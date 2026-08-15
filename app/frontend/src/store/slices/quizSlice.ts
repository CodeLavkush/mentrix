import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Quiz, QuizQuestion, QuizAttempt } from '../types';
import { quizApi } from '../../api/quizApi';
import type { CreateQuizPayload, SubmitAttemptPayload } from '../../api/quizApi';

export interface QuizState {
  quizzes: Quiz[];
  activeQuiz: Quiz | null;
  attempts: QuizAttempt[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: QuizState = {
  quizzes: [],
  activeQuiz: null,
  attempts: [],
  loading: false,
  submitting: false,
  error: null,
};

export const fetchQuizzesByDocument = createAsyncThunk(
  'quiz/fetchQuizzesByDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await quizApi.getQuizzesByDocument(documentId);
      return response.data;
    } catch (err: any) {
      if (err.statusCode === 404) {
        return [];
      }
      return rejectWithValue(err.message || 'Failed to fetch quizzes');
    }
  }
);

export const createQuiz = createAsyncThunk(
  'quiz/createQuiz',
  async (
    { documentId, payload }: { documentId: string; payload: CreateQuizPayload },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await quizApi.createQuiz(documentId, payload);
      if (response.data?.id) {
        // Automatically fetch questions for created quiz
        dispatch(fetchQuizQuestions(response.data.id));
      }
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create quiz');
    }
  }
);

export const fetchQuizById = createAsyncThunk(
  'quiz/fetchQuizById',
  async (
    { documentId, quizId }: { documentId: string; quizId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await quizApi.getQuizById(documentId, quizId);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch quiz');
    }
  }
);

export const fetchQuizQuestions = createAsyncThunk(
  'quiz/fetchQuizQuestions',
  async (quizId: string, { rejectWithValue }) => {
    try {
      const response = await quizApi.getQuizQuestions(quizId);
      return { quizId, questions: response.data || [] };
    } catch (err: any) {
      if (err.statusCode === 404) {
        return { quizId, questions: [] };
      }
      return rejectWithValue(err.message || 'Failed to fetch quiz questions');
    }
  }
);

export const submitQuizAttempt = createAsyncThunk(
  'quiz/submitQuizAttempt',
  async (
    { quizId, payload }: { quizId: string; payload: SubmitAttemptPayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await quizApi.submitAttempt(quizId, payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to submit quiz attempt');
    }
  }
);

export const fetchQuizAttempts = createAsyncThunk(
  'quiz/fetchQuizAttempts',
  async (quizId: string, { rejectWithValue }) => {
    try {
      const response = await quizApi.getAttemptsByQuiz(quizId);
      return response.data;
    } catch (err: any) {
      if (err.statusCode === 404) {
        return [];
      }
      return rejectWithValue(err.message || 'Failed to fetch quiz attempts');
    }
  }
);

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setActiveQuiz(state, action: PayloadAction<Quiz | null>) {
      state.activeQuiz = action.payload;
    },
    setQuizQuestions(state, action: PayloadAction<{ quizId: string; questions: QuizQuestion[] }>) {
      if (state.activeQuiz && state.activeQuiz.id === action.payload.quizId) {
        state.activeQuiz.quizQuestions = action.payload.questions;
      }
      const target = state.quizzes.find((q) => q.id === action.payload.quizId);
      if (target) {
        target.quizQuestions = action.payload.questions;
      }
    },
    clearQuizError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Quizzes
      .addCase(fetchQuizzesByDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzesByDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload || [];
      })
      .addCase(fetchQuizzesByDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Quiz
      .addCase(createQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes.unshift(action.payload);
        state.activeQuiz = action.payload;
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Quiz Questions
      .addCase(fetchQuizQuestions.fulfilled, (state, action) => {
        const { quizId, questions } = action.payload;
        if (state.activeQuiz && state.activeQuiz.id === quizId) {
          state.activeQuiz.quizQuestions = questions;
        }
        const target = state.quizzes.find((q) => q.id === quizId);
        if (target) {
          target.quizQuestions = questions;
        }
      })
      // Fetch Quiz By Id
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.activeQuiz = action.payload;
      })
      // Submit Attempt
      .addCase(submitQuizAttempt.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitQuizAttempt.fulfilled, (state, action) => {
        state.submitting = false;
        state.attempts.unshift(action.payload);
      })
      .addCase(submitQuizAttempt.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // Fetch Attempts
      .addCase(fetchQuizAttempts.fulfilled, (state, action) => {
        state.attempts = action.payload || [];
      });
  },
});

export const { setActiveQuiz, setQuizQuestions, clearQuizError } = quizSlice.actions;
export default quizSlice.reducer;
