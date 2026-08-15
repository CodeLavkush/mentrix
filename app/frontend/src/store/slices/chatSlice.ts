import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { Sender } from '../types';
import type { ChatMessage } from '../types';
import { chatApi } from '../../api/chatApi';

export interface ChatState {
  messagesByDocument: Record<string, ChatMessage[]>;
  loading: boolean;
  sending: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messagesByDocument: {},
  loading: false,
  sending: false,
  error: null,
};

export const fetchChatMessages = createAsyncThunk(
  'chat/fetchChatMessages',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await chatApi.getMessages(documentId);
      return { documentId, messages: response.data.messages || [] };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch chat history');
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  'chat/sendChatMessage',
  async (
    { documentId, message }: { documentId: string; message: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // Optimistically append user message to local state
      const tempUserMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        documentId,
        sender: Sender.USER,
        message,
        timestamp: new Date().toISOString(),
      };
      dispatch(addLocalMessage({ documentId, message: tempUserMsg }));

      const response = await chatApi.sendMessage(documentId, message);
      return { documentId, aiMessage: response.data };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to send message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addLocalMessage(
      state,
      action: PayloadAction<{ documentId: string; message: ChatMessage }>
    ) {
      const { documentId, message } = action.payload;
      if (!state.messagesByDocument[documentId]) {
        state.messagesByDocument[documentId] = [];
      }
      state.messagesByDocument[documentId].push(message);
    },
    clearChatError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messagesByDocument[action.payload.documentId] = action.payload.messages;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Send
      .addCase(sendChatMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.sending = false;
        const { documentId, aiMessage } = action.payload;
        if (!state.messagesByDocument[documentId]) {
          state.messagesByDocument[documentId] = [];
        }
        if (aiMessage) {
          state.messagesByDocument[documentId].push(aiMessage);
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload as string;
      });
  },
});

export const { addLocalMessage, clearChatError } = chatSlice.actions;
export default chatSlice.reducer;
