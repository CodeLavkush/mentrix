import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User, AcademicDetails } from '../types';
import { authApi } from '../../api/authApi';
import type { LoginPayload, RegisterPayload } from '../../api/authApi';
import { profileApi } from '../../api/profileApi';
import type { AcademicDetailsPayload } from '../../api/profileApi';
import { loadStateFromStorage, clearStoredState } from '../persistence/localStorageHelper';

export interface AuthState {
  user: User | null;
  academicDetails: AcademicDetails | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const getInitialAuthState = (): AuthState => {
  const persisted = loadStateFromStorage();
  const initialToken = persisted?.auth?.token || localStorage.getItem('mentrix_auth_token') || null;
  return {
    user: persisted?.auth?.user || null,
    academicDetails: persisted?.auth?.academicDetails || null,
    token: initialToken,
    isAuthenticated: Boolean(initialToken),
    loading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialAuthState();

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload: RegisterPayload | FormData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.login(payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Session expired');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout backend errors, clear locally anyway
    } finally {
      clearStoredState();
      dispatch(clearAuth());
    }
  }
);

export const updateAcademicProfile = createAsyncThunk(
  'auth/updateAcademicProfile',
  async (payload: AcademicDetailsPayload, { rejectWithValue }) => {
    try {
      const response = await profileApi.updateProfile(payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      state.isAuthenticated = Boolean(action.payload);
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.academicDetails = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.academicDetails = action.payload.academicDetails || null;
        if (action.payload.accessToken) {
          state.token = action.payload.accessToken;
          state.isAuthenticated = true;
          localStorage.setItem('mentrix_auth_token', action.payload.accessToken);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.academicDetails = action.payload.academicDetails || null;
        if (action.payload.accessToken) {
          state.token = action.payload.accessToken;
          state.isAuthenticated = true;
          localStorage.setItem('mentrix_auth_token', action.payload.accessToken);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.user) {
          state.user = action.payload.user;
        }
        if (action.payload?.academicDetails !== undefined) {
          state.academicDetails = action.payload.academicDetails;
        }
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        // Only clear token if 401 Unauthorized / forbidden
        const errMsg = (action.payload as string) || '';
        if (errMsg.toLowerCase().includes('expired') || errMsg.toLowerCase().includes('unauthorized')) {
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          clearStoredState();
        }
        state.error = action.payload as string;
      })
      // Update Academic Profile
      .addCase(updateAcademicProfile.fulfilled, (state, action) => {
        state.academicDetails = action.payload;
      });
  },
});

export const { setToken, setUser, clearAuth, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
