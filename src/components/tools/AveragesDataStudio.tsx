import React, { useState } from 'react';
import { MathView } from '../MathView';
import { Sparkles, Info, RefreshCw, BarChart2 } from 'lucide-react';
import { ReadableCard } from '../ReadableCard';
import { AudioButton } from '../AudioButton';

export const AveragesDataStudio: React.FC = () => {
  const [dataPoints, setDataPoints] = useState<number[]>([4, 7, 7, 8, 9, 10, 11]);

  const sortedData = [...dataPoints].sort((a, b) => a - b);
  const count = dataPoints.length;

  // Mean
  const sum = dataPoints.reduce((acc, v) => acc + v, 0);
  const mean = count > 0 ? Number((sum / count).toFixed(2)) : 0;

  // Median
  const median = (() => {
    if (count === 0) return 0;
    const mid = Math.floor(count / 2);
    return count % 2 !== 0 ? sortedData[mid] : Number(((sortedData[mid - 1] + sortedData[mid]) / 2).toFixed(2));
  })();

  // Mode
  const mode = (() => {
    const freq: Record<number, number> = {};
    let maxFreq = 0;
    dataPoints.forEach((n) => {
      freq[n] = (freq[n] || 0) + 1;
      if (freq[n] > maxFreq) maxFreq = freq[n];
    });
    if (maxFreq <= 1 && count > 1) return 'No distinct mode';
    const modes = Object.keys(freq).filter((k) => freq[parseInt(k)] === maxFreq);
    return modes.join(', ');
  })();

  // Range
  const min = count > 0 ? Math.min(...dataPoints) : 0;
  const max = count > 0 ? Math.max(...dataPoints) : 0;
  const range = max - min;

  const presets = [
    { label: 'Weekly Test Scores', data: [4, 7, 7, 8, 9, 10, 11] },
    { label: 'Sibling Heights (cm/10)', data: [12, 13, 13, 14, 15, 17] },
    { label: 'Daily Temperatures (°C)', data: [15, 18, 14, 18, 20, 22, 19] },
    { label: 'Goal Tally', data: [2, 0, 3, 1, 2, 4, 2] },
  ];

  const addPoint = (val: number) => {
    if (dataPoints.length < 12) {
      setDataPoints([...dataPoints, val]);
    }
  };

  const removePoint = (index: number) => {
    if (dataPoints.length > 2) {
      setDataPoints(dataPoints.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header card */}
      <ReadableCard
        id="averages-tool-header"
        ariaLabel="Averages and Data Handling Studio"
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
              <BarChart2 size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                Averages &amp; Data Handling Laboratory
              </h2>
              <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Real-time calculation of Mean, Median, Mode, and Range with interactive data points.
              </p>
            </div>
          </div>
          <AudioButton
            id="audio-averages-tool-intro"
            textToRead="Welcome to the Averages and Data Handling Laboratory. Add, remove, or edit data points to instantly see the Mean, Median, Mode, and Range calculated with step-by-step working."
            label="Tool Overview"
            size="sm"
          />
        </div>
      </ReadableCard>

      {/* Preset Pickers & Data editor */}
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
              Sample Datasets:
            </span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDataPoints(p.data)}
                className="px-3 py-1.5 rounded-xl text-xs font-black border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200 cursor-pointer shadow-2xs"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Data Point Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Active Data Points ({dataPoints.length} values):</span>
            <span>Sorted: [{sortedData.join(', ')}]</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 min-h-[52px]">
            {dataPoints.map((val, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-lg border bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-200 text-xs font-black flex items-center gap-2 shadow-2xs animate-scaleIn"
              >
                <span>{val}</span>
                {dataPoints.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removePoint(idx)}
                    className="text-slate-400 hover:text-red-500 cursor-pointer text-xs"
                    title="Remove"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            {dataPoints.length < 12 && (
              <button
                type="button"
                onClick={() => addPoint(Math.floor(Math.random() * 15) + 1)}
                className="px-2.5 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:text-blue-600 text-xs font-bold cursor-pointer hover:bg-blue-50/50"
              >
                + Add Value
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Mean */}
          <div className="p-3.5 rounded-xl border bg-blue-500/10 border-blue-500/30 text-center space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
              Mean (Average)
            </span>
            <div className="text-2xl font-mono font-black text-blue-800 dark:text-blue-200">
              {mean}
            </div>
            <span className="text-[10px] text-blue-600/80 dark:text-blue-400/80 block">
              Sum ({sum}) ÷ Count ({count})
            </span>
          </div>

          {/* Median */}
          <div className="p-3.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-center space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
              Median (Middle)
            </span>
            <div className="text-2xl font-mono font-black text-emerald-800 dark:text-emerald-200">
              {median}
            </div>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 block">
              Middle value of ordered list
            </span>
          </div>

          {/* Mode */}
          <div className="p-3.5 rounded-xl border bg-amber-500/10 border-amber-500/30 text-center space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
              Mode (Most Common)
            </span>
            <div className="text-2xl font-mono font-black text-amber-800 dark:text-amber-200 truncate">
              {mode}
            </div>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 block">
              Most frequent occurrence
            </span>
          </div>

          {/* Range */}
          <div className="p-3.5 rounded-xl border bg-purple-500/10 border-purple-500/30 text-center space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
              Range (Spread)
            </span>
            <div className="text-2xl font-mono font-black text-purple-800 dark:text-purple-200">
              {range}
            </div>
            <span className="text-[10px] text-purple-600/80 dark:text-purple-400/80 block">
              Max ({max}) − Min ({min})
            </span>
          </div>
        </div>

        {/* Step-by-Step Calculation Formula Box */}
        <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-xs font-mono space-y-1.5">
          <div className="font-bold text-slate-700 dark:text-slate-300 font-sans">
            📝 Step-by-Step Working:
          </div>
          <div>1. Sum of all values = {dataPoints.join(' + ')} = <strong>{sum}</strong></div>
          <div>2. Mean = {sum} ÷ {count} = <strong>{mean}</strong></div>
          <div>3. Ordered list = [{sortedData.join(', ')}] ➔ Middle is <strong>{median}</strong></div>
          <div>4. Range = {max} − {min} = <strong>{range}</strong></div>
        </div>
      </div>
    </div>
  );
};
