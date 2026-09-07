import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  GraduationCap,
  Lightbulb,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Cpu,
} from 'lucide-react';
import { MathTopic } from '../types/math';
import { MathView } from './MathView';
import { ReadableCard } from './ReadableCard';
import { AudioButton } from './AudioButton';
import { FractionsVisualizer } from './tools/FractionsVisualizer';
import { BidmasEvaluator } from './tools/BidmasEvaluator';
import { AnglesExplorer } from './tools/AnglesExplorer';
import { AreaPerimeterSandbox } from './tools/AreaPerimeterSandbox';
import { RomanNumeralsConverter } from './tools/RomanNumeralsConverter';

interface TopicDetailProps {
  topic: MathTopic;
  onSelectTopic?: (topicId: string) => void;
}

type TabType = 'theory' | 'tips' | 'formulas' | 'practice' | 'tools';

export const TopicDetail: React.FC<TopicDetailProps> = ({ topic }) => {
  const [activeTab, setActiveTab] = useState<TabType>('theory');
  const [selectedExampleLevel, setSelectedExampleLevel] = useState<string>('All');
  const [expandedExamples, setExpandedExamples] = useState<Record<string, boolean>>({
    [topic.sections[0]?.workedExamples?.[0]?.id || '']: true,
  });

  // Practice state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});

  const toggleExample = (id: string) => {
    setExpandedExamples((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAnswer = (qId: string, optIndex: number, correctIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optIndex }));
    setShowExplanations((prev) => ({ ...prev, [qId]: true }));
    if (optIndex === correctIndex) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {
        // Safe fallback
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Topic Header Card - Click anywhere to read! */}
      <ReadableCard
        id={`topic-header-${topic.id}`}
        textToRead={`${topic.title}. For ${topic.yearLevel}. ${topic.summary}`}
        className="p-5 sm:p-7 relative overflow-hidden shadow-xs border"
        ariaLabel="Topic Header Overview"
      >
        <div className="space-y-3">
          {/* Top Row: Metadata badges & Audio indicator cleanly aligned at top right */}
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
                {topic.yearLevel}
              </span>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-md border shrink-0"
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-secondary)',
                }}
              >
                {topic.difficulty} Tier
              </span>
              <span
                className="flex items-center gap-1 text-xs font-medium ml-1 shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                <Clock size={13} /> {topic.readTimeMinutes} min study
              </span>
            </div>

            <AudioButton
              id={`topic-header-${topic.id}`}
              textToRead={`${topic.title}. For ${topic.yearLevel}. ${topic.summary}`}
              title="Listen to topic overview"
              size="md"
              className="shrink-0"
            />
          </div>

          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight break-words"
            style={{ color: 'var(--text-primary)' }}
          >
            {topic.title}
          </h1>

          <p
            className="text-sm sm:text-base leading-relaxed max-w-3xl"
            style={{ color: 'var(--text-secondary)' }}
          >
            {topic.summary}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div
          className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-6 pt-5 border-t"
          style={{ borderColor: 'var(--border-card)' }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('theory')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer border shadow-2xs"
            style={{
              backgroundColor: activeTab === 'theory' ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
              borderColor: activeTab === 'theory' ? 'var(--accent-primary)' : 'var(--border-card)',
              color: activeTab === 'theory' ? '#ffffff' : 'var(--text-primary)',
            }}
          >
            <BookOpen size={16} />
            <span>Concepts & Worked Examples</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tips')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer border shadow-2xs"
            style={{
              backgroundColor: activeTab === 'tips' ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
              borderColor: activeTab === 'tips' ? 'var(--accent-primary)' : 'var(--border-card)',
              color: activeTab === 'tips' ? '#ffffff' : 'var(--text-primary)',
            }}
          >
            <Sparkles size={16} />
            <span>Tips & Tricks ({topic.tipsAndTricks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('formulas')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer border shadow-2xs"
            style={{
              backgroundColor: activeTab === 'formulas' ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
              borderColor: activeTab === 'formulas' ? 'var(--accent-primary)' : 'var(--border-card)',
              color: activeTab === 'formulas' ? '#ffffff' : 'var(--text-primary)',
            }}
          >
            <Award size={16} />
            <span>Key Formulas & Important Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('practice')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer border shadow-2xs"
            style={{
              backgroundColor: activeTab === 'practice' ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
              borderColor: activeTab === 'practice' ? 'var(--accent-primary)' : 'var(--border-card)',
              color: activeTab === 'practice' ? '#ffffff' : 'var(--text-primary)',
            }}
          >
            <GraduationCap size={16} />
            <span>Self-Check Practice ({topic.practiceQuestions.length})</span>
          </button>

          {topic.toolType && (
            <button
              type="button"
              onClick={() => setActiveTab('tools')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer border shadow-2xs"
              style={{
                backgroundColor: activeTab === 'tools' ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                borderColor: activeTab === 'tools' ? 'var(--accent-primary)' : 'var(--border-card)',
                color: activeTab === 'tools' ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              <Cpu size={16} />
              <span>Interactive Visual Tool</span>
            </button>
          )}
        </div>
      </ReadableCard>

      {/* Tab 1: Concepts & Worked Examples */}
      {activeTab === 'theory' && (
        <div className="space-y-6">
          {topic.sections.map((sec, idx) => (
            <ReadableCard
              key={sec.id}
              id={`sec-${sec.id}`}
              textToRead={`${sec.title}. ${sec.content}. Essential Key Rules: ${sec.keyTakeaways.join('. ')}`}
              className="p-5 sm:p-7 space-y-4 shadow-xs border"
              ariaLabel={`Section: ${sec.title}`}
            >
              <div
                className="flex items-start justify-between gap-3 pb-3 border-b"
                style={{ borderColor: 'var(--border-card)' }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    {idx + 1}
                  </span>
                  <h2
                    className="text-lg sm:text-xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {sec.title}
                  </h2>
                </div>

                <AudioButton
                  id={`sec-${sec.id}`}
                  textToRead={`${sec.title}. ${sec.content}. Essential Key Rules: ${sec.keyTakeaways.join('. ')}`}
                  title="Listen to this section"
                  size="sm"
                />
              </div>

              <p
                className="text-sm sm:text-base leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {sec.content}
              </p>

              {/* Creative Mental Model / Visual Metaphor */}
              {sec.visualMetaphor && (
                <div
                  className="p-3.5 rounded-xl border flex items-start gap-2.5 shadow-2xs"
                  style={{
                    backgroundColor: 'var(--contrast-indigo-bg)',
                    borderColor: 'var(--contrast-indigo-border)',
                  }}
                >
                  <Sparkles size={17} className="shrink-0 mt-0.5" style={{ color: 'var(--contrast-indigo)' }} />
                  <div className="text-xs sm:text-sm">
                    <span
                      className="font-extrabold uppercase tracking-wider block text-[11px]"
                      style={{ color: 'var(--contrast-indigo)' }}
                    >
                      Creative Mental Picture (How Kids Understand Best)
                    </span>
                    <p className="mt-0.5 leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>
                      {sec.visualMetaphor}
                    </p>
                  </div>
                </div>
              )}

              {/* Math expressions callout if any */}
              {sec.mathExpressions && sec.mathExpressions.length > 0 && (
                <div
                  className="border rounded-xl p-3.5 space-y-2"
                  style={{
                    backgroundColor: 'var(--bg-card-subtle)',
                    borderColor: 'var(--border-card)',
                  }}
                >
                  <span
                    className="text-xs uppercase font-extrabold tracking-wider block"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Mathematical Formulation:
                  </span>
                  <div className="space-y-1">
                    {sec.mathExpressions.map((expr, i) => (
                      <MathView key={i} math={expr} block={true} className="font-bold" />
                    ))}
                  </div>
                </div>
              )}

              {/* Key Takeaways */}
              {sec.keyTakeaways && sec.keyTakeaways.length > 0 && (
                <div
                  className="border rounded-xl p-4 space-y-2"
                  style={{
                    backgroundColor: 'var(--bg-card-subtle)',
                    borderColor: 'var(--border-card-strong)',
                  }}
                >
                  <div
                    className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    <Lightbulb size={15} />
                    <span>Essential Key Rules</span>
                  </div>
                  <ul className="space-y-1.5 text-xs sm:text-sm">
                    {sec.keyTakeaways.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--accent-primary)' }} className="font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Worked Examples */}
              {sec.workedExamples && sec.workedExamples.length > 0 && (
                <div
                  className="mt-4 pt-4 border-t space-y-4"
                  style={{ borderColor: 'var(--border-card)' }}
                >
                  {/* Worked Examples Level Filter Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
                    <span
                      className="text-xs uppercase font-extrabold tracking-wider shrink-0"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      Progressive Step-by-Step Examples (Easy ⟶ Hard)
                    </span>

                    {/* Level selector pills */}
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[11px] font-bold mr-1 shrink-0" style={{ color: 'var(--text-muted)' }}>
                        Level:
                      </span>
                      {[
                        { id: 'All', label: 'All (5)' },
                        { id: 'Level 1', label: 'L1: Easy' },
                        { id: 'Level 2', label: 'L2: Medium' },
                        { id: 'Level 3', label: 'L3: Multi-Step' },
                        { id: 'Level 4', label: 'L4: Real-World' },
                        { id: 'Level 5', label: 'L5: Hard' },
                      ].map((lvl) => {
                        const isSelected = selectedExampleLevel === lvl.id;
                        return (
                          <button
                            key={lvl.id}
                            type="button"
                            onClick={() => {
                              setSelectedExampleLevel(lvl.id);
                              // Auto-expand matching examples
                              const matching = sec.workedExamples.filter(
                                (e) => lvl.id === 'All' || (e.level && e.level.includes(lvl.id))
                              );
                              const newExpanded = { ...expandedExamples };
                              matching.forEach((m) => {
                                newExpanded[m.id] = true;
                              });
                              setExpandedExamples(newExpanded);
                            }}
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border shrink-0"
                            style={{
                              backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                              borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-card)',
                              color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                            }}
                          >
                            {lvl.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {sec.workedExamples
                    .filter((ex) => {
                      if (selectedExampleLevel === 'All') return true;
                      return ex.level ? ex.level.includes(selectedExampleLevel) : true;
                    })
                    .map((ex) => {
                    const isExpanded = expandedExamples[ex.id] ?? true;
                    const levelLabel =
                      ex.level ||
                      (ex.title.toLowerCase().includes('starter') || ex.title.toLowerCase().includes('easy')
                        ? 'Level 1: Easy'
                        : ex.title.toLowerCase().includes('challenge') || ex.title.toLowerCase().includes('hard')
                        ? 'Level 3: Hard'
                        : 'Level 2: Medium');

                    const getLevelBadgeStyles = () => {
                      if (levelLabel.includes('Easy') || levelLabel.includes('Level 1')) {
                        return {
                          backgroundColor: 'var(--contrast-teal-bg)',
                          color: 'var(--contrast-teal)',
                          borderColor: 'var(--border-card-strong)',
                        };
                      }
                      if (levelLabel.includes('Hard') || levelLabel.includes('Level 3') || levelLabel.includes('Mastery')) {
                        return {
                          backgroundColor: 'var(--contrast-warm-bg)',
                          color: 'var(--contrast-warm)',
                          borderColor: 'var(--contrast-warm-border)',
                        };
                      }
                      return {
                        backgroundColor: 'var(--contrast-amber-bg)',
                        color: 'var(--contrast-amber)',
                        borderColor: 'var(--contrast-amber-border)',
                      };
                    };

                    const mathProblemText = ex.mathProblem ? ` Formula: ${ex.mathProblem}.` : '';
                    const stepsText = ex.steps
                      .map((s) => `Step ${s.stepNumber}, ${s.title}: ${s.explanation}.${s.math ? ` Math: ${s.math}.` : ''}`)
                      .join(' ');
                    const exampleSpeechText = `Worked Example ${levelLabel}: ${ex.title}. Problem: ${ex.problem}.${mathProblemText} Solution: ${stepsText} Final answer: ${ex.finalAnswer}.${ex.proTip ? ` Pro tip: ${ex.proTip}` : ''}`;

                    return (
                      <ReadableCard
                        key={ex.id}
                        id={`example-${ex.id}`}
                        textToRead={exampleSpeechText}
                        highlightStyle="inner"
                        className="rounded-xl border overflow-hidden p-0 shadow-2xs"
                        ariaLabel={`Worked Example: ${ex.title}`}
                      >
                        <div
                          onClick={() => toggleExample(ex.id)}
                          className="flex items-center justify-between p-3.5 sm:p-4 transition-colors cursor-pointer border-b gap-3"
                          style={{
                            backgroundColor: 'var(--bg-card-hover)',
                            borderColor: 'var(--border-card)',
                          }}
                        >
                          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0 pr-1">
                            <span
                              className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-md border shrink-0"
                              style={getLevelBadgeStyles()}
                            >
                              {levelLabel}
                            </span>
                            <span
                              className="font-bold text-sm sm:text-base break-words"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {ex.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <AudioButton
                              id={`example-${ex.id}`}
                              textToRead={exampleSpeechText}
                              title="Listen to worked example"
                              size="sm"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExample(ex.id);
                              }}
                              className="p-1 rounded cursor-pointer shrink-0"
                              style={{ color: 'var(--text-muted)' }}
                              aria-label={isExpanded ? 'Collapse example' : 'Expand example'}
                            >
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 sm:p-5 space-y-4">
                            <div
                              className="p-3 border rounded-lg text-sm font-medium"
                              style={{
                                backgroundColor: 'var(--badge-bg)',
                                borderColor: 'var(--border-card-strong)',
                                color: 'var(--badge-text)',
                              }}
                            >
                              <strong>Question:</strong> {ex.problem}
                              {ex.mathProblem && (
                                <div className="mt-1">
                                  <MathView math={ex.mathProblem} block={true} />
                                </div>
                              )}
                            </div>

                            {/* Steps */}
                            <div className="space-y-3">
                              {ex.steps.map((step) => (
                                <div
                                  key={step.stepNumber}
                                  className="flex items-start gap-3 p-3 rounded-lg border transition-all"
                                  style={{
                                    backgroundColor: 'var(--bg-card-hover)',
                                    borderColor: 'var(--border-card)',
                                  }}
                                >
                                  <span
                                    className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold shrink-0 mt-0.5"
                                    style={{ backgroundColor: 'var(--accent-primary)' }}
                                  >
                                    {step.stepNumber}
                                  </span>
                                  <div className="space-y-1 text-xs sm:text-sm">
                                    <strong
                                      className="font-bold block"
                                      style={{ color: 'var(--text-primary)' }}
                                    >
                                      {step.title}
                                    </strong>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                      {step.explanation}
                                    </p>
                                    {step.math && (
                                      <MathView math={step.math} block={true} />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Final Answer */}
                            <div
                              className="p-3 rounded-lg border text-xs sm:text-sm font-bold flex items-center justify-between"
                              style={{
                                backgroundColor: 'var(--reading-highlight-bg)',
                                borderColor: 'var(--reading-highlight-border)',
                                color: 'var(--text-primary)',
                              }}
                            >
                              <span>Final Solution:</span>
                              <span className="font-mono">{ex.finalAnswer}</span>
                            </div>

                            {/* Pro Tip */}
                            {ex.proTip && (
                              <div
                                className="text-xs p-2.5 rounded border"
                                style={{
                                  backgroundColor: 'var(--bg-card-hover)',
                                  borderColor: 'var(--border-card-strong)',
                                  color: 'var(--text-primary)',
                                }}
                              >
                                💡 <strong>Pro Tip:</strong> {ex.proTip}
                              </div>
                            )}
                          </div>
                        )}
                      </ReadableCard>
                    );
                  })}
                </div>
              )}
            </ReadableCard>
          ))}
        </div>
      )}

      {/* Tab 2: Tips & Tricks */}
      {activeTab === 'tips' && (
        <div className="space-y-4">
          <div
            className="border rounded-xl p-4 flex items-start gap-3"
            style={{
              backgroundColor: 'var(--contrast-indigo-bg)',
              borderColor: 'var(--contrast-indigo-border)',
              color: 'var(--text-primary)',
            }}
          >
            <Sparkles className="shrink-0 mt-0.5" size={20} style={{ color: 'var(--contrast-indigo)' }} />
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                High-Yield Exam Tips, Traps & Mental Shortcuts
              </h3>
              <p className="text-xs sm:text-sm opacity-90" style={{ color: 'var(--text-secondary)' }}>
                Master intuitive mental models, avoid common student traps, and speed up calculations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topic.tipsAndTricks.map((tip) => {
              const tipSpeechText = `${tip.title}. ${tip.badge}. ${tip.content}. ${tip.ruleSummary ? `Remember: ${tip.ruleSummary}` : ''}`;
              return (
                <ReadableCard
                  key={tip.id}
                  id={`tip-${tip.id}`}
                  textToRead={tipSpeechText}
                  className="p-5 space-y-3 relative flex flex-col justify-between shadow-xs border"
                  ariaLabel={`Tip: ${tip.title}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: 'var(--contrast-amber-bg)',
                          borderColor: 'var(--contrast-amber-border)',
                          color: 'var(--contrast-amber)',
                        }}
                      >
                        {tip.badge}
                      </span>
                      <AudioButton
                        id={`tip-${tip.id}`}
                        textToRead={tipSpeechText}
                        title="Listen to tip"
                        size="sm"
                      />
                    </div>

                    <h4
                      className="font-bold text-base"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {tip.title}
                    </h4>

                    <p
                      className="text-xs sm:text-sm mt-2 leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {tip.content}
                    </p>

                    {tip.mathExample && (
                      <div className="mt-2.5">
                        <MathView math={tip.mathExample} block={true} />
                      </div>
                    )}
                  </div>

                  {tip.ruleSummary && (
                    <div
                      className="mt-3 pt-3 border-t text-xs font-semibold"
                      style={{
                        borderColor: 'var(--border-card)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      🔑 <strong>Remember:</strong> {tip.ruleSummary}
                    </div>
                  )}
                </ReadableCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Key Formulas & Important Info */}
      {activeTab === 'formulas' && (
        <div className="space-y-6">
          {/* Formulas list */}
          <div
            className="rounded-2xl border p-5 sm:p-7 space-y-4 shadow-xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <h3
              className="font-bold text-lg sm:text-xl flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <Award style={{ color: 'var(--accent-primary)' }} size={20} />
              <span>Must-Know Formulas & Definitions</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topic.keyFormulas.map((f) => {
                const formulaSpeechText = `Formula: ${f.name}. Formula is: ${f.formula}. Description: ${f.description}. ${f.keyNote ? `Warning: ${f.keyNote}` : ''}`;
                return (
                  <ReadableCard
                    key={f.id}
                    id={`formula-${f.id}`}
                    textToRead={formulaSpeechText}
                    highlightStyle="inner"
                    className="p-4 space-y-2 flex flex-col justify-between shadow-xs border"
                    ariaLabel={`Formula: ${f.name}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {f.name}
                        </span>
                        <AudioButton
                          id={`formula-${f.id}`}
                          textToRead={formulaSpeechText}
                          title="Listen to formula"
                          size="sm"
                        />
                      </div>
                      <MathView math={f.formula} block={true} className="font-bold my-1" />
                      <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                        {f.description}
                      </p>
                    </div>
                    {f.keyNote && (
                      <div
                        className="text-[11px] p-2 rounded border mt-2"
                        style={{
                          backgroundColor: 'var(--contrast-warm-bg)',
                          borderColor: 'var(--contrast-warm-border)',
                          color: 'var(--contrast-warm)',
                        }}
                      >
                        ⚠️ {f.keyNote}
                      </div>
                    )}
                  </ReadableCard>
                );
              })}
            </div>
          </div>

          {/* Important Info Cards */}
          {topic.importantInfo.length > 0 && (
            <div
              className="rounded-2xl border p-5 sm:p-7 space-y-4 shadow-xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <h3
                className="font-bold text-lg flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <AlertTriangle style={{ color: 'var(--accent-primary)' }} size={20} />
                <span>Important Information & Exam Guidelines</span>
              </h3>

              <div className="space-y-3">
                {topic.importantInfo.map((info) => {
                  const infoSpeechText = `Important Note: ${info.title}. Priority ${info.priority}. ${info.content}`;
                  return (
                    <ReadableCard
                      key={info.id}
                      id={`important-info-${info.id}`}
                      textToRead={infoSpeechText}
                      highlightStyle="inner"
                      className="p-4 rounded-xl border space-y-1.5 shadow-xs"
                      ariaLabel={`Note: ${info.title}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-extrabold uppercase tracking-wider"
                          style={{
                            color: info.priority === 'High' ? 'var(--contrast-warm)' : 'var(--contrast-teal)',
                          }}
                        >
                          {info.priority}: {info.title}
                        </span>
                        <AudioButton
                          id={`important-info-${info.id}`}
                          textToRead={infoSpeechText}
                          title="Listen to note"
                          size="sm"
                        />
                      </div>
                      <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {info.content}
                      </p>
                      {info.math && <MathView math={info.math} block={true} />}
                    </ReadableCard>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Interactive Self-Check Practice */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          <div
            className="rounded-2xl border p-5 sm:p-7 space-y-6 shadow-xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <div
              className="flex items-center justify-between pb-3 border-b"
              style={{ borderColor: 'var(--border-card)' }}
            >
              <div>
                <h3
                  className="font-bold text-lg sm:text-xl"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Interactive Practice & Check Understanding
                </h3>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                  Test your understanding with instant feedback, hints, and step-by-step walkthroughs.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {topic.practiceQuestions.map((q, qIndex) => {
                const selected = userAnswers[q.id];
                const isAnswered = selected !== undefined;
                const isCorrect = selected === q.correctIndex;
                const showingExplanation = showExplanations[q.id];
                const showingHint = showHints[q.id];
                const questionSpeechText = `Question ${qIndex + 1}: ${q.question}. Options are: ${q.options.join(
                  ', '
                )}`;

                return (
                  <ReadableCard
                    key={q.id}
                    id={`practice-${q.id}`}
                    textToRead={questionSpeechText}
                    highlightStyle="inner"
                    className="p-5 rounded-xl border space-y-4 shadow-xs"
                    ariaLabel={`Question ${qIndex + 1}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span
                          className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold shrink-0 mt-0.5"
                          style={{ backgroundColor: 'var(--accent-primary)' }}
                        >
                          Q{qIndex + 1}
                        </span>
                        <div>
                          <p
                            className="font-bold text-sm sm:text-base"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {q.question}
                          </p>
                          {q.mathQuestion && (
                            <MathView math={q.mathQuestion} block={true} />
                          )}
                        </div>
                      </div>

                      <AudioButton
                        id={`practice-${q.id}`}
                        textToRead={questionSpeechText}
                        title="Listen to question"
                        size="sm"
                      />
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIdx) => {
                        const isThisSelected = selected === optIdx;

                        let bgStyle = 'var(--bg-card-hover)';
                        let borderStyle = 'var(--border-card)';
                        let textColor = 'var(--text-primary)';

                        if (isAnswered) {
                          if (optIdx === q.correctIndex) {
                            bgStyle = 'var(--reading-highlight-bg)';
                            borderStyle = 'var(--reading-highlight-border)';
                            textColor = 'var(--text-primary)';
                          } else if (isThisSelected && !isCorrect) {
                            bgStyle = 'var(--contrast-warm-bg)';
                            borderStyle = 'var(--contrast-warm-border)';
                            textColor = 'var(--contrast-warm)';
                          } else {
                            bgStyle = 'var(--bg-card-subtle)';
                            borderStyle = 'var(--border-card)';
                            textColor = 'var(--text-muted)';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, optIdx, q.correctIndex)}
                            disabled={isAnswered}
                            className="p-3 rounded-lg border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer"
                            style={{
                              backgroundColor: bgStyle,
                              borderColor: borderStyle,
                              color: textColor,
                            }}
                          >
                            <span>{opt}</span>
                            {isAnswered && optIdx === q.correctIndex && (
                              <CheckCircle2 size={16} className="text-emerald-700 shrink-0 ml-2" />
                            )}
                            {isAnswered && isThisSelected && !isCorrect && (
                              <XCircle size={16} className="text-rose-700 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Hint & Solution Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowHints((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                        className="text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        <HelpCircle size={14} />
                        <span>{showingHint ? 'Hide Hint' : 'Need a Hint?'}</span>
                      </button>

                      {isAnswered && (
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full border"
                          style={{
                            backgroundColor: isCorrect ? 'var(--reading-highlight-bg)' : 'var(--contrast-warm-bg)',
                            color: isCorrect ? 'var(--badge-text)' : 'var(--contrast-warm)',
                            borderColor: isCorrect ? 'var(--reading-highlight-border)' : 'var(--contrast-warm-border)',
                          }}
                        >
                          {isCorrect ? '✓ Correct!' : '✗ Not quite right'}
                        </span>
                      )}
                    </div>

                    {/* Hint Box */}
                    {showingHint && (
                      <div
                        className="p-3 border rounded-lg text-xs"
                        style={{
                          backgroundColor: 'var(--contrast-amber-bg)',
                          borderColor: 'var(--contrast-amber-border)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        💡 <strong>Hint:</strong> {q.hint}
                      </div>
                    )}

                    {/* Explanation Box */}
                    {showingExplanation && (
                      <div
                        id={`explanation-${q.id}`}
                        className="p-4 border rounded-xl space-y-2 text-xs sm:text-sm shadow-2xs"
                        style={{
                          backgroundColor: 'var(--bg-card-subtle)',
                          borderColor: 'var(--border-card-strong)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <strong
                            className="font-bold flex items-center gap-1.5"
                            style={{ color: 'var(--accent-primary)' }}
                          >
                            <Sparkles size={14} />
                            <span>Detailed Step-by-Step Explanation:</span>
                          </strong>
                          <AudioButton
                            id={`explanation-${q.id}`}
                            textToRead={`Explanation for question ${qIndex + 1}: ${q.explanation}`}
                            title="Listen to explanation"
                            size="sm"
                          />
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>{q.explanation}</p>
                        {q.mathExplanation && (
                          <MathView math={q.mathExplanation} block={true} />
                        )}
                      </div>
                    )}
                  </ReadableCard>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Interactive Visual Tools */}
      {activeTab === 'tools' && topic.toolType && (
        <div className="space-y-4">
          {topic.toolType === 'fractions' && <FractionsVisualizer />}
          {topic.toolType === 'bidmas' && <BidmasEvaluator />}
          {topic.toolType === 'angles' && <AnglesExplorer />}
          {topic.toolType === 'area-perimeter' && <AreaPerimeterSandbox />}
          {topic.toolType === 'roman-numerals' && <RomanNumeralsConverter />}
        </div>
      )}
    </div>
  );
};
