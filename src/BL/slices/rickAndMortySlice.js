import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Асинхронный thunk для поиска персонажей
export const fetchCharacters = createAsyncThunk(
  'rickAndMorty/fetchCharacters',
  async (name, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://rickandmortyapi.com/api/character/?name=${name}`);
      if (response.data.results.length === 0) {
        throw new Error("Character's not found"); // Исключение, если персонажи не найдены
      }
      return response.data.results;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Error getting characters');
    }
  }
);

const rickAndMortySlice = createSlice({
  name: 'rickAndMorty',
  initialState: {
    characters: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    likeCharacter: (state, action) => {
      state.characters = state.characters.map(character =>
        character.id === action.payload ? { ...character, is_favorite: !character.is_favorite } : character
      );
      console.log("liked in redux");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCharacters.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCharacters.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.characters = action.payload.map(m => ({ ...m, is_favorite: false }));
      })
      .addCase(fetchCharacters.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { likeCharacter } = rickAndMortySlice.actions;
export default rickAndMortySlice.reducer;