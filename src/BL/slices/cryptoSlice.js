import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { favoritesAPI, authAPI } from '../api';

export const fetchCrypto = createAsyncThunk(
    'crypto/fetchCrypto',
    async (searchQuery = '') => {
        const response = await axios.get(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false'
        );
        if (searchQuery) {
            return response.data.filter(coin =>
                coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return response.data;
    }
);

export const fetchCryptoDetails = createAsyncThunk(
    'crypto/fetchCryptoDetails',
    async (coinId) => {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
        );
        return response.data;
    }
);

export const loadCryptoFavoritesFromDB = createAsyncThunk(
    'crypto/loadFavoritesFromDB',
    async (_, { rejectWithValue }) => {
        try {
            const user = await authAPI.getUser();
            if (!user) return [];
            const response = await favoritesAPI.getAll(user.id, 'crypto');
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const toggleCryptoLike = createAsyncThunk(
    'crypto/toggleCryptoLike',
    async ({ coin }, { getState }) => {
        try {
            const user = await authAPI.getUser();
            if (!user) throw new Error('Не авторизован');

            const { crypto } = getState();
            const currentCrypto = crypto.coins.find(c => c.id === coin.id);
            const isFavorite = currentCrypto?.is_favorite;

            if (isFavorite) {
                const result = await favoritesAPI.remove(user.id, 'crypto', coin.id);
                if (result.error) throw new Error(result.error);
            } else {
                const result = await favoritesAPI.add(user.id, 'crypto', coin.id, coin);
                if (result.error && result.error !== 'Уже в избранном') throw new Error(result.error);
            }
            return coin.id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const cryptoSlice = createSlice({
    name: 'crypto',
    initialState: {
        coins: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        likeCrypto: (state, action) => {
            const coin = state.coins.find(c => c.id === action.payload);
            if (coin) {
                coin.is_favorite = !coin.is_favorite;
            }
        },
        clearCrypto: (state) => {
            state.coins = [];
            state.status = 'idle';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCrypto.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCrypto.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.coins = action.payload;
            })
            .addCase(fetchCrypto.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(toggleCryptoLike.fulfilled, (state, action) => {
                const coinId = action.payload;
                const coin = state.coins.find(c => c.id === coinId);
                if (coin) {
                    coin.is_favorite = !coin.is_favorite;
                }
            });
    },
});

export const { likeCrypto, clearCrypto } = cryptoSlice.actions;

// Aliases for backward compatibility
export const searchCrypto = fetchCrypto;
export const likeCoin = likeCrypto;

export default cryptoSlice.reducer;
