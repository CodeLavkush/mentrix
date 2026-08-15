import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { FileText, Upload, ArrowRight, Lock } from 'lucide-react';

interface DocumentRequiredGuardProps {
  children: React.ReactNode;
  featureName?: string;
}

export const DocumentRequiredGuard: React.FC<DocumentRequiredGuardProps> = ({
  children,
  featureName = 'This AI Study Feature',
}) => {
  const navigate = useNavigate();
  const { documents, loading } = useAppSelector((state) => state.document);

  const hasReadyDocument = documents.some((doc) => doc.uploadStatus === 'READY');

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[65vh] font-inter p-6">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Checking document status...</p>
        </div>
      </div>
    );
  }

  if (!hasReadyDocument) {
    return (
      <div className="flex items-center justify-center min-h-[75vh] font-inter p-4 sm:p-6">
        <div className="w-full max-w-lg glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-600/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/10 relative">
            <FileText className="w-8 h-8" />
            <span className="absolute -top-1.5 -right-1.5 p-1 bg-amber-500 text-white rounded-full shadow">
              <Lock className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold font-outfit text-slate-900 dark:text-white">
              Document Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">{featureName}</strong>{' '}
              requires at least one processed study document to generate AI insights, summaries, and assessments.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2 text-slate-600 dark:text-slate-400">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>How to unlock this feature:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] pl-1 text-slate-500 dark:text-slate-400">
              <li>Open Documents Studio</li>
              <li>Upload any PDF, DOCX, or TXT file (under 16MB)</li>
              <li>Wait a few moments for AI vector indexing to complete (Status: READY)</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/documents')}
              className="w-full sm:w-auto glow-btn px-6 py-3 rounded-xl text-white font-semibold font-outfit text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
            >
              <Upload className="w-4 h-4" />
              <span>Go to Documents Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default DocumentRequiredGuard;
