import { combineReducers, configureStore, type Action } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import documentReducer from './slices/documentSlice';
import quizReducer from './slices/quizSlice';
import notesReducer from './slices/notesSlice';
import whiteboardReducer from './slices/whiteboardSlice';
import flashcardReducer from './slices/flashcardSlice';
import chatReducer from './slices/chatSlice';
import uiReducer from './slices/uiSlice';
import { persistMiddleware } from './persistence/persistMiddleware';

const appReducer = combineReducers({
  auth: authReducer,
  document: documentReducer,
  quiz: quizReducer,
  notes: notesReducer,
  whiteboard: whiteboardReducer,
  flashcard: flashcardReducer,
  chat: chatReducer,
  ui: uiReducer,
});

const rootReducer = (state: any, action: Action<string>) => {
  if (
    action.type === 'auth/clearAuth' ||
    action.type === 'auth/logoutUser/fulfilled' ||
    action.type === 'auth/logoutUser/rejected'
  ) {
    // Preserve UI preferences while setting auth to unauthenticated state explicitly
    const currentTheme = state?.ui?.theme || 'dark';
    state = {
      auth: {
        user: null,
        academicDetails: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      },
      ui: {
        theme: currentTheme,
        sidebarOpen: false,
      },
    };
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable files/data in specific actions if needed
        ignoredActions: ['auth/registerUser/pending', 'document/uploadDocument/pending', 'whiteboard/createWhiteboard/pending'],
      },
    }).concat(persistMiddleware),
});

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;

