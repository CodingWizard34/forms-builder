import { configureStore } from '@reduxjs/toolkit';
import formReducer from './slices/formSlice';
import builderReducer from './slices/builderSlice';

export const store = configureStore({
  reducer: {
    form: formReducer,
    builder: builderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
