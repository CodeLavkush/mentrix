import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchCurrentUser } from './store/slices/authSlice';
import { fetchDocuments } from './store/slices/documentSlice';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import ChatPage from './pages/ChatPage';
import NotesPage from './pages/NotesPage';
import QuizzesPage from './pages/QuizzesPage';
import FlashcardsPage from './pages/FlashcardsPage';
import WhiteboardPage from './pages/WhiteboardPage';
import ProfilePage from './pages/ProfilePage';

import { setSidebarOpen } from './store/slices/uiSlice';

import DocumentRequiredGuard from './components/DocumentRequiredGuard';

// Layout Wrapper
const AppLayout: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Handle responsive sidebar defaults and window resizing
  useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1024;
      if (!isLargeScreen) {
        dispatch(setSidebarOpen(false));
      }
    };

    // On initial mount/navigation: larger screens open, smaller screens closed
    if (window.innerWidth < 1024) {
      dispatch(setSidebarOpen(false));
    } else {
      dispatch(setSidebarOpen(true));
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/documents':
        return 'Documents Studio';
      case '/chat':
        return 'AI Assistant Chat';
      case '/notes':
        return 'Study Notes';
      case '/quizzes':
        return 'Quizzes & Practice';
      case '/flashcards':
        return 'Flashcard Studio';
      case '/whiteboard':
        return 'Interactive Whiteboard';
      case '/profile':
        return 'User & Academic Profile';
      default:
        return 'Mentrix Studio';
    }
  };

  return (
    <div className="flex h-screen max-h-screen bg-mentrix-bg text-slate-900 dark:text-slate-100 font-inter transition-colors duration-200 relative overflow-hidden w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full h-full max-h-screen overflow-hidden">
        <Navbar title={getPageTitle(location.pathname)} />
        <main className="flex-1 overflow-y-auto w-full relative">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route
              path="/chat"
              element={
                <DocumentRequiredGuard featureName="AI Assistant Chat">
                  <ChatPage />
                </DocumentRequiredGuard>
              }
            />
            <Route
              path="/notes"
              element={
                <DocumentRequiredGuard featureName="Study Notes Library">
                  <NotesPage />
                </DocumentRequiredGuard>
              }
            />
            <Route
              path="/quizzes"
              element={
                <DocumentRequiredGuard featureName="Adaptive Quizzes">
                  <QuizzesPage />
                </DocumentRequiredGuard>
              }
            />
            <Route
              path="/flashcards"
              element={
                <DocumentRequiredGuard featureName="Flashcard Studio">
                  <FlashcardsPage />
                </DocumentRequiredGuard>
              }
            />
            <Route path="/whiteboard" element={<WhiteboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const { theme } = useAppSelector((state) => state.ui);

  // Sync theme class and data-theme to HTML root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
    if (token) {
      dispatch(fetchDocuments());
    }
  }, [dispatch, token, user]);

  const isLight = theme === 'light';

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(15, 23, 42, 0.95)',
            color: isLight ? '#0F172A' : '#F8FAFC',
            border: isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid rgba(99, 102, 241, 0.3)',
            backdropFilter: 'blur(10px)',
            fontSize: '13px',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: isLight
              ? '0 8px 30px rgba(0, 0, 0, 0.08)'
              : '0 8px 30px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: {
              primary: '#6366F1',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<AppLayout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
