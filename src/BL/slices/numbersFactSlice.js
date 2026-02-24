import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { favoritesAPI, authAPI } from '../api';

// Async thunks
export const fetchNumbersFact = createAsyncThunk(
  'numbersFact/fetchNumbersFact',
  async (number = 'random') => {
    const isRandom = number === 'random';
    const url = isRandom
      ? 'http://numbersapi.com/random/math?json'
      : `http://numbersapi.com/${number}/math?json`;

    const response = await axios.get(url);
    return {
      text: response.data.text,
      number: response.data.number,
      found: response.data.found,
      type: 'math',
    };
  }
);

export const fetchYearFact = createAsyncThunk(
  'numbersFact/fetchYearFact',
  async (year = 'random') => {
    const isRandom = year === 'random';
    const url = isRandom
      ? 'http://numbersapi.com/random/year?json'
      : `http://numbersapi.com/${year}/year?json`;

    const response = await axios.get(url);
    return {
      text: response.data.text,
      number: response.data.number,
      found: response.data.found,
      type: 'year',
    };
  }
);

export const fetchDateFact = createAsyncThunk(
  'numbersFact/fetchDateFact',
  async ({ month, day } = {}) => {
    if (!month || !day) {
      const response = await axios.get('http://numbersapi.com/random/date?json');
      return {
        text: response.data.text,
        number: response.data.number,
        found: response.data.found,
        type: 'date',
      };
    }
    const response = await axios.get(`http://numbersapi.com/${month}/${day}/date?json`);
    return {
      text: response.data.text,
      number: response.data.number,
      found: response.data.found,
      type: 'date',
    };
  }
);

export const loadNumbersFactFavoritesFromDB = createAsyncThunk(
  'numbersFact/loadFavoritesFromDB',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authAPI.getUser();
      if (!user) return [];
      const response = await favoritesAPI.getAll(user.id, 'numbersfact');
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleNumbersFactLike = createAsyncThunk(
  'numbersFact/toggleNumbersFactLike',
  async ({ fact }, { getState }) => {
    try {
      const user = await authAPI.getUser();
      if (!user) throw new Error('Не авторизован');

      const { numbersFact } = getState();
      const currentFact = numbersFact.facts.find(f => f.id === fact.id);
      const isFavorite = currentFact?.is_favorite;

      if (isFavorite) {
        const result = await favoritesAPI.remove(user.id, 'numbersfact', fact.id);
        if (result.error) throw new Error(result.error);
      } else {
        const result = await favoritesAPI.add(user.id, 'numbersfact', fact.id, fact);
        if (result.error && result.error !== 'Уже в избранном') throw new Error(result.error);
      }
      return fact.id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const numbersFactSlice = createSlice({
  name: 'numbersFact',
  initialState: {
    facts: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    likeNumbersFact: (state, action) => {
      const fact = state.facts.find(f => f.id === action.payload);
      if (fact) {
        fact.is_favorite = !fact.is_favorite;
      }
    },
    clearFacts: (state) => {
      state.facts = [];
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNumbersFact.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNumbersFact.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const fact = {
          ...action.payload,
          id: `math-${action.payload.number}`
        };
        state.facts = [fact];
      })
      .addCase(fetchNumbersFact.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchYearFact.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchYearFact.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const fact = {
          ...action.payload,
          id: `year-${action.payload.number}`
        };
        state.facts = [fact];
      })
      .addCase(fetchYearFact.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchDateFact.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDateFact.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const fact = {
          ...action.payload,
          id: `date-${action.payload.number}`
        };
        state.facts = [fact];
      })
      .addCase(fetchDateFact.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(toggleNumbersFactLike.fulfilled, (state, action) => {
        const factId = action.payload;
        const fact = state.facts.find(f => f.id === factId);
        if (fact) {
          fact.is_favorite = !fact.is_favorite;
        }
      });
  },
});

export const { likeNumbersFact, clearFacts } = numbersFactSlice.actions;

// Aliases for backward compatibility
export const fetchMathFact = fetchNumbersFact;
export const fetchTriviaFact = fetchNumbersFact;
export const likeFact = likeNumbersFact;

export default numbersFactSlice.reducer;
