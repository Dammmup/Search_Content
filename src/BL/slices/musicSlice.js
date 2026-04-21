import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { favoritesAPI, authAPI } from '../api';

// iTunes Search API — бесплатно, без ключа, 30сек превью коммерческих треков
const ITUNES_API_URL = 'https://itunes.apple.com/search';

export const fetchMusic = createAsyncThunk(
  'music/fetchMusic',
  async (query, { rejectWithValue }) => {
    try {
      const response = await axios.get(ITUNES_API_URL, {
        params: {
          term: query,
          entity: 'song',
          media: 'music',
          limit: 20,
        }
      });

      if (!response.data.results || response.data.results.length === 0) {
        return rejectWithValue('Ничего не найдено');
      }

      // Маппинг данных iTunes под единую структуру
      return response.data.results.map(track => ({
        id: String(track.trackId),
        name: track.trackName,
        artist_name: track.artistName,
        artist_id: String(track.artistId),
        album_name: track.collectionName || 'Сингл',
        image: track.artworkUrl100?.replace('100x100', '300x300') || track.artworkUrl60,
        audio: track.previewUrl, // 30сек mp3 превью
        duration: Math.round(track.trackTimeMillis / 1000), // из мс в секунды
        genre: track.primaryGenreName,
        track_url: track.trackViewUrl,
        release_date: track.releaseDate,
        is_favorite: false,
      }));
    } catch (error) {
      return rejectWithValue(error.message || 'Ошибка при поиске музыки');
    }
  }
);

export const loadMusicFavoritesFromDB = createAsyncThunk(
  'music/loadFavoritesFromDB',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authAPI.getUser();
      if (!user) return [];
      const response = await favoritesAPI.getAll(user.id, 'track');
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleTrackLike = createAsyncThunk(
  'music/toggleTrackLike',
  async ({ track }, { getState, rejectWithValue }) => {
    const { music } = getState();
    const currentTrack = music.tracks.find(t => t.id === track.id);
    const isFavorite = currentTrack?.is_favorite;

    // Пробуем сохранить в Supabase
    try {
      const user = await authAPI.getUser();
      if (!user) throw new Error('Не авторизован');

      if (isFavorite) {
        const result = await favoritesAPI.remove(user.id, 'track', track.id);
        if (result.error) throw new Error(result.error);
      } else {
        const result = await favoritesAPI.add(user.id, 'track', track.id, track);
        if (result.error && result.error !== 'Уже в избранном') throw new Error(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }

    return track.id;
  }
);

const musicSlice = createSlice({
  name: 'music',
  initialState: {
    tracks: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    likeTrack: (state, action) => {
      state.tracks = state.tracks.map(track =>
        track.id === action.payload ? { ...track, is_favorite: !track.is_favorite } : track
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMusic.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMusic.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tracks = action.payload;
      })
      .addCase(fetchMusic.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(toggleTrackLike.fulfilled, (state, action) => {
        const trackId = action.payload;
        state.tracks = state.tracks.map(track =>
          track.id === trackId ? { ...track, is_favorite: !track.is_favorite } : track
        );
      });
  },
});

export const { likeTrack } = musicSlice.actions;
export default musicSlice.reducer;
