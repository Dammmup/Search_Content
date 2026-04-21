import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { favoritesAPI, authAPI } from '../api';

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, '').trim();
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY || 'thewdb';

const mapOmdbTitle = (title) => ({
  id: `omdb-${title.imdbID}`,
  name: title.Title,
  year: title.Year,
  description: title.Type === 'series' ? 'Сериал' : title.Type === 'movie' ? 'Фильм' : title.Type,
  poster: {
    url: title.Poster && title.Poster !== 'N/A' ? title.Poster : null,
  },
  rating: {
    kp: null,
    imdb: null,
  },
  type: title.Type,
  imdbId: title.imdbID,
  is_favorite: false,
});

const mapTvMazeShow = ({ show }) => ({
  id: `tvmaze-${show.id}`,
  name: show.name,
  year: show.premiered ? new Date(show.premiered).getFullYear() : null,
  description: stripHtml(show.summary) || `${show.type || 'Show'}${show.genres?.length ? `: ${show.genres.join(', ')}` : ''}`,
  poster: {
    url: show.image?.original || show.image?.medium || null,
  },
  rating: {
    kp: show.rating?.average || null,
    imdb: null,
  },
  type: show.type,
  genres: show.genres || [],
  url: show.url,
  is_favorite: false,
});

const dedupeTitles = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${String(item.name).toLowerCase()}-${item.year || ''}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// Public OMDb + TVMaze search APIs.
export const fetchFilms = createAsyncThunk(
  'films/fetchFilms',
  async (query, { rejectWithValue }) => {
    try {
      const searchQuery = query?.trim();
      if (!searchQuery) {
        return [];
      }

      const [omdbResponse, tvMazeResponse] = await Promise.allSettled([
        axios.get('https://www.omdbapi.com/', {
          params: { s: searchQuery, apikey: OMDB_API_KEY },
        }),
        axios.get('https://api.tvmaze.com/search/shows', {
          params: { q: searchQuery },
        }),
      ]);

      const omdbItems = omdbResponse.status === 'fulfilled' && omdbResponse.value.data.Response === 'True'
        ? omdbResponse.value.data.Search.map(mapOmdbTitle)
        : [];

      const tvMazeItems = tvMazeResponse.status === 'fulfilled'
        ? tvMazeResponse.value.data.map(mapTvMazeShow)
        : [];

      const results = dedupeTitles([...omdbItems, ...tvMazeItems]);
      if (!results.length) {
        throw new Error('Ничего не найдено');
      }

      return results;
    } catch (error) {
      return rejectWithValue(error.message || 'Error fetching movies and shows');
    }
  }
);

// Загрузить избранное из Supabase
export const loadFavoritesFromDB = createAsyncThunk(
  'films/loadFavoritesFromDB',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authAPI.getUser();
      if (!user) return [];
      const response = await favoritesAPI.getAll(user.id, 'film');
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Переключить лайк с сохранением в Supabase
export const toggleFilmLike = createAsyncThunk(
  'films/toggleFilmLike',
  async ({ film }, { rejectWithValue, getState }) => {
    try {
      const user = await authAPI.getUser();
      if (!user) throw new Error('Не авторизован');

      const { films } = getState();
      const currentFilm = films.films.find(f => f.id === film.id);
      const isFavorite = currentFilm?.is_favorite;

      if (isFavorite) {
        const result = await favoritesAPI.remove(user.id, 'film', film.id);
        if (result.error) throw new Error(result.error);
      } else {
        const result = await favoritesAPI.add(user.id, 'film', film.id, film);
        if (result.error && result.error !== 'Уже в избранном') throw new Error(result.error);
      }

      return film.id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const filmSlice = createSlice({
  name: 'films',
  initialState: {
    films: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    likeFilm: (state, action) => {
      state.films = state.films.map(film =>
        film.id === action.payload ? { ...film, is_favorite: !film.is_favorite } : film
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilms.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFilms.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.films = action.payload;
      })
      .addCase(fetchFilms.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(loadFavoritesFromDB.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      .addCase(toggleFilmLike.fulfilled, (state, action) => {
        const filmId = action.payload;
        state.films = state.films.map(film =>
          film.id === filmId ? { ...film, is_favorite: !film.is_favorite } : film
        );
      });
  },
});

export const { likeFilm } = filmSlice.actions;
export default filmSlice.reducer;
