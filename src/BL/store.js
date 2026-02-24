import { configureStore } from "@reduxjs/toolkit";

import filmReducer from './slices/filmSlice';
import musicReducer from './slices/musicSlice';
import imageReducer from './slices/imageSlice';
import numbersFactReducer from './slices/numbersFactSlice';
import rickAndMortyReducer from './slices/rickAndMortySlice';
import gameReducer from './slices/gameSlice';
import jokeReducer from './slices/jokeSlice';
import cryptoReducer from './slices/cryptoSlice';

export const store = configureStore({
  reducer: {
    films: filmReducer,
    music: musicReducer,
    images: imageReducer,
    numbersFact: numbersFactReducer,
    rickAndMorty: rickAndMortyReducer,
    games: gameReducer,
    jokes: jokeReducer,
    crypto: cryptoReducer,
  },
});
