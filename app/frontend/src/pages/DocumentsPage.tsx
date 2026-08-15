import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDocuments, uploadDocument, deleteDocument, setActiveDocument } from '../store/slices/documentSlice';
import type { DocumentItem } from '../store/types';
import { Upload, FileText, Trash2, AlertCircle, File, ExternalLink } from 'lucide-react';
import { formatFileSize } from '../utils/format';
import DocumentStatusBadge from '../components/DocumentStatusBadge';

import showToast from '../utils/toast';

export const DocumentsPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const pageRef = useRef<HTMLDivElement | null>(null);

  const dispatch = useAppDispatch();
  const { documents, activeDocument, loading, uploading, error } = useAppSelector((state) => state.document);

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  // Live auto-polling if any document is currently uploading or processing
  useEffect(() => {
    const hasPendingDocs = documents.some(
      (doc) => doc.uploadStatus === 'UPLOADING' || doc.uploadStatus === 'PROCESSING'
    );
    if (!hasPendingDocs) return;

    const interval = setInterval(() => {
      dispatch(fetchDocuments());
    }, 3000);

    return () => clearInterval(interval);
  }, [dispatch, documents]);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        '.doc-anim-zone',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.doc-card',
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'back.out(1.2)', delay: 0.2 }
      );
    }
  }, [documents.length]);

  const validateAndSetFile = (file: File) => {
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      showToast.warning('Unsupported file type. Please upload a PDF, DOCX, or TXT document.');
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      showToast.warning('File exceeds 16MB limit. Please choose a smaller file.');
      return;
    }

    setSelectedFile(file);
    showToast.info(`Selected: ${file.name} (${formatFileSize(file.size)})`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast.warning('Please select a file to upload first.');
      return;
    }
    const toastId = showToast.loading('Uploading and indexing document...');
    const result = await dispatch(uploadDocument(selectedFile));
    if (uploadDocument.fulfilled.match(result)) {
      showToast.dismiss(toastId);
      showToast.success(`"${selectedFile.name}" uploaded successfully! Indexing initiated.`);
      setSelectedFile(null);
    } else {
      showToast.dismiss(toastId);
      const errMsg = (result.payload as string) || 'Failed to upload document. Please check file format and try again.';
      showToast.error(errMsg);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this document?')) {
      const toastId = showToast.loading('Deleting document...');
      const result = await dispatch(deleteDocument(docId));
      if (deleteDocument.fulfilled.match(result)) {
        showToast.dismiss(toastId);
        showToast.success('Document deleted successfully.');
      } else {
        showToast.dismiss(toastId);
        const errMsg = (result.payload as string) || 'Failed to delete document.';
        showToast.error(errMsg);
      }
    }
  };

  const handleSelectDoc = (doc: DocumentItem) => {
    dispatch(setActiveDocument(doc));
    showToast.success(`Active document set to "${doc.fileName}"`);
  };

  return (
    <div ref={pageRef} className="p-8 space-y-8 font-inter">
      {/* Upload Zone */}
      <div className="doc-anim-zone glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold font-outfit text-white flex items-center space-x-2">
          <Upload className="w-5 h-5 text-indigo-400" />
          <span>Upload Study Material</span>
        </h2>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            dragActive
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
          }`}
        >
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.docx,.txt"
          />
          <label htmlFor="file-upload" className="cursor-pointer space-y-3 block">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <File className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white font-outfit">
                {selectedFile ? selectedFile.name : 'Click to upload or drag & drop file'}
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, or TXT (Max 16MB)</p>
            </div>
          </label>
        </div>

        {selectedFile && (
          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="glow-btn px-6 py-2.5 rounded-xl text-white font-semibold text-xs flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Confirm Upload'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Documents Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-outfit text-white">Your Documents ({documents.length})</h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center text-slate-400 border border-slate-800 space-y-2">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-base font-semibold text-white font-outfit">No documents uploaded yet</p>
            <p className="text-xs">Upload your first file above to unlock AI study features.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map((doc: DocumentItem) => {
              const isActive = activeDocument?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => handleSelectDoc(doc)}
                  className={`doc-card glass-card p-5 rounded-2xl border transition-all cursor-pointer relative group ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="max-w-[170px]">
                        <h3 className="text-sm font-bold font-outfit text-white truncate" title={doc.fileName}>
                          {doc.fileName}
                        </h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{doc.fileType}</p>
                      </div>
                    </div>
                    <DocumentStatusBadge status={doc.uploadStatus} isActive={isActive} />
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`/api/v1/document/${doc.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 hover:text-indigo-400 hover:bg-slate-800 rounded transition"
                        title="Download Document"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={(e) => handleDelete(doc.id, e)}
                        className="p-1.5 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
