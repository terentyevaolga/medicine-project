import { configureStore } from '@reduxjs/toolkit';
import miscReducer from './miscSlice';

export const store = configureStore({
    reducer: {
        misc: miscReducer
    }
})