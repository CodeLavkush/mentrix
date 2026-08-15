import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Note } from '../types';
import { notesApi } from '../../api/notesApi';
import type { CreateNotePayload } from '../../api/notesApi';
import { loadStateFromStorage } from '../persistence/localStorageHelper';

export interface NotesState {
  notes: Note[];
  activeNote: Note | null;
  draftNote: { documentId?: string; title: string; content: string } | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const loadedState = loadStateFromStorage();

const initialState: NotesState = {
  notes: [],
  activeNote: null,
  draftNote: loadedState?.notes?.draftNote || null,
  loading: false,
  saving: false,
  error: null,
};

export const fetchNotesByDocument = createAsyncThunk(
  'notes/fetchNotesByDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await notesApi.getNotesByDocument(documentId);
      return response.data;
    } catch (err: any) {
      if (err.statusCode === 404) {
        return [];
      }
      return rejectWithValue(err.message || 'Failed to fetch notes');
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/createNote',
  async (
    { documentId, payload }: { documentId: string; payload: CreateNotePayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await notesApi.createNote(documentId, payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to save note');
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (
    { documentId, noteId }: { documentId: string; noteId: string },
    { rejectWithValue }
  ) => {
    try {
      await notesApi.deleteNote(documentId, noteId);
      return noteId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete note');
    }
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setActiveNote(state, action: PayloadAction<Note | null>) {
      state.activeNote = action.payload;
    },
    setDraftNote(
      state,
      action: PayloadAction<{ documentId?: string; title: string; content: string } | null>
    ) {
      state.draftNote = action.payload;
    },
    clearDraftNote(state) {
      state.draftNote = null;
    },
    clearNotesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notes
      .addCase(fetchNotesByDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotesByDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload || [];
        if (!state.activeNote && action.payload && action.payload.length > 0) {
          state.activeNote = action.payload[0];
        }
      })
      .addCase(fetchNotesByDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create / Update Note
      .addCase(createNote.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload?.id) {
          const index = state.notes.findIndex((n) => n.id === action.payload.id);
          if (index >= 0) {
            state.notes[index] = action.payload;
          } else {
            state.notes.unshift(action.payload);
          }
          state.activeNote = action.payload;
        }
        state.draftNote = null;
      })
      .addCase(createNote.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      // Delete Note
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter((note) => note.id !== action.payload);
        if (state.activeNote?.id === action.payload) {
          state.activeNote = state.notes[0] || null;
        }
      });
  },
});

export const { setActiveNote, setDraftNote, clearDraftNote, clearNotesError } = notesSlice.actions;
export default notesSlice.reducer;
