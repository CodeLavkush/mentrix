import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setActiveDocument } from '../store/slices/documentSlice';
import { toggleTheme, toggleSidebar } from '../store/slices/uiSlice';
import type { DocumentItem } from '../store/types';
import CustomDropdown from './CustomDropdown';
import {
  Sun,
  Moon,
  FileText,
  Menu,
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Layers,
  Edit3,
  User,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import showToast from '../utils/toast';
import { formatFileSize } from '../utils/format';

interface SectionConfig {
  title: string;
  shortTitle: string;
  category: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const SECTION_MAP: Record<string, SectionConfig> = {
  '/dashboard': {
    title: 'Dashboard Overview',
    shortTitle: 'Dashboard',
    category: 'Workspace',
    badge: 'Overview',
    icon: LayoutDashboard,
    description: 'System stats & study insights',
  },
  '/documents': {
    title: 'Documents Studio',
    shortTitle: 'Documents',
    category: 'Knowledge Base',
    badge: 'Files',
    icon: FileText,
    description: 'Manage study materials',
  },
  '/chat': {
    title: 'AI Assistant Chat',
    shortTitle: 'AI Chat',
    category: 'AI Copilot',
    badge: 'Q&A Assistant',
    icon: MessageSquare,
    description: 'Ask questions & discuss concepts',
  },
  '/notes': {
    title: 'Study Notes & Summaries',
    shortTitle: 'Notes',
    category: 'Knowledge Base',
    badge: 'Smart Notes',
    icon: BookOpen,
    description: 'Structured notes & concepts',
  },
  '/quizzes': {
    title: 'Quizzes & Practice',
    shortTitle: 'Quizzes',
    category: 'Assessment',
    badge: 'Adaptive Test',
    icon: HelpCircle,
    description: 'Test & evaluate knowledge',
  },
  '/flashcards': {
    title: 'Flashcard Studio',
    shortTitle: 'Flashcards',
    category: 'Learning Tools',
    badge: 'Spaced Recall',
    icon: Layers,
    description: 'Spaced repetition decks',
  },
  '/whiteboard': {
    title: 'Interactive Whiteboard',
    shortTitle: 'Whiteboard',
    category: 'Creative Canvas',
    badge: 'Visual Canvas',
    icon: Edit3,
    description: 'Diagrams & visual thinking',
  },
  '/profile': {
    title: 'User & Academic Profile',
    shortTitle: 'Profile',
    category: 'Settings',
    badge: 'Account',
    icon: User,
    description: 'Profile settings & learning goals',
  },
};

interface NavbarProps {
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  const { documents, activeDocument } = useAppSelector((state) => state.document);

  // Match the active section from current URL path
  const currentSection: SectionConfig =
    SECTION_MAP[location.pathname] || {
      title: title || 'Mentrix Studio',
      shortTitle: title || 'Mentrix',
      category: 'Workspace',
      badge: 'Active',
      icon: Sparkles,
      description: 'AI-Powered Student Workspace',
    };

  const SectionIcon = currentSection.icon;

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
    <header className="h-16 glass-panel border-b border-slate-200 dark:border-slate-800/80 px-3 sm:px-5 md:px-6 flex items-center justify-between sticky top-0 z-20 font-inter flex-shrink-0">
      {/* Left Area: Mobile Toggle & Responsive Section Indicator */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 mr-2 sm:mr-4">
        {/* Mobile Toggle Button */}
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 md:hidden transition cursor-pointer flex-shrink-0 shadow-sm"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Section Icon Badge with subtle accent */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/25 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 shadow-sm">
          <SectionIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>

        {/* Responsive Section Info (Different layouts for small, mid, and large screens) */}
        <div className="flex flex-col min-w-0 flex-1">
          {/* Breadcrumb / Category Row (Mid & Large Screens) */}
          <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-medium leading-tight">
            <span className="text-slate-400 dark:text-slate-500 font-semibold">Mentrix</span>
            <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />
            <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
              Section
            </span>
            <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 truncate max-w-[140px] md:max-w-[200px]">
              {currentSection.category}
            </span>
          </div>

          {/* Micro "Active Section" Tag for Small Screens (< 640px) */}
          <div className="flex sm:hidden items-center space-x-1 leading-none mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
              Active Section
            </span>
          </div>

          {/* Main Title Row */}
          <div className="flex items-center space-x-2 min-w-0">
            {/* Small Screen Title (< 640px) */}
            <h2 className="sm:hidden text-sm font-bold font-outfit text-slate-900 dark:text-white tracking-tight truncate">
              {currentSection.shortTitle}
            </h2>

            {/* Mid & Large Screen Title (>= 640px) */}
            <h2 className="hidden sm:block text-base md:text-lg font-bold font-outfit text-slate-900 dark:text-white tracking-tight truncate">
              {currentSection.title}
            </h2>

            {/* Section Badge / Tag Pill (Visible on Mid & Large screens) */}
            <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-[10px] font-semibold text-indigo-600 dark:text-indigo-300 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentSection.badge}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right Area: Actions (Document Switcher + Theme Toggle) */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        {/* Custom Document Switcher Dropdown */}
        {documents.length > 0 && (
          <div className="w-32 xs:w-40 sm:w-48 md:w-56 flex-shrink-0">
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
          className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer shadow-sm flex items-center space-x-1.5 flex-shrink-0"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold hidden lg:inline text-amber-300">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold hidden lg:inline text-indigo-600">Dark</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
