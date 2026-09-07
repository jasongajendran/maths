import React, { useState } from 'react';
import { MathView } from '../MathView';
import { Sparkles } from 'lucide-react';
import { ReadableCard } from '../ReadableCard';

export const FractionsVisualizer: React.FC = () => {
  const [num1, setNum1] = useState<number>(2);
  const [den1, setDen1] = useState<number>(3);
  const [num2, setNum2] = useState<number>(1);
  const [den2, setDen2] = useState<number>(4);
  const [operation, setOperation] = useState<'+' | '-' | '×' | '÷'>('+');

  // Math helper
  const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

  const calculateResult = () => {
    let resNum = 0;
    let resDen = 1;
    let step1 = '';
    let step2 = '';

    if (operation === '+') {
      const commonDen = den1 * den2;
      const convertedNum1 = num1 * den2;
      const convertedNum2 = num2 * den1;
      resNum = convertedNum1 + convertedNum2;
      resDen = commonDen;
      step1 = `Find common denominator: ${den1} × ${den2} = ${commonDen}. Convert fractions to ${convertedNum1}/${commonDen} + ${convertedNum2}/${commonDen}.`;
      step2 = `Add numerators: ${convertedNum1} + ${convertedNum2} = ${resNum}. Result is ${resNum}/${resDen}.`;
    } else if (operation === '-') {
      const commonDen = den1 * den2;
      const convertedNum1 = num1 * den2;
      const convertedNum2 = num2 * den1;
      resNum = convertedNum1 - convertedNum2;
      resDen = commonDen;
      step1 = `Find common denominator: ${den1} × ${den2} = ${commonDen}. Convert fractions to ${convertedNum1}/${commonDen} - ${convertedNum2}/${commonDen}.`;
      step2 = `Subtract numerators: ${convertedNum1} - ${convertedNum2} = ${resNum}. Result is ${resNum}/${resDen}.`;
    } else if (operation === '×') {
      resNum = num1 * num2;
      resDen = den1 * den2;
      step1 = `Multiply numerators: ${num1} × ${num2} = ${resNum}.`;
      step2 = `Multiply denominators: ${den1} × ${den2} = ${resDen}. Result is ${resNum}/${resDen}.`;
    } else {
      // Division: KFC (Keep, Flip, Change)
      resNum = num1 * den2;
      resDen = den1 * num2;
      step1 = `KFC Rule: Keep ${num1}/${den1}, Flip ${num2}/${den2} to ${den2}/${num2}, and Change ÷ to ×.`;
      step2 = `Multiply: (${num1} × ${den2}) / (${den1} × ${num2}) = ${resNum}/${resDen}.`;
    }

    const divisor = gcd(resNum, resDen);
    const simpNum = resNum / divisor;
    const simpDen = resDen / divisor;

    let mixed = '';
    if (simpDen > 0 && Math.abs(simpNum) >= simpDen) {
      const whole = Math.floor(Math.abs(simpNum) / simpDen) * (simpNum < 0 ? -1 : 1);
      const rem = Math.abs(simpNum) % simpDen;
      if (rem !== 0) {
        mixed = `${whole} \\frac{${rem}}{${simpDen}}`;
      }
    }

    return {
      resNum,
      resDen,
      simpNum,
      simpDen,
      divisor,
      step1,
      step2,
      mixed,
    };
  };

  const res = calculateResult();

  const speechExplanation = `Fractions problem: ${num1} over ${den1} ${operation === '+' ? 'plus' : operation === '-' ? 'minus' : operation === '×' ? 'times' : 'divided by'} ${num2} over ${den2}. ${res.step1}. ${res.step2}. In simplest form, the answer is ${res.simpNum} over ${res.simpDen}.`;

  return (
    <div
      className="rounded-2xl border p-5 sm:p-6 shadow-xs space-y-6"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-card)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--badge-bg)',
                color: 'var(--badge-text)',
                borderColor: 'var(--border-card-strong)',
              }}
            >
              Interactive Tool
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              Primary 5 / Year 5+
            </span>
          </div>
          <h3
            className="text-lg sm:text-xl font-extrabold mt-1"
            style={{ color: 'var(--text-primary)' }}
          >
            Visual Fraction Calculator & Bar Model
          </h3>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Experiment with fractions, see live bar models, and watch step-by-step simplification!
          </p>
        </div>
      </div>

      {/* Input Controls */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 p-4 rounded-xl border"
        style={{
          backgroundColor: 'var(--bg-card-subtle)',
          borderColor: 'var(--border-card)',
        }}
      >
        {/* Fraction 1 */}
        <div
          className="flex flex-col items-center gap-2 p-3 rounded-lg border"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
            Fraction 1
          </span>
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Top:</span>
              <input
                type="number"
                min="1"
                max="20"
                value={num1}
                onChange={(e) => setNum1(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 text-center text-sm font-bold rounded p-1 border"
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderColor: 'var(--border-card-strong)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div className="w-16 h-0.5" style={{ backgroundColor: 'var(--text-primary)' }} />
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Bottom:</span>
              <input
                type="number"
                min="1"
                max="20"
                value={den1}
                onChange={(e) => setDen1(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 text-center text-sm font-bold rounded p-1 border"
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderColor: 'var(--border-card-strong)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Operation Selector */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
            Operation
          </span>
          <div className="grid grid-cols-4 gap-1 w-full max-w-[200px]">
            {(['+', '-', '×', '÷'] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => setOperation(op)}
                className="py-2 text-base font-extrabold rounded-lg transition-all cursor-pointer border"
                style={{
                  backgroundColor: operation === op ? 'var(--accent-primary)' : 'var(--bg-card)',
                  borderColor: operation === op ? 'var(--accent-primary)' : 'var(--border-card)',
                  color: operation === op ? '#ffffff' : 'var(--text-primary)',
                }}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        {/* Fraction 2 */}
        <div
          className="flex flex-col items-center gap-2 p-3 rounded-lg border"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
            Fraction 2
          </span>
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Top:</span>
              <input
                type="number"
                min="1"
                max="20"
                value={num2}
                onChange={(e) => setNum2(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 text-center text-sm font-bold rounded p-1 border"
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderColor: 'var(--border-card-strong)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div className="w-16 h-0.5" style={{ backgroundColor: 'var(--text-primary)' }} />
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Bottom:</span>
              <input
                type="number"
                min="1"
                max="20"
                value={den2}
                onChange={(e) => setDen2(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 text-center text-sm font-bold rounded p-1 border"
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderColor: 'var(--border-card-strong)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Bar Models */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="p-3.5 rounded-xl border space-y-2"
          style={{
            backgroundColor: 'var(--bg-card-subtle)',
            borderColor: 'var(--border-card)',
          }}
        >
          <div className="flex justify-between items-center text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
            <span>Visual Bar 1: {num1}/{den1}</span>
            <span style={{ color: 'var(--accent-primary)' }}>{((num1 / den1) * 100).toFixed(1)}%</span>
          </div>
          <div
            className="h-6 w-full rounded-md overflow-hidden flex border"
            style={{
              backgroundColor: 'var(--bg-card-hover)',
              borderColor: 'var(--border-card-strong)',
            }}
          >
            {Array.from({ length: den1 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r last:border-r-0 transition-all"
                style={{
                  backgroundColor: i < num1 ? 'var(--accent-primary)' : 'transparent',
                  borderColor: 'var(--border-card)',
                }}
              />
            ))}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Split into {den1} equal parts, shading {num1} of them.
          </p>
        </div>

        <div
          className="p-3.5 rounded-xl border space-y-2"
          style={{
            backgroundColor: 'var(--bg-card-subtle)',
            borderColor: 'var(--border-card)',
          }}
        >
          <div className="flex justify-between items-center text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
            <span>Visual Bar 2: {num2}/{den2}</span>
            <span style={{ color: 'var(--accent-primary)' }}>{((num2 / den2) * 100).toFixed(1)}%</span>
          </div>
          <div
            className="h-6 w-full rounded-md overflow-hidden flex border"
            style={{
              backgroundColor: 'var(--bg-card-hover)',
              borderColor: 'var(--border-card-strong)',
            }}
          >
            {Array.from({ length: den2 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r last:border-r-0 transition-all"
                style={{
                  backgroundColor: i < num2 ? 'var(--accent-primary)' : 'transparent',
                  borderColor: 'var(--border-card)',
                }}
              />
            ))}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Split into {den2} equal parts, shading {num2} of them.
          </p>
        </div>
      </div>

      {/* Step by Step Breakdown - Click anywhere to read! */}
      <ReadableCard
        id="fractions-tool-solution"
        textToRead={speechExplanation}
        highlightStyle="inner"
        className="p-4 rounded-xl border space-y-3 shadow-2xs"
        ariaLabel="Fraction Calculation Solution"
      >
        <h4
          className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5"
          style={{ color: 'var(--accent-primary)' }}
        >
          <Sparkles size={14} />
          <span>Step-by-Step Calculation Solution (Click anywhere on card to read)</span>
        </h4>

        <div
          className="flex flex-wrap items-center gap-3 text-sm font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          <MathView
            math={`\\frac{${num1}}{${den1}} ${operation === '×' ? '\\times' : operation === '÷' ? '\\div' : operation} \\frac{${num2}}{${den2}} = \\frac{${res.resNum}}{${res.resDen}}`}
          />
          {res.divisor > 1 && (
            <>
              <span className="opacity-50">⟶</span>
              <span
                className="text-xs px-2 py-1 rounded border"
                style={{
                  backgroundColor: 'var(--badge-bg)',
                  color: 'var(--badge-text)',
                  borderColor: 'var(--border-card-strong)',
                }}
              >
                Divide top & bottom by {res.divisor}
              </span>
              <span className="opacity-50">⟶</span>
              <MathView math={`\\mathbf{\\frac{${res.simpNum}}{${res.simpDen}}}`} />
            </>
          )}
          {res.mixed && (
            <>
              <span className="opacity-50">or</span>
              <MathView math={`\\mathbf{${res.mixed}}`} />
            </>
          )}
        </div>

        <div className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <p>• <strong>Step 1:</strong> {res.step1}</p>
          <p>• <strong>Step 2:</strong> {res.step2}</p>
        </div>
      </ReadableCard>
    </div>
  );
};
