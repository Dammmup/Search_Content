import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { favoritesAPI, authAPI } from '../api';

export const fetchJokes = createAsyncThunk(
    'jokes/fetchJokes',
    async (category = 'any') => {
        const response = await axios.get(
            `https://v2.jokeapi.dev/joke/${category}?amount=20&lang=ru`
        );
        if (response.data.type === 'twopart') {
            return [{
                id: response.data.id,
                setup: response.data.setup,
                delivery: response.data.delivery,
                category: response.data.category,
                is_favorite: false,
            }];
        }
        return [{
            id: response.data.id,
            joke: response.data.joke,
            category: response.data.category,
            is_favorite: false,
        }];
    }
);

export const fetchRandomJokes = createAsyncThunk(
    'jokes/fetchRandomJokes',
    async () => {
        const categories = ['programming', 'misc', 'pun', 'spooky', 'christmas'];
        const jokes = [];

        for (const cat of categories) {
            try {
                const response = await axios.get(`https://v2.jokeapi.dev/joke/${cat}?lang=ru`);
                if (response.data.type === 'twopart') {
                    jokes.push({
                        id: `${response.data.id}-${cat}`,
                        setup: response.data.setup,
                        delivery: response.data.delivery,
                        category: response.data.category,
                        is_favorite: false,
                    });
                } else {
                    jokes.push({
                        id: `${response.data.id}-${cat}`,
                        joke: response.data.joke,
                        category: response.data.category,
                        is_favorite: false,
                    });
                }
            } catch (e) {
                console.log(`Failed to fetch from ${cat}`);
            }
        }
        return jokes;
    }
);

export const loadJokeFavoritesFromDB = createAsyncThunk(
    'jokes/loadFavoritesFromDB',
    async () => {
        try {
            const user = await authAPI.getUser();
            if (!user) return [];
            const response = await favoritesAPI.getAll(user.id, 'joke');
            return response;
        } catch (error) {
            const saved = localStorage.getItem('favorite_jokes');
            return saved ? JSON.parse(saved) : [];
        }
    }
);

export const toggleJokeLike = createAsyncThunk(
    'jokes/toggleJokeLike',
    async ({ joke }, { getState }) => {
        try {
            const user = await authAPI.getUser();
            if (!user) throw new Error('Не авторизован');

            const { jokes } = getState();
            const currentJoke = jokes.jokes.find(j => j.id === joke.id);
            const isFavorite = currentJoke?.is_favorite;

            if (isFavorite) {
                const result = await favoritesAPI.remove(user.id, 'joke', joke.id);
                if (result.error) throw new Error(result.error);
            } else {
                const result = await favoritesAPI.add(user.id, 'joke', joke.id, joke);
                if (result.error && result.error !== 'Уже в избранном') throw new Error(result.error);
            }
            return joke.id;
        } catch (error) {
            const saved = localStorage.getItem('favorite_jokes');
            let favorites = saved ? JSON.parse(saved) : [];
            const index = favorites.findIndex(j => j.id === joke.id);
            if (index >= 0) favorites.splice(index, 1);
            else favorites.push(joke);
            localStorage.setItem('favorite_jokes', JSON.stringify(favorites));
            return joke.id;
        }
    }
);

const jokeSlice = createSlice({
    name: 'jokes',
    initialState: {
        jokes: [],
        favorites: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        likeJoke: (state, action) => {
            const joke = state.jokes.find(j => j.id === action.payload);
            if (joke) {
                joke.is_favorite = !joke.is_favorite;
            }
        },
        clearJokes: (state) => {
            state.jokes = [];
            state.status = 'idle';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchJokes.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchJokes.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.jokes = action.payload.map(joke => ({
                    ...joke,
                    is_favorite: state.favorites.some(f => f.external_id === joke.id)
                }));
            })
            .addCase(fetchJokes.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchRandomJokes.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchRandomJokes.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.jokes = action.payload.map(joke => ({
                    ...joke,
                    is_favorite: state.favorites.some(f => f.external_id === joke.id)
                }));
            })
            .addCase(fetchRandomJokes.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(loadJokeFavoritesFromDB.fulfilled, (state, action) => {
                state.favorites = action.payload;
            })
            .addCase(toggleJokeLike.fulfilled, (state, action) => {
                const jokeId = action.payload;
                const joke = state.jokes.find(j => j.id === jokeId);
                if (joke) {
                    joke.is_favorite = !joke.is_favorite;
                }
            });
    },
});

export const { likeJoke, clearJokes } = jokeSlice.actions;
export default jokeSlice.reducer;
