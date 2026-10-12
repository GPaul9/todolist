import { createSlice } from '@reduxjs/toolkit';

type AuthState = {
  isAuth: boolean;
  isInitialized: boolean;
};

const initialState: AuthState = {
  isAuth: false,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state) {
      state.isAuth = true;
    },

    setInitialized(state) {
      state.isInitialized = true;
    },

    logout(state) {
      state.isAuth = false;
    },
  },
});

export const { logout, setAuth, setInitialized } = authSlice.actions;
export const authReducer = authSlice.reducer;
