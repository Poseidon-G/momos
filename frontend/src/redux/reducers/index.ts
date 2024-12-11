// reducers/index.ts
import { combineReducers } from 'redux';
import authReducer from './authReducer';
import orderReducer from './orderReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    order: orderReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
