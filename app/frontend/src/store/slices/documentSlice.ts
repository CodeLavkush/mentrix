import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { DocumentItem } from '../types';
import { documentApi } from '../../api/documentApi';

export interface DocumentState {
  documents: DocumentItem[];
  activeDocument: DocumentItem | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  documents: [],
  activeDocument: null,
  loading: false,
  uploading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk(
  'document/fetchDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await documentApi.getDocuments();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch documents');
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'document/uploadDocument',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await documentApi.uploadDocument(file);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to upload document');
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'document/deleteDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      await documentApi.deleteDocument(documentId);
      return documentId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete document');
    }
  }
);

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    setActiveDocument(state, action: PayloadAction<DocumentItem | null>) {
      state.activeDocument = action.payload;
    },
    clearDocumentError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload || [];
        if (!state.activeDocument && action.payload?.length) {
          state.activeDocument = action.payload[0];
        }
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Upload
      .addCase(uploadDocument.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.uploading = false;
        state.documents.unshift(action.payload);
        state.activeDocument = action.payload;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter((doc) => doc.id !== action.payload);
        if (state.activeDocument?.id === action.payload) {
          state.activeDocument = state.documents[0] || null;
        }
      });
  },
});

export const { setActiveDocument, clearDocumentError } = documentSlice.actions;
export default documentSlice.reducer;
