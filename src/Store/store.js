import { createStore } from "redux";

import { persistStore, persistReducer } from "redux-persist";

import storage from "redux-persist/lib/storage/session";

import UserReducer from "../Reducers/UserdetailReducer";

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, UserReducer);

export const store = createStore(persistedReducer);

export const persistor = persistStore(store);
