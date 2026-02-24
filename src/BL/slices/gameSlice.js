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
    async () => {
        try {
            const user = await authAPI.getUser();
            if (!user) return [];
            const response = await favoritesAPI.getAll(user.id, 'game');
            return response;
        } catch (error) {
            const saved = localStorage.getItem('favorite_games');
            return saved ? JSON.parse(saved) : [];
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
            const saved = localStorage.getItem('favorite_games');
            let favorites = saved ? JSON.parse(saved) : [];
            const index = favorites.findIndex(g => g.id === game.id);
            if (index >= 0) favorites.splice(index, 1);
            else favorites.push(game);
            localStorage.setItem('favorite_games', JSON.stringify(favorites));
            return game.id;
        }
    }
);

const gameSlice = createSlice({
    name: 'games',
    initialState: {
        games: [],
        favorites: [],
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
                state.games = action.payload.map(game => ({
                    ...game,
                    is_favorite: state.favorites.some(f => f.external_id === String(game.id))
                }));
            })
            .addCase(fetchGames.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(loadGameFavoritesFromDB.fulfilled, (state, action) => {
                state.favorites = action.payload;
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
