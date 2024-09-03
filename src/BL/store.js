import { configureStore } from "@reduxjs/toolkit";

import filmReducer from './slices/filmSlice';
import musicReducer from './slices/musicSlice';
import imageReducer from './slices/imageSlice';
import numbersFactReducer from './slices/numbersFactSlice';
import rickAndMortyReducer from './slices/rickAndMortySlice';

export const store = configureStore({
  reducer: {
    films: filmReducer,
    music: musicReducer,
    images: imageReducer,
    numbersFact: numbersFactReducer,
    rickAndMorty: rickAndMortyReducer,

  },
});
