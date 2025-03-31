import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authStore";
import userReducer from "./userStore";
import categoryReducer from "./categoryStore";

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    categories: categoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
