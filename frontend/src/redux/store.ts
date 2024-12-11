// store.ts
import { configureStore } from '@reduxjs/toolkit';
import { thunk } from 'redux-thunk'
import rootReducer from './reducers';
import * as redux from 'redux';

const store = configureStore({
    reducer: rootReducer,
});
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
