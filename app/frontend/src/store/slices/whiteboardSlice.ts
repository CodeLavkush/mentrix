import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Whiteboard } from '../types';
import { whiteboardApi } from '../../api/whiteboardApi';
import type { CreateWhiteboardPayload } from '../../api/whiteboardApi';
import { loadStateFromStorage } from '../persistence/localStorageHelper';

export interface WhiteboardState {
  whiteboards: Whiteboard[];
  activeWhiteboard: Whiteboard | null;
  draftCanvas: { title: string; drawingData: any } | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const loadedState = loadStateFromStorage();

const initialState: WhiteboardState = {
  whiteboards: [],
  activeWhiteboard: null,
  draftCanvas: loadedState?.whiteboard?.draftCanvas || null,
  loading: false,
  saving: false,
  error: null,
};

export const fetchWhiteboards = createAsyncThunk(
  'whiteboard/fetchWhiteboards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await whiteboardApi.getAllWhiteboards();
      return response.data;
    } catch (err: any) {
      if (err.statusCode === 404) {
        return [];
      }
      return rejectWithValue(err.message || 'Failed to fetch whiteboards');
    }
  }
);

export const createWhiteboard = createAsyncThunk(
  'whiteboard/createWhiteboard',
  async (payload: CreateWhiteboardPayload, { rejectWithValue }) => {
    try {
      const response = await whiteboardApi.createWhiteboard(payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create whiteboard');
    }
  }
);

export const deleteWhiteboard = createAsyncThunk(
  'whiteboard/deleteWhiteboard',
  async (whiteboardId: string, { rejectWithValue }) => {
    try {
      await whiteboardApi.deleteWhiteboard(whiteboardId);
      return whiteboardId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete whiteboard');
    }
  }
);

const whiteboardSlice = createSlice({
  name: 'whiteboard',
  initialState,
  reducers: {
    setActiveWhiteboard(state, action: PayloadAction<Whiteboard | null>) {
      state.activeWhiteboard = action.payload;
    },
    setDraftCanvas(state, action: PayloadAction<{ title: string; drawingData: any } | null>) {
      state.draftCanvas = action.payload;
    },
    clearDraftCanvas(state) {
      state.draftCanvas = null;
    },
    clearWhiteboardError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Whiteboards
      .addCase(fetchWhiteboards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWhiteboards.fulfilled, (state, action) => {
        state.loading = false;
        state.whiteboards = action.payload || [];
        if (!state.activeWhiteboard && action.payload?.length) {
          state.activeWhiteboard = action.payload[0];
        }
      })
      .addCase(fetchWhiteboards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Whiteboard
      .addCase(createWhiteboard.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createWhiteboard.fulfilled, (state, action) => {
        state.saving = false;
        state.whiteboards.unshift(action.payload);
        state.activeWhiteboard = action.payload;
        state.draftCanvas = null;
      })
      .addCase(createWhiteboard.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      // Delete Whiteboard
      .addCase(deleteWhiteboard.fulfilled, (state, action) => {
        state.whiteboards = state.whiteboards.filter((wb) => wb.id !== action.payload);
        if (state.activeWhiteboard?.id === action.payload) {
          state.activeWhiteboard = state.whiteboards[0] || null;
        }
      });
  },
});

export const {
  setActiveWhiteboard,
  setDraftCanvas,
  clearDraftCanvas,
  clearWhiteboardError,
} = whiteboardSlice.actions;
export default whiteboardSlice.reducer;
