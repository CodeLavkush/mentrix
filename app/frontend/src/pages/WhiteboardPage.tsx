import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchWhiteboards,
  createWhiteboard,
  deleteWhiteboard,
  setActiveWhiteboard,
  setDraftCanvas,
} from '../store/slices/whiteboardSlice';
import CanvasBoard, { type CanvasBoardHandle } from '../components/CanvasBoard';
import type { Whiteboard } from '../store/types';
import { Edit3, Save, Trash2, Plus, AlertCircle, Image as ImageIcon, Sparkles, Clock } from 'lucide-react';

export const WhiteboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const canvasBoardRef = useRef<CanvasBoardHandle | null>(null);

  const { whiteboards, activeWhiteboard, draftCanvas, loading, saving, error } = useAppSelector(
    (state) => state.whiteboard
  );

  const [title, setTitle] = useState(draftCanvas?.title || activeWhiteboard?.title || 'New Whiteboard');
  const [currentCanvasData, setCurrentCanvasData] = useState<any>(
    draftCanvas?.drawingData || activeWhiteboard?.drawingData || null
  );

  useEffect(() => {
    dispatch(fetchWhiteboards());
  }, [dispatch]);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        '.wb-top-bar',
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.wb-canvas-area',
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out', delay: 0.15 }
      );
    }
  }, []);

  useEffect(() => {
    if (activeWhiteboard) {
      setTitle(activeWhiteboard.title);
      setCurrentCanvasData(activeWhiteboard.drawingData);
    }
  }, [activeWhiteboard]);

  const handleCanvasChange = (dataUrl: string) => {
    setCurrentCanvasData(dataUrl);
    dispatch(setDraftCanvas({ title, drawingData: dataUrl }));
  };

  const handleSaveWhiteboard = async () => {
    if (!title.trim()) {
      toast.error('Please provide a whiteboard title');
      return;
    }

    const dataUrl = canvasBoardRef.current?.getDataUrl() || currentCanvasData;
    if (!dataUrl) {
      toast.error('Canvas is empty');
      return;
    }

    const blob = await canvasBoardRef.current?.getBlob();
    const toastId = toast.loading('Saving whiteboard & thumbnail to cloud...');

    const payload = {
      title,
      drawingData: {
        image: dataUrl,
        updatedAt: new Date().toISOString(),
      },
      thumbnail: blob || dataUrl,
    };

    const result = await dispatch(createWhiteboard(payload));
    if (createWhiteboard.fulfilled.match(result)) {
      toast.success('Whiteboard saved with thumbnail! ✨', { id: toastId });
    } else {
      toast.error((result.payload as string) || 'Failed to save whiteboard', { id: toastId });
    }
  };

  const handleCreateNew = () => {
    dispatch(setActiveWhiteboard(null));
    canvasBoardRef.current?.clear();
    const newName = `Whiteboard ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    setTitle(newName);
    setCurrentCanvasData(null);
    toast.success('Ready for new whiteboard canvas', { icon: '🎨' });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this whiteboard?')) {
      const toastId = toast.loading('Deleting whiteboard...');
      const result = await dispatch(deleteWhiteboard(id));
      if (deleteWhiteboard.fulfilled.match(result)) {
        toast.success('Whiteboard deleted', { id: toastId });
      } else {
        toast.error('Failed to delete whiteboard', { id: toastId });
      }
    }
  };

  return (
    <div ref={pageRef} className="p-8 space-y-6 font-inter">
      {/* Top Studio Controls */}
      <div className="wb-top-bar glass-card p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center shadow-md">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                dispatch(setDraftCanvas({ title: e.target.value, drawingData: currentCanvasData }));
              }}
              placeholder="Whiteboard Title..."
              className="glass-input px-4 py-2 rounded-xl text-base font-bold font-outfit max-w-sm text-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleCreateNew}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Canvas</span>
          </button>
          <button
            type="button"
            onClick={handleSaveWhiteboard}
            disabled={saving || !title.trim()}
            className="glow-btn px-5 py-2.5 rounded-xl text-white text-xs font-semibold flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save to Cloud'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Interactive Canvas & Saved Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="wb-canvas-area lg:col-span-3">
          <CanvasBoard
            ref={canvasBoardRef}
            initialData={currentCanvasData}
            onSave={handleCanvasChange}
          />
        </div>

        {/* Saved Whiteboards Sidebar with Visual Thumbnails */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 max-h-[580px] flex flex-col shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold font-outfit text-white flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-pink-400" />
              <span>Saved Boards</span>
            </h3>
            <span className="text-xs text-slate-400 font-normal">({whiteboards.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {loading && whiteboards.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading whiteboards...</div>
            ) : whiteboards.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No saved whiteboards yet.</p>
              </div>
            ) : (
              whiteboards.map((wb: Whiteboard) => {
                const isSelected = activeWhiteboard?.id === wb.id;
                const rawData = wb.drawingData as any;
                
                let thumbImg: string | null = null;
                if (typeof rawData === 'object' && rawData?.image && typeof rawData.image === 'string' && rawData.image.startsWith('data:image')) {
                  thumbImg = rawData.image;
                } else if (typeof rawData === 'string' && rawData.startsWith('data:image')) {
                  thumbImg = rawData;
                } else if (wb.thumbnailUrl) {
                  if (wb.thumbnailUrl.startsWith('http') || wb.thumbnailUrl.startsWith('data:')) {
                    thumbImg = wb.thumbnailUrl;
                  } else {
                    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
                    const host = apiBase.replace(/\/api\/v1\/?$/, '');
                    thumbImg = `${host}${wb.thumbnailUrl.startsWith('/') ? '' : '/'}${wb.thumbnailUrl}`;
                  }
                } else if (wb.id) {
                  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
                  thumbImg = `${apiBase}/whiteboard/${wb.id}/thumbnail`;
                }

                return (
                  <div
                    key={wb.id}
                    onClick={() => dispatch(setActiveWhiteboard(wb))}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 group ${
                      isSelected
                        ? 'bg-pink-500/20 border-pink-500 text-white shadow-lg ring-1 ring-pink-500/40'
                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    {/* Thumbnail Preview Banner */}
                    <div className="w-full h-24 rounded-lg bg-slate-950/80 border border-slate-800/80 overflow-hidden flex items-center justify-center relative">
                      {thumbImg ? (
                        <img
                          src={thumbImg}
                          alt={wb.title}
                          className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback if network stream fails
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center space-y-1 text-slate-600">
                          <ImageIcon className="w-6 h-6" />
                          <span className="text-[10px]">No Preview</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata Header & Delete Button */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="truncate pr-2">
                        <h4 className="text-xs font-bold font-outfit truncate text-white">{wb.title}</h4>
                        <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(wb.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(wb.id, e)}
                        className="p-1.5 hover:text-red-400 hover:bg-red-500/10 text-slate-500 rounded-lg transition cursor-pointer flex-shrink-0"
                        title="Delete Whiteboard"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiteboardPage;
