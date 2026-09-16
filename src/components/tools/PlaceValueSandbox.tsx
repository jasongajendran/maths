import React, { useState } from 'react';
import { MathView } from '../MathView';
import { Sparkles, Info, RefreshCw, ArrowLeftRight, Layers } from 'lucide-react';
import { ReadableCard } from '../ReadableCard';
import { AudioButton } from '../AudioButton';

export const PlaceValueSandbox: React.FC = () => {
  const [currentNum, setCurrentNum] = useState<number>(345.6);
  const [roundTarget, setRoundTarget] = useState<'ten' | 'hundred' | 'tenth' | 'unit'>('ten');

  const shiftLeft = (factor: number) => {
    setCurrentNum((prev) => Number((prev * factor).toFixed(3)));
  };

  const shiftRight = (factor: number) => {
    setCurrentNum((prev) => Number((prev / factor).toFixed(3)));
  };

  const getRounded = (num: number, target: 'ten' | 'hundred' | 'tenth' | 'unit') => {
    switch (target) {
      case 'hundred':
        return Math.round(num / 100) * 100;
      case 'ten':
        return Math.round(num / 10) * 10;
      case 'unit':
        return Math.round(num);
      case 'tenth':
        return Math.round(num * 10) / 10;
    }
  };

  // Extract place values
  const thousands = Math.floor((currentNum % 10000) / 1000);
  const hundreds = Math.floor((currentNum % 1000) / 100);
  const tens = Math.floor((currentNum % 100) / 10);
  const ones = Math.floor(currentNum % 10);
  const tenths = Math.floor((currentNum * 10) % 10);
  const hundredths = Math.floor((currentNum * 100) % 10);

  const roundedVal = getRounded(currentNum, roundTarget);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header card */}
      <ReadableCard
        id="place-value-tool-header"
        ariaLabel="Place Value &amp; Rounding Explorer Tool"
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
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                Place Value &amp; Rounding Laboratory
              </h2>
              <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Slide digits across column houses and observe rounding boundaries in real-time.
              </p>
            </div>
          </div>
          <AudioButton
            id="audio-pv-tool-intro"
            textToRead="Welcome to the Place Value and Rounding Laboratory. Adjust the number, multiply or divide by 10, 100, or 1000 to slide digits across columns, and test rounding to any place value."
            label="Tool Overview"
            size="sm"
          />
        </div>
      </ReadableCard>

      {/* Preset values & Direct Inputs */}
      <div
        className="p-5 border rounded-2xl shadow-xs space-y-4"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-card)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Presets:
            </span>
            {[345.6, 1284, 56.75, 4.09, 8905].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setCurrentNum(val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  currentNum === val
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="pv-custom-input" className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              Custom Value:
            </label>
            <input
              id="pv-custom-input"
              type="number"
              step="0.01"
              value={currentNum}
              onChange={(e) => setCurrentNum(parseFloat(e.target.value) || 0)}
              className="w-28 px-3 py-1.5 text-xs font-mono font-bold rounded-xl border"
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                borderColor: 'var(--border-card)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Place Value Column Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              🏛️ Place Value Columns (Decimal point remains anchored)
            </span>
            <span className="text-xs font-mono font-extrabold text-slate-500">
              Current: {currentNum}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-2 text-center">
            {/* Thousands */}
            <div className="p-3 rounded-xl border bg-slate-100/70 dark:bg-slate-800/70 border-slate-300 dark:border-slate-700">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Thousands (1,000)</span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">
                {thousands > 0 || currentNum >= 1000 ? thousands : '-'}
              </span>
              <span className="text-[10px] text-slate-400">{thousands > 0 ? `${thousands * 1000}` : '0'}</span>
            </div>

            {/* Hundreds */}
            <div className="p-3 rounded-xl border bg-blue-500/10 border-blue-500/30">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">Hundreds (100)</span>
              <span className="text-2xl font-black text-blue-800 dark:text-blue-200 mt-1 block">
                {hundreds > 0 || currentNum >= 100 ? hundreds : '-'}
              </span>
              <span className="text-[10px] text-blue-600/70 dark:text-blue-400/70">{hundreds > 0 ? `${hundreds * 100}` : '0'}</span>
            </div>

            {/* Tens */}
            <div className="p-3 rounded-xl border bg-indigo-500/10 border-indigo-500/30">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">Tens (10)</span>
              <span className="text-2xl font-black text-indigo-800 dark:text-indigo-200 mt-1 block">
                {tens > 0 || currentNum >= 10 ? tens : '-'}
              </span>
              <span className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70">{tens > 0 ? `${tens * 10}` : '0'}</span>
            </div>

            {/* Ones */}
            <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">Ones (1)</span>
              <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-1 block">
                {ones}
              </span>
              <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">{ones}</span>
            </div>

            {/* Tenths */}
            <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/30">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">Tenths (0.1)</span>
              <span className="text-2xl font-black text-amber-800 dark:text-amber-200 mt-1 block">
                {tenths}
              </span>
              <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70">{`0.${tenths}`}</span>
            </div>

            {/* Hundredths */}
            <div className="p-3 rounded-xl border bg-rose-500/10 border-rose-500/30">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300 block">Hundredths (0.01)</span>
              <span className="text-2xl font-black text-rose-800 dark:text-rose-200 mt-1 block">
                {hundredths}
              </span>
              <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70">{`0.0${hundredths}`}</span>
            </div>
          </div>
        </div>

        {/* Powers of 10 Shifter Buttons */}
        <div className="p-3 rounded-xl border bg-black/5 dark:bg-white/5 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
            ⚡ Quick Shift Operations:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => shiftLeft(10)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-xs"
            >
              × 10 (Slide 1 Left)
            </button>
            <button
              type="button"
              onClick={() => shiftLeft(100)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-xs"
            >
              × 100 (Slide 2 Left)
            </button>
            <button
              type="button"
              onClick={() => shiftRight(10)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer shadow-xs"
            >
              ÷ 10 (Slide 1 Right)
            </button>
            <button
              type="button"
              onClick={() => shiftRight(100)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer shadow-xs"
            >
              ÷ 100 (Slide 2 Right)
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Rounding Mountain */}
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
              <span>⛰️ Rounding Mountain Explorer</span>
            </h3>
            <p className="text-xs text-slate-500">
              5 or more rounds UP, 4 or less rounds DOWN.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Round to nearest:</span>
            {(['ten', 'hundred', 'unit', 'tenth'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setRoundTarget(t)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer capitalize ${
                  roundTarget === t
                    ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}
              >
                {t === 'unit' ? 'Whole Number' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Rounding Result Card */}
        <div className="p-4 rounded-xl border bg-purple-500/10 border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300 block">
              Rounding Result for {currentNum}:
            </span>
            <div className="text-xl font-black text-purple-900 dark:text-purple-100 mt-0.5">
              {currentNum} rounded to nearest {roundTarget === 'unit' ? 'whole number' : roundTarget} is{' '}
              <span className="underline decoration-purple-500 font-extrabold">{roundedVal}</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
            {currentNum} ≈ {roundedVal}
          </div>
        </div>
      </div>
    </div>
  );
};
