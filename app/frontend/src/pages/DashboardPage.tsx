import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDocuments } from '../store/slices/documentSlice';
import { fetchWhiteboards } from '../store/slices/whiteboardSlice';
import {
  FileText,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Edit3,
  Layers,
  ArrowRight,
  Sparkles,
  Flame,
  Compass,
  Activity,
  Bot,
  Upload,
  Lock,
  Camera,
} from 'lucide-react';
import { formatFileSize, getSafeAvatarUrl } from '../utils/format';
import DocumentStatusBadge from '../components/DocumentStatusBadge';
import EditAvatarModal from '../components/EditAvatarModal';
import showToast from '../utils/toast';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const { user } = useAppSelector((state) => state.auth);
  const { documents, activeDocument } = useAppSelector((state) => state.document);
  const { whiteboards } = useAppSelector((state) => state.whiteboard);
  const { notes } = useAppSelector((state) => state.notes);
  const { quizzes } = useAppSelector((state) => state.quiz);

  const hasReadyDocument = documents.some((doc) => doc.uploadStatus === 'READY');
  const documentRequiredPaths = new Set(['/chat', '/notes', '/quizzes', '/flashcards']);

  useEffect(() => {
    dispatch(fetchDocuments());
    dispatch(fetchWhiteboards());
  }, [dispatch]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        '.dash-hero-anim',
        { opacity: 0, y: -20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.dash-stat-anim',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'back.out(1.2)', delay: 0.15 }
      );
      gsap.fromTo(
        '.dash-tool-card',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'power2.out', delay: 0.25 }
      );
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty('--mouse-x', `${x}px`);
    target.style.setProperty('--mouse-y', `${y}px`);
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleActionClick = (to: string, label: string) => {
    if (documentRequiredPaths.has(to) && !hasReadyDocument) {
      showToast.warning(`"${label}" requires at least one ready study document. Upload one in Documents Studio.`);
      navigate('/documents');
      return;
    }
    navigate(to);
  };

  const quickPromptChips = [
    { label: 'Summarize Key Takeaways', icon: Sparkles, to: '/notes' },
    { label: 'Generate Practice Quiz', icon: HelpCircle, to: '/quizzes' },
    { label: 'Create 3D Study Flashcards', icon: Layers, to: '/flashcards' },
    { label: 'Open Concept Whiteboard', icon: Edit3, to: '/whiteboard' },
  ];

  const tools = [
    {
      title: 'Documents Studio',
      desc: 'Upload PDFs, text, & academic papers with AI vector search',
      icon: FileText,
      to: '/documents',
      tag: 'Knowledge Base',
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
    },
    {
      title: 'AI Assistant Chat',
      desc: 'Ask complex questions, extract insights, & brainstorm concepts',
      icon: MessageSquare,
      to: '/chat',
      tag: 'Gemini AI',
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    },
    {
      title: 'Study Notes Library',
      desc: 'Rich Markdown note-taking with instant AI summarization',
      icon: BookOpen,
      to: '/notes',
      tag: 'Active Revision',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Adaptive Quizzes',
      desc: 'Auto-generate MCQs with difficulty tiers & score analytics',
      icon: HelpCircle,
      to: '/quizzes',
      tag: 'Self Assessment',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    },
    {
      title: 'Flashcard Studio',
      desc: '3D interactive flip decks with mastery level tracking',
      icon: Layers,
      to: '/flashcards',
      tag: 'Spaced Repetition',
      color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400',
    },
    {
      title: 'Interactive Whiteboard',
      desc: 'Sketch diagrams, flowcharts, & export cloud visuals',
      icon: Edit3,
      to: '/whiteboard',
      tag: 'Visual Thinking',
      color: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/30 text-cyan-400',
    },
  ];

  return (
    <div ref={containerRef} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 font-inter max-w-7xl mx-auto">
      {/* Hero Command Center Banner */}
      <div
        onMouseMove={handleMouseMove}
        className="dash-hero-anim glass-card spotlight-surface p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8 shadow-2xl"
      >
        <div className="space-y-4 max-w-2xl z-10">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Interactive User Avatar Badge with Camera Edit Trigger */}
            <div
              onClick={() => setIsAvatarModalOpen(true)}
              className="relative group cursor-pointer flex-shrink-0"
              title="Click to edit your profile picture"
            >
              {getSafeAvatarUrl(user?.avatarUrl) ? (
                <img
                  src={getSafeAvatarUrl(user?.avatarUrl)}
                  alt={user?.username || 'User'}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg group-hover:border-indigo-400 group-hover:scale-105 transition-all duration-200"
                />
              ) : (
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/40 flex items-center justify-center font-outfit font-extrabold text-white text-sm sm:text-base shadow-lg group-hover:scale-105 transition-all duration-200">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:bg-indigo-500 group-hover:scale-110 transition-transform">
                <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </div>
            </div>

            <span className="glow-pill">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>{getTimeGreeting()}, {user?.username || 'Student'}</span>
            </span>

            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="px-2.5 py-1 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-sm active:scale-95"
              title="Change your profile picture"
            >
              <Camera className="w-3 h-3" />
              <span>Edit Photo</span>
            </button>

            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center space-x-1">
              <Activity className="w-3 h-3" />
              <span>AI Engine Active</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-outfit text-slate-900 dark:text-white tracking-tight leading-tight">
            Empower your learning with{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Mentrix AI
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            Your all-in-one AI study companion. Chat with documents, test yourself with auto-generated quizzes, practice flashcards, and organize your academic workflow.
          </p>

          {/* Quick AI Action Prompt Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
              Quick Actions:
            </span>
            {quickPromptChips.map((chip) => {
              const Icon = chip.icon;
              const isLocked = documentRequiredPaths.has(chip.to) && !hasReadyDocument;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleActionClick(chip.to, chip.label)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm ${
                    isLocked
                      ? 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 text-slate-400 dark:text-slate-500'
                      : 'bg-slate-100 dark:bg-slate-900/80 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
                  }`}
                  title={isLocked ? `${chip.label} (Requires ready document)` : chip.label}
                >
                  <Icon className={`w-3.5 h-3.5 ${isLocked ? 'text-slate-400' : 'text-indigo-500 dark:text-indigo-400'}`} />
                  <span>{chip.label}</span>
                  {isLocked && <Lock className="w-3 h-3 text-amber-500 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Study Widget Card */}
        <div className="flex items-center gap-4 sm:gap-5 z-10 flex-shrink-0 w-full sm:w-auto">
          {/* Daily Goal Circular Meter */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center text-center space-y-2 flex-1 sm:min-w-[130px] shadow-lg">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-500 transition-all duration-1000 ease-out"
                  strokeDasharray="75, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-outfit font-bold text-xs sm:text-sm text-slate-900 dark:text-white">75%</span>
            </div>
            <div className="text-xs font-semibold font-outfit text-slate-900 dark:text-white">Daily Goal</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">45m / 60m</div>
          </div>

          {/* Study Streak Pill */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center text-center space-y-2 flex-1 sm:min-w-[130px] shadow-lg">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-inner">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div className="text-xs font-semibold font-outfit text-slate-900 dark:text-white">
              5 Day Streak
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">+200 XP</div>
          </div>
        </div>

        {/* Ambient Glow Atmosphere */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Onboarding Banner for users without ready documents */}
      {!hasReadyDocument && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold font-outfit text-base">
              <Upload className="w-5 h-5" />
              <span>Step 1: Upload Your Study Material</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Upload a document (PDF, DOCX, TXT) to activate Mentrix AI. Once indexed, AI Chat, Study Notes, Practice Quizzes, and Flashcards will automatically unlock.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="glow-btn px-5 py-2.5 rounded-xl text-white text-xs font-semibold flex items-center space-x-2 flex-shrink-0 cursor-pointer shadow-md"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="dash-stat-anim glass-card-interactive p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Documents</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">{documents.length}</div>
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Uploaded & Indexed</div>
          </div>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-inner">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="dash-stat-anim glass-card-interactive p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Practice Quizzes</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">{quizzes.length}</div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Auto-generated MCQs</div>
          </div>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-inner">
            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="dash-stat-anim glass-card-interactive p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Study Notes</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">{notes.length}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Summaries & Notes</div>
          </div>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shadow-inner">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="dash-stat-anim glass-card-interactive p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Whiteboards</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">{whiteboards.length}</div>
            <div className="text-[11px] text-pink-600 dark:text-pink-400 font-medium">Diagrams & Concepts</div>
          </div>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500 dark:text-pink-400 shadow-inner">
            <Edit3 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Quick Learning Tools Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-outfit text-slate-900 dark:text-white tracking-wide flex items-center space-x-2">
            <Compass className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span>Learning Modules</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">All tools integrated with Gemini AI</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isLocked = documentRequiredPaths.has(tool.to) && !hasReadyDocument;

            return (
              <div
                key={tool.title}
                onClick={() => handleActionClick(tool.to, tool.title)}
                className={`dash-tool-card glass-card-interactive p-6 rounded-2xl border flex flex-col justify-between group relative overflow-hidden cursor-pointer ${
                  isLocked
                    ? 'border-slate-200 dark:border-slate-800/50 opacity-75'
                    : 'border-slate-200 dark:border-slate-800/80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br border flex items-center justify-center ${tool.color} shadow-lg`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isLocked ? (
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-500/30 flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>Requires Doc</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                        {tool.tag}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-outfit text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors flex items-center space-x-1">
                      <span>{tool.title}</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{tool.desc}</p>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/60 mt-4">
                  <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors font-medium">
                    {isLocked ? 'Unlock in Documents' : 'Launch Module'}
                  </span>
                  {isLocked ? (
                    <Lock className="w-4 h-4 text-amber-500" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition transform" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Document Command Center */}
      {activeDocument && (
        <div className="glass-card spotlight-surface p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shadow-md">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold font-outfit text-slate-900 dark:text-white">{activeDocument.fileName}</h3>
                  <DocumentStatusBadge status={activeDocument.uploadStatus} isActive={true} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Size: {formatFileSize(activeDocument.fileSize)} • Type: {activeDocument.fileType || 'PDF/Document'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/chat"
                className="glow-btn px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Chat with Document</span>
              </Link>
              <Link
                to="/quizzes"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Generate Quiz</span>
              </Link>
              <Link
                to="/notes"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Study Notes</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Picture Modal */}
      <EditAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
