import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { favoritesAPI, authAPI } from '../api';

const JOKE_CATEGORY_ENDPOINTS = {
    random: 'https://official-joke-api.appspot.com/random_ten',
    general: 'https://official-joke-api.appspot.com/jokes/general/ten',
    programming: 'https://official-joke-api.appspot.com/jokes/programming/ten',
    knockKnock: 'https://official-joke-api.appspot.com/jokes/knock-knock/ten',
};

const mapOfficialJoke = (joke) => ({
    id: joke.id,
    setup: joke.setup,
    delivery: joke.punchline,
    category: joke.type,
    is_favorite: false,
});

export const fetchJokes = createAsyncThunk(
    'jokes/fetchJokes',
    async (category = 'random', { rejectWithValue }) => {
        try {
            const response = await axios.get(JOKE_CATEGORY_ENDPOINTS[category] || JOKE_CATEGORY_ENDPOINTS.random);
            return response.data.map(mapOfficialJoke);
        } catch (error) {
            return rejectWithValue(error.message || 'Error fetching jokes');
        }
    }
);

export const fetchRandomJokes = createAsyncThunk(
    'jokes/fetchRandomJokes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(JOKE_CATEGORY_ENDPOINTS.random);
            return response.data.map(mapOfficialJoke);
        } catch (error) {
            return rejectWithValue(error.message || 'Error fetching jokes');
        }
    }
);

export const loadJokeFavoritesFromDB = createAsyncThunk(
    'jokes/loadFavoritesFromDB',
    async (_, { rejectWithValue }) => {
        try {
            const user = await authAPI.getUser();
            if (!user) return [];
            const response = await favoritesAPI.getAll(user.id, 'joke');
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const toggleJokeLike = createAsyncThunk(
    'jokes/toggleJokeLike',
    async ({ joke }, { getState, rejectWithValue }) => {
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
            return rejectWithValue(error.message);
        }
    }
);

const jokeSlice = createSlice({
    name: 'jokes',
    initialState: {
        jokes: [],
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
                state.jokes = action.payload;
            })
            .addCase(fetchJokes.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            .addCase(fetchRandomJokes.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchRandomJokes.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.jokes = action.payload;
            })
            .addCase(fetchRandomJokes.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
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
