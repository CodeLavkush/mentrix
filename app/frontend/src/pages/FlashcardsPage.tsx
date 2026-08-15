import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchFlashcardSetsByAttempt,
  fetchCardsBySet,
  createFlashcardSet,
  updateCardProgress,
  setActiveSet,
} from '../store/slices/flashcardSlice';
import { fetchQuizzesByDocument, fetchQuizAttempts } from '../store/slices/quizSlice';
import type { Flashcard, Quiz } from '../store/types';
import CustomDropdown from '../components/CustomDropdown';
import MarkdownRenderer from '../components/MarkdownRenderer';
import {
  Layers,
  RotateCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Plus,
  FileText,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Target,
} from 'lucide-react';

export const FlashcardsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeDocument } = useAppSelector((state) => state.document);
  const { quizzes, attempts } = useAppSelector((state) => state.quiz);
  const { sets, activeSet, cards, progressMap, loading, generating, error } = useAppSelector(
    (state) => state.flashcard
  );

  const documentId = activeDocument?.id || '';
  const [selectedAttemptId, setSelectedAttemptId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newTotalCards, setNewTotalCards] = useState('5');

  const [flipped, setFlipped] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Session counters
  const [sessionKnownCount, setSessionKnownCount] = useState(0);
  const [sessionReviewCount, setSessionReviewCount] = useState(0);

  // Load quizzes for active document
  useEffect(() => {
    if (documentId) {
      dispatch(fetchQuizzesByDocument(documentId));
    }
  }, [dispatch, documentId]);

  // Load attempts for quizzes
  useEffect(() => {
    if (quizzes.length > 0) {
      quizzes.forEach((q: Quiz) => {
        dispatch(fetchQuizAttempts(q.id));
      });
    }
  }, [dispatch, quizzes]);

  // Automatically select first attempt if available and not selected
  useEffect(() => {
    if (attempts.length > 0 && !selectedAttemptId) {
      setSelectedAttemptId(attempts[0].id);
    }
  }, [attempts, selectedAttemptId]);

  // Fetch sets when attempt is selected
  useEffect(() => {
    if (selectedAttemptId) {
      dispatch(fetchFlashcardSetsByAttempt(selectedAttemptId));
    }
  }, [dispatch, selectedAttemptId]);

  // Fetch cards when active set changes
  useEffect(() => {
    if (activeSet?.id) {
      dispatch(fetchCardsBySet(activeSet.id));
      setCurrentCardIndex(0);
      setFlipped(false);
      setSessionKnownCount(0);
      setSessionReviewCount(0);
    }
  }, [dispatch, activeSet?.id]);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = -(y / (rect.height / 2)) * 12;
    const tiltY = (x / (rect.width / 2)) * 12;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((prev) => !prev);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFlipped(false);
        setCurrentCardIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFlipped(false);
        setCurrentCardIndex((prev) => Math.min(cards.length - 1, prev + 1));
      } else if (e.key === '1' || e.key.toLowerCase() === 'r') {
        handleReview(false);
      } else if (e.key === '2' || e.key.toLowerCase() === 'k') {
        handleReview(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards.length, currentCardIndex]);

  const handleGenerateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttemptId || !newTitle.trim()) return;

    const toastId = toast.loading('Generating study flashcards with AI...');
    const result = await dispatch(
      createFlashcardSet({
        quizAttemptId: selectedAttemptId,
        payload: {
          title: newTitle,
          topic: newTopic || 'General Study',
          totalCards: Number(newTotalCards),
        },
      })
    );
    if (createFlashcardSet.fulfilled.match(result)) {
      toast.success('Flashcard set generated successfully!', { id: toastId });
      setShowCreateModal(false);
      setNewTitle('');
      setNewTopic('');
    } else {
      toast.error((result.payload as string) || 'Failed to generate flashcard set', { id: toastId });
    }
  };

  const handleReview = async (isCorrect: boolean) => {
    const currentCard = cards[currentCardIndex];
    if (!currentCard) return;

    if (isCorrect) {
      setSessionKnownCount((prev) => prev + 1);
      toast.success('Marked as Known! 🎉', { duration: 1500 });
    } else {
      setSessionReviewCount((prev) => prev + 1);
      toast.error('Marked for Review 📝', { duration: 1500 });
    }

    await dispatch(updateCardProgress({ flashcardId: currentCard.id, isCorrect }));

    setFlipped(false);
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      toast.success('Completed this study cycle! Check your deck progress below. 🚀', {
        icon: '🏆',
        duration: 3500,
      });
    }
  };

  const cardsCountOptions = [
    { value: '3', label: '3 Flashcards' },
    { value: '5', label: '5 Flashcards' },
    { value: '10', label: '10 Flashcards' },
  ];

  if (!activeDocument) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[70vh] font-inter">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center max-w-md space-y-4 shadow-xl">
          <FileText className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-xl font-bold font-outfit text-white">No Active Document Selected</h2>
          <p className="text-xs text-slate-400">Please select or upload a document first to practice with flashcards.</p>
        </div>
      </div>
    );
  }

  const attemptOptions = attempts.map((att) => ({
    value: att.id,
    label: `Attempt (Score: ${att.score}/${att.totalMarks} - ${new Date(att.attemptedAt || Date.now()).toLocaleDateString()})`,
  }));

  const setOptions = sets.map((set) => ({
    value: set.id,
    label: `${set.title} (${set.totalCards} cards)`,
  }));

  const currentCard: Flashcard | undefined = cards[currentCardIndex];

  // Calculate Progress Metrics
  const totalCardsCount = cards.length;
  let masteredCount = 0;
  let inProgressCount = 0;
  let totalMasterySum = 0;

  cards.forEach((card) => {
    const prog = progressMap[card.id];
    if (prog) {
      totalMasterySum += Number(prog.masteryLevel || 0);
      if (Number(prog.masteryLevel || 0) >= 80) {
        masteredCount += 1;
      } else {
        inProgressCount += 1;
      }
    }
  });

  const averageMastery = totalCardsCount > 0 ? Math.round(totalMasterySum / totalCardsCount) : 0;
  const unstudiedCount = Math.max(0, totalCardsCount - masteredCount - inProgressCount);

  return (
    <div className="p-8 space-y-8 font-inter">
      {/* Header & Controls */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-white flex items-center space-x-2">
            <Layers className="w-6 h-6 text-pink-400" />
            <span>Flashcard Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Master key concepts with AI-generated 3D flip cards & progress analytics</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {attemptOptions.length > 0 && (
            <div className="w-60">
              <CustomDropdown
                options={attemptOptions}
                value={selectedAttemptId}
                onChange={setSelectedAttemptId}
                placeholder="Select Quiz Attempt..."
              />
            </div>
          )}

          {setOptions.length > 0 && (
            <div className="w-52">
              <CustomDropdown
                options={setOptions}
                value={activeSet?.id || ''}
                onChange={(val) => {
                  const s = sets.find((item) => item.id === val) || null;
                  dispatch(setActiveSet(s));
                }}
                placeholder="Select Set..."
              />
            </div>
          )}

          {selectedAttemptId && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="glow-btn px-4 py-2.5 rounded-xl text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>New Set</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Flashcard Interactive Area */}
      {attempts.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4 shadow-xl">
          <Layers className="w-14 h-14 text-indigo-400/60 mx-auto" />
          <h3 className="text-lg font-bold font-outfit text-white">No Quiz Attempts Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Flashcards are generated from quiz questions. Take a quick practice quiz to create your study sets!
          </p>
          <Link
            to="/quizzes"
            className="inline-flex items-center space-x-2 glow-btn px-5 py-2.5 rounded-xl text-white text-xs font-semibold cursor-pointer"
          >
            <span>Go to Quizzes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : loading ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading flashcard study cards...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4 shadow-xl">
          <Sparkles className="w-12 h-12 text-pink-400 mx-auto" />
          <h3 className="text-lg font-bold font-outfit text-white">No Flashcard Sets for this Attempt</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Generate your first interactive flashcard deck from this quiz attempt using AI.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="glow-btn px-6 py-2.5 rounded-xl text-white text-xs font-semibold flex items-center space-x-2 mx-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Flashcard Set</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Deck Progress Analytics Dashboard */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-outfit text-white">
                    {activeSet?.title || 'Deck Progress Overview'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Topic: {activeSet?.topic || 'General Practice'} • {totalCardsCount} Flashcards
                  </p>
                </div>
              </div>

              {/* Progress Summary Badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                  <Award className="w-3.5 h-3.5" />
                  <span>Mastered: {masteredCount}</span>
                </div>
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
                  <Target className="w-3.5 h-3.5" />
                  <span>Reviewing: {inProgressCount}</span>
                </div>
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                  <span>Unstudied: {unstudiedCount}</span>
                </div>
              </div>
            </div>

            {/* Overall Mastery Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Overall Deck Mastery</span>
                <span className="text-pink-400 font-mono">{averageMastery}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${averageMastery}%` }}
                />
              </div>
            </div>

            {/* Live Session Counter */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="flex items-center space-x-4">
                <span>
                  Session Known: <strong className="text-emerald-400 font-semibold">+{sessionKnownCount}</strong>
                </span>
                <span>
                  Session Review: <strong className="text-red-400 font-semibold">+{sessionReviewCount}</strong>
                </span>
              </div>
              <span className="text-slate-500">Click any card below to jump to it directly</span>
            </div>
          </div>

          {/* Main Flashcard Interactive Player */}
          <div className="max-w-xl mx-auto space-y-6">
            {/* Top Card Navigation Bar */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={() => {
                  setFlipped(false);
                  setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                }}
                disabled={currentCardIndex === 0}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg disabled:opacity-30 transition cursor-pointer border border-slate-800 flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <span className="font-semibold text-slate-200">
                Card {currentCardIndex + 1} of {cards.length}
              </span>

              <button
                type="button"
                onClick={() => {
                  setFlipped(false);
                  setCurrentCardIndex((prev) => Math.min(cards.length - 1, prev + 1));
                }}
                disabled={currentCardIndex === cards.length - 1}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg disabled:opacity-30 transition cursor-pointer border border-slate-800 flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 3D Perspective Flip Card Container */}
            {currentCard && (
              <div
                className="perspective-1200 w-full min-h-[350px] select-none"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                onClick={() => setFlipped(!flipped)}
              >
                <div
                  className="transform-style-3d relative w-full min-h-[350px] transition-transform duration-700 ease-out cursor-pointer shadow-2xl rounded-3xl"
                  style={{
                    transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y + (flipped ? 180 : 0)}deg)`,
                  }}
                >
                  {/* FRONT FACE */}
                  <div className="backface-hidden absolute inset-0 glass-card rounded-3xl border border-indigo-500/30 p-8 flex flex-col justify-between items-center text-center shadow-2xl bg-slate-950/90 ring-1 ring-white/10 group-hover:border-indigo-500/60 overflow-hidden">
                    {/* Ambient Top Glow */}
                    <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                    
                    {/* Front Header */}
                    <div className="w-full flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      <span className="flex items-center space-x-1.5 text-indigo-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Question / Term</span>
                      </span>
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono">
                          {currentCard.difficulty}
                        </span>
                        <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold">
                          <RotateCw className="w-3 h-3" />
                          <span>Click to Flip</span>
                        </span>
                      </div>
                    </div>

                    {/* Front Content */}
                    <div className="my-auto py-6 max-h-56 overflow-y-auto px-2">
                      <div className="text-lg md:text-xl font-bold font-outfit text-white leading-relaxed">
                        <MarkdownRenderer content={currentCard.frontText} />
                      </div>
                    </div>

                    {/* Front Footer */}
                    <div className="w-full flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest font-mono border-t border-slate-800/80 pt-3">
                      <span>Space: Flip • ←/→: Navigate</span>
                      {progressMap[currentCard.id] && (
                        <span className="text-indigo-400 font-semibold">
                          Mastery: {progressMap[currentCard.id].masteryLevel}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* BACK FACE */}
                  <div className="backface-hidden rotate-y-180 absolute inset-0 glass-card rounded-3xl border border-emerald-500/40 p-8 flex flex-col justify-between items-center text-center shadow-2xl bg-slate-950/95 ring-1 ring-emerald-500/20 overflow-hidden">
                    {/* Ambient Top Glow */}
                    <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

                    {/* Back Header */}
                    <div className="w-full flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      <span className="flex items-center space-x-1.5 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Answer / Concept</span>
                      </span>
                      <div className="flex items-center space-x-2.5">
                        {progressMap[currentCard.id] && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                            {progressMap[currentCard.id].masteryLevel}% Mastered
                          </span>
                        )}
                        <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                          <RotateCw className="w-3 h-3" />
                          <span>Click to Flip</span>
                        </span>
                      </div>
                    </div>

                    {/* Back Content */}
                    <div className="my-auto py-6 max-h-56 overflow-y-auto px-2">
                      <div className="text-base md:text-lg font-medium font-outfit text-slate-100 leading-relaxed">
                        <MarkdownRenderer content={currentCard.backText} />
                      </div>
                    </div>

                    {/* Back Footer */}
                    <div className="w-full flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest font-mono border-t border-slate-800/80 pt-3">
                      <span>Reviews: {progressMap[currentCard.id]?.reviewCount || 0} • Correct: {progressMap[currentCard.id]?.correctCount || 0}</span>
                      <span className="text-emerald-400 font-semibold">Press 1: Review • 2: Known</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Review Controls */}
            <div className="flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={() => handleReview(false)}
                className="flex-1 py-3.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg active:scale-98"
              >
                <XCircle className="w-4 h-4" />
                <span>Need Review</span>
              </button>

              <button
                type="button"
                onClick={() => handleReview(true)}
                className="flex-1 py-3.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg active:scale-98"
              >
                <CheckCircle className="w-4 h-4" />
                <span>I Know This</span>
              </button>
            </div>
          </div>

          {/* All Cards Quick Progress Grid */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <h4 className="text-xs font-bold font-outfit text-white uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cards in this Set ({cards.length})</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {cards.map((c, idx) => {
                const prog = progressMap[c.id];
                const mastery = prog ? Number(prog.masteryLevel || 0) : 0;
                const isCurrent = currentCardIndex === idx;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setCurrentCardIndex(idx);
                      setFlipped(false);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isCurrent
                        ? 'bg-pink-500/20 border-pink-500 text-white shadow-lg ring-1 ring-pink-500/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span>Card #{idx + 1}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          mastery >= 80
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : mastery > 0
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {prog ? `${mastery}%` : 'New'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2">{c.frontText}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Create Set Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-slate-800 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold font-outfit text-white">Generate AI Flashcard Set</h3>
            <form onSubmit={handleGenerateSet} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Set Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Core Terms & Definitions"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Topic Description
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Chapter Summary"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Card Count
                </label>
                <CustomDropdown
                  options={cardsCountOptions}
                  value={newTotalCards}
                  onChange={setNewTotalCards}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating || !newTitle.trim()}
                  className="glow-btn px-5 py-2 rounded-xl text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {generating ? 'Generating...' : 'Generate Deck'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;
