import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import storage from 'redux-persist/lib/storage';
import { PersistConfig, persistReducer, persistStore } from 'redux-persist';
import { apiClient } from 'api/API';

export const rootReducer = combineReducers({
  // API
  [apiClient.reducerPath]: apiClient.reducer,
});
export type RootState = ReturnType<typeof rootReducer>;

const middlewares = [apiClient.middleware];

// На будущее
// const migration: MigrationManifest = {} as unknown as MigrationManifest;

const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  storage,
  whitelist: ['app'],
  // migrate: createMigrate(migration, { debug: true }),
  // version: 1,
};

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(middlewares),
});

setupListeners(store.dispatch);

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
