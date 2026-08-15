import React from 'react';
import { UploadStatus } from '../store/types';
import { CheckCircle2, Loader2, AlertCircle, Sparkles } from 'lucide-react';

interface DocumentStatusBadgeProps {
  status?: UploadStatus | string;
  isActive?: boolean;
  className?: string;
  showIconOnly?: boolean;
}

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({
  status,
  isActive = false,
  className = '',
  showIconOnly = false,
}) => {
  const normalizedStatus = (status || 'READY').toUpperCase();

  switch (normalizedStatus) {
    case UploadStatus.READY:
    case 'READY':
      return (
        <span
          className={`inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
            isActive
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
          } ${className}`}
          title="Document indexed & ready for AI study"
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
          {!showIconOnly && <span>{isActive ? 'Active • Ready' : 'Ready'}</span>}
        </span>
      );

    case UploadStatus.PROCESSING:
    case 'PROCESSING':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border bg-indigo-500/15 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 animate-pulse ${className}`}
          title="AI is analyzing, indexing, and generating vectors"
        >
          <Loader2 className="w-3 h-3 animate-spin text-indigo-500 flex-shrink-0" />
          {!showIconOnly && <span>Processing AI</span>}
        </span>
      );

    case UploadStatus.UPLOADING:
    case 'UPLOADING':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 ${className}`}
          title="Uploading document to secure storage"
        >
          <Loader2 className="w-3 h-3 animate-spin text-amber-500 flex-shrink-0" />
          {!showIconOnly && <span>Uploading</span>}
        </span>
      );

    case UploadStatus.FAILED:
    case 'FAILED':
      return (
        <span
          className={`inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-400 ${className}`}
          title="Document processing failed"
        >
          <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
          {!showIconOnly && <span>Failed</span>}
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 ${className}`}
        >
          <Sparkles className="w-3 h-3" />
          {!showIconOnly && <span>{status}</span>}
        </span>
      );
  }
};

export default DocumentStatusBadge;
