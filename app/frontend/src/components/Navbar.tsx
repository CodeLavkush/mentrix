import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setActiveDocument } from '../store/slices/documentSlice';
import { toggleTheme, toggleSidebar } from '../store/slices/uiSlice';
import type { DocumentItem } from '../store/types';
import CustomDropdown from './CustomDropdown';
import { Sun, Moon, FileText, Menu } from 'lucide-react';
import showToast from '../utils/toast';
import { formatFileSize } from '../utils/format';

interface NavbarProps {
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  const { documents, activeDocument } = useAppSelector((state) => state.document);

  const docOptions = documents.map((doc: DocumentItem) => ({
    value: doc.id,
    label: doc.fileName,
    icon: <FileText className="w-3.5 h-3.5" />,
    badge: doc.uploadStatus && doc.uploadStatus !== 'READY' ? `${doc.uploadStatus}` : formatFileSize(doc.fileSize),
  }));

  const handleDocumentSelect = (selectedId: string) => {
    const doc = documents.find((d) => d.id === selectedId) || null;
    dispatch(setActiveDocument(doc));
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
    const nextTheme = theme === 'dark' ? 'Light' : 'Dark';
    showToast.success(`Switched to ${nextTheme} Mode`);
  };

  return (
    <header className="h-16 glass-panel border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 font-inter flex-shrink-0">
      {/* Mobile Toggle & Title */}
      <div className="flex items-center space-x-2 sm:space-x-3 truncate mr-2">
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 md:hidden transition cursor-pointer flex-shrink-0"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        <h2 className="text-base sm:text-xl font-bold font-outfit text-slate-900 dark:text-white tracking-wide truncate">
          {title}
        </h2>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Custom Document Switcher Dropdown */}
        {documents.length > 0 && (
          <div className="w-56">
            <CustomDropdown
              options={docOptions}
              value={activeDocument?.id || ''}
              onChange={handleDocumentSelect}
              placeholder="Select document..."
            />
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={handleToggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer shadow-sm flex items-center space-x-2"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold hidden sm:inline text-amber-300">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold hidden sm:inline text-indigo-600">Dark</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
