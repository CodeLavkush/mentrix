const STORAGE_KEY = 'mentrix_persisted_state_v1';
const AUTH_TOKEN_KEY = 'mentrix_auth_token';

export interface PersistedState {
  auth?: {
    token?: string | null;
    user?: any | null;
    academicDetails?: any | null;
  };
  ui?: {
    theme?: 'light' | 'dark';
    sidebarOpen?: boolean;
  };
  whiteboard?: {
    draftCanvas?: any;
  };
  notes?: {
    draftNote?: any;
  };
}

export function loadStateFromStorage(): PersistedState | undefined {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    let parsedState: PersistedState = {};
    if (serialized) {
      parsedState = JSON.parse(serialized);
    }

    if (token) {
      if (!parsedState.auth) parsedState.auth = {};
      parsedState.auth.token = token;
    }

    return Object.keys(parsedState).length > 0 ? parsedState : undefined;
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return undefined;
  }
}

export function saveStateToStorage(state: PersistedState): void {
  try {
    if (state.auth?.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, state.auth.token);
    } else if (state.auth && state.auth.token === null) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }

    const stateToSave = { ...state };
    // We don't need token inside stateToSave JSON object as it's stored separately in AUTH_TOKEN_KEY
    if (stateToSave.auth) {
      const { token, ...authData } = stateToSave.auth;
      stateToSave.auth = authData;
    }

    const serialized = JSON.stringify(stateToSave);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function clearStoredState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (err) {
    console.error('Failed to clear stored state:', err);
  }
}
