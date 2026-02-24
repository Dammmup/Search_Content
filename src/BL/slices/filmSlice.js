import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { favoritesAPI, authAPI } from '../api';

// Внешний API для фильмов
export const fetchFilms = createAsyncThunk(
  'films/fetchFilms',
  async (query, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://api.kinopoisk.dev/v1.4/movie/search?query=${query}`, {
        headers: { 'X-API-KEY': '0Y26KB7-3SB4NK8-N277RVY-NQW1TEN' }
      });
      return response.data.docs;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching data');
    }
  }
);

// Загрузить избранное из Supabase
export const loadFavoritesFromDB = createAsyncThunk(
  'films/loadFavoritesFromDB',
  async () => {
    try {
      const user = await authAPI.getUser();
      if (!user) return [];
      const response = await favoritesAPI.getAll(user.id, 'film');
      return response;
    } catch (error) {
      // Fallback: localStorage
      const saved = localStorage.getItem('favorite_films');
      return saved ? JSON.parse(saved) : [];
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
      // Fallback: localStorage
      const saved = localStorage.getItem('favorite_films');
      let favorites = saved ? JSON.parse(saved) : [];

      const index = favorites.findIndex(f => f.id === film.id);
      if (index >= 0) {
        favorites.splice(index, 1);
      } else {
        favorites.push(film);
      }
      localStorage.setItem('favorite_films', JSON.stringify(favorites));

      return film.id;
    }
  }
);

const filmSlice = createSlice({
  name: 'films',
  initialState: {
    films: [],
    favorites: [],
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
        state.films = action.payload.map(film => ({
          ...film,
          is_favorite: state.favorites.some(f => f.external_id === String(film.id))
        }));
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
