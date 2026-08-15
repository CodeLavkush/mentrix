import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Palette, RotateCcw, Download } from 'lucide-react';

export interface CanvasBoardHandle {
  getDataUrl: () => string | null;
  getBlob: () => Promise<Blob | null>;
  clear: () => void;
}

interface CanvasBoardProps {
  initialData?: any;
  onSave?: (drawingData: string) => void;
}

export const CanvasBoard = forwardRef<CanvasBoardHandle, CanvasBoardProps>(({ initialData, onSave }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6366F1');
  const [lineWidth, setLineWidth] = useState(4);
  const [mode, setMode] = useState<'draw' | 'erase'>('draw');

  useImperativeHandle(ref, () => ({
    getDataUrl: () => {
      return canvasRef.current ? canvasRef.current.toDataURL('image/png') : null;
    },
    getBlob: () => {
      return new Promise<Blob | null>((resolve) => {
        if (!canvasRef.current) return resolve(null);
        canvasRef.current.toBlob((blob) => resolve(blob), 'image/png');
      });
    },
    clear: () => {
      clearCanvas();
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set responsive canvas dimensions
    const parentWidth = canvas.parentElement?.clientWidth || 800;
    canvas.width = parentWidth;
    canvas.height = window.innerWidth < 640 ? 380 : 500;

    // Background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (initialData) {
      const rawImage = typeof initialData === 'string'
        ? initialData
        : initialData?.image || initialData?.drawingData;

      if (rawImage && typeof rawImage === 'string' && rawImage.startsWith('data:image')) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = rawImage;
      }
    }
  }, [initialData]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = mode === 'erase' ? '#0F172A' : color;
    ctx.lineWidth = mode === 'erase' ? lineWidth * 4 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Touch drawing handlers for mobile & tablet screens
  const getTouchPos = (canvas: HTMLCanvasElement, touchEvent: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvas.getBoundingClientRect();
    const touch = touchEvent.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const startTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getTouchPos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const touchDraw = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getTouchPos(canvas, e);
    ctx.strokeStyle = mode === 'erase' ? '#0F172A' : color;
    ctx.lineWidth = mode === 'erase' ? lineWidth * 4 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (onSave && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (onSave) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `mentrix-whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const colors = ['#6366F1', '#818CF8', '#38BDF8', '#4ADE80', '#FACC15', '#F87171', '#FFFFFF'];

  return (
    <div className="flex flex-col space-y-3 font-inter">
      {/* Responsive Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              mode === 'draw'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ✏️ Draw
          </button>
          <button
            type="button"
            onClick={() => setMode('erase')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              mode === 'erase'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🧹 Eraser
          </button>

          {/* Color Palette */}
          {mode === 'draw' && (
            <div className="flex items-center space-x-1.5 sm:ml-2 border-l border-slate-200 dark:border-slate-700 pl-2 sm:pl-3">
              <Palette className="w-4 h-4 text-slate-400 mr-0.5 hidden sm:inline" />
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border transition transform hover:scale-110 cursor-pointer ${
                    color === c ? 'border-indigo-400 scale-110 shadow-md' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}

          {/* Line Thickness */}
          <div className="flex items-center space-x-2 sm:ml-2 border-l border-slate-200 dark:border-slate-700 pl-2 sm:pl-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">Size:</span>
            <input
              type="range"
              min="2"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-16 sm:w-20 accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Clear & Download */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={clearCanvas}
            className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-red-500/10 hover:text-red-500 dark:bg-slate-800 dark:hover:bg-red-500/20 dark:hover:text-red-400 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
          <button
            type="button"
            onClick={downloadCanvas}
            className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-950 relative touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startTouchDrawing}
          onTouchMove={touchDraw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair block"
        />
      </div>
    </div>
  );
});

export default CanvasBoard;
