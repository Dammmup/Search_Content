import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchFilms = createAsyncThunk(
  'films/fetchFilms',
  async (query, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://api.kinopoisk.dev/v1.4/movie/search?query=${query}`, {
        headers: {
          'X-API-KEY': '0Y26KB7-3SB4NK8-N277RVY-NQW1TEN'
        }
      });
      return response.data.docs;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching data');
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
      console.log("liked in redux");
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
        state.films = action.payload.map(film => ({ ...film, is_favorite: false }));
      })
      .addCase(fetchFilms.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { likeFilm } = filmSlice.actions;
export default filmSlice.reducer;
