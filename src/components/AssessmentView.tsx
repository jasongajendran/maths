import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Check,
  AlertTriangle,
  Lightbulb,
  FileQuestion,
  RefreshCw,
  Eye,
  Filter,
  Layers,
  Star,
  Edit3,
  BookmarkCheck,
  Zap,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { TopicAssessment, AssessmentQuestion, QuestionUserAttempt, AssessmentRecord } from '../types/assessment';
import { MathView } from './MathView';
import { AudioButton } from './AudioButton';
import { soundEffects } from '../utils/soundEffects';
import {
  getAssessmentRecord,
  saveAssessmentRecord,
  saveQuestionAttempt,
  resetAssessmentRecord,
  calculateAssessmentStats,
} from '../utils/assessmentStorage';

interface AssessmentViewProps {
  assessment: TopicAssessment;
  onBackToTheory?: () => void;
}

type FilterTab = 'all' | 'easy' | 'medium' | 'hard' | 'wrong';

export const AssessmentView: React.FC<AssessmentViewProps> = ({ assessment, onBackToTheory }) => {
  // Assessment persistent record state
  const [record, setRecord] = useState<AssessmentRecord>(() =>
    getAssessmentRecord(assessment.topicId)
  );

  // Active question index in filtered list
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<'step' | 'list'>('step');

  // Interactive state for current question
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [numberInput, setNumberInput] = useState<string>('');
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [selectedLeftKey, setSelectedLeftKey] = useState<string | null>(null);
  const [shuffledRightItems, setShuffledRightItems] = useState<string[]>([]);
  const [orderedStepIndices, setOrderedStepIndices] = useState<number[]>([]);
  const [fillBlankChoice, setFillBlankChoice] = useState<string>('');
  const [soundFxEnabled, setSoundFxEnabled] = useState<boolean>(() => soundEffects.getIsEnabled());

  const handleToggleSoundFx = () => {
    const nextState = soundEffects.toggle();
    setSoundFxEnabled(nextState);
  };

  // Helper to ensure right-hand matching column is reliably scrambled and never pre-matched row-by-row
  const getScrambledRightItems = (pairs: { left: string; right: string }[]): string[] => {
    const originals = pairs.map((p) => p.right);
    if (originals.length <= 1) return originals;

    // Use a deterministic seed/shift plus derangement check to guarantee no matching row pairs on initial load
    let scrambled = [...originals];
    for (let attempt = 0; attempt < 30; attempt++) {
      for (let i = scrambled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
      }
      // Derangement check: verify that no item is in its exact original row position
      const samePosCount = scrambled.filter((item, idx) => item === originals[idx]).length;
      if (samePosCount === 0 || (originals.length > 2 && samePosCount <= 1)) {
        return scrambled;
      }
    }
    // Fallback: guaranteed cyclic shift
    const shift = Math.max(1, Math.floor(originals.length / 2));
    return [...originals.slice(shift), ...originals.slice(0, shift)];
  };

  // Helper to ensure step sequence items start scrambled (not pre-solved)
  const getScrambledStepIndices = (count: number, correctOrder?: number[]): number[] => {
    const indices = Array.from({ length: count }, (_, i) => i);
    if (count <= 1) return indices;

    const target = correctOrder && correctOrder.length === count ? correctOrder : indices;
    let scrambled = [...indices];
    for (let attempt = 0; attempt < 30; attempt++) {
      for (let i = scrambled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
      }
      if (JSON.stringify(scrambled) !== JSON.stringify(target)) {
        return scrambled;
      }
    }
    return [...indices].reverse();
  };

  // Per-question UI expansion toggles
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSelfReflectionInput, setShowSelfReflectionInput] = useState<boolean>(false);
  const [studentReflectionNote, setStudentReflectionNote] = useState<string>('');

  // Reload record when assessment changes
  useEffect(() => {
    const loaded = getAssessmentRecord(assessment.topicId);
    setRecord(loaded);
    setActiveQuestionIndex(0);
    setFilterTab('all');
  }, [assessment.topicId]);

  // Compute question list according to filter tab
  const filteredQuestions = useMemo(() => {
    if (filterTab === 'all') return assessment.questions;
    if (filterTab === 'easy') return assessment.questions.filter((q) => q.difficulty === 'easy');
    if (filterTab === 'medium') return assessment.questions.filter((q) => q.difficulty === 'medium');
    if (filterTab === 'hard') return assessment.questions.filter((q) => q.difficulty === 'hard');
    if (filterTab === 'wrong') {
      return assessment.questions.filter((q) => {
        const attempt = record.attempts[q.id];
        return attempt && !attempt.isCorrect;
      });
    }
    return assessment.questions;
  }, [assessment.questions, filterTab, record.attempts]);

  // Current active question
  const currentQuestion: AssessmentQuestion | undefined =
    filteredQuestions[activeQuestionIndex] || filteredQuestions[0];

  // Current attempt record for the active question
  const currentAttempt: QuestionUserAttempt | undefined = currentQuestion
    ? record.attempts[currentQuestion.id]
    : undefined;

  // Initialize input state when active question changes
  useEffect(() => {
    if (!currentQuestion) return;

    setShowExplanation(false);
    setShowHint(false);
    setShowSelfReflectionInput(false);

    const prevAttempt = record.attempts[currentQuestion.id];
    if (prevAttempt) {
      setStudentReflectionNote(prevAttempt.studentExplanation || '');
      // If already answered, prefill or show attempt
      if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') {
        setSelectedOption(String(prevAttempt.userAnswer || ''));
      } else if (currentQuestion.type === 'number-input') {
        setNumberInput(String(prevAttempt.userAnswer || ''));
      } else if (currentQuestion.type === 'fill-blank') {
        setFillBlankChoice(String(prevAttempt.userAnswer || ''));
      }
    } else {
      setSelectedOption('');
      setNumberInput('');
      setFillBlankChoice('');
      setStudentReflectionNote('');
      setMatchedPairs({});
      setSelectedLeftKey(null);
    }

    // Scramble right-side matching items so they are never in the same row order as the left side
    if (currentQuestion.type === 'match' && currentQuestion.matchPairs) {
      setShuffledRightItems(getScrambledRightItems(currentQuestion.matchPairs));
      setMatchedPairs({});
      setSelectedLeftKey(null);
    }

    // If order-steps, initialize with scrambled order so items are not pre-solved
    if (currentQuestion.type === 'order-steps' && currentQuestion.sequenceItems) {
      setOrderedStepIndices(
        getScrambledStepIndices(
          currentQuestion.sequenceItems.length,
          currentQuestion.correctOrder
        )
      );
    }
  }, [currentQuestion?.id, record.attempts]);

  // Stats calculation
  const stats = useMemo(() => calculateAssessmentStats(assessment.topicId, record), [
    assessment.topicId,
    record,
  ]);

  const incorrectQuestionsCount = useMemo(() => {
    return Object.values(record.attempts).filter((a: QuestionUserAttempt) => !a.isCorrect).length;
  }, [record.attempts]);

  // Normalization helper for number input verification
  const checkAnswerAccuracy = (question: AssessmentQuestion, answer: string): boolean => {
    const clean = (val: string) =>
      val
        .trim()
        .toLowerCase()
        .replace(/£/g, '')
        .replace(/,/g, '')
        .replace(/cm/g, '')
        .replace(/m/g, '')
        .replace(/kg/g, '')
        .replace(/g/g, '')
        .replace(/°/g, '')
        .replace(/%/g, '')
        .trim();

    const cleanUser = clean(answer);
    const cleanCorrect = clean(String(question.correctAnswer));

    if (cleanUser === cleanCorrect) return true;

    // Check acceptable answers
    if (question.acceptableAnswers && question.acceptableAnswers.length > 0) {
      return question.acceptableAnswers.some((acc) => clean(String(acc)) === cleanUser);
    }

    // Try numeric tolerance check (e.g. 12.50 vs 12.5)
    const numUser = parseFloat(cleanUser);
    const numCorrect = parseFloat(cleanCorrect);
    if (!isNaN(numUser) && !isNaN(numCorrect) && Math.abs(numUser - numCorrect) < 0.0001) {
      return true;
    }

    return false;
  };

  // Submission handler
  const handleSubmitAnswer = (submittedAnswer: string) => {
    if (!currentQuestion) return;

    let isCorrect = false;

    if (currentQuestion.type === 'match') {
      // Check if all pairs match
      if (currentQuestion.matchPairs) {
        const allMatchedCorrectly = currentQuestion.matchPairs.every(
          (p) => matchedPairs[p.left] === p.right
        );
        isCorrect =
          allMatchedCorrectly &&
          Object.keys(matchedPairs).length === currentQuestion.matchPairs.length;
      }
    } else if (currentQuestion.type === 'order-steps') {
      if (currentQuestion.correctOrder) {
        isCorrect =
          JSON.stringify(orderedStepIndices) === JSON.stringify(currentQuestion.correctOrder);
      }
    } else {
      isCorrect = checkAnswerAccuracy(currentQuestion, submittedAnswer);
    }

    const previousAttemptsCount = currentAttempt ? currentAttempt.attemptsCount : 0;
    const newAttempt: QuestionUserAttempt = {
      questionId: currentQuestion.id,
      userAnswer: submittedAnswer,
      isCorrect,
      attemptsCount: previousAttemptsCount + 1,
      lastAttemptTimestamp: Date.now(),
      viewedExplanation: false,
      studentExplanation: studentReflectionNote,
    };

    const updated = saveQuestionAttempt(assessment.topicId, newAttempt);
    setRecord(updated);

    if (isCorrect) {
      soundEffects.playCorrectSound();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
        });
      } catch {
        // Safe fallback
      }

      // If user has now answered all questions in assessment correctly, celebrate with a victory fanfare!
      const allCorrect =
        assessment.questions.length > 0 &&
        assessment.questions.every((q) => updated.attempts[q.id]?.isCorrect);
      if (allCorrect) {
        setTimeout(() => {
          soundEffects.playVictoryFanfare();
        }, 600);
      }
    } else {
      soundEffects.playWrongSound();
    }
  };

  // Retake current question handler
  const handleRetakeCurrentQuestion = () => {
    if (!currentQuestion) return;
    setSelectedOption('');
    setNumberInput('');
    setFillBlankChoice('');
    setMatchedPairs({});
    setSelectedLeftKey(null);
    setShowExplanation(false);
    setShowHint(false);

    if (currentQuestion.type === 'match' && currentQuestion.matchPairs) {
      setShuffledRightItems(getScrambledRightItems(currentQuestion.matchPairs));
    }
    if (currentQuestion.type === 'order-steps' && currentQuestion.sequenceItems) {
      setOrderedStepIndices(
        getScrambledStepIndices(
          currentQuestion.sequenceItems.length,
          currentQuestion.correctOrder
        )
      );
    }

    // Update attempt record to allow fresh attempt
    const updated = { ...record };
    delete updated.attempts[currentQuestion.id];
    saveAssessmentRecord(assessment.topicId, updated);
    setRecord(updated);
  };

  // Save student reflection note
  const handleSaveReflection = () => {
    if (!currentQuestion || !currentAttempt) return;
    const updatedAttempt: QuestionUserAttempt = {
      ...currentAttempt,
      studentExplanation: studentReflectionNote,
    };
    const updated = saveQuestionAttempt(assessment.topicId, updatedAttempt);
    setRecord(updated);
    setShowSelfReflectionInput(false);
  };

  // Matching pair handler
  const handleMatchClick = (side: 'left' | 'right', value: string) => {
    if (currentAttempt && currentAttempt.isCorrect) return;

    if (side === 'left') {
      // Toggle selection if already selected, otherwise select
      setSelectedLeftKey((prev) => (prev === value ? null : value));
    } else if (side === 'right') {
      if (selectedLeftKey) {
        soundEffects.playPairConnectedSound();
        // Link the selected left item to this right item
        setMatchedPairs((prev) => {
          const next = { ...prev };
          // If any other left key was previously pointing to this right item, clear it
          for (const k of Object.keys(next)) {
            if (next[k] === value) delete next[k];
          }
          next[selectedLeftKey] = value;
          return next;
        });
        setSelectedLeftKey(null);
      } else {
        // If clicked on a linked right item without an active left selection, unlink it
        const linkedLeft = Object.keys(matchedPairs).find((k) => matchedPairs[k] === value);
        if (linkedLeft) {
          setMatchedPairs((prev) => {
            const next = { ...prev };
            delete next[linkedLeft];
            return next;
          });
        }
      }
    }
  };

  // Unlink specific left item
  const handleUnlinkLeft = (leftKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMatchedPairs((prev) => {
      const next = { ...prev };
      delete next[leftKey];
      return next;
    });
    if (selectedLeftKey === leftKey) {
      setSelectedLeftKey(null);
    }
  };

  // Reorder steps handler
  const handleMoveStep = (fromIdx: number, toIdx: number) => {
    if (!currentQuestion?.sequenceItems) return;
    if (toIdx < 0 || toIdx >= currentQuestion.sequenceItems.length) return;
    const next = [...orderedStepIndices];
    const item = next.splice(fromIdx, 1)[0];
    next.splice(toIdx, 0, item);
    setOrderedStepIndices(next);
  };

  // Reset entire assessment
  const handleResetAssessment = () => {
    if (window.confirm('Reset your assessment record and start fresh for this topic?')) {
      const reset = resetAssessmentRecord(assessment.topicId);
      setRecord(reset);
      setActiveQuestionIndex(0);
      setFilterTab('all');
    }
  };

  return (
    <div id="assessment-container" className="space-y-6">
      {/* Assessment Header Card */}
      <div
        className="rounded-2xl border p-5 sm:p-7 relative overflow-hidden shadow-xs space-y-4"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-card)',
        }}
      >
        <div className="space-y-3">
          {/* Top Row: Badges, Controls & Audio */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
              <span
                className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shrink-0"
                style={{
                  backgroundColor: 'var(--badge-bg)',
                  color: 'var(--badge-text)',
                  borderColor: 'var(--border-card-strong)',
                }}
              >
                {assessment.yearLevel}
              </span>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-md border shrink-0"
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-secondary)',
                }}
              >
                25 Syllabus Questions (Easy → Difficult)
              </span>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-md border shrink-0 inline-flex items-center gap-1"
                style={{
                  backgroundColor: stats.accuracyPercentage >= 80 ? '#dcfce7' : 'var(--bg-card-subtle)',
                  color: stats.accuracyPercentage >= 80 ? '#166534' : 'var(--text-primary)',
                  borderColor: stats.accuracyPercentage >= 80 ? '#86efac' : 'var(--border-card)',
                }}
              >
                <Award size={13} />
                <span>Score: {stats.correctCount} / {stats.totalQuestions} ({stats.accuracyPercentage}%)</span>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Kid-friendly Sound FX toggle button */}
              <button
                type="button"
                onClick={handleToggleSoundFx}
                className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                style={{
                  backgroundColor: soundFxEnabled ? 'var(--bg-card)' : 'var(--bg-card-subtle)',
                  borderColor: soundFxEnabled ? 'var(--accent-primary)' : 'var(--border-card)',
                  color: soundFxEnabled ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
                title={
                  soundFxEnabled
                    ? 'Sound FX active for correct/wrong answers (Click to mute)'
                    : 'Sound FX muted (Click to enable sounds)'
                }
              >
                {soundFxEnabled ? (
                  <Volume2 size={14} className="text-amber-500 animate-pulse" />
                ) : (
                  <VolumeX size={14} />
                )}
                <span className="hidden sm:inline font-bold">
                  {soundFxEnabled ? 'Sound FX ON' : 'Sound FX Muted'}
                </span>
              </button>

              {onBackToTheory && (
                <button
                  type="button"
                  onClick={onBackToTheory}
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                  style={{
                    backgroundColor: 'var(--bg-card-subtle)',
                    borderColor: 'var(--border-card)',
                    color: 'var(--text-primary)',
                  }}
                  title="Return to Concept Lessons"
                >
                  <BookOpen size={14} />
                  <span className="hidden sm:inline">Back to Theory</span>
                </button>
              )}

              <AudioButton
                id={`audio-assessment-${assessment.topicId}`}
                textToRead={`Assessment for ${assessment.topicTitle}. ${assessment.summary} Total of 25 exam style questions.`}
                label={`${assessment.topicTitle} Assessment Audio`}
                title="Listen to assessment introduction"
                size="md"
              />
            </div>
          </div>

          <div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Assessment: {assessment.topicTitle}
            </h1>
            <p
              className="text-sm sm:text-base leading-relaxed mt-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              {assessment.summary}
            </p>
          </div>

          {/* Progress Tracker Bar */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              <span>
                Progress: {stats.completedCount} of {stats.totalQuestions} attempted ({stats.progressPercentage}%)
              </span>
              <div className="flex items-center gap-3">
                {incorrectQuestionsCount > 0 && (
                  <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle size={13} />
                    {incorrectQuestionsCount} to review
                  </span>
                )}
                <span>Mastery: {stats.accuracyPercentage}%</span>
              </div>
            </div>

            <div className="w-full h-2.5 rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--bg-card-subtle)' }}>
              <div
                className="h-full transition-all duration-500 rounded-l-full"
                style={{
                  width: `${(stats.correctCount / stats.totalQuestions) * 100}%`,
                  backgroundColor: '#22c55e',
                }}
                title={`${stats.correctCount} Correct`}
              />
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${(incorrectQuestionsCount / stats.totalQuestions) * 100}%`,
                  backgroundColor: '#f59e0b',
                }}
                title={`${incorrectQuestionsCount} Incorrect (Needs Retake)`}
              />
            </div>
          </div>

          {/* Filter Tabs & Retake Wrong Questions Shortcut */}
          <div
            className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t"
            style={{ borderColor: 'var(--border-card)' }}
          >
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setFilterTab('all');
                  setActiveQuestionIndex(0);
                }}
                className="px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs"
                style={{
                  backgroundColor: filterTab === 'all' ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                  borderColor: filterTab === 'all' ? 'var(--accent-primary)' : 'var(--border-card)',
                  color: filterTab === 'all' ? 'var(--accent-contrast)' : 'var(--text-primary)',
                }}
              >
                All (25)
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterTab('easy');
                  setActiveQuestionIndex(0);
                }}
                className="px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs"
                style={{
                  backgroundColor: filterTab === 'easy' ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                  borderColor: filterTab === 'easy' ? 'var(--accent-primary)' : 'var(--border-card)',
                  color: filterTab === 'easy' ? 'var(--accent-contrast)' : 'var(--text-primary)',
                }}
              >
                Foundation Q1-8
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterTab('medium');
                  setActiveQuestionIndex(0);
                }}
                className="px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs"
                style={{
                  backgroundColor: filterTab === 'medium' ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                  borderColor: filterTab === 'medium' ? 'var(--accent-primary)' : 'var(--border-card)',
                  color: filterTab === 'medium' ? 'var(--accent-contrast)' : 'var(--text-primary)',
                }}
              >
                Application Q9-17
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterTab('hard');
                  setActiveQuestionIndex(0);
                }}
                className="px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs"
                style={{
                  backgroundColor: filterTab === 'hard' ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                  borderColor: filterTab === 'hard' ? 'var(--accent-primary)' : 'var(--border-card)',
                  color: filterTab === 'hard' ? 'var(--accent-contrast)' : 'var(--text-primary)',
                }}
              >
                Reasoning Q18-25
              </button>

              {incorrectQuestionsCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterTab('wrong');
                    setActiveQuestionIndex(0);
                  }}
                  className="px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs flex items-center gap-1 font-bold"
                  style={{
                    backgroundColor: filterTab === 'wrong' ? '#b91c1c' : '#fee2e2',
                    borderColor: filterTab === 'wrong' ? '#b91c1c' : '#f87171',
                    color: filterTab === 'wrong' ? '#ffffff' : '#991b1b',
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Retake Wrong Questions ({incorrectQuestionsCount})</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetAssessment}
                className="px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-muted)',
                }}
                title="Reset all answers for this topic"
              >
                Reset Assessment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Quick Dots Bar for 25 Questions */}
      <div
        className="rounded-2xl border p-3.5 sm:p-4 shadow-2xs space-y-2.5 tactile-card"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-card)',
        }}
      >
        <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
          <span className="uppercase tracking-wider text-[11px] font-extrabold" style={{ color: 'var(--accent-primary)' }}>
            Jump to Question:
          </span>
          <span className="text-[11px] font-medium">
            Showing {filteredQuestions.length} {filterTab === 'wrong' ? 'incorrect' : ''} questions
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {filteredQuestions.map((q, idx) => {
            const attempt = record.attempts[q.id];
            const isCurrent = idx === activeQuestionIndex;
            let bgColor = 'var(--bg-card-subtle)';
            let textColor = 'var(--text-primary)';
            let borderColor = 'var(--border-card)';

            if (attempt) {
              if (attempt.isCorrect) {
                bgColor = '#22c55e';
                textColor = '#ffffff';
                borderColor = '#16a34a';
              } else {
                bgColor = '#ef4444';
                textColor = '#ffffff';
                borderColor = '#dc2626';
              }
            }

            if (isCurrent) {
              borderColor = 'var(--accent-primary)';
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setActiveQuestionIndex(idx)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer border shadow-2xs relative tactile-btn"
                style={{
                  backgroundColor: isCurrent ? 'var(--reading-highlight-bg)' : bgColor,
                  color: isCurrent ? 'var(--text-primary)' : textColor,
                  borderColor: isCurrent ? 'var(--accent-primary)' : borderColor,
                  transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                  zIndex: isCurrent ? 2 : 1,
                  boxShadow: isCurrent ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
                }}
                title={`Question ${q.questionNumber} (${q.difficulty}) - ${
                  attempt ? (attempt.isCorrect ? 'Correct' : 'Incorrect - Click to retake') : 'Unattempted'
                }`}
              >
                <span>{q.questionNumber}</span>
                {attempt && (
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white"
                    style={{ backgroundColor: attempt.isCorrect ? '#15803d' : '#991b1b' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card Container */}
      {currentQuestion ? (
        <div
          id={`assessment-q-${currentQuestion.id}`}
          className="rounded-2xl border p-5 sm:p-7 shadow-xs space-y-5 transition-all tactile-card"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          {/* Question Metadata Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--border-card)' }}>
            <div className="flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center border shadow-2xs"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-contrast)',
                  borderColor: 'var(--accent-primary)',
                }}
              >
                Q{currentQuestion.questionNumber}
              </span>
              <span
                className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border"
                style={{
                  backgroundColor:
                    currentQuestion.difficulty === 'easy'
                      ? '#dcfce7'
                      : currentQuestion.difficulty === 'medium'
                      ? '#fef3c7'
                      : '#f3e8ff',
                  color:
                    currentQuestion.difficulty === 'easy'
                      ? '#166534'
                      : currentQuestion.difficulty === 'medium'
                      ? '#854d0e'
                      : '#6b21a8',
                  borderColor: 'var(--border-card)',
                }}
              >
                {currentQuestion.difficulty === 'easy'
                  ? 'Level 1: Foundation'
                  : currentQuestion.difficulty === 'medium'
                  ? 'Level 2: Application'
                  : 'Level 3: Reasoning & Challenge'}
              </span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded border capitalize hidden sm:inline"
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  color: 'var(--text-muted)',
                  borderColor: 'var(--border-card)',
                }}
              >
                Format: {currentQuestion.type.replace('-', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <AudioButton
                id={`audio-q-${currentQuestion.id}`}
                textToRead={`Question ${currentQuestion.questionNumber}. ${currentQuestion.question}`}
                label={`Listen to Question ${currentQuestion.questionNumber}`}
                size="sm"
              />
            </div>
          </div>

          {/* Question Prompt */}
          <div className="space-y-3">
            <h2
              className="text-base sm:text-lg font-bold leading-relaxed"
              style={{ color: 'var(--text-primary)' }}
            >
              {currentQuestion.question}
            </h2>

            {/* LaTeX Math Expression in Question if available */}
            {currentQuestion.mathProblem && (
              <div
                className="p-3.5 rounded-xl border text-center my-2 shadow-2xs"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-card)',
                }}
              >
                <MathView formula={currentQuestion.mathProblem} displayMode={true} />
              </div>
            )}
          </div>

          {/* FORMAT 1: Multiple Choice */}
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {currentQuestion.options.map((opt, optIdx) => {
                const optLetter = String.fromCharCode(65 + optIdx);
                const isSelected = selectedOption === opt;
                const isSubmitted = currentAttempt !== undefined;
                const isCorrectOption = opt === currentQuestion.correctAnswer;

                let optBg = 'var(--bg-card-subtle)';
                let optBorder = 'var(--border-card)';
                let optText = 'var(--text-primary)';

                if (isSelected) {
                  optBg = 'var(--reading-highlight-bg)';
                  optBorder = 'var(--accent-primary)';
                }

                if (isSubmitted) {
                  if (isCorrectOption) {
                    optBg = '#dcfce7';
                    optBorder = '#22c55e';
                    optText = '#14532d';
                  } else if (isSelected && !currentAttempt.isCorrect) {
                    optBg = '#fee2e2';
                    optBorder = '#ef4444';
                    optText = '#7f1d1d';
                  }
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={isSubmitted && currentAttempt.isCorrect}
                    onClick={() => {
                      setSelectedOption(opt);
                      if (!isSubmitted) {
                        handleSubmitAnswer(opt);
                      }
                    }}
                    className="p-3.5 rounded-xl border text-left font-semibold text-xs sm:text-sm flex items-start gap-3 transition-all cursor-pointer shadow-2xs tactile-btn"
                    style={{
                      backgroundColor: optBg,
                      borderColor: optBorder,
                      color: optText,
                    }}
                  >
                    <span
                      className="w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-card)',
                        color: isSelected ? 'var(--accent-contrast)' : 'var(--text-primary)',
                        borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-card-strong)',
                      }}
                    >
                      {optLetter}
                    </span>
                    <span className="flex-1 mt-0.5 leading-snug">{opt}</span>
                    {isSubmitted && isCorrectOption && (
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {isSubmitted && isSelected && !currentAttempt.isCorrect && (
                      <XCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* FORMAT 2: True / False */}
          {currentQuestion.type === 'true-false' && currentQuestion.options && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedOption === opt;
                const isSubmitted = currentAttempt !== undefined;
                const isCorrectOption = opt === currentQuestion.correctAnswer;

                let btnBg = 'var(--bg-card-subtle)';
                let btnBorder = 'var(--border-card)';

                if (isSelected) {
                  btnBg = 'var(--reading-highlight-bg)';
                  btnBorder = 'var(--accent-primary)';
                }

                if (isSubmitted) {
                  if (isCorrectOption) {
                    btnBg = '#dcfce7';
                    btnBorder = '#22c55e';
                  } else if (isSelected && !currentAttempt.isCorrect) {
                    btnBg = '#fee2e2';
                    btnBorder = '#ef4444';
                  }
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={isSubmitted && currentAttempt.isCorrect}
                    onClick={() => {
                      setSelectedOption(opt);
                      if (!isSubmitted) {
                        handleSubmitAnswer(opt);
                      }
                    }}
                    className="p-4 rounded-xl border text-center font-bold text-sm sm:text-base transition-all cursor-pointer shadow-2xs flex flex-col items-center justify-center gap-1"
                    style={{
                      backgroundColor: btnBg,
                      borderColor: btnBorder,
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span>{opt}</span>
                    {isSubmitted && isCorrectOption && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <Check size={14} /> Correct
                      </span>
                    )}
                    {isSubmitted && isSelected && !currentAttempt.isCorrect && (
                      <span className="text-xs text-red-700 font-bold flex items-center gap-1">
                        <XCircle size={14} /> Incorrect
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* FORMAT 3: Number / Math Input */}
          {currentQuestion.type === 'number-input' && (
            <div className="space-y-3 pt-2 max-w-md">
              <div className="flex gap-2">
                <input
                  id={`input-number-${currentQuestion.id}`}
                  type="text"
                  value={numberInput}
                  onChange={(e) => setNumberInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && numberInput.trim()) {
                      handleSubmitAnswer(numberInput.trim());
                    }
                  }}
                  disabled={currentAttempt && currentAttempt.isCorrect}
                  placeholder="Enter your final answer..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    borderColor: 'var(--border-card-strong)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  type="button"
                  disabled={(currentAttempt && currentAttempt.isCorrect) || !numberInput.trim()}
                  onClick={() => handleSubmitAnswer(numberInput.trim())}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50 shadow-2xs border"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    borderColor: 'var(--accent-primary)',
                    color: 'var(--accent-contrast)',
                  }}
                >
                  Check Answer
                </button>
              </div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Tip: Enter decimals (e.g. 4.95), fractions (e.g. 3/4), or whole numbers as needed.
              </p>
            </div>
          )}

          {/* FORMAT 4: Match Pairs */}
          {currentQuestion.type === 'match' && currentQuestion.matchPairs && (
            <div className="space-y-4 pt-2">
              <div
                className="p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-secondary)',
                }}
              >
                <span>
                  {selectedLeftKey ? (
                    <span className="text-amber-600 font-bold flex items-center gap-1.5 animate-pulse">
                      <Sparkles size={14} /> Selected: "{selectedLeftKey}" — Now click its match on the Right!
                    </span>
                  ) : (
                    <span>Click an item on the Left, then click its corresponding match on the Right:</span>
                  )}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-bold border"
                  style={{
                    backgroundColor:
                      Object.keys(matchedPairs).length === currentQuestion.matchPairs.length
                        ? '#dcfce7'
                        : 'var(--bg-card)',
                    color:
                      Object.keys(matchedPairs).length === currentQuestion.matchPairs.length
                        ? '#166534'
                        : 'var(--text-primary)',
                    borderColor: 'var(--border-card-strong)',
                  }}
                >
                  {Object.keys(matchedPairs).length} / {currentQuestion.matchPairs.length} Pairs Connected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left side items (Premise / Problem) */}
                <div className="space-y-2">
                  <span
                    className="text-[11px] font-extrabold uppercase tracking-wider block"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Premise / Problem:
                  </span>
                  {currentQuestion.matchPairs.map((pair, idx) => {
                    const isSelected = selectedLeftKey === pair.left;
                    const matchedRight = matchedPairs[pair.left];
                    const isSubmitted = currentAttempt !== undefined;
                    const isPairCorrect = isSubmitted && matchedRight === pair.right;
                    const isPairWrong = isSubmitted && matchedRight && matchedRight !== pair.right;

                    let cardBg = 'var(--bg-card-subtle)';
                    let cardBorder = 'var(--border-card)';

                    if (isSelected) {
                      cardBg = 'var(--reading-highlight-bg)';
                      cardBorder = 'var(--accent-primary)';
                    } else if (matchedRight) {
                      cardBg = 'var(--bg-card)';
                      cardBorder = 'var(--accent-primary)';
                    }

                    if (isSubmitted) {
                      if (isPairCorrect) {
                        cardBg = '#dcfce7';
                        cardBorder = '#22c55e';
                      } else if (isPairWrong) {
                        cardBg = '#fee2e2';
                        cardBorder = '#ef4444';
                      }
                    }

                    return (
                      <div
                        key={pair.left}
                        onClick={() => handleMatchClick('left', pair.left)}
                        className="w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs flex flex-col gap-1.5"
                        style={{
                          backgroundColor: cardBg,
                          borderColor: cardBorder,
                          color: 'var(--text-primary)',
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold">{pair.left}</span>
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 border"
                            style={{
                              backgroundColor: 'var(--badge-bg)',
                              color: 'var(--badge-text)',
                              borderColor: 'var(--border-card)',
                            }}
                          >
                            {idx + 1}
                          </span>
                        </div>

                        {/* Matched connection pill */}
                        {matchedRight && (
                          <div className="flex items-center justify-between gap-2 pt-1 border-t text-[11px]" style={{ borderColor: 'var(--border-card)' }}>
                            <span className="truncate flex items-center gap-1 font-bold" style={{ color: 'var(--accent-primary)' }}>
                              <span>➜ Linked to:</span>
                              <span className="underline">{matchedRight}</span>
                            </span>
                            {!isSubmitted && (
                              <button
                                type="button"
                                onClick={(e) => handleUnlinkLeft(pair.left, e)}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold border hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer"
                                style={{ borderColor: 'var(--border-card)', color: 'var(--text-muted)' }}
                                title="Unlink this pair"
                              >
                                ✕
                              </button>
                            )}
                            {isSubmitted && isPairCorrect && (
                              <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                                <Check size={12} /> Correct
                              </span>
                            )}
                            {isSubmitted && isPairWrong && (
                              <span className="text-red-700 font-bold flex items-center gap-1 text-[10px]">
                                <XCircle size={12} /> Target: {pair.right}
                              </span>
                            )}
                          </div>
                        )}

                        {isSelected && !matchedRight && (
                          <span className="text-[10px] font-bold text-amber-600">
                            Select match on right...
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Right side items (Shuffled Solutions) */}
                <div className="space-y-2">
                  <span
                    className="text-[11px] font-extrabold uppercase tracking-wider block"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Matching Solution (Shuffled):
                  </span>
                  {(shuffledRightItems.length === currentQuestion.matchPairs.length
                    ? shuffledRightItems
                    : getScrambledRightItems(currentQuestion.matchPairs)
                  ).map((rightVal) => {
                    const linkedLeftKey = Object.keys(matchedPairs).find(
                      (k) => matchedPairs[k] === rightVal
                    );
                    const isLinkedToCurrentSelection =
                      selectedLeftKey && matchedPairs[selectedLeftKey] === rightVal;
                    const isSubmitted = currentAttempt !== undefined;
                    const correctLeft = currentQuestion.matchPairs!.find((p) => p.right === rightVal)?.left;
                    const isRightCorrect = isSubmitted && linkedLeftKey === correctLeft;
                    const isRightWrong = isSubmitted && linkedLeftKey && linkedLeftKey !== correctLeft;

                    let rightBg = 'var(--bg-card-subtle)';
                    let rightBorder = 'var(--border-card)';

                    if (isLinkedToCurrentSelection) {
                      rightBg = 'var(--reading-highlight-bg)';
                      rightBorder = 'var(--accent-primary)';
                    } else if (linkedLeftKey) {
                      rightBg = 'var(--bg-card)';
                      rightBorder = 'var(--accent-primary)';
                    }

                    if (isSubmitted) {
                      if (isRightCorrect) {
                        rightBg = '#dcfce7';
                        rightBorder = '#22c55e';
                      } else if (isRightWrong) {
                        rightBg = '#fee2e2';
                        rightBorder = '#ef4444';
                      }
                    }

                    return (
                      <div
                        key={rightVal}
                        onClick={() => handleMatchClick('right', rightVal)}
                        className="w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs flex flex-col gap-1.5"
                        style={{
                          backgroundColor: rightBg,
                          borderColor: rightBorder,
                          color: 'var(--text-primary)',
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold">{rightVal}</span>
                          {linkedLeftKey && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                              style={{
                                backgroundColor: 'var(--badge-bg)',
                                color: 'var(--badge-text)',
                                borderColor: 'var(--border-card)',
                              }}
                            >
                              Linked ✓
                            </span>
                          )}
                        </div>

                        {linkedLeftKey && (
                          <div className="pt-1 border-t text-[11px] font-bold truncate" style={{ borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}>
                            <span>Matched from: </span>
                            <span className="underline" style={{ color: 'var(--text-primary)' }}>{linkedLeftKey}</span>
                          </div>
                        )}

                        {selectedLeftKey && !linkedLeftKey && (
                          <span className="text-[10px] font-bold text-amber-600">
                            Click to link to "{selectedLeftKey}"
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSubmitAnswer('All pairs matched')}
                  disabled={
                    (currentAttempt && currentAttempt.isCorrect) ||
                    Object.keys(matchedPairs).length !== currentQuestion.matchPairs.length
                  }
                  className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-50 border shadow-2xs transition-all"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    borderColor: 'var(--accent-primary)',
                    color: 'var(--accent-contrast)',
                  }}
                >
                  Verify All Pairings
                </button>
                {Object.keys(matchedPairs).length > 0 && !currentAttempt?.isCorrect && (
                  <button
                    type="button"
                    onClick={() => {
                      setMatchedPairs({});
                      setSelectedLeftKey(null);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-medium border cursor-pointer hover:opacity-80"
                    style={{
                      borderColor: 'var(--border-card)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Clear All Pairings
                  </button>
                )}
              </div>
            </div>
          )}

          {/* FORMAT 5: Order Steps */}
          {currentQuestion.type === 'order-steps' && currentQuestion.sequenceItems && (
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                Arrange the problem-solving steps into the correct chronological order using the Up / Down arrows:
              </p>

              <div className="space-y-2">
                {orderedStepIndices.map((origIdx, currentIdx) => {
                  const stepText = currentQuestion.sequenceItems![origIdx];
                  return (
                    <div
                      key={stepText}
                      className="p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-semibold shadow-2xs"
                      style={{
                        backgroundColor: 'var(--bg-card-subtle)',
                        borderColor: 'var(--border-card)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-5 h-5 rounded-full font-bold text-[11px] flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: 'var(--accent-contrast)',
                            borderColor: 'var(--accent-primary)',
                          }}
                        >
                          {currentIdx + 1}
                        </span>
                        <span>{stepText}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={currentIdx === 0}
                          onClick={() => handleMoveStep(currentIdx, currentIdx - 1)}
                          className="p-1 rounded border disabled:opacity-30 cursor-pointer"
                          style={{ borderColor: 'var(--border-card)' }}
                          title="Move step up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={currentIdx === currentQuestion.sequenceItems!.length - 1}
                          onClick={() => handleMoveStep(currentIdx, currentIdx + 1)}
                          className="p-1 rounded border disabled:opacity-30 cursor-pointer"
                          style={{ borderColor: 'var(--border-card)' }}
                          title="Move step down"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSubmitAnswer('Ordered steps checked')}
                  className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm cursor-pointer border shadow-2xs"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    borderColor: 'var(--accent-primary)',
                    color: 'var(--accent-contrast)',
                  }}
                >
                  Verify Step Order
                </button>
              </div>
            </div>
          )}

          {/* FORMAT 6: Fill in the Blank */}
          {currentQuestion.type === 'fill-blank' && currentQuestion.options && (
            <div className="space-y-3 pt-2 max-w-md">
              <div className="grid grid-cols-2 gap-2">
                {currentQuestion.options.map((opt) => {
                  const isSelected = fillBlankChoice === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setFillBlankChoice(opt);
                        handleSubmitAnswer(opt);
                      }}
                      className="p-3 rounded-xl border text-center font-bold text-xs sm:text-sm cursor-pointer transition-all shadow-2xs"
                      style={{
                        backgroundColor: isSelected ? 'var(--reading-highlight-bg)' : 'var(--bg-card-subtle)',
                        borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-card)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PEDAGOGICAL FEEDBACK & RETAKE MECHANISMS (Requested in prompt)            */}
          {/* ========================================================================= */}
          {currentAttempt !== undefined && (
            <div
              className="mt-4 p-4 sm:p-5 rounded-xl border space-y-3 transition-all"
              style={{
                backgroundColor: currentAttempt.isCorrect ? '#f0fdf4' : '#fffbeb',
                borderColor: currentAttempt.isCorrect ? '#86efac' : '#fde68a',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {currentAttempt.isCorrect ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
                      ✓
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                      !
                    </div>
                  )}
                  <div>
                    <h3
                      className="font-extrabold text-sm sm:text-base"
                      style={{ color: currentAttempt.isCorrect ? '#14532d' : '#78350f' }}
                    >
                      {currentAttempt.isCorrect
                        ? 'Brilliant! That is correct!'
                        : 'Not quite! Mistakes help us discover how math works.'}
                    </h3>
                    <p
                      className="text-xs font-medium mt-0.5"
                      style={{ color: currentAttempt.isCorrect ? '#166534' : '#92400e' }}
                    >
                      {currentAttempt.isCorrect
                        ? `Solved accurately on attempt ${currentAttempt.attemptsCount}.`
                        : 'Would you like to try again, see a hint, or have the answer fully explained?'}
                    </p>
                  </div>
                </div>

                {/* Retake this question button */}
                {!currentAttempt.isCorrect && (
                  <button
                    type="button"
                    onClick={handleRetakeCurrentQuestion}
                    className="px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer shadow-2xs border transition-transform hover:scale-105 flex items-center gap-1.5 shrink-0"
                    style={{
                      backgroundColor: '#b45309',
                      borderColor: '#92400e',
                      color: '#ffffff',
                    }}
                    title="Clear your answer and try again"
                  >
                    <RotateCcw size={13} />
                    <span>Retake Question</span>
                  </button>
                )}
              </div>

              {/* Action Buttons for Incorrect State: Hint, Explanation, and Student Reflection */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {currentQuestion.hint && (
                  <button
                    type="button"
                    onClick={() => setShowHint((prev) => !prev)}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                    style={{
                      backgroundColor: showHint ? 'var(--reading-highlight-bg)' : 'var(--bg-card)',
                      borderColor: 'var(--border-card-strong)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Lightbulb size={14} style={{ color: 'var(--accent-primary)' }} />
                    <span>{showHint ? 'Hide Hint' : 'Show Clue / Hint'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowExplanation((prev) => !prev)}
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                  style={{
                    backgroundColor: showExplanation ? 'var(--reading-highlight-bg)' : 'var(--bg-card)',
                    borderColor: 'var(--border-card-strong)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <BookOpen size={14} style={{ color: 'var(--accent-primary)' }} />
                  <span>{showExplanation ? 'Hide Explanation' : 'Explain Answer to Me'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSelfReflectionInput((prev) => !prev)}
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                  style={{
                    backgroundColor: showSelfReflectionInput ? 'var(--reading-highlight-bg)' : 'var(--bg-card)',
                    borderColor: 'var(--border-card-strong)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Edit3 size={14} style={{ color: 'var(--accent-primary)' }} />
                  <span>
                    {currentAttempt.studentExplanation
                      ? 'Edit My Reflection Note'
                      : 'Explain My Thinking (Note)'}
                  </span>
                </button>
              </div>

              {/* Unfolded Hint */}
              {showHint && currentQuestion.hint && (
                <div
                  className="p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 mt-2 animate-in fade-in"
                  style={{
                    backgroundColor: '#fffbeb',
                    borderColor: '#fde68a',
                    color: '#92400e',
                  }}
                >
                  <span className="font-extrabold flex items-center gap-1">
                    <Lightbulb size={13} /> Syllabus Hint:
                  </span>
                  <p>{currentQuestion.hint}</p>
                </div>
              )}

              {/* Unfolded Full Explanation */}
              {(showExplanation || currentAttempt.isCorrect) && (
                <div
                  className="p-4 rounded-xl border space-y-3 mt-2 text-xs sm:text-sm animate-in fade-in"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-card-strong)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-card)' }}>
                    <span className="font-extrabold flex items-center gap-1.5" style={{ color: 'var(--accent-primary)' }}>
                      <CheckCircle2 size={15} /> Correct Solution & Explanation:
                    </span>
                    <AudioButton
                      id={`audio-expl-${currentQuestion.id}`}
                      textToRead={`Explanation: ${currentQuestion.explanation}`}
                      label="Listen to explanation"
                      size="sm"
                    />
                  </div>

                  <p className="leading-relaxed">{currentQuestion.explanation}</p>

                  {/* Math Formula Derivation if provided */}
                  {currentQuestion.mathExplanation && (
                    <div
                      className="p-3 rounded-lg border text-center my-1"
                      style={{
                        backgroundColor: 'var(--bg-canvas)',
                        borderColor: 'var(--border-card)',
                      }}
                    >
                      <MathView formula={currentQuestion.mathExplanation} displayMode={true} />
                    </div>
                  )}

                  {/* Common Misconception Alert */}
                  {currentQuestion.commonMisconception && (
                    <div
                      className="p-3 rounded-lg border text-xs space-y-1"
                      style={{
                        backgroundColor: '#fef2f2',
                        borderColor: '#fca5a5',
                        color: '#991b1b',
                      }}
                    >
                      <span className="font-extrabold flex items-center gap-1">
                        <AlertTriangle size={13} /> Common Exam Misconception:
                      </span>
                      <p>{currentQuestion.commonMisconception}</p>
                    </div>
                  )}

                  {/* Self-Check Strategy */}
                  {currentQuestion.selfCheckPrompt && (
                    <div
                      className="p-2.5 rounded-lg border text-xs space-y-0.5"
                      style={{
                        backgroundColor: 'var(--bg-card-subtle)',
                        borderColor: 'var(--border-card)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span className="font-bold flex items-center gap-1">
                        <BookmarkCheck size={13} style={{ color: 'var(--accent-primary)' }} /> Quick Verification Check:
                      </span>
                      <p>{currentQuestion.selfCheckPrompt}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Student Self-Reflection Note Editor */}
              {showSelfReflectionInput && (
                <div
                  className="p-3.5 rounded-xl border space-y-2 mt-2"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-card)',
                  }}
                >
                  <label className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                    Student Reflection: What was your thought process or what tripped you up?
                  </label>
                  <textarea
                    rows={2}
                    value={studentReflectionNote}
                    onChange={(e) => setStudentReflectionNote(e.target.value)}
                    placeholder="e.g. 'I forgot to find a common denominator before adding' or 'I misread 20 minutes as 0.2 hours'..."
                    className="w-full p-2.5 rounded-lg border text-xs focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      borderColor: 'var(--border-card-strong)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSelfReflectionInput(false)}
                      className="px-2.5 py-1 text-xs rounded border cursor-pointer"
                      style={{ borderColor: 'var(--border-card)' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveReflection}
                      className="px-3 py-1 text-xs font-bold rounded cursor-pointer border"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        borderColor: 'var(--accent-primary)',
                        color: 'var(--accent-contrast)',
                      }}
                    >
                      Save Reflection
                    </button>
                  </div>
                </div>
              )}

              {/* Display existing saved reflection */}
              {currentAttempt.studentExplanation && !showSelfReflectionInput && (
                <div
                  className="p-2.5 rounded-lg border text-xs flex items-start gap-2"
                  style={{
                    backgroundColor: 'var(--bg-card-subtle)',
                    borderColor: 'var(--border-card)',
                  }}
                >
                  <Edit3 size={13} className="shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-bold">Your Reflection Note: </span>
                    <span className="italic">"{currentAttempt.studentExplanation}"</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question Navigation Controls (Previous / Next) */}
          <div
            className="flex items-center justify-between gap-3 pt-4 border-t"
            style={{ borderColor: 'var(--border-card)' }}
          >
            <button
              type="button"
              disabled={activeQuestionIndex === 0}
              onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border cursor-pointer transition-all disabled:opacity-40 shadow-2xs tactile-btn"
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                borderColor: 'var(--border-card)',
                color: 'var(--text-primary)',
              }}
            >
              <ArrowLeft size={16} />
              <span>Previous Question</span>
            </button>

            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
              {activeQuestionIndex + 1} of {filteredQuestions.length}
            </span>

            <button
              type="button"
              disabled={activeQuestionIndex === filteredQuestions.length - 1}
              onClick={() =>
                setActiveQuestionIndex((prev) => Math.min(filteredQuestions.length - 1, prev + 1))
              }
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border cursor-pointer transition-all disabled:opacity-40 shadow-2xs tactile-btn"
              style={{
                backgroundColor: 'var(--accent-primary)',
                borderColor: 'var(--accent-primary)',
                color: 'var(--accent-contrast)',
              }}
            >
              <span>Next Question</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl border p-8 text-center space-y-3"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          <Award size={36} className="mx-auto text-amber-500" />
          <h3 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>
            {filterTab === 'wrong'
              ? 'No Incorrect Questions!'
              : 'No Questions Found'}
          </h3>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            {filterTab === 'wrong'
              ? 'Terrific job! You have answered all questions correctly or have not yet attempted any.'
              : 'Please switch your filter tab to view questions.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setFilterTab('all');
              setActiveQuestionIndex(0);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer"
            style={{
              backgroundColor: 'var(--accent-primary)',
              borderColor: 'var(--accent-primary)',
              color: 'var(--accent-contrast)',
            }}
          >
            Show All Questions (25)
          </button>
        </div>
      )}
    </div>
  );
};
