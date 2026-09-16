import React, { useState } from 'react';
import { MathView } from '../MathView';
import { Sparkles, Info, RefreshCw, Layers } from 'lucide-react';
import { ReadableCard } from '../ReadableCard';
import { AudioButton } from '../AudioButton';

export const DecimalsPercentagesConverter: React.FC = () => {
  const [percent, setPercent] = useState<number>(35);
  const [baseAmount, setBaseAmount] = useState<number>(80);

  const decimalVal = Number((percent / 100).toFixed(4));
  const fractionStr = `${percent}/100`;

  // Simplify fraction
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(percent, 100);
  const simNum = percent / divisor;
  const simDen = 100 / divisor;

  const calculatedAmount = Number(((baseAmount * percent) / 100).toFixed(2));
  const mental10 = Number((baseAmount * 0.1).toFixed(2));
  const mental5 = Number((baseAmount * 0.05).toFixed(2));
  const mental1 = Number((baseAmount * 0.01).toFixed(2));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header card */}
      <ReadableCard
        id="fdp-tool-header"
        ariaLabel="Decimals, Percentages &amp; Fractions Interactive Tool"
        className="p-5 border rounded-2xl shadow-xs"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-card)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--accent-contrast)',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                FDP Converter &amp; Mental Percentage Studio
              </h2>
              <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Equivalence visualizer, 100-grid sandbox, and mental percentage Lego building blocks.
              </p>
            </div>
          </div>
          <AudioButton
            id="audio-fdp-tool-intro"
            textToRead="Welcome to the Fractions, Decimals and Percentages Studio. Adjust percentages on the interactive 100-grid to see instant equivalent fractions and decimals, and calculate percentages of amounts using mental 10% and 5% building blocks."
            label="Tool Overview"
            size="sm"
          />
        </div>
      </ReadableCard>

      {/* Preset benchmarks & Slider */}
      <div
        className="p-5 border rounded-2xl shadow-xs space-y-4"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-card)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gold Benchmarks:
            </span>
            {[
              { label: '50% (½)', val: 50 },
              { label: '25% (¼)', val: 25 },
              { label: '75% (¾)', val: 75 },
              { label: '10% (¹⁄₁₀)', val: 10 },
              { label: '20% (⅕)', val: 20 },
              { label: '35%', val: 35 },
            ].map((b) => (
              <button
                key={b.val}
                type="button"
                onClick={() => setPercent(b.val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  percent === b.val
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="fdp-slider" className="text-xs font-bold text-slate-500">
              Slider:
            </label>
            <input
              id="fdp-slider"
              type="range"
              min="1"
              max="100"
              value={percent}
              onChange={(e) => setPercent(parseInt(e.target.value))}
              className="w-36 accent-amber-600 cursor-pointer"
            />
            <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400 w-12 text-right">
              {percent}%
            </span>
          </div>
        </div>

        {/* 3-Way Equivalence Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/30 text-center space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Simplified Fraction
            </span>
            <div className="text-2xl font-black text-blue-800 dark:text-blue-200">
              <MathView math={`\\frac{${simNum}}{${simDen}}`} />
            </div>
            <span className="text-[11px] text-blue-600/80 dark:text-blue-400/80 font-mono">
              ({percent}/100)
            </span>
          </div>

          <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-center space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Decimal Value
            </span>
            <div className="text-2xl font-mono font-black text-emerald-800 dark:text-emerald-200">
              {decimalVal}
            </div>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
              ({percent} ÷ 100)
            </span>
          </div>

          <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/30 text-center space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Percentage
            </span>
            <div className="text-2xl font-mono font-black text-amber-800 dark:text-amber-200">
              {percent}%
            </div>
            <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80">
              ({percent} out of 100)
            </span>
          </div>
        </div>

        {/* 100 Grid Visualizer */}
        <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Hundredths Grid ({percent} / 100 shaded):</span>
            <span>{percent}% Shaded</span>
          </div>
          <div className="grid grid-cols-10 gap-1 aspect-square max-w-[280px] mx-auto p-2 bg-white dark:bg-slate-800 border rounded-xl shadow-inner">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-xs transition-colors duration-150 ${
                  i < percent
                    ? 'bg-amber-500 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Percentage of an Amount Calculator */}
      <div
        className="p-5 border rounded-2xl shadow-xs space-y-4"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-card)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>🧮 Percentage of an Amount Calculator</span>
            </h3>
            <p className="text-xs text-slate-500">
              See the Lego decomposition method in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Base (£/units):</span>
            {[40, 80, 120, 250, 600].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setBaseAmount(a)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black border cursor-pointer ${
                  baseAmount === a ? 'bg-amber-600 text-white border-amber-700' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                £{a}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
              Calculating {percent}% of £{baseAmount}:
            </span>
            <div className="text-2xl font-mono font-black text-amber-900 dark:text-amber-100 mt-1">
              £{calculatedAmount}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800 border border-amber-200 dark:border-amber-800">
              <span className="text-[10px] text-slate-400 block">10% Block</span>
              <span className="font-bold text-amber-700 dark:text-amber-300">£{mental10}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800 border border-amber-200 dark:border-amber-800">
              <span className="text-[10px] text-slate-400 block">5% Block</span>
              <span className="font-bold text-amber-700 dark:text-amber-300">£{mental5}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800 border border-amber-200 dark:border-amber-800">
              <span className="text-[10px] text-slate-400 block">1% Block</span>
              <span className="font-bold text-amber-700 dark:text-amber-300">£{mental1}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
