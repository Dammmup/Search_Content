import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { favoritesAPI, authAPI } from '../api';

export const fetchCharacters = createAsyncThunk(
  'rickAndMorty/fetchCharacters',
  async (searchQuery = '') => {
    const url = searchQuery
      ? `https://rickandmortyapi.com/api/character/?name=${searchQuery}`
      : 'https://rickandmortyapi.com/api/character/?page=1';

    const response = await axios.get(url);
    return response.data.results;
  }
);

export const fetchCharacterById = createAsyncThunk(
  'rickAndMorty/fetchCharacterById',
  async (id) => {
    const response = await axios.get(`https://rickandmortyapi.com/api/character/${id}`);
    return response.data;
  }
);

export const loadRickAndMortyFavoritesFromDB = createAsyncThunk(
  'rickAndMorty/loadFavoritesFromDB',
  async () => {
    try {
      const user = await authAPI.getUser();
      if (!user) return [];
      const response = await favoritesAPI.getAll(user.id, 'rickandmorty');
      return response;
    } catch (error) {
      const saved = localStorage.getItem('favorite_rickandmorty');
      return saved ? JSON.parse(saved) : [];
    }
  }
);

export const toggleRickAndMortyLike = createAsyncThunk(
  'rickAndMorty/toggleRickAndMortyLike',
  async ({ character }, { getState }) => {
    try {
      const user = await authAPI.getUser();
      if (!user) throw new Error('Не авторизован');

      const { rickAndMorty } = getState();
      const currentCharacter = rickAndMorty.characters.find(c => c.id === character.id);
      const isFavorite = currentCharacter?.is_favorite;

      if (isFavorite) {
        const result = await favoritesAPI.remove(user.id, 'rickandmorty', character.id);
        if (result.error) throw new Error(result.error);
      } else {
        const result = await favoritesAPI.add(user.id, 'rickandmorty', character.id, character);
        if (result.error && result.error !== 'Уже в избранном') throw new Error(result.error);
      }
      return character.id;
    } catch (error) {
      const saved = localStorage.getItem('favorite_rickandmorty');
      let favorites = saved ? JSON.parse(saved) : [];
      const index = favorites.findIndex(c => c.id === character.id);
      if (index >= 0) favorites.splice(index, 1);
      else favorites.push(character);
      localStorage.setItem('favorite_rickandmorty', JSON.stringify(favorites));
      return character.id;
    }
  }
);

const rickAndMortySlice = createSlice({
  name: 'rickAndMorty',
  initialState: {
    characters: [],
    favorites: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    likeCharacter: (state, action) => {
      const character = state.characters.find(c => c.id === action.payload);
      if (character) {
        character.is_favorite = !character.is_favorite;
      }
    },
    clearCharacters: (state) => {
      state.characters = [];
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCharacters.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCharacters.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.characters = action.payload.map(character => ({
          ...character,
          is_favorite: state.favorites.some(f => f.external_id === String(character.id))
        }));
      })
      .addCase(fetchCharacters.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchCharacterById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCharacterById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const character = {
          ...action.payload,
          is_favorite: state.favorites.some(f => f.external_id === String(action.payload.id))
        };
        const exists = state.characters.find(c => c.id === character.id);
        if (!exists) {
          state.characters.push(character);
        }
      })
      .addCase(fetchCharacterById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(loadRickAndMortyFavoritesFromDB.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      .addCase(toggleRickAndMortyLike.fulfilled, (state, action) => {
        const characterId = action.payload;
        const character = state.characters.find(c => c.id === characterId);
        if (character) {
          character.is_favorite = !character.is_favorite;
        }
      });
  },
});

export const { likeCharacter, clearCharacters } = rickAndMortySlice.actions;
export default rickAndMortySlice.reducer;
