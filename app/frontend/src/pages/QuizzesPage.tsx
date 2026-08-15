import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchQuizzesByDocument,
  createQuiz,
  submitQuizAttempt,
  fetchQuizAttempts,
  fetchQuizQuestions,
  setActiveQuiz,
} from '../store/slices/quizSlice';
import type { Quiz, QuizQuestion } from '../store/types';
import CustomDropdown from '../components/CustomDropdown';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { Plus, Award, AlertCircle, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import showToast from '../utils/toast';

export const QuizzesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const { activeDocument } = useAppSelector((state) => state.document);
  const { quizzes, activeQuiz, loading, submitting, error } = useAppSelector((state) => state.quiz);

  const documentId = activeDocument?.id || '';

  // Generator form
  const [quizTitle, setQuizTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [totalQuestions, setTotalQuestions] = useState('5');

  // Player state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; total: number; percentage: number } | null>(null);

  useEffect(() => {
    if (documentId) {
      dispatch(fetchQuizzesByDocument(documentId));
    }
  }, [dispatch, documentId]);

  // When activeQuiz changes, fetch its questions and attempts
  useEffect(() => {
    if (activeQuiz?.id) {
      dispatch(fetchQuizQuestions(activeQuiz.id));
      dispatch(fetchQuizAttempts(activeQuiz.id));
      setCurrentQIndex(0);
      setSelectedAnswers({});
      setQuizCompleted(false);
      setScoreResult(null);
    }
  }, [dispatch, activeQuiz?.id]);

  useEffect(() => {
    gsap.fromTo(
      '.question-card-anim',
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, [currentQIndex, activeQuiz?.id]);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentId) {
      showToast.warning('Please select an active document first from the top bar.');
      return;
    }
    if (!quizTitle.trim()) {
      showToast.warning('Please enter a title or focus topic for the quiz.');
      return;
    }
    const qCount = Number(totalQuestions);
    if (isNaN(qCount) || qCount < 1 || qCount > 30) {
      showToast.warning('Total questions must be between 1 and 30.');
      return;
    }

    const toastId = showToast.loading('Generating AI quiz questions with Gemini...');
    const result = await dispatch(
      createQuiz({
        documentId,
        payload: { quizTitle: quizTitle.trim(), difficulty, totalQuestions: qCount },
      })
    );
    if (createQuiz.fulfilled.match(result)) {
      showToast.dismiss(toastId);
      showToast.success('Quiz generated successfully! Select questions below to begin.');
      setQuizTitle('');
    } else {
      showToast.dismiss(toastId);
      const errMsg = (result.payload as string) || 'Failed to generate quiz. Please try again.';
      showToast.error(errMsg);
    }
  };

  const handleSelectOption = (questionId: string, optionKey: string) => {
    if (quizCompleted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz?.quizQuestions || activeQuiz.quizQuestions.length === 0) return;

    let score = 0;
    const questions = activeQuiz.quizQuestions;
    questions.forEach((q: QuizQuestion) => {
      if (selectedAnswers[q.id] === q.correctOption) {
        score += 1;
      }
    });

    const total = questions.length;
    const percentage = Math.round((score / total) * 100);
    setScoreResult({ score, total, percentage });
    setQuizCompleted(true);

    const toastId = showToast.loading('Recording quiz score...');
    await dispatch(
      submitQuizAttempt({
        quizId: activeQuiz.id,
        payload: {
          score,
          totalMarks: total,
          percentage,
          timeTaken: 120,
        },
      })
    );
    showToast.dismiss(toastId);
    showToast.success(`Quiz complete! Your score: ${score}/${total} (${percentage}%)`);
  };

  const difficultyOptions = [
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HARD', label: 'Hard' },
  ];

  const questionsCountOptions = [
    { value: '3', label: '3 Questions' },
    { value: '5', label: '5 Questions' },
    { value: '10', label: '10 Questions' },
  ];

  if (!activeDocument) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[70vh] font-inter">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center max-w-md space-y-4 shadow-xl">
          <FileText className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-xl font-bold font-outfit text-white">No Active Document Selected</h2>
          <p className="text-xs text-slate-400">Please select or upload a document to generate and play practice quizzes.</p>
        </div>
      </div>
    );
  }

  const questions = activeQuiz?.quizQuestions || [];
  const currentQ = questions[currentQIndex];

  return (
    <div ref={pageRef} className="p-8 space-y-8 font-inter">
      {/* Top Generator Form */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold font-outfit text-white">Generate AI Practice Quiz</h2>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleGenerateQuiz} className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Quiz Title</label>
            <input
              type="text"
              required
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="e.g. Key Definitions & Concepts Practice"
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Difficulty</label>
            <CustomDropdown
              options={difficultyOptions}
              value={difficulty}
              onChange={(val) => setDifficulty(val as any)}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Questions</label>
            <CustomDropdown
              options={questionsCountOptions}
              value={totalQuestions}
              onChange={setTotalQuestions}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full glow-btn py-2.5 rounded-xl text-white font-semibold text-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Quiz'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Grid: Quiz Library & Interactive Player */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quizzes List */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
          <h3 className="text-base font-bold font-outfit text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Quiz Library</span>
            <span className="text-xs text-slate-400 font-normal">({quizzes.length})</span>
          </h3>
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {loading && quizzes.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading quizzes...</div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No quizzes generated yet.</div>
            ) : (
              quizzes.map((q: Quiz) => {
                const isSelected = activeQuiz?.id === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => dispatch(setActiveQuiz(q))}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg'
                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <h4 className="text-xs font-bold font-outfit truncate">{q.quizTitle}</h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 font-semibold text-amber-300">
                        {q.difficulty}
                      </span>
                      <span>{q.totalQuestions} Questions</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Interactive Player */}
        <div className="md:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
          {!activeQuiz ? (
            <div className="text-center py-20 text-slate-400 text-xs">
              Select a quiz from the library on the left or create one above to begin practicing.
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading quiz questions...</p>
            </div>
          ) : (
            <div className="question-card-anim space-y-6">
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold font-outfit text-white">{activeQuiz.quizTitle}</h3>
                  <span className="text-xs text-slate-400">
                    Question {currentQIndex + 1} of {questions.length}
                  </span>
                </div>
                {scoreResult && (
                  <div className="flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg">
                    <Award className="w-4 h-4" />
                    <span>
                      Score: {scoreResult.score}/{scoreResult.total} ({scoreResult.percentage}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Question Card */}
              {currentQ && (
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-slate-100 font-outfit leading-relaxed">
                    <span className="text-indigo-400 mr-2">{currentQIndex + 1}.</span>
                    <MarkdownRenderer content={currentQ.question} />
                  </div>

                  <div className="space-y-2.5">
                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const optionText = (currentQ as any)[`option${optKey}`];
                      if (!optionText) return null;

                      const isSelected = selectedAnswers[currentQ.id] === optKey;
                      const isCorrect = currentQ.correctOption === optKey;

                      let btnStyle = 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700';
                      if (isSelected) {
                        btnStyle = 'bg-indigo-600/30 border-indigo-500 text-white font-semibold';
                      }
                      if (quizCompleted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-500/30 border-emerald-500 text-emerald-300 font-semibold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-red-500/30 border-red-500 text-red-300 font-semibold';
                        }
                      }

                      return (
                        <button
                          key={optKey}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, optKey)}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle} cursor-pointer`}
                        >
                          <div className="flex items-start space-x-2">
                            <span className="w-5 h-5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center font-mono font-bold text-indigo-300 flex-shrink-0">
                              {optKey}
                            </span>
                            <span className="leading-relaxed mt-0.5">{optionText}</span>
                          </div>
                          {quizCompleted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation shown after quiz is submitted */}
                  {quizCompleted && currentQ.explanation && (
                    <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
                      <div className="font-semibold font-outfit text-indigo-300">Explanation:</div>
                      <MarkdownRenderer content={currentQ.explanation} />
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQIndex === 0}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs disabled:opacity-40 cursor-pointer transition"
                >
                  Previous
                </button>

                {currentQIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition"
                  >
                    Next Question
                  </button>
                ) : !quizCompleted ? (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    className="glow-btn px-6 py-2 rounded-xl text-white text-xs font-semibold cursor-pointer"
                  >
                    {submitting ? 'Submitting...' : 'Finish & Submit'}
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizzesPage;
