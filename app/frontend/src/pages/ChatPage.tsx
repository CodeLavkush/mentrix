import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchChatMessages, sendChatMessage } from '../store/slices/chatSlice';
import type { ChatMessage } from '../store/types';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { Send, User, FileText, AlertCircle, Copy } from 'lucide-react';
import mentrixLogo from '../assets/mentrix_logo.png';

import showToast from '../utils/toast';

export const ChatPage: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const dispatch = useAppDispatch();
  const { activeDocument } = useAppSelector((state) => state.document);
  const { messagesByDocument, sending, loading, error } = useAppSelector((state) => state.chat);

  const documentId = activeDocument?.id || '';
  const messages: ChatMessage[] = documentId ? messagesByDocument[documentId] || [] : [];

  useEffect(() => {
    if (documentId) {
      dispatch(fetchChatMessages(documentId));
    }
  }, [dispatch, documentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    gsap.fromTo(
      '.chat-bubble:last-child',
      { opacity: 0, y: 12, scale: 0.98 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, [messages.length, sending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) {
      showToast.warning('Please enter a message or select a suggested prompt.');
      return;
    }
    if (!documentId) {
      showToast.warning('Please select an active document from the top navigation first.');
      return;
    }
    if (sending) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    const result = await dispatch(sendChatMessage({ documentId, message: messageText }));
    if (sendChatMessage.fulfilled.match(result)) {
      // response rendered smoothly
    } else {
      const errMsg = (result.payload as string) || 'AI Assistant could not generate a response. Please try again.';
      showToast.error(errMsg);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast.success('Response copied to clipboard!');
  };

  const promptSuggestions = [
    'Summarize key concepts in this document.',
    'What are the main definitions mentioned?',
    'Create 3 practice questions from this material.',
    'Explain the most difficult topic simply.',
  ];

  if (!activeDocument) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[70vh] font-inter">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center max-w-md space-y-4 shadow-xl">
          <FileText className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-xl font-bold font-outfit text-white">No Active Document Selected</h2>
          <p className="text-xs text-slate-400">
            Please select or upload a document first to start chatting with your AI Student Assistant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col font-inter space-y-4">
      {/* Header Context Banner */}
      <div className="glass-panel px-5 py-3 rounded-xl border border-slate-800 flex items-center justify-between flex-shrink-0 shadow-lg">
        <div className="flex items-center space-x-3">
          <img src={mentrixLogo} alt="Mentrix AI" className="w-9 h-9 object-contain drop-shadow" />
          <div>
            <div className="text-sm font-bold font-outfit text-white flex items-center space-x-2">
              <span>Mentrix AI Assistant</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                Online
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Context: <span className="text-indigo-300 font-medium">{activeDocument.fileName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2 flex-shrink-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {loading && messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading chat history...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <img src={mentrixLogo} alt="AI" className="w-16 h-16 object-contain mx-auto drop-shadow-xl animate-pulse" />
            <h3 className="text-lg font-bold font-outfit text-white">Ask anything about this document!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your AI assistant can explain concepts, find definitions, create study guides, and answer any questions.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto pt-2">
              {promptSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestionClick(s)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 hover:text-white transition cursor-pointer"
                >
                  💡 {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg: ChatMessage) => {
            const isUser = msg.sender === 'USER';
            return (
              <div
                key={msg.id}
                className={`chat-bubble flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isUser ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-indigo-500/30 overflow-hidden'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <img src={mentrixLogo} alt="AI" className="w-6 h-6 object-contain" />}
                </div>
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed relative group ${
                    isUser
                      ? 'bg-mentrix-btn text-white font-medium rounded-tr-none shadow-md shadow-indigo-500/10'
                      : 'glass-card border border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  ) : (
                    <MarkdownRenderer content={msg.message} />
                  )}
                  {!isUser && (
                    <button
                      onClick={() => copyMessage(msg.message)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition p-1.5 bg-slate-800/90 rounded-lg border border-slate-700/80 cursor-pointer"
                      title="Copy response"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {sending && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-indigo-500/30 flex items-center justify-center">
              <img src={mentrixLogo} alt="AI" className="w-6 h-6 object-contain animate-spin" />
            </div>
            <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-none text-xs text-indigo-300 animate-pulse border border-indigo-500/30">
              AI Assistant is analyzing the document and generating formatted response...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="glass-panel p-2 rounded-2xl border border-slate-800 flex items-center space-x-2 flex-shrink-0 shadow-xl"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask AI about ${activeDocument.fileName}...`}
          className="flex-1 glass-input px-4 py-3 rounded-xl text-xs bg-transparent border-0 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || sending}
          className="glow-btn p-3 rounded-xl text-white disabled:opacity-40 cursor-pointer flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
