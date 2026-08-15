import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { FlashcardSet, Flashcard, FlashcardProgress } from '../types';
import { flashcardApi } from '../../api/flashcardApi';
import type { CreateFlashcardSetPayload } from '../../api/flashcardApi';

export interface FlashcardState {
  sets: FlashcardSet[];
  activeSet: FlashcardSet | null;
  cards: Flashcard[];
  progressMap: Record<string, FlashcardProgress>;
  loading: boolean;
  generating: boolean;
  error: string | null;
}

const initialState: FlashcardState = {
  sets: [],
  activeSet: null,
  cards: [],
  progressMap: {},
  loading: false,
  generating: false,
  error: null,
};

export const fetchFlashcardSetsByAttempt = createAsyncThunk(
  'flashcard/fetchFlashcardSetsByAttempt',
  async (quizAttemptId: string, { rejectWithValue }) => {
    try {
      const response = await flashcardApi.getSetsByQuizAttempt(quizAttemptId);
      return response.data;
    } catch (err: any) {
      if (err.statusCode === 404) {
        return [];
      }
      return rejectWithValue(err.message || 'Failed to fetch flashcard sets');
    }
  }
);

export const createFlashcardSet = createAsyncThunk(
  'flashcard/createFlashcardSet',
  async (
    { quizAttemptId, payload }: { quizAttemptId: string; payload: CreateFlashcardSetPayload },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await flashcardApi.createFlashcardSet(quizAttemptId, payload);
      if (response.data?.id) {
        dispatch(fetchCardsBySet(response.data.id));
      }
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create flashcard set');
    }
  }
);

export const fetchCardsBySet = createAsyncThunk(
  'flashcard/fetchCardsBySet',
  async (flashcardSetId: string, { rejectWithValue }) => {
    try {
      const response = await flashcardApi.getCardsBySet(flashcardSetId);
      return response.data;
    } catch (err: any) {
      if (err.statusCode === 404) {
        return [];
      }
      return rejectWithValue(err.message || 'Failed to fetch cards');
    }
  }
);

export const updateCardProgress = createAsyncThunk(
  'flashcard/updateCardProgress',
  async (
    { flashcardId, isCorrect }: { flashcardId: string; isCorrect: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await flashcardApi.updateProgress(flashcardId, isCorrect);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update flashcard progress');
    }
  }
);

const flashcardSlice = createSlice({
  name: 'flashcard',
  initialState,
  reducers: {
    setActiveSet(state, action: PayloadAction<FlashcardSet | null>) {
      state.activeSet = action.payload;
    },
    clearFlashcardError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sets
      .addCase(fetchFlashcardSetsByAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlashcardSetsByAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.sets = action.payload || [];
        if (action.payload && action.payload.length > 0) {
          state.activeSet = action.payload[0];
        } else {
          state.activeSet = null;
          state.cards = [];
        }
      })
      .addCase(fetchFlashcardSetsByAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Set
      .addCase(createFlashcardSet.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(createFlashcardSet.fulfilled, (state, action) => {
        state.generating = false;
        state.sets.unshift(action.payload);
        state.activeSet = action.payload;
      })
      .addCase(createFlashcardSet.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload as string;
      })
      // Fetch Cards
      .addCase(fetchCardsBySet.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCardsBySet.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload || [];
      })
      .addCase(fetchCardsBySet.rejected, (state) => {
        state.loading = false;
      })
      // Update Progress
      .addCase(updateCardProgress.fulfilled, (state, action) => {
        if (action.payload?.flashcardId) {
          state.progressMap[action.payload.flashcardId] = action.payload;
        }
      });
  },
});

export const { setActiveSet, clearFlashcardError } = flashcardSlice.actions;
export default flashcardSlice.reducer;
