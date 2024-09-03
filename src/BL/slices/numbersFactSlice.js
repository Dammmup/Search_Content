// src/BL/slices/numbersFactSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchMathFact = createAsyncThunk(
  'numbersFact/fetchMathFact',
  async (number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://numbersapi.com/${number}/math`);
      return { text: response.data, id: `math-${number}` };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Ошибка получения математического факта');
    }
  }
);

export const fetchTriviaFact = createAsyncThunk(
  'numbersFact/fetchTriviaFact',
  async (number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://numbersapi.com/${number}/trivia`);
      return { text: response.data, id: `trivia-${number}` };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Ошибка получения тривиального факта');
    }
  }
);

export const fetchDateFact = createAsyncThunk(
  'numbersFact/fetchDateFact',
  async (date, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://numbersapi.com/${date}/date`);
      return { text: response.data, id: `date-${date}` };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Ошибка получения факта по дате');
    }
  }
);

const numbersFactSlice = createSlice({
  name: 'numbersFact',
  initialState: {
    facts: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    likeFact: (state, action) => {
      const index = state.facts.findIndex(f => f.id === action.payload);
      if (index !== -1) {
        state.facts[index].is_favorite = !state.facts[index].is_favorite;
      }
      console.log('liked in redux');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMathFact.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMathFact.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.facts.push({ ...action.payload, is_favorite: false });
      })
      .addCase(fetchMathFact.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchTriviaFact.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTriviaFact.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.facts.push({ ...action.payload, is_favorite: false });
      })
      .addCase(fetchTriviaFact.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchDateFact.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDateFact.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.facts.push({ ...action.payload, is_favorite: false });
      })
      .addCase(fetchDateFact.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { likeFact } = numbersFactSlice.actions;

export default numbersFactSlice.reducer;