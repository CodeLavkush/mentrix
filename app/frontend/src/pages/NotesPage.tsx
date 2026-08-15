import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import showToast from '../utils/toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchNotesByDocument,
  createNote,
  deleteNote,
  setActiveNote,
  setDraftNote,
} from '../store/slices/notesSlice';
import type { Note } from '../store/types';
import MarkdownRenderer from '../components/MarkdownRenderer';
import {
  BookOpen,
  Plus,
  Trash2,
  Save,
  FileText,
  AlertCircle,
  Sparkles,
  Eye,
  Edit3,
  CheckCircle,
  RotateCcw,
  Clock,
} from 'lucide-react';

export const NotesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  const { activeDocument } = useAppSelector((state) => state.document);
  const { notes, activeNote, draftNote, loading, saving, error } = useAppSelector((state) => state.notes);

  const documentId = activeDocument?.id || '';

  const [title, setTitle] = useState(draftNote?.title || '');
  const [content, setContent] = useState(draftNote?.content || '');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (documentId) {
      dispatch(fetchNotesByDocument(documentId));
    }
  }, [dispatch, documentId]);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        '.notes-panel',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.editor-panel',
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' }
      );
    }
  }, [documentId]);

  // When activeNote changes (user selects a note), update the editor inputs and animate
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      gsap.fromTo(
        '.editor-panel',
        { scale: 0.99, borderColor: 'rgba(99, 102, 241, 0.6)' },
        { scale: 1, borderColor: 'rgba(51, 65, 85, 1)', duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [activeNote]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    dispatch(setDraftNote({ documentId, title: val, content }));
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    dispatch(setDraftNote({ documentId, title, content: val }));
  };

  const handleSaveNote = async () => {
    if (!documentId) {
      showToast.warning('Please select an active document first.');
      return;
    }
    if (!title.trim()) {
      showToast.warning('Please provide a title for your note.');
      return;
    }

    const toastId = showToast.loading(activeNote ? 'Updating note in cloud...' : 'Saving note to cloud...');
    const result = await dispatch(createNote({ documentId, payload: { title: title.trim(), content } }));
    if (createNote.fulfilled.match(result)) {
      showToast.dismiss(toastId);
      showToast.success(activeNote ? 'Note updated successfully! ✨' : 'Note created & saved! ✨');
    } else {
      showToast.dismiss(toastId);
      const errMsg = (result.payload as string) || 'Failed to save note. Please try again.';
      showToast.error(errMsg);
    }
  };

  const handleSelectNote = (note: Note) => {
    dispatch(setActiveNote(note));
    setTitle(note.title);
    setContent(note.content);
    setPreviewMode(false);
    showToast.info(`Editing note: "${note.title}"`);
  };

  const handleCreateNew = () => {
    dispatch(setActiveNote(null));
    setTitle('');
    setContent('');
    setPreviewMode(false);
    editorRef.current?.focus();
    showToast.info('Ready for a new note.');
  };

  const handleDelete = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!documentId) return;
    if (confirm('Are you sure you want to delete this note?')) {
      const toastId = showToast.loading('Deleting note...');
      const result = await dispatch(deleteNote({ documentId, noteId }));
      if (deleteNote.fulfilled.match(result)) {
        showToast.dismiss(toastId);
        showToast.success('Note deleted successfully.');
        if (activeNote?.id === noteId) {
          handleCreateNew();
        }
      } else {
        showToast.dismiss(toastId);
        const errMsg = (result.payload as string) || 'Failed to delete note.';
        showToast.error(errMsg);
      }
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  if (!activeDocument) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[70vh] font-inter">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center max-w-md space-y-4 shadow-xl">
          <FileText className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-xl font-bold font-outfit text-white">No Active Document Selected</h2>
          <p className="text-xs text-slate-400">Please select or upload a document to create and view notes.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 font-inter">
      {/* Saved Notes Sidebar */}
      <div className="notes-panel glass-card p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden shadow-xl max-h-[360px] lg:max-h-none">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 dark:text-indigo-400" />
            <h2 className="text-sm sm:text-base font-bold font-outfit text-slate-900 dark:text-white">Notes Library</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">({notes.length})</span>
          </div>
          <button
            type="button"
            onClick={handleCreateNew}
            className="p-1.5 sm:p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/30 dark:hover:bg-indigo-600/50 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-semibold border border-indigo-200 dark:border-indigo-500/30 transition flex items-center space-x-1 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {loading && notes.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <FileText className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No saved notes for this document yet.</p>
            </div>
          ) : (
            notes.map((note: Note) => {
              const isSelected = activeNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-600/25 border-indigo-400 dark:border-indigo-500 text-indigo-900 dark:text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-900/80'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center space-x-1.5">
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />}
                      <h3 className={`text-xs font-bold font-outfit truncate ${isSelected ? 'text-indigo-600 dark:text-white' : 'text-slate-900 dark:text-white'}`}>{note.title}</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1">{note.content.slice(0, 45)}...</p>
                    <div className="flex items-center space-x-2 text-[9px] text-slate-400 dark:text-slate-500 mt-1.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{new Date(note.updatedAt || note.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(note.id, e)}
                    className="p-1.5 hover:text-red-500 hover:bg-red-500/10 text-slate-400 rounded-lg transition cursor-pointer flex-shrink-0"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Note Editor Panel */}
      <div className="editor-panel lg:col-span-2 glass-card p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-full space-y-4 shadow-xl relative overflow-hidden">
        {/* Editor Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 ${
                activeNote
                  ? 'bg-amber-500/20 text-amber-500 dark:text-amber-300 border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/30'
              }`}
            >
              {activeNote ? <Edit3 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 truncate">
                <h2 className="text-base font-bold font-outfit text-slate-900 dark:text-white truncate">
                  {activeNote ? 'Edit Note' : 'Create New Note'}
                </h2>
                {activeNote && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-[10px] font-semibold flex-shrink-0">
                    Editing
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {activeNote
                  ? `Last modified: ${new Date(
                      activeNote.updatedAt || activeNote.createdAt || Date.now()
                    ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Capture notes & AI study insights'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
            {activeNote && (
              <button
                type="button"
                onClick={handleCreateNew}
                className="px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1 cursor-pointer"
                title="Discard active edit and create new note"
              >
                <RotateCcw className="w-3 h-3" />
                <span>New</span>
              </button>
            )}

            {/* Write vs Preview Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/80 p-0.5 sm:p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1 ${
                  !previewMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Write</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1 ${
                  previewMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveNote}
              disabled={saving || !title.trim()}
              className="glow-btn px-3.5 sm:px-5 py-2 rounded-xl text-white text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer shadow-lg flex-shrink-0"
            >
              {saving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{activeNote ? 'Update Note' : 'Save Note'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note Title (e.g. Chapter 1 Summary)..."
            className="w-full glass-input px-4 py-3 rounded-xl text-sm font-bold font-outfit text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Main Editor / Markdown Preview Area */}
        {previewMode ? (
          <div className="flex-1 glass-panel p-5 rounded-xl border border-slate-800/80 overflow-y-auto min-h-[260px]">
            {content ? (
              <MarkdownRenderer content={content} />
            ) : (
              <p className="text-xs text-slate-500 italic">No content to preview.</p>
            )}
          </div>
        ) : (
          <textarea
            ref={editorRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Type your notes, AI insights, code snippets, or markdown here..."
            className="flex-1 glass-input p-4 rounded-xl text-xs font-mono leading-relaxed resize-none focus:outline-none min-h-[260px]"
          />
        )}

        {/* Status Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
          <div className="flex items-center space-x-3">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>
          {activeNote && (
            <div className="flex items-center space-x-1 text-emerald-400 font-medium">
              <CheckCircle className="w-3 h-3" />
              <span>Loaded note from cloud</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
