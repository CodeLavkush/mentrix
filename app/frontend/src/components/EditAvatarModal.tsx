import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateUserAvatar, deleteUserAvatar } from '../store/slices/authSlice';
import {
  Camera,
  Upload,
  X,
  Trash2,
  Check,
  Loader2,
} from 'lucide-react';
import showToast from '../utils/toast';
import { getSafeAvatarUrl } from '../utils/format';

interface EditAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditAvatarModal: React.FC<EditAvatarModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setIsSubmitting(false);
      setIsDeleting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateAndSetFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast.warning('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast.warning('Image size must be less than 10 MB.');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('avatar', selectedFile);

    const toastId = showToast.loading('Updating profile picture...');
    const result = await dispatch(updateUserAvatar(formData));
    setIsSubmitting(false);

    if (updateUserAvatar.fulfilled.match(result)) {
      showToast.dismiss(toastId);
      showToast.success('Profile picture updated successfully!');
      onClose();
    } else {
      showToast.dismiss(toastId);
      const errMsg = (result.payload as string) || 'Failed to update profile picture';
      showToast.error(errMsg);
    }
  };

  const handleDelete = async () => {
    if (!user?.avatarUrl && !user?.avatarKey) return;

    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    setIsDeleting(true);
    const toastId = showToast.loading('Removing profile picture...');
    const result = await dispatch(deleteUserAvatar());
    setIsDeleting(false);

    if (deleteUserAvatar.fulfilled.match(result)) {
      showToast.dismiss(toastId);
      showToast.success('Profile picture removed successfully');
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      onClose();
    } else {
      showToast.dismiss(toastId);
      const errMsg = (result.payload as string) || 'Failed to remove profile picture';
      showToast.error(errMsg);
    }
  };

  const currentDisplayAvatar = previewUrl || getSafeAvatarUrl(user?.avatarUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 bg-white dark:bg-slate-950/95 font-inter">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/25 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-outfit text-slate-900 dark:text-white tracking-tight">
                Edit Profile Picture
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update or customize your personal student avatar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-5">
          {/* Avatar Preview Area */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-3 border-indigo-500/40 shadow-xl relative bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                {currentDisplayAvatar ? (
                  <img
                    src={currentDisplayAvatar}
                    alt={user?.username || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-outfit font-extrabold text-4xl text-white shadow-inner">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}

                {selectedFile && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-md">
                    New
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm font-semibold font-outfit text-slate-900 dark:text-white">
                {user?.username || 'Student'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
            </div>
          </div>

          {/* Upload Dropzone */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700/80 hover:border-indigo-500/60 hover:bg-slate-50 dark:hover:bg-slate-900/60'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {selectedFile ? (
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-[260px] inline-block">
                    {selectedFile.name}
                  </span>
                ) : (
                  <span>Click to browse or drag & drop photo</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                PNG, JPG, WEBP or GIF (max 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Delete Option */}
          {user?.avatarUrl ? (
            <button
              type="button"
              disabled={isSubmitting || isDeleting}
              onClick={handleDelete}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Remove Photo</span>
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}

          {/* Cancel & Save Buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isSubmitting || isDeleting}
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!selectedFile || isSubmitting || isDeleting}
              onClick={handleSave}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white transition shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Picture</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAvatarModal;
