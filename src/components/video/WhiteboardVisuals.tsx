import React, { useState } from 'react';
import { MathView } from '../MathView';
import { Check, X, ArrowRight, Sparkles, RefreshCw, AlertTriangle, Layers, Award } from 'lucide-react';
import { VideoChapter } from '../../data/videoLessons/fractionsLessonData';

interface WhiteboardVisualsProps {
  chapter: VideoChapter;
  currentTime?: number;
  activeCaptionIndex?: number;
  isPlaying?: boolean;
  onCheckpointAnswer?: (isCorrect: boolean, feedback: string) => void;
  selectedQuizOption?: string | null;
  quizResult?: { isCorrect: boolean; feedback: string } | null;
}

export const WhiteboardVisuals: React.FC<WhiteboardVisualsProps> = ({
  chapter,
  currentTime = 0,
  activeCaptionIndex = 0,
  isPlaying = false,
  onCheckpointAnswer,
  selectedQuizOption,
  quizResult,
}) => {
  // Local state for interactive exploration within the video scenes
  const [manualSliceToggle, setManualSliceToggle] = useState<boolean | null>(null);
  const [manualStepAddition, setManualStepAddition] = useState<number | null>(null);
  const [isButterflyHovered, setIsButterflyHovered] = useState<string | null>(null);
  const [manualFlippedReciprocal, setManualFlippedReciprocal] = useState<boolean | null>(null);

  // Derive smart state synced with playback time unless manually overridden
  const isSlicedIntoSixths = manualSliceToggle !== null
    ? manualSliceToggle
    : (chapter.whiteboardType === 'pizza_slices' && currentTime >= 41);

  // Synchronized step addition for chapter 3
  const computedStep = (() => {
    if (manualStepAddition !== null) return manualStepAddition;
    if (chapter.whiteboardType === 'step_by_step_addition') {
      if (currentTime < 128) return 1;
      if (currentTime < 152) return 2;
      if (currentTime < 164) return 3;
      return 4;
    }
    return 1;
  })();
  const activeStepAddition = computedStep;

  // Reciprocal flip synced for chapter 6
  const isFlippedReciprocal = manualFlippedReciprocal !== null
    ? manualFlippedReciprocal
    : (chapter.whiteboardType === 'kfc_division' && currentTime >= 302);

  switch (chapter.whiteboardType) {
    /* ----------------------------------------------------
     * SCENE 1: THE PIZZA PARADOX (Why 1/2 + 1/3 != 2/5)
     * ---------------------------------------------------- */
    case 'pizza_slices':
      return (
        <div className="space-y-5 animate-fadeIn">
          {/* Header Equation Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border bg-black/5 dark:bg-white/5">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                The Core Mystery
              </span>
              <h3 className="font-extrabold text-base sm:text-lg">
                Can we add slices of different sizes?
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setManualSliceToggle(!isSlicedIntoSixths)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 active:scale-95"
              style={{
                backgroundColor: isSlicedIntoSixths ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                color: isSlicedIntoSixths ? 'var(--accent-contrast)' : 'var(--text-primary)',
                borderColor: isSlicedIntoSixths ? 'var(--accent-primary)' : 'var(--border-card)',
              }}
            >
              <RefreshCw size={13} className={isSlicedIntoSixths ? 'rotate-180 transition-transform duration-500' : ''} />
              <span>{isSlicedIntoSixths ? 'Reset to Halves & Thirds' : '⚡ Slicing into Sixths!'}</span>
            </button>
          </div>

          {/* Side-by-Side Visual Pizzas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center items-stretch">
            {/* Pizza 1: 1/2 or 3/6 */}
            <div className="p-4 rounded-2xl border shadow-2xs flex flex-col items-center justify-between gap-2"
              style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}>
              <div className="w-full flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Pizza A</span>
                <span>{isSlicedIntoSixths ? '3 out of 6 slices' : '1 out of 2 slices'}</span>
              </div>

              {/* Pizza Dial SVG */}
              <div className="w-28 h-28 relative my-1">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                  <circle cx="50" cy="50" r="46" fill="#fef3c7" stroke="#d97706" strokeWidth="4" />
                  {/* Slices */}
                  {isSlicedIntoSixths ? (
                    <>
                      {/* 3 shaded sixths */}
                      <path d="M50 50 L50 4 A46 46 0 0 1 50 96 Z" fill="#10b981" opacity="0.85" />
                      {/* 6 slice lines */}
                      <line x1="50" y1="4" x2="50" y2="96" stroke="#92400e" strokeWidth="1.5" />
                      <line x1="10" y1="27" x2="90" y2="73" stroke="#92400e" strokeWidth="1.5" />
                      <line x1="10" y1="73" x2="90" y2="27" stroke="#92400e" strokeWidth="1.5" />
                    </>
                  ) : (
                    <>
                      {/* 1 half shaded */}
                      <path d="M50 50 L50 4 A46 46 0 0 1 50 96 Z" fill="#10b981" opacity="0.85" />
                      <line x1="50" y1="4" x2="50" y2="96" stroke="#92400e" strokeWidth="2.5" />
                    </>
                  )}
                  {/* Crust center */}
                  <circle cx="50" cy="50" r="4" fill="#92400e" />
                </svg>
              </div>

              <div className="font-extrabold text-lg">
                <MathView math={isSlicedIntoSixths ? '\\frac{3}{6}' : '\\frac{1}{2}'} />
              </div>
            </div>

            {/* Operator Symbol (+) */}
            <div className="hidden sm:flex flex-col items-center justify-center font-extrabold text-3xl" style={{ color: 'var(--accent-primary)' }}>
              +
            </div>

            {/* Pizza 2: 1/3 or 2/6 */}
            <div className="p-4 rounded-2xl border shadow-2xs flex flex-col items-center justify-between gap-2"
              style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}>
              <div className="w-full flex items-center justify-between text-xs font-bold">
                <span className="text-blue-600 dark:text-blue-400 font-extrabold">Pizza B</span>
                <span>{isSlicedIntoSixths ? '2 out of 6 slices' : '1 out of 3 slices'}</span>
              </div>

              {/* Pizza Dial SVG */}
              <div className="w-28 h-28 relative my-1">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                  <circle cx="50" cy="50" r="46" fill="#fef3c7" stroke="#d97706" strokeWidth="4" />
                  {/* Thirds or Sixths */}
                  {isSlicedIntoSixths ? (
                    <>
                      {/* 2 shaded sixths (120 degrees) */}
                      <path d="M50 50 L50 4 A46 46 0 0 1 89.8 73 Z" fill="#3b82f6" opacity="0.85" />
                      <line x1="50" y1="4" x2="50" y2="96" stroke="#92400e" strokeWidth="1.5" />
                      <line x1="10" y1="27" x2="90" y2="73" stroke="#92400e" strokeWidth="1.5" />
                      <line x1="10" y1="73" x2="90" y2="27" stroke="#92400e" strokeWidth="1.5" />
                    </>
                  ) : (
                    <>
                      {/* 1 third shaded */}
                      <path d="M50 50 L50 4 A46 46 0 0 1 89.8 73 Z" fill="#3b82f6" opacity="0.85" />
                      <line x1="50" y1="50" x2="50" y2="4" stroke="#92400e" strokeWidth="2.5" />
                      <line x1="50" y1="50" x2="89.8" y2="73" stroke="#92400e" strokeWidth="2.5" />
                      <line x1="50" y1="50" x2="10.2" y2="73" stroke="#92400e" strokeWidth="2.5" />
                    </>
                  )}
                  <circle cx="50" cy="50" r="4" fill="#92400e" />
                </svg>
              </div>

              <div className="font-extrabold text-lg">
                <MathView math={isSlicedIntoSixths ? '\\frac{2}{6}' : '\\frac{1}{3}'} />
              </div>
            </div>
          </div>

          {/* The Trap Comparison Box */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center gap-4 transition-all ${
            currentTime >= 23 && currentTime < 41 ? 'ring-2 ring-amber-500/80 shadow-md' : ''
          }`}
            style={{
              backgroundColor: isSlicedIntoSixths ? 'var(--contrast-teal-bg)' : 'var(--contrast-warm-bg)',
              borderColor: isSlicedIntoSixths ? 'var(--contrast-teal-border)' : 'var(--contrast-warm-border)',
            }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: isSlicedIntoSixths ? 'var(--contrast-teal)' : 'var(--contrast-warm)',
                color: '#ffffff',
                borderColor: isSlicedIntoSixths ? 'var(--contrast-teal-border)' : 'var(--contrast-warm-border)',
              }}
            >
              {isSlicedIntoSixths ? <Check size={20} /> : <X size={20} />}
            </div>

            <div className="flex-1 text-center sm:text-left text-xs sm:text-sm space-y-1">
              <p className="font-extrabold" style={{ color: isSlicedIntoSixths ? 'var(--contrast-teal)' : 'var(--contrast-warm)' }}>
                {isSlicedIntoSixths
                  ? 'EQUAL SLICES! MATCHING SIXTHS FOUND:'
                  : 'THE DANGEROUS DENOMINATOR TRAP: 1/2 + 1/3 ≠ 2/5!'}
              </p>
              <p className="leading-relaxed">
                {isSlicedIntoSixths ? (
                  <span>
                    Now that both pizzas are sliced into sixths: 3 slices + 2 slices = <strong>5 slices out of 6</strong> (<MathView math={'\\frac{5}{6}'} />).
                  </span>
                ) : (
                  <span>
                    Adding denominators gives <MathView math={'\\frac{2}{5}'} /> (40%), which is <em>smaller than half a pizza alone</em>! That would mean pizza vanished!
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * SCENE 2: THE LCM LADDER & COMMON DENOMINATOR
     * ---------------------------------------------------- */
    case 'lcm_ladder':
      return (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-3.5 rounded-xl border bg-black/5 dark:bg-white/5 space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Skip-Counting Ladder
            </span>
            <p className="text-xs sm:text-sm">
              We list the multiples of both denominators until they find their first common meeting point:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Multiples of 2 */}
            <div className="p-4 rounded-xl border space-y-2"
              style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}>
              <span className="text-xs font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
                Multiples of 2 (Denominator A):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[2, 4, 6, 8, 10].map((num) => (
                  <span
                    key={num}
                    className={`w-9 h-9 rounded-lg font-bold text-sm flex items-center justify-center border transition-transform ${
                      num === 6
                        ? 'scale-110 font-black shadow-xs ring-2 ring-emerald-500'
                        : 'opacity-80'
                    }`}
                    style={{
                      backgroundColor: num === 6 ? 'var(--contrast-teal-bg)' : 'var(--bg-card)',
                      color: num === 6 ? 'var(--contrast-teal)' : 'var(--text-primary)',
                      borderColor: num === 6 ? 'var(--contrast-teal-border)' : 'var(--border-card)',
                    }}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>

            {/* Multiples of 3 */}
            <div className="p-4 rounded-xl border space-y-2"
              style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}>
              <span className="text-xs font-extrabold uppercase text-blue-600 dark:text-blue-400">
                Multiples of 3 (Denominator B):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[3, 6, 9, 12, 15].map((num) => (
                  <span
                    key={num}
                    className={`w-9 h-9 rounded-lg font-bold text-sm flex items-center justify-center border transition-transform ${
                      num === 6
                        ? 'scale-110 font-black shadow-xs ring-2 ring-blue-500'
                        : 'opacity-80'
                    }`}
                    style={{
                      backgroundColor: num === 6 ? 'var(--contrast-teal-bg)' : 'var(--bg-card)',
                      color: num === 6 ? 'var(--contrast-teal)' : 'var(--text-primary)',
                      borderColor: num === 6 ? 'var(--contrast-teal-border)' : 'var(--border-card)',
                    }}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Golden Rule Callout */}
          <div className="p-4 rounded-xl border shadow-2xs flex items-center gap-3"
            style={{
              backgroundColor: 'var(--reading-highlight-bg)',
              borderColor: 'var(--accent-primary)',
              color: 'var(--text-primary)',
            }}
          >
            <Sparkles size={24} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-xs sm:text-sm space-y-0.5">
              <span className="font-extrabold uppercase tracking-wide text-[11px] block">
                The Golden Rule of Equivalent Fractions:
              </span>
              <p className="font-medium">
                Whatever you multiply the bottom by to reach 6, you <strong>MUST multiply the top by the exact same number</strong>!
              </p>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * SCENE 3: LIVE WHITEBOARD WALKTHROUGH (3/4 + 2/5)
     * ---------------------------------------------------- */
    case 'step_by_step_addition':
      const steps = [
        {
          num: 1,
          title: 'Find the LCM of Denominators 4 and 5',
          math: '\\text{LCM}(4, 5) = 20',
          desc: '4 and 5 share no factors, so 4 × 5 = 20 is our target common denominator.',
        },
        {
          num: 2,
          title: 'Scale Both Fractions to Twentieths',
          math: '\\frac{3 \\times 5}{4 \\times 5} = \\frac{15}{20}, \\quad \\frac{2 \\times 4}{5 \\times 4} = \\frac{8}{20}',
          desc: 'Multiply 3/4 by 5/5, and multiply 2/5 by 4/4 to maintain perfect numerical balance.',
        },
        {
          num: 3,
          title: 'Keep the 20 and Add Numerators',
          math: '\\frac{15}{20} + \\frac{8}{20} = \\frac{15 + 8}{20} = \\frac{23}{20}',
          desc: 'Combine the slices on top! 15 + 8 = 23 slices of size 1/20.',
        },
        {
          num: 4,
          title: 'Convert to Mixed Number (Improper to Mixed)',
          math: '\\frac{23}{20} = 1\\frac{3}{20}',
          desc: '23 divided by 20 equals 1 whole with a remainder of 3 twentieths.',
        },
      ];

      return (
        <div className="space-y-4 animate-fadeIn">
          {/* Problem Banner */}
          <div className="p-3 rounded-xl border text-center font-extrabold text-base sm:text-lg flex items-center justify-center gap-3"
            style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}>
            <span>Worked Problem:</span>
            <MathView math={'\\frac{3}{4} + \\frac{2}{5} = \\; ?'} />
          </div>

          {/* Interactive Steps Accordion / Progression */}
          <div className="space-y-2.5">
            {steps.map((s) => {
              const isSelected = activeStepAddition === s.num;
              return (
                <div
                  key={s.num}
                  onClick={() => setManualStepAddition(s.num)}
                  className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    isSelected ? 'ring-2 ring-amber-500/70' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--reading-highlight-bg)' : 'var(--bg-card-subtle)',
                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-card)',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border"
                        style={{
                          backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-card)',
                          color: isSelected ? 'var(--accent-contrast)' : 'var(--text-primary)',
                          borderColor: 'var(--border-card)',
                        }}
                      >
                        {s.num}
                      </span>
                      <span className="font-bold text-xs sm:text-sm">{s.title}</span>
                    </div>

                    <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
                      {isSelected ? 'Active Step' : 'Click to inspect'}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="mt-2.5 pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border-card)' }}>
                      <MathView math={s.math} block />
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {s.desc}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * SCENE 4: THE BUTTERFLY METHOD (10-Second Speed Hack)
     * ---------------------------------------------------- */
    case 'butterfly_method':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs">
            <span className="font-extrabold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Exam Speed-Hack
            </span>
            <span className="font-medium">Hover wings to see cross-multiplication</span>
          </div>

          {/* Interactive SVG Butterfly Canvas */}
          <div className="relative p-6 rounded-2xl border flex flex-col items-center justify-center shadow-2xs"
            style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}>
            <svg viewBox="0 0 340 220" className="w-full max-w-sm h-52">
              {/* Left Wing (3 and 5) */}
              <ellipse
                cx="115"
                cy="110"
                rx="65"
                ry="38"
                transform="rotate(-45 115 110)"
                fill={isButterflyHovered === 'left' || (currentTime >= 183 && currentTime < 200) ? '#fde047' : '#fef08a'}
                stroke={isButterflyHovered === 'left' || (currentTime >= 183 && currentTime < 200) ? '#b45309' : '#ca8a04'}
                strokeWidth={isButterflyHovered === 'left' || (currentTime >= 183 && currentTime < 200) ? '3.5' : '2.5'}
                strokeDasharray="4 2"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setIsButterflyHovered('left')}
                onMouseLeave={() => setIsButterflyHovered(null)}
              />

              {/* Right Wing (4 and 2) */}
              <ellipse
                cx="225"
                cy="110"
                rx="65"
                ry="38"
                transform="rotate(45 225 110)"
                fill={isButterflyHovered === 'right' || (currentTime >= 200 && currentTime < 209) ? '#6ee7b7' : '#d1fae5'}
                stroke={isButterflyHovered === 'right' || (currentTime >= 200 && currentTime < 209) ? '#047857' : '#059669'}
                strokeWidth={isButterflyHovered === 'right' || (currentTime >= 200 && currentTime < 209) ? '3.5' : '2.5'}
                strokeDasharray="4 2"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setIsButterflyHovered('right')}
                onMouseLeave={() => setIsButterflyHovered(null)}
              />

              {/* Left Antenna & Value Bulb (3 × 5 = 15) */}
              <path d="M125 75 Q110 35 95 30" stroke="#ca8a04" strokeWidth="2.5" fill="none" />
              <circle cx="95" cy="30" r="18" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
              <text x="95" y="35" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#713f12">
                15
              </text>

              {/* Right Antenna & Value Bulb (2 × 4 = 8) */}
              <path d="M215 75 Q230 35 245 30" stroke="#059669" strokeWidth="2.5" fill="none" />
              <circle cx="245" cy="30" r="18" fill="#d1fae5" stroke="#059669" strokeWidth="2" />
              <text x="245" y="35" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#064e3b">
                8
              </text>

              {/* Fractions: 3/4 + 2/5 */}
              {/* Fraction 1 (3/4) */}
              <text x="130" y="96" textAnchor="middle" fontSize="22" fontWeight="900" fill="#18181b">
                3
              </text>
              <line x1="110" y1="105" x2="150" y2="105" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
              <text x="130" y="132" textAnchor="middle" fontSize="22" fontWeight="900" fill="#18181b">
                4
              </text>

              {/* Plus sign */}
              <text x="170" y="115" textAnchor="middle" fontSize="26" fontWeight="900" fill="var(--accent-primary)">
                +
              </text>

              {/* Fraction 2 (2/5) */}
              <text x="210" y="96" textAnchor="middle" fontSize="22" fontWeight="900" fill="#18181b">
                2
              </text>
              <line x1="190" y1="105" x2="230" y2="105" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
              <text x="210" y="132" textAnchor="middle" fontSize="22" fontWeight="900" fill="#18181b">
                5
              </text>

              {/* Butterfly Bottom Body (Multiply Denominators: 4 × 5 = 20) */}
              <path d="M125 140 Q170 185 215 140" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
              <rect x="150" y="170" width="40" height="26" rx="6" fill="#dbeafe" stroke="#2563eb" strokeWidth="2" />
              <text x="170" y="188" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e3a8a">
                20
              </text>
            </svg>

            {/* Quick Result Formula */}
            <div className="mt-3 text-center space-y-1">
              <div className="font-extrabold text-lg">
                <MathView math={'\\text{Top: } 15 + 8 = 23, \\quad \\text{Bottom: } 20 \\implies \\frac{23}{20} = 1\\frac{3}{20}'} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Left Antenna (15) + Right Antenna (8) = 23. Body (4 × 5) = 20!
              </p>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * SCENE 5: MULTIPLYING FRACTIONS (The Highway & 2D Grid)
     * ---------------------------------------------------- */
    case 'multiplication_grid':
      return (
        <div className="space-y-4 animate-fadeIn">
          {/* Equation Banner */}
          <div className="p-3 rounded-xl border text-center font-extrabold text-base sm:text-lg flex items-center justify-center gap-3"
            style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}>
            <span>Highway Rule:</span>
            <MathView math={'\\frac{2}{3} \\times \\frac{4}{5} = \\frac{2 \\times 4}{3 \\times 5} = \\frac{8}{15}'} />
          </div>

          {/* Visual 2D Area Model (3 rows x 5 columns) */}
          <div className="p-4 rounded-2xl border space-y-3"
            style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">
                Visual Area Proof: 2/3 of 4/5
              </span>
              <span style={{ color: 'var(--text-muted)' }}>15 equal blocks total</span>
            </div>

            {/* 3x5 Grid */}
            <div className="grid grid-rows-3 gap-1.5 p-2 rounded-xl border bg-black/5 dark:bg-white/5">
              {[0, 1, 2].map((row) => (
                <div key={row} className="grid grid-cols-5 gap-1.5">
                  {[0, 1, 2, 3, 4].map((col) => {
                    const isRowInTwoThirds = row < 2; // top 2 rows
                    const isColInFourFifths = col < 4; // left 4 columns
                    const isOverlap = isRowInTwoThirds && isColInFourFifths; // 2x4 = 8

                    return (
                      <div
                        key={col}
                        className={`h-9 rounded-lg border text-xs font-extrabold flex items-center justify-center transition-all ${
                          isOverlap
                            ? 'bg-amber-400 dark:bg-amber-500 text-stone-900 border-amber-600 shadow-2xs font-black'
                            : isRowInTwoThirds
                            ? 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 opacity-60'
                            : isColInFourFifths
                            ? 'bg-blue-100 dark:bg-blue-950/40 border-blue-300 opacity-60'
                            : 'bg-stone-100 dark:bg-stone-800 border-stone-300 opacity-30'
                        }`}
                        title={isOverlap ? 'Overlap square (8 total)' : 'Non-overlap square'}
                      >
                        {isOverlap ? '★' : ''}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: 'var(--border-card)' }}>
              <span className="font-bold flex items-center gap-1 text-amber-600 dark:text-amber-400">
                ★ 8 Overlapping Gold Blocks
              </span>
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Out of 15 Total Blocks = 8/15
              </span>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * SCENE 6: DIVIDING FRACTIONS (K.F.C. Keep, Flip, Change)
     * ---------------------------------------------------- */
    case 'kfc_division':
      return (
        <div className="space-y-4 animate-fadeIn">
          {/* KFC Three-Pillar Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* K - KEEP */}
            <div className="p-4 rounded-xl border text-center space-y-2 shadow-2xs"
              style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}>
              <span className="w-8 h-8 mx-auto rounded-full bg-blue-500 text-white font-black text-base flex items-center justify-center">
                K
              </span>
              <h4 className="font-extrabold text-sm uppercase tracking-wide">Keep</h4>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Keep the 1st fraction as it is:</p>
              <div className="text-lg font-bold">
                <MathView math={'\\frac{3}{4}'} />
              </div>
            </div>

            {/* F - FLIP (Interactive 180° flip) */}
            <div
              onClick={() => setManualFlippedReciprocal(!isFlippedReciprocal)}
              className={`p-4 rounded-xl border text-center space-y-2 shadow-2xs cursor-pointer transition-transform hover:scale-102 ${
                currentTime >= 302 && currentTime < 312 ? 'ring-2 ring-amber-500' : ''
              }`}
              style={{
                backgroundColor: 'var(--reading-highlight-bg)',
                borderColor: 'var(--accent-primary)',
              }}
            >
              <span className="w-8 h-8 mx-auto rounded-full bg-amber-500 text-stone-900 font-black text-base flex items-center justify-center">
                F
              </span>
              <h4 className="font-extrabold text-sm uppercase tracking-wide">Flip (Reciprocal)</h4>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Flip 2nd fraction upside down:</p>
              <div className="text-lg font-bold transition-transform duration-300">
                <MathView math={isFlippedReciprocal ? '\\frac{5}{2}' : '\\frac{2}{5} \\to \\mathbf{\\frac{5}{2}}'} />
              </div>
            </div>

            {/* C - CHANGE */}
            <div className="p-4 rounded-xl border text-center space-y-2 shadow-2xs"
              style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}>
              <span className="w-8 h-8 mx-auto rounded-full bg-emerald-500 text-white font-black text-base flex items-center justify-center">
                C
              </span>
              <h4 className="font-extrabold text-sm uppercase tracking-wide">Change</h4>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Change division to multiplication:</p>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                <MathView math={'\\div \\implies \\times'} />
              </div>
            </div>
          </div>

          {/* Result Calculation Banner */}
          <div className="p-4 rounded-xl border text-center space-y-1.5 shadow-2xs"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
            <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: 'var(--accent-primary)' }}>
              Completed Highway Multiplication:
            </span>
            <div className="text-lg sm:text-xl font-extrabold">
              <MathView math={'\\frac{3}{4} \\times \\frac{5}{2} = \\frac{3 \\times 5}{4 \\times 2} = \\frac{15}{8} = 1\\frac{7}{8}'} />
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * SCENE 7: INTERACTIVE CHECKPOINT (Student Try It!)
     * ---------------------------------------------------- */
    case 'interactive_quiz':
      const quiz = {
        question: 'Solve this live on your whiteboard:',
        mathQuestion: '\\frac{1}{4} + \\frac{2}{3} = \\; ?',
        options: [
          {
            id: 'A',
            math: '\\frac{3}{7}',
            isCorrect: false,
            feedback: 'Watch out! You fell into the pizza trap of adding denominators 4+3=7! You must find common 12ths.',
          },
          {
            id: 'B',
            math: '\\frac{11}{12}',
            isCorrect: true,
            feedback: 'Spot on! LCM(4, 3) = 12. 1/4 scales to 3/12, and 2/3 scales to 8/12. 3 + 8 = 11/12!',
          },
          {
            id: 'C',
            math: '\\frac{3}{12}',
            isCorrect: false,
            feedback: 'Close! 1/4 is indeed 3/12, but you forgot to convert 2/3 into 8/12 before combining.',
          },
          {
            id: 'D',
            math: '\\frac{8}{12}',
            isCorrect: false,
            feedback: '2/3 is 8/12, but do not forget to add the 3/12 from the first fraction!',
          },
        ],
      };

      return (
        <div className="space-y-4 animate-fadeIn">
          {/* Question Banner */}
          <div className="p-4 rounded-xl border text-center space-y-2 shadow-2xs"
            style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}>
            <span className="text-xs font-extrabold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              ⚡ Classroom Live Checkpoint
            </span>
            <div className="text-xl sm:text-2xl font-extrabold">
              <MathView math={quiz.mathQuestion} />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Tap your answer to see if you avoid the denominator trap:
            </p>
          </div>

          {/* Interactive Multiple Choice Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quiz.options.map((opt) => {
              const isSelected = selectedQuizOption === opt.id;
              const showResult = isSelected && quizResult;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onCheckpointAnswer?.(opt.isCorrect, opt.feedback)}
                  className="p-3.5 rounded-xl border text-left font-bold text-sm flex items-center justify-between gap-3 transition-all cursor-pointer shadow-2xs hover:scale-101 active:scale-98"
                  style={{
                    backgroundColor: showResult
                      ? opt.isCorrect
                        ? 'var(--contrast-teal-bg)'
                        : 'var(--contrast-warm-bg)'
                      : isSelected
                      ? 'var(--reading-highlight-bg)'
                      : 'var(--bg-card)',
                    borderColor: showResult
                      ? opt.isCorrect
                        ? 'var(--contrast-teal-border)'
                        : 'var(--contrast-warm-border)'
                      : isSelected
                      ? 'var(--accent-primary)'
                      : 'var(--border-card)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center border"
                      style={{
                        backgroundColor: 'var(--bg-card-subtle)',
                        borderColor: 'var(--border-card)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {opt.id}
                    </span>
                    <MathView math={opt.math} />
                  </div>

                  {showResult && (
                    <span className="shrink-0">
                      {opt.isCorrect ? (
                        <Check size={18} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <X size={18} className="text-rose-600 dark:text-rose-400" />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quiz Result Box */}
          {quizResult && (
            <div
              className="p-3.5 rounded-xl border text-xs sm:text-sm space-y-1 animate-fadeIn shadow-2xs"
              style={{
                backgroundColor: quizResult.isCorrect ? 'var(--contrast-teal-bg)' : 'var(--contrast-warm-bg)',
                borderColor: quizResult.isCorrect ? 'var(--contrast-teal-border)' : 'var(--contrast-warm-border)',
                color: 'var(--text-primary)',
              }}
            >
              <div className="flex items-center gap-1.5 font-extrabold">
                {quizResult.isCorrect ? <Check size={16} /> : <AlertTriangle size={16} />}
                <span>{quizResult.isCorrect ? 'EXCELLENT WORK!' : 'TEACHER DIAGNOSTIC TIP:'}</span>
              </div>
              <p className="leading-relaxed">{quizResult.feedback}</p>
            </div>
          )}
        </div>
      );

    /* ----------------------------------------------------
     * SCENE 8: GOLDEN RULES & WRAP-UP
     * ---------------------------------------------------- */
    case 'golden_rules':
    default:
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs">
            <span className="font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Exam Gold Nuggets
            </span>
            <span className="font-medium">Permanent Revision Notes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-xl border space-y-1.5 shadow-2xs transition-all ${
              currentTime >= 408 && currentTime < 418 ? 'ring-2 ring-amber-500 shadow-sm' : ''
            }`}
              style={{ backgroundColor: currentTime >= 408 && currentTime < 418 ? 'var(--reading-highlight-bg)' : 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}>
              <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">Rule 1</span>
              <h4 className="font-extrabold text-xs sm:text-sm">Adding / Subtracting</h4>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                MUST find common denominators using the LCM before combining numerators!
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border space-y-1.5 shadow-2xs transition-all ${
              currentTime >= 418 && currentTime < 428 ? 'ring-2 ring-blue-500 shadow-sm' : ''
            }`}
              style={{ backgroundColor: currentTime >= 418 && currentTime < 428 ? 'var(--reading-highlight-bg)' : 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}>
              <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">Rule 2</span>
              <h4 className="font-extrabold text-xs sm:text-sm">Multiplying</h4>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Drive straight across the highway: Top × Top, Bottom × Bottom. No common denominators needed!
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border space-y-1.5 shadow-2xs transition-all ${
              currentTime >= 428 && currentTime < 438 ? 'ring-2 ring-emerald-500 shadow-sm' : ''
            }`}
              style={{ backgroundColor: currentTime >= 428 && currentTime < 438 ? 'var(--reading-highlight-bg)' : 'var(--bg-card-subtle)', borderColor: 'var(--border-card)' }}>
              <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">Rule 3</span>
              <h4 className="font-extrabold text-xs sm:text-sm">Dividing (K.F.C.)</h4>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Keep 1st fraction, Flip 2nd fraction (reciprocal), Change ÷ to ×!
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl border flex items-center justify-between gap-3 text-xs"
            style={{ backgroundColor: 'var(--reading-highlight-bg)', borderColor: 'var(--accent-primary)' }}>
            <span className="font-bold">Ready to test your skills in the 25-Question Assessment?</span>
            <span className="font-extrabold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-md border"
              style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)', borderColor: 'var(--border-card)' }}>
              Mastery Ready
            </span>
          </div>
        </div>
      );
  }
};
