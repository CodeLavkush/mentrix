import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { loadStateFromStorage } from '../persistence/localStorageHelper';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  activeTab: string;
  activeModal: string | null;
  toasts: ToastNotification[];
}

const loadedState = loadStateFromStorage();

const initialState: UIState = {
  theme: loadedState?.ui?.theme || 'dark',
  sidebarOpen: loadedState?.ui?.sidebarOpen ?? true,
  activeTab: 'dashboard',
  activeModal: null,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
    addToast(state, action: PayloadAction<Omit<ToastNotification, 'id'>>) {
      const id = Date.now().toString();
      state.toasts.push({ id, ...action.payload });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setActiveTab,
  openModal,
  closeModal,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
