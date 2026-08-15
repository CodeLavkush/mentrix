import type { Middleware } from '@reduxjs/toolkit';
import { saveStateToStorage } from './localStorageHelper';

export const persistMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);

  const state = storeApi.getState();

  // Save selected persistent state slices to localStorage
  saveStateToStorage({
    auth: {
      token: state.auth?.token,
      user: state.auth?.user,
      academicDetails: state.auth?.academicDetails,
    },
    ui: {
      theme: state.ui?.theme,
      sidebarOpen: state.ui?.sidebarOpen,
    },
    whiteboard: {
      draftCanvas: state.whiteboard?.draftCanvas,
    },
    notes: {
      draftNote: state.notes?.draftNote,
    },
  });

  return result;
};
