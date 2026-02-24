import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { favoritesAPI, authAPI } from '../api';

const RAWG_API_KEY = 'c542e67aec3a4340908f9de9e86038af';

export const fetchGames = createAsyncThunk(
    'games/fetchGames',
    async (searchQuery) => {
        const response = await axios.get(
            `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${searchQuery}&page_size=20`
        );
        return response.data.results;
    }
);

export const loadGameFavoritesFromDB = createAsyncThunk(
    'games/loadFavoritesFromDB',
    async (_, { rejectWithValue }) => {
        try {
            const user = await authAPI.getUser();
            if (!user) return [];
            const response = await favoritesAPI.getAll(user.id, 'game');
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const toggleGameLike = createAsyncThunk(
    'games/toggleGameLike',
    async ({ game }, { getState }) => {
        try {
            const user = await authAPI.getUser();
            if (!user) throw new Error('Не авторизован');

            const { games } = getState();
            const currentGame = games.games.find(g => g.id === game.id);
            const isFavorite = currentGame?.is_favorite;

            if (isFavorite) {
                const result = await favoritesAPI.remove(user.id, 'game', game.id);
                if (result.error) throw new Error(result.error);
            } else {
                const result = await favoritesAPI.add(user.id, 'game', game.id, game);
                if (result.error && result.error !== 'Уже в избранном') throw new Error(result.error);
            }
            return game.id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const gameSlice = createSlice({
    name: 'games',
    initialState: {
        games: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        likeGame: (state, action) => {
            const game = state.games.find(g => g.id === action.payload);
            if (game) {
                game.is_favorite = !game.is_favorite;
            }
        },
        clearGames: (state) => {
            state.games = [];
            state.status = 'idle';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGames.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchGames.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.games = action.payload;
            })
            .addCase(fetchGames.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(toggleGameLike.fulfilled, (state, action) => {
                const gameId = action.payload;
                const game = state.games.find(g => g.id === gameId);
                if (game) {
                    game.is_favorite = !game.is_favorite;
                }
            });
    },
});

export const { likeGame, clearGames } = gameSlice.actions;
export default gameSlice.reducer;
