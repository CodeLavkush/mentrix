import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Layers,
  Edit3,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import { toggleSidebar, setSidebarOpen } from '../store/slices/uiSlice';
import mentrixLogo from '../assets/mentrix_logo.png';

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { activeDocument } = useAppSelector((state) => state.document);
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  useEffect(() => {
    gsap.fromTo(
      '.sidebar-item',
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.3, stagger: 0.03, ease: 'power2.out', delay: 0.1 }
    );
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      dispatch(setSidebarOpen(false));
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/chat', label: 'AI Chat', icon: MessageSquare },
    { path: '/notes', label: 'Notes', icon: BookOpen },
    { path: '/quizzes', label: 'Quizzes', icon: HelpCircle },
    { path: '/flashcards', label: 'Flashcards', icon: Layers },
    { path: '/whiteboard', label: 'Whiteboard', icon: Edit3 },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => dispatch(setSidebarOpen(false))}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`glass-panel border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between h-screen z-50 font-inter transition-all duration-300 bg-white dark:bg-slate-950/95 
        fixed inset-y-0 left-0 max-w-[80vw] ${sidebarOpen ? 'translate-x-0 w-64 shadow-2xl pointer-events-auto' : '-translate-x-full pointer-events-none'}
        md:sticky md:top-0 md:translate-x-0 md:pointer-events-auto md:shadow-none md:max-w-none ${sidebarOpen ? 'md:w-64' : 'md:w-20'}`}
      >
        {/* Brand Header */}
        <div>
          <div className={`p-4 border-b border-slate-200 dark:border-slate-800/60 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            <div className="flex items-center space-x-3">
              <img
                src={mentrixLogo}
                alt="Mentrix"
                className="w-9 h-9 object-contain rounded-xl shadow-lg shadow-indigo-500/25 flex-shrink-0"
              />
              {sidebarOpen && (
                <div className="truncate">
                  <h1 className="text-sm font-extrabold font-outfit text-slate-900 dark:text-white tracking-wide leading-tight">
                    Mentrix
                  </h1>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">AI Student Assistant</p>
                </div>
              )}
            </div>

            {sidebarOpen && (
              <button
                type="button"
                onClick={() => dispatch(toggleSidebar())}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition cursor-pointer"
                title="Collapse Sidebar"
              >
                <span className="hidden md:inline"><PanelLeftClose className="w-4 h-4" /></span>
                <span className="md:hidden"><X className="w-4 h-4" /></span>
              </button>
            )}
          </div>

          {/* Active Document Indicator */}
          {sidebarOpen ? (
            <div className="mx-3.5 mt-3.5 p-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-xs">
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <span>Active Doc</span>
                <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ready</span>
                </span>
              </div>
              <div
                className="text-indigo-600 dark:text-indigo-300 font-semibold truncate mt-1 text-xs"
                title={activeDocument?.fileName || 'No active document'}
              >
                {activeDocument ? activeDocument.fileName : 'Select a document'}
              </div>
            </div>
          ) : (
            <div className="mt-3 flex justify-center">
              <div
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 cursor-pointer"
                title={activeDocument ? `Active: ${activeDocument.fileName}` : 'No active document'}
              >
                <FileText className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="mt-4 px-2.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  title={!sidebarOpen ? item.label : undefined}
                  className={({ isActive }) =>
                    `sidebar-item relative flex items-center rounded-xl font-medium text-xs transition-all duration-200 group ${
                      sidebarOpen ? 'px-3.5 py-2.5 space-x-3' : 'p-2.5 justify-center'
                    } ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full shadow-sm" />
                      )}
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                        }`}
                      />
                      {sidebarOpen && <span>{item.label}</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Footer & Toggle */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/60 space-y-2">
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => dispatch(toggleSidebar())}
              className="w-full p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition flex justify-center cursor-pointer"
              title="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}

          <div
            className={`flex items-center rounded-xl bg-slate-100/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-2 ${
              sidebarOpen ? 'justify-between' : 'justify-center'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/40 flex items-center justify-center font-outfit font-bold text-white text-xs flex-shrink-0 shadow-md">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              {sidebarOpen && (
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate flex items-center space-x-1">
                    <span>{user?.username || 'Student'}</span>
                    <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email || ''}</div>
                </div>
              )}
            </div>

            {sidebarOpen && (
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
