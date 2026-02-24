import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { favoritesAPI, authAPI } from '../api';

const UNSPLASH_CLIENT_ID = '3CQ-Y7JZ_hSuDcAC4OsLJm5hbIJ4u5WFlcLQ9f3rYok';

export const fetchImages = createAsyncThunk(
  'images/fetchImages',
  async (query, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query, client_id: UNSPLASH_CLIENT_ID },
      });
      if (response.data.results.length === 0) {
        throw new Error('No images for that query.');
      }
      return response.data.results;
    } catch (error) {
      return rejectWithValue(error.response?.data?.errors[0] || error.message || 'Error fetching Unsplash');
    }
  }
);

export const loadImageFavoritesFromDB = createAsyncThunk(
  'images/loadFavoritesFromDB',
  async () => {
    try {
      const user = await authAPI.getUser();
      if (!user) return [];
      const response = await favoritesAPI.getAll(user.id, 'image');
      return response;
    } catch (error) {
      const saved = localStorage.getItem('favorite_images');
      return saved ? JSON.parse(saved) : [];
    }
  }
);

export const toggleImageLike = createAsyncThunk(
  'images/toggleImageLike',
  async ({ image }, { getState }) => {
    try {
      const user = await authAPI.getUser();
      if (!user) throw new Error('Не авторизован');

      const { images } = getState();
      const currentImage = images.images.find(i => i.id === image.id);
      const isFavorite = currentImage?.is_favorite;

      if (isFavorite) {
        const result = await favoritesAPI.remove(user.id, 'image', image.id);
        if (result.error) throw new Error(result.error);
      } else {
        const result = await favoritesAPI.add(user.id, 'image', image.id, image);
        if (result.error && result.error !== 'Уже в избранном') throw new Error(result.error);
      }
      return image.id;
    } catch (error) {
      const saved = localStorage.getItem('favorite_images');
      let favorites = saved ? JSON.parse(saved) : [];
      const index = favorites.findIndex(i => i.id === image.id);
      if (index >= 0) favorites.splice(index, 1);
      else favorites.push(image);
      localStorage.setItem('favorite_images', JSON.stringify(favorites));
      return image.id;
    }
  }
);

const imageSlice = createSlice({
  name: 'images',
  initialState: {
    images: [],
    favorites: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    likeImage: (state, action) => {
      const imageIndex = state.images.findIndex(image => image.id === action.payload);
      if (imageIndex >= 0) {
        state.images[imageIndex].is_favorite = !state.images[imageIndex].is_favorite;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImages.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchImages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.images = action.payload.map(image => ({
          ...image,
          is_favorite: state.favorites.some(f => f.external_id === image.id)
        }));
      })
      .addCase(fetchImages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(loadImageFavoritesFromDB.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      .addCase(toggleImageLike.fulfilled, (state, action) => {
        const imageId = action.payload;
        const imageIndex = state.images.findIndex(i => i.id === imageId);
        if (imageIndex >= 0) {
          state.images[imageIndex].is_favorite = !state.images[imageIndex].is_favorite;
        }
      });
  },
});

export const { likeImage } = imageSlice.actions;
export default imageSlice.reducer;
