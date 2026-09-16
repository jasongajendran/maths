import React, { useState } from 'react';
import { MathView } from '../MathView';
import { Sparkles, Check, X, ArrowRight, RefreshCw, AlertTriangle, Box, Grid } from 'lucide-react';
import { playSound } from '../../utils/soundEffects';
import { WhiteboardType } from '../../data/videoLessons/types';

interface ExpandedWhiteboardScenesProps {
  type: WhiteboardType;
  currentTime?: number;
}

export const ExpandedWhiteboardScenes: React.FC<ExpandedWhiteboardScenesProps> = ({
  type,
  currentTime = 0,
}) => {
  // Local state for interactive explorations
  const [selectedPrimeTestNum, setSelectedPrimeTestNum] = useState<number>(7);
  const [attemptedRows, setAttemptedRows] = useState<number>(2);
  const [selectedSquareN, setSelectedSquareN] = useState<number>(4);
  const [selectedCubeN, setSelectedCubeN] = useState<number>(3);
  const [balanceStep, setBalanceStep] = useState<number>(1);
  const [metricUnit, setMetricUnit] = useState<'km' | 'm' | 'cm'>('m');
  const [fdpShadedCount, setFdpShadedCount] = useState<number>(50);

  switch (type) {
    /* ----------------------------------------------------
     * 1. PRIME TILE RECTANGLE TEST
     * ---------------------------------------------------- */
    case 'prime_tile_test': {
      const q = Math.floor(selectedPrimeTestNum / attemptedRows);
      const rem = selectedPrimeTestNum % attemptedRows;
      const isPrime = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29].includes(selectedPrimeTestNum);

      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="font-extrabold text-amber-700 dark:text-amber-300">
              The Tile Rectangle Test: Can {selectedPrimeTestNum} tiles make equal rectangular rows?
            </span>
            <span className="font-medium text-amber-900 dark:text-amber-200">
              Try different rows below to see if any tiles get left out!
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Pick tiles:</span>
              {[6, 7, 8, 9, 12, 13, 15, 16, 17].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setSelectedPrimeTestNum(n);
                    setAttemptedRows(2);
                    playSound('click');
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer"
                  style={{
                    backgroundColor: selectedPrimeTestNum === n ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                    color: selectedPrimeTestNum === n ? 'var(--accent-contrast)' : 'var(--text-primary)',
                    borderColor: selectedPrimeTestNum === n ? 'var(--accent-primary)' : 'var(--border-card)',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Rows:</span>
              {[1, 2, 3, 4].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setAttemptedRows(r);
                    playSound(selectedPrimeTestNum % r === 0 ? 'correct' : 'wrong');
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer"
                  style={{
                    backgroundColor: attemptedRows === r ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                    color: attemptedRows === r ? 'var(--accent-contrast)' : 'var(--text-primary)',
                    borderColor: attemptedRows === r ? 'var(--accent-primary)' : 'var(--border-card)',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Tile Grid */}
          <div
            className="p-4 rounded-xl border flex flex-col items-center justify-center min-h-[140px] gap-2 shadow-2xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <div className="space-y-1.5">
              {Array.from({ length: attemptedRows }).map((_, rIdx) => {
                const rowCount = q + (rIdx < rem ? 1 : 0);
                return (
                  <div key={rIdx} className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono w-10 text-right" style={{ color: 'var(--text-muted)' }}>R{rIdx + 1}:</span>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: rowCount }).map((_, cIdx) => {
                        const isStickingOut = rIdx < rem && cIdx === rowCount - 1 && q > 0;
                        return (
                          <div
                            key={cIdx}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs font-black shadow-2xs transition-all ${
                              isStickingOut ? 'bg-rose-500 text-white animate-pulse ring-2 ring-rose-400' : ''
                            }`}
                            style={isStickingOut ? undefined : {
                              backgroundColor: 'var(--accent-primary)',
                              color: 'var(--accent-contrast)',
                            }}
                          >
                            {rIdx * q + cIdx + 1}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Verdict */}
            <div className="mt-3 pt-3 border-t w-full text-center text-xs sm:text-sm font-extrabold" style={{ borderColor: 'var(--border-card)' }}>
              {rem === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  ✓ Perfect Rectangle! {selectedPrimeTestNum} can be arranged into {attemptedRows} equal rows of {q}!
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400">
                  ✗ Unequal! {rem} leftover tile{rem > 1 ? 's' : ''} sticking out. Cannot make an equal rectangle!
                </span>
              )}
            </div>
          </div>

          <div
            className="p-3 rounded-xl border text-xs"
            style={{
              backgroundColor: 'var(--reading-highlight-bg)',
              borderColor: 'var(--accent-primary)',
              color: 'var(--text-primary)',
            }}
          >
            <strong>Teacher Key Insight:</strong> {selectedPrimeTestNum} {isPrime ? 'is a PRIME NUMBER because it only ever forms a 1-row stick (1 × ' + selectedPrimeTestNum + ')!' : 'is a COMPOSITE NUMBER because it forms equal rectangular rows!'}
          </div>
        </div>
      );
    }

    /* ----------------------------------------------------
     * 2. SQUARE NUMBER GRID
     * ---------------------------------------------------- */
    case 'square_number_grid':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-blue-500/10 border-blue-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-blue-700 dark:text-blue-300">
              Geometric Square Array: Side × Side = Area
            </span>
            <span className="font-medium text-blue-900 dark:text-blue-200">
              Width and Height are identical!
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Pick Square:</span>
            {[2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setSelectedSquareN(n);
                  playSound('click');
                }}
                className="px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer"
                style={{
                  backgroundColor: selectedSquareN === n ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                  color: selectedSquareN === n ? 'var(--accent-contrast)' : 'var(--text-primary)',
                  borderColor: selectedSquareN === n ? 'var(--accent-primary)' : 'var(--border-card)',
                }}
              >
                {n}² = {n * n}
              </button>
            ))}
          </div>

          <div
            className="p-4 rounded-xl border flex flex-col items-center justify-center shadow-2xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <span className="text-xs font-black mb-2" style={{ color: 'var(--accent-primary)' }}>
              {selectedSquareN} wide × {selectedSquareN} high = {selectedSquareN * selectedSquareN} tiles (Square!)
            </span>
            <div
              className="grid gap-1.5 p-3 rounded-xl border-2 shadow-sm"
              style={{
                gridTemplateColumns: `repeat(${selectedSquareN}, minmax(0, 1fr))`,
                borderColor: 'var(--accent-primary)',
                backgroundColor: 'var(--bg-card-subtle)',
              }}
            >
              {Array.from({ length: selectedSquareN * selectedSquareN }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs font-bold shadow-2xs"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--accent-contrast)',
                  }}
                >
                  {idx + 1}
                </div>
              ))}
            </div>

            <div
              className="mt-4 p-2.5 rounded-lg border text-xs w-full text-center"
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                borderColor: 'var(--border-card)',
                color: 'var(--text-secondary)',
              }}
            >
              <strong>Why Square Numbers have an ODD number of factors:</strong> The center factor ({selectedSquareN} × {selectedSquareN}) pairs with itself and is only listed once!
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 3. CUBE 3D BLOCKS
     * ---------------------------------------------------- */
    case 'cube_3d_blocks':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-purple-500/10 border-purple-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-purple-700 dark:text-purple-300">
              Cube Numbers (3D): Length × Width × Height
            </span>
            <span className="font-medium text-purple-900 dark:text-purple-200">
              Solid 3D Rubik's blocks!
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Pick Cube:</span>
            {[1, 2, 3, 4].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setSelectedCubeN(c);
                  playSound('click');
                }}
                className="px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer"
                style={{
                  backgroundColor: selectedCubeN === c ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                  color: selectedCubeN === c ? 'var(--accent-contrast)' : 'var(--text-primary)',
                  borderColor: selectedCubeN === c ? 'var(--accent-primary)' : 'var(--border-card)',
                }}
              >
                {c}³ = {c * c * c}
              </button>
            ))}
          </div>

          <div
            className="p-4 rounded-xl border flex flex-col items-center justify-center space-y-3 shadow-2xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <span className="text-xs sm:text-sm font-black" style={{ color: 'var(--accent-primary)' }}>
              {selectedCubeN} wide × {selectedCubeN} deep × {selectedCubeN} high = {selectedCubeN * selectedCubeN * selectedCubeN} Cubes
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {Array.from({ length: selectedCubeN }).map((_, lIdx) => (
                <div key={lIdx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Layer {lIdx + 1}</span>
                  <div
                    className="grid gap-1 p-1.5 rounded-lg border"
                    style={{
                      gridTemplateColumns: `repeat(${selectedCubeN}, minmax(0, 1fr))`,
                      backgroundColor: 'var(--bg-card-subtle)',
                      borderColor: 'var(--border-card-strong)',
                    }}
                  >
                    {Array.from({ length: selectedCubeN * selectedCubeN }).map((_, bIdx) => (
                      <div
                        key={bIdx}
                        className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shadow-2xs"
                        style={{
                          backgroundColor: 'var(--accent-primary)',
                          color: 'var(--accent-contrast)',
                        }}
                      >
                        {lIdx * (selectedCubeN * selectedCubeN) + bIdx + 1}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 4. FACTOR RAINBOW BOARD
     * ---------------------------------------------------- */
    case 'factor_rainbow_board':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
              Factor Rainbow for 12: Paired from Outside In
            </span>
            <span className="font-medium text-emerald-900 dark:text-emerald-200">
              Zero remainders or crumbs!
            </span>
          </div>

          <div
            className="p-4 rounded-xl border space-y-4 shadow-2xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <div
              className="flex items-center justify-around py-3 px-4 rounded-xl border"
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                borderColor: 'var(--border-card-strong)',
              }}
            >
              {[
                { num: 1, pair: 12, color: 'text-rose-500 border-rose-400' },
                { num: 2, pair: 6, color: 'text-amber-500 border-amber-400' },
                { num: 3, pair: 4, color: 'text-emerald-500 border-emerald-400' },
                { num: 4, pair: 3, color: 'text-emerald-500 border-emerald-400' },
                { num: 6, pair: 2, color: 'text-amber-500 border-amber-400' },
                { num: 12, pair: 1, color: 'text-rose-500 border-rose-400' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs ${item.color}`}
                    style={{ backgroundColor: 'var(--bg-card)' }}>
                    {item.num}
                  </div>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>× {item.pair}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div
                className="p-2 rounded-lg border font-bold"
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-primary)',
                }}
              >
                1 × 12 = 12
              </div>
              <div
                className="p-2 rounded-lg border font-bold"
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-primary)',
                }}
              >
                2 × 6 = 12
              </div>
              <div
                className="p-2 rounded-lg border font-bold"
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-primary)',
                }}
              >
                3 × 4 = 12
              </div>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 5. PLACE VALUE HOUSES
     * ---------------------------------------------------- */
    case 'place_value_houses':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-sky-500/10 border-sky-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-sky-700 dark:text-sky-300">
              The Place Value Hotel: Powers of 10
            </span>
            <span className="font-medium text-sky-900 dark:text-sky-200">
              Left = ×10 | Right = ÷10
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 text-center">
            {[
              { title: 'Thousands', val: '5,000', power: '1,000' },
              { title: 'Hundreds', val: '500', power: '100' },
              { title: 'Tens', val: '50', power: '10' },
              { title: 'Ones', val: '5', power: '1' },
              { title: 'Tenths', val: '0.5', power: '0.1' },
              { title: 'Hundredths', val: '0.05', power: '0.01' },
            ].map((col, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xl border space-y-1 shadow-2xs"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-card)',
                }}
              >
                <span className="text-[10px] font-bold block" style={{ color: 'var(--text-muted)' }}>{col.title}</span>
                <span className="text-sm font-black block" style={{ color: 'var(--accent-primary)' }}>{col.val}</span>
                <span className="text-[9px] font-mono block" style={{ color: 'var(--text-secondary)' }}>{col.power}</span>
              </div>
            ))}
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 6. ROUNDING MOUNTAIN
     * ---------------------------------------------------- */
    case 'rounding_mountain':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-amber-700 dark:text-amber-300">
              Rounding Mountain Rollercoaster
            </span>
            <span className="font-medium text-amber-900 dark:text-amber-200">
              0, 1, 2, 3, 4 Roll Back | 5, 6, 7, 8, 9 Zoom Forward!
            </span>
          </div>

          <div
            className="p-4 rounded-xl border flex items-center justify-between gap-2 shadow-2xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <div
              className="p-3 rounded-xl border text-center w-1/3"
              style={{
                backgroundColor: 'var(--contrast-warm-bg)',
                borderColor: 'var(--contrast-warm-border)',
              }}
            >
              <span className="text-[10px] font-bold uppercase block" style={{ color: 'var(--contrast-warm)' }}>Roll Down</span>
              <span className="text-sm font-black block" style={{ color: 'var(--contrast-warm)' }}>0, 1, 2, 3, 4</span>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>Stays at lower ten/hundred</p>
            </div>

            <div className="text-center font-black text-lg" style={{ color: 'var(--accent-primary)' }}>
              ▲<br /><span className="text-xs">Peak 5</span>
            </div>

            <div
              className="p-3 rounded-xl border text-center w-1/3"
              style={{
                backgroundColor: 'var(--contrast-teal-bg)',
                borderColor: 'var(--contrast-teal-border)',
              }}
            >
              <span className="text-[10px] font-bold uppercase block" style={{ color: 'var(--contrast-teal)' }}>Climb Over</span>
              <span className="text-sm font-black block" style={{ color: 'var(--contrast-teal)' }}>5, 6, 7, 8, 9</span>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>Rounds UP to next benchmark</p>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 7. FDP 100-GRID BOARD
     * ---------------------------------------------------- */
    case 'fdp_grid_board':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-teal-500/10 border-teal-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-teal-700 dark:text-teal-300">
              The 100-Square Grid: Fractions, Decimals &amp; Percentages
            </span>
            <span className="font-medium text-teal-900 dark:text-teal-200">
              Shaded: {fdpShadedCount} squares = {fdpShadedCount}% = {fdpShadedCount / 100}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Benchmarks:</span>
            {[
              { label: '10% (Tenth)', val: 10 },
              { label: '25% (Quarter)', val: 25 },
              { label: '50% (Half)', val: 50 },
              { label: '75% (3/4)', val: 75 },
            ].map((b) => (
              <button
                key={b.val}
                type="button"
                onClick={() => {
                  setFdpShadedCount(b.val);
                  playSound('click');
                }}
                className="px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer"
                style={{
                  backgroundColor: fdpShadedCount === b.val ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                  color: fdpShadedCount === b.val ? 'var(--accent-contrast)' : 'var(--text-primary)',
                  borderColor: fdpShadedCount === b.val ? 'var(--accent-primary)' : 'var(--border-card)',
                }}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div
            className="p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-around gap-4 shadow-2xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            {/* 10x10 Mini Grid */}
            <div
              className="grid grid-cols-10 gap-0.5 p-1 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                borderColor: 'var(--border-card-strong)',
              }}
            >
              {Array.from({ length: 100 }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[2px] transition-colors"
                  style={{
                    backgroundColor: idx < fdpShadedCount ? 'var(--accent-primary)' : 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                  }}
                />
              ))}
            </div>

            {/* Equivalent Values */}
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold w-24" style={{ color: 'var(--text-muted)' }}>Fraction:</span>
                <span className="font-black" style={{ color: 'var(--accent-primary)' }}>
                  {fdpShadedCount}/100 {fdpShadedCount === 50 && '(= 1/2)'} {fdpShadedCount === 25 && '(= 1/4)'} {fdpShadedCount === 75 && '(= 3/4)'} {fdpShadedCount === 10 && '(= 1/10)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold w-24" style={{ color: 'var(--text-muted)' }}>Decimal:</span>
                <span className="font-black" style={{ color: 'var(--accent-primary)' }}>
                  {(fdpShadedCount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold w-24" style={{ color: 'var(--text-muted)' }}>Percentage:</span>
                <span className="font-black" style={{ color: 'var(--accent-primary)' }}>
                  {fdpShadedCount}%
                </span>
              </div>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 8. RATIO BAR BOARD
     * ---------------------------------------------------- */
    case 'ratio_bar_board':
      return (
        <div className="space-y-4 animate-fadeIn">
          {/* Header Summary */}
          <div
            className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            style={{
              backgroundColor: 'var(--bg-card-subtle)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-primary)',
            }}
          >
            <span className="font-extrabold text-sm sm:text-base" style={{ color: 'var(--accent-primary)' }}>
              Ratio Bar Model: Sharing £35 in ratio 2:3
            </span>
            <span
              className="font-bold text-xs px-2.5 py-1 rounded-lg border shadow-2xs"
              style={{
                backgroundColor: 'var(--badge-bg)',
                color: 'var(--badge-text)',
                borderColor: 'var(--border-card-strong)',
              }}
            >
              5 equal parts total (£7 per block)
            </span>
          </div>

          <div
            className="p-4 sm:p-5 rounded-2xl border space-y-4 shadow-xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            {/* Maya (2): £7, £7 = £14 */}
            <div
              className="p-3.5 rounded-xl border space-y-2.5 shadow-2xs"
              style={{
                backgroundColor: 'var(--tool-model1-badge-bg)',
                borderColor: 'var(--border-card)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black" style={{ color: 'var(--tool-model1-badge-text)' }}>
                  Maya (2 parts):
                </span>
                <span className="text-xs sm:text-sm font-black" style={{ color: 'var(--tool-model1-badge-text)' }}>
                  2 × £7 = £14
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="w-20 h-10 rounded-lg flex items-center justify-center font-black text-sm shadow-xs border"
                  style={{
                    backgroundColor: 'var(--tool-model1-bg)',
                    color: 'var(--tool-model1-text)',
                    borderColor: 'var(--border-card-strong)',
                  }}
                >
                  £7
                </div>
                <div
                  className="w-20 h-10 rounded-lg flex items-center justify-center font-black text-sm shadow-xs border"
                  style={{
                    backgroundColor: 'var(--tool-model1-bg)',
                    color: 'var(--tool-model1-text)',
                    borderColor: 'var(--border-card-strong)',
                  }}
                >
                  £7
                </div>
                <span className="font-black text-sm ml-1" style={{ color: 'var(--tool-model1-badge-text)' }}>
                  = £14
                </span>
              </div>
            </div>

            {/* Liam (3): £7, £7, £7 = £21 */}
            <div
              className="p-3.5 rounded-xl border space-y-2.5 shadow-2xs"
              style={{
                backgroundColor: 'var(--tool-model2-badge-bg)',
                borderColor: 'var(--border-card)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black" style={{ color: 'var(--tool-model2-badge-text)' }}>
                  Liam (3 parts):
                </span>
                <span className="text-xs sm:text-sm font-black" style={{ color: 'var(--tool-model2-badge-text)' }}>
                  3 × £7 = £21
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="w-20 h-10 rounded-lg flex items-center justify-center font-black text-sm shadow-xs border"
                  style={{
                    backgroundColor: 'var(--tool-model2-bg)',
                    color: 'var(--tool-model2-text)',
                    borderColor: 'var(--border-card-strong)',
                  }}
                >
                  £7
                </div>
                <div
                  className="w-20 h-10 rounded-lg flex items-center justify-center font-black text-sm shadow-xs border"
                  style={{
                    backgroundColor: 'var(--tool-model2-bg)',
                    color: 'var(--tool-model2-text)',
                    borderColor: 'var(--border-card-strong)',
                  }}
                >
                  £7
                </div>
                <div
                  className="w-20 h-10 rounded-lg flex items-center justify-center font-black text-sm shadow-xs border"
                  style={{
                    backgroundColor: 'var(--tool-model2-bg)',
                    color: 'var(--tool-model2-text)',
                    borderColor: 'var(--border-card-strong)',
                  }}
                >
                  £7
                </div>
                <span className="font-black text-sm ml-1" style={{ color: 'var(--tool-model2-badge-text)' }}>
                  = £21
                </span>
              </div>
            </div>

            {/* Total check */}
            <div
              className="pt-3 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
              style={{ borderColor: 'var(--border-card)' }}
            >
              <span className="font-extrabold text-sm" style={{ color: 'var(--accent-primary)' }}>
                Total: £14 + £21 = £35
              </span>
              <span className="font-bold" style={{ color: 'var(--text-secondary)' }}>
                1 Part = £35 ÷ 5 = £7
              </span>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 9. BIDMAS PRIORITY BOARD
     * ---------------------------------------------------- */
    case 'bidmas_priority_board':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-rose-500/10 border-rose-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-rose-700 dark:text-rose-300">
              BIDMAS Priority Ladder: 2 + 3 × 4 = 14
            </span>
            <span className="font-medium text-rose-900 dark:text-rose-200">
              Multiplication outranks Addition!
            </span>
          </div>

          <div
            className="p-4 rounded-xl border space-y-3 shadow-2xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-purple-500 text-white font-black">
                1. Brackets ()
              </div>
              <div className="p-2 rounded-lg bg-indigo-500 text-white font-black">
                2. Indices (n²)
              </div>
              <div className="p-2 rounded-lg bg-amber-500 text-white font-black">
                3. Multiply / Divide (×, ÷)
              </div>
              <div className="p-2 rounded-lg bg-emerald-500 text-white font-black">
                4. Add / Subtract (+, -)
              </div>
            </div>

            <div
              className="p-3 rounded-xl border text-center space-y-1 text-xs sm:text-sm"
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                borderColor: 'var(--border-card-strong)',
              }}
            >
              <span className="font-mono block" style={{ color: 'var(--text-muted)' }}>2 + (3 × 4)</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 block text-base">
                2 + 12 = 14 ✓
              </span>
              <span className="text-[10px] text-rose-500 block">
                Common Trap: (2 + 3) × 4 = 20 (WRONG without brackets!)
              </span>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 10. ALGEBRA BALANCE BOARD
     * ---------------------------------------------------- */
    case 'algebra_balance_board':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-amber-700 dark:text-amber-300">
              Two-Pan Balance Scale: 2x + 3 = 11
            </span>
            <span className="font-medium text-amber-900 dark:text-amber-200">
              Balance step: {balanceStep} of 3
            </span>
          </div>

          <div
            className="p-4 rounded-xl border space-y-4 shadow-2xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <div
              className="flex items-center justify-around py-3 px-4 rounded-xl border"
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                borderColor: 'var(--border-card-strong)',
              }}
            >
              <div className="text-center space-y-1">
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Left Pan</span>
                <div className="font-black text-sm text-amber-600 dark:text-amber-400">
                  {balanceStep === 1 && '2x + 3'}
                  {balanceStep === 2 && '2x (removed 3)'}
                  {balanceStep === 3 && 'x (divided by 2)'}
                </div>
              </div>

              <div className="text-xl font-black" style={{ color: 'var(--text-muted)' }}>=</div>

              <div className="text-center space-y-1">
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Right Pan</span>
                <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                  {balanceStep === 1 && '11'}
                  {balanceStep === 2 && '8 (11 - 3)'}
                  {balanceStep === 3 && '4 (8 ÷ 2)'}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => { setBalanceStep(1); playSound('click'); }}
                className="px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all"
                style={{
                  backgroundColor: balanceStep === 1 ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                  color: balanceStep === 1 ? 'var(--accent-contrast)' : 'var(--text-primary)',
                  borderColor: balanceStep === 1 ? 'var(--accent-primary)' : 'var(--border-card)',
                }}
              >
                Start: 2x + 3 = 11
              </button>
              <button
                type="button"
                onClick={() => { setBalanceStep(2); playSound('click'); }}
                className="px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all"
                style={{
                  backgroundColor: balanceStep === 2 ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                  color: balanceStep === 2 ? 'var(--accent-contrast)' : 'var(--text-primary)',
                  borderColor: balanceStep === 2 ? 'var(--accent-primary)' : 'var(--border-card)',
                }}
              >
                Step 1: Subtract 3
              </button>
              <button
                type="button"
                onClick={() => { setBalanceStep(3); playSound('correct'); }}
                className="px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all"
                style={{
                  backgroundColor: balanceStep === 3 ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
                  color: balanceStep === 3 ? 'var(--accent-contrast)' : 'var(--text-primary)',
                  borderColor: balanceStep === 3 ? 'var(--accent-primary)' : 'var(--border-card)',
                }}
              >
                Step 2: Divide by 2 (x = 4!)
              </button>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 11. METRIC STAIRCASE BOARD
     * ---------------------------------------------------- */
    case 'metric_staircase_board':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
              The Metric Staircase
            </span>
            <span className="font-medium text-emerald-900 dark:text-emerald-200">
              Big to Small: Multiply | Small to Big: Divide
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div
              className="p-3 rounded-xl border shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <span className="font-black text-sm block" style={{ color: 'var(--accent-primary)' }}>Kilometer (km)</span>
              <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>1,000 meters</span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block mt-1 font-bold">× 1,000 to m</span>
            </div>
            <div
              className="p-3 rounded-xl border shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <span className="font-black text-sm block" style={{ color: 'var(--accent-primary)' }}>Meter (m)</span>
              <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>Base Unit</span>
              <span className="text-[9px] text-teal-600 dark:text-teal-400 block mt-1 font-bold">× 100 to cm</span>
            </div>
            <div
              className="p-3 rounded-xl border shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <span className="font-black text-sm block" style={{ color: 'var(--accent-primary)' }}>Centimeter (cm)</span>
              <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>1/100 of a meter</span>
              <span className="text-[9px] text-cyan-600 dark:text-cyan-400 block mt-1 font-bold">× 10 to mm</span>
            </div>
            <div
              className="p-3 rounded-xl border shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <span className="font-black text-sm block" style={{ color: 'var(--accent-primary)' }}>Millimeter (mm)</span>
              <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>1/1,000 of a meter</span>
              <span className="text-[9px] text-blue-600 dark:text-blue-400 block mt-1 font-bold">Tiny tip</span>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 12. PERIMETER, AREA, VOLUME BOARD
     * ---------------------------------------------------- */
    case 'perimeter_area_volume_board':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-amber-700 dark:text-amber-300">
              1D vs 2D vs 3D Spatial Geometry
            </span>
            <span className="font-medium text-amber-900 dark:text-amber-200">
              Fence vs Carpet Tiles vs Water Cubes
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div
              className="p-3 rounded-xl border space-y-1 shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <span className="text-[10px] font-bold block" style={{ color: 'var(--contrast-warm)' }}>1D: Perimeter</span>
              <span className="text-sm font-black block" style={{ color: 'var(--text-primary)' }}>The Fence</span>
              <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Walk around outside: 2(L + W) [cm, m]</p>
            </div>
            <div
              className="p-3 rounded-xl border space-y-1 shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <span className="text-[10px] font-bold block" style={{ color: 'var(--accent-primary)' }}>2D: Area</span>
              <span className="text-sm font-black block" style={{ color: 'var(--text-primary)' }}>Carpet Tiles</span>
              <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Cover inside: L × W [cm², m²]</p>
            </div>
            <div
              className="p-3 rounded-xl border space-y-1 shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <span className="text-[10px] font-bold block" style={{ color: 'var(--contrast-teal)' }}>3D: Volume</span>
              <span className="text-sm font-black block" style={{ color: 'var(--text-primary)' }}>Water Blocks</span>
              <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Fill tank: L × W × H [cm³, m³]</p>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 13. ANGLES CLOCK BOARD
     * ---------------------------------------------------- */
    case 'angles_clock_board':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-blue-500/10 border-blue-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-blue-700 dark:text-blue-300">
              Angle Rotational Turns: The Clock Face
            </span>
            <span className="font-medium text-blue-900 dark:text-blue-200">
              Circle = 360° | Straight line = 180°
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div
              className="p-2.5 rounded-xl border shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <span className="font-black text-amber-500 block">Acute</span>
              <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>&lt; 90°</span>
              <span className="text-[9px] block" style={{ color: 'var(--text-secondary)' }}>Cute &amp; small</span>
            </div>
            <div
              className="p-2.5 rounded-xl border shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <span className="font-black text-emerald-500 block">Right Angle</span>
              <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>= 90°</span>
              <span className="text-[9px] block" style={{ color: 'var(--text-secondary)' }}>Book corner</span>
            </div>
            <div
              className="p-2.5 rounded-xl border shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <span className="font-black text-blue-500 block">Obtuse</span>
              <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>90° - 180°</span>
              <span className="text-[9px] block" style={{ color: 'var(--text-secondary)' }}>Wide open</span>
            </div>
            <div
              className="p-2.5 rounded-xl border shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <span className="font-black text-purple-500 block">Reflex</span>
              <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>&gt; 180°</span>
              <span className="text-[9px] block" style={{ color: 'var(--text-secondary)' }}>Bent backwards</span>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 14. COORDINATES GRID BOARD
     * ---------------------------------------------------- */
    case 'coordinates_grid_board':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-indigo-500/10 border-indigo-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-indigo-700 dark:text-indigo-300">
              Coordinates (x, y): Along Corridor, Up Stairs
            </span>
            <span className="font-medium text-indigo-900 dark:text-indigo-200">
              X comes before Y in the alphabet!
            </span>
          </div>

          <div
            className="p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 shadow-2xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <div className="font-mono font-black text-base text-indigo-600 dark:text-indigo-400">
              ( -3 , 4 )
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                x = -3 (3 units LEFT along corridor)
              </span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                y = +4 (4 units UP the stairs)
              </span>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 15. ROMAN NUMERALS BOARD
     * ---------------------------------------------------- */
    case 'roman_numerals_board':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div
            className="p-3 rounded-xl border flex items-center justify-between text-xs"
            style={{
              backgroundColor: 'var(--bg-card-subtle)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-primary)',
            }}
          >
            <span className="font-extrabold" style={{ color: 'var(--accent-primary)' }}>
              7 Roman Symbols: Lucky Cows Drink Milk (L, C, D, M)
            </span>
            <span
              className="font-bold text-xs px-2.5 py-0.5 rounded-lg border shadow-2xs"
              style={{
                backgroundColor: 'var(--badge-bg)',
                color: 'var(--badge-text)',
                borderColor: 'var(--border-card-strong)',
              }}
            >
              Subtractive: IV = 4, IX = 9, XL = 40
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {[
              { sym: 'I', val: 1 },
              { sym: 'V', val: 5 },
              { sym: 'X', val: 10 },
              { sym: 'L', val: 50 },
              { sym: 'C', val: 100 },
              { sym: 'D', val: 500 },
              { sym: 'M', val: 1000 },
            ].map((r) => (
              <div
                key={r.sym}
                className="p-2.5 rounded-xl border shadow-2xs"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-card)',
                }}
              >
                <span className="font-black text-base font-serif block" style={{ color: 'var(--accent-primary)' }}>
                  {r.sym}
                </span>
                <span className="text-xs font-bold block" style={{ color: 'var(--text-secondary)' }}>
                  {r.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 16. AVERAGES RHYME BOARD
     * ---------------------------------------------------- */
    case 'averages_rhyme_board':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-purple-500/10 border-purple-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-purple-700 dark:text-purple-300">
              The Famous Average Rhyme: Hey Diddle Diddle
            </span>
            <span className="font-medium text-purple-900 dark:text-purple-200">
              Unforgettable SATs checklist
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div
              className="p-3 rounded-xl border space-y-1 shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <span className="text-[10px] font-bold text-purple-500 block">Hey Diddle Diddle</span>
              <span className="font-black text-sm block" style={{ color: 'var(--text-primary)' }}>Median's the Middle</span>
              <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Middle number in ascending order</p>
            </div>
            <div
              className="p-3 rounded-xl border space-y-1 shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <span className="text-[10px] font-bold text-blue-500 block">Add &amp; Divide</span>
              <span className="font-black text-sm block" style={{ color: 'var(--text-primary)' }}>For the Mean</span>
              <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Total sum ÷ count of numbers</p>
            </div>
            <div
              className="p-3 rounded-xl border space-y-1 shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <span className="text-[10px] font-bold text-amber-500 block">Most Popular</span>
              <span className="font-black text-sm block" style={{ color: 'var(--text-primary)' }}>The Mode</span>
              <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Number appearing most times</p>
            </div>
            <div
              className="p-3 rounded-xl border space-y-1 shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <span className="text-[10px] font-bold text-emerald-500 block">Difference</span>
              <span className="font-black text-sm block" style={{ color: 'var(--text-primary)' }}>The Range</span>
              <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Highest value - Lowest value</p>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 17. WORD PROBLEMS BAR BOARD
     * ---------------------------------------------------- */
    case 'word_problems_bar_board':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div
            className="p-3 rounded-xl border flex items-center justify-between text-xs"
            style={{
              backgroundColor: 'var(--bg-card-subtle)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-primary)',
            }}
          >
            <span className="font-extrabold" style={{ color: 'var(--accent-primary)' }}>
              Singapore Comparison Bar Model: Liam has £12 more than Maya (Total £48)
            </span>
            <span
              className="font-bold text-xs px-2.5 py-1 rounded-lg border shadow-2xs"
              style={{
                backgroundColor: 'var(--badge-bg)',
                color: 'var(--badge-text)',
                borderColor: 'var(--border-card-strong)',
              }}
            >
              Subtract difference first: 48 − 12 = 36!
            </span>
          </div>

          <div
            className="p-4 rounded-xl border space-y-3 shadow-xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-16 font-black" style={{ color: 'var(--tool-model1-badge-text)' }}>Maya:</span>
                <div
                  className="w-24 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-xs border"
                  style={{
                    backgroundColor: 'var(--tool-model1-bg)',
                    color: 'var(--tool-model1-text)',
                    borderColor: 'var(--border-card-strong)',
                  }}
                >
                  £18
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 font-black" style={{ color: 'var(--tool-model2-badge-text)' }}>Liam:</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-24 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-xs border"
                    style={{
                      backgroundColor: 'var(--tool-model1-bg)',
                      color: 'var(--tool-model1-text)',
                      borderColor: 'var(--border-card-strong)',
                    }}
                  >
                    £18
                  </div>
                  <div
                    className="w-16 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-xs border"
                    style={{
                      backgroundColor: 'var(--tool-model2-bg)',
                      color: 'var(--tool-model2-text)',
                      borderColor: 'var(--border-card-strong)',
                    }}
                  >
                    +£12
                  </div>
                </div>
                <span className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>
                  = £30
                </span>
              </div>
            </div>

            <div
              className="pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs"
              style={{
                borderColor: 'var(--border-card)',
                color: 'var(--text-secondary)',
              }}
            >
              <span>Step 1: £48 − £12 = £36</span>
              <span>Step 2: £36 ÷ 2 = £18 (Maya)</span>
              <span>Step 3: £18 + £12 = £30 (Liam)</span>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 18. FDP BENCHMARK HIGHWAY
     * ---------------------------------------------------- */
    case 'fdp_benchmark_highway': {
      const benchmarks = [
        { label: '1/2', fraction: '\\frac{1}{2}', decimal: '0.5', percent: '50%', color: 'from-blue-500 to-indigo-600', width: '50%' },
        { label: '1/4', fraction: '\\frac{1}{4}', decimal: '0.25', percent: '25%', color: 'from-emerald-500 to-teal-600', width: '25%' },
        { label: '3/4', fraction: '\\frac{3}{4}', decimal: '0.75', percent: '75%', color: 'from-amber-500 to-orange-600', width: '75%' },
        { label: '1/5', fraction: '\\frac{1}{5}', decimal: '0.2', percent: '20%', color: 'from-purple-500 to-pink-600', width: '20%' },
        { label: '2/5', fraction: '\\frac{2}{5}', decimal: '0.4', percent: '40%', color: 'from-purple-600 to-indigo-600', width: '40%' },
        { label: '1/10', fraction: '\\frac{1}{10}', decimal: '0.1', percent: '10%', color: 'from-rose-500 to-red-600', width: '10%' },
        { label: '1/8', fraction: '\\frac{1}{8}', decimal: '0.125', percent: '12.5%', color: 'from-cyan-500 to-blue-600', width: '12.5%' },
      ];
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-blue-500/10 border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="font-extrabold text-blue-700 dark:text-blue-300">
              ⚡ The Golden Benchmark Highway: Instant Conversions
            </span>
            <span className="font-medium text-blue-900 dark:text-blue-200">
              Tap any benchmark to see Fraction ↔ Decimal ↔ Percentage alignment!
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {benchmarks.map((b, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border flex flex-col items-center justify-between gap-2 shadow-xs hover:scale-102 transition-all cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-card)',
                }}
                onClick={() => playSound('pop')}
              >
                <div className="text-sm font-black text-blue-600 dark:text-blue-400">
                  <MathView math={b.fraction} />
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${b.color}`}
                    style={{ width: b.width }}
                  />
                </div>
                <div className="flex items-center justify-between w-full text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span>{b.decimal}</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">{b.percent}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl border bg-black/5 dark:bg-white/5 text-xs text-center font-bold text-slate-700 dark:text-slate-300">
            💡 Pro-Tip: <MathView math="\\frac{1}{5} = 20\\%" /> means <MathView math="\\frac{3}{5} = 3 \\times 20\\% = 60\\%" />! Benchmarks unlock every multiple.
          </div>
        </div>
      );
    }

    /* ----------------------------------------------------
     * 19. FDP LEGO BLOCKS (Mental Percentage Builder)
     * ---------------------------------------------------- */
    case 'fdp_lego_blocks': {
      const [targetVal, setTargetVal] = useState<number>(80);
      const [activeBlocks, setActiveBlocks] = useState<{ id: string; pct: number; label: string }[]>([
        { id: '1', pct: 10, label: '10%' },
        { id: '2', pct: 5, label: '5%' },
      ]);

      const blockTen = targetVal * 0.1;
      const blockFive = targetVal * 0.05;
      const blockOne = targetVal * 0.01;
      const blockFifty = targetVal * 0.5;

      const totalPercent = activeBlocks.reduce((sum, b) => sum + b.pct, 0);
      const totalCalculated = (targetVal * totalPercent) / 100;

      const addBlock = (pct: number, label: string) => {
        setActiveBlocks((prev) => [...prev, { id: Math.random().toString(), pct, label }]);
        playSound('click');
      };

      const removeBlock = (id: string) => {
        setActiveBlocks((prev) => prev.filter((b) => b.id !== id));
        playSound('pop');
      };

      const resetBlocks = () => {
        setActiveBlocks([]);
        playSound('click');
      };

      return (
        <div className="space-y-4 animate-fadeIn">
          {/* Header controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border bg-amber-500/10 border-amber-500/20 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-amber-800 dark:text-amber-200">Base Number (£/units):</span>
              {[80, 240, 160, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setTargetVal(val);
                    playSound('click');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-black border text-xs cursor-pointer transition-all ${
                    targetVal === val
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {val === 80 ? '£80' : val}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={resetBlocks}
              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-1"
            >
              <RefreshCw size={12} /> Clear Blocks
            </button>
          </div>

          {/* Lego toolbox buttons */}
          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Snap a Lego Block:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => addBlock(10, '10%')}
                className="p-2.5 rounded-xl border bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300 font-extrabold text-xs flex flex-col items-center gap-0.5 cursor-pointer shadow-2xs transition-all active:scale-95"
              >
                <span>+ 10% Block</span>
                <span className="text-[10px] font-medium opacity-80">({targetVal} ÷ 10 = {blockTen})</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock(5, '5%')}
                className="p-2.5 rounded-xl border bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs flex flex-col items-center gap-0.5 cursor-pointer shadow-2xs transition-all active:scale-95"
              >
                <span>+ 5% Block</span>
                <span className="text-[10px] font-medium opacity-80">(Half of 10% = {blockFive})</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock(1, '1%')}
                className="p-2.5 rounded-xl border bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-700 dark:text-purple-300 font-extrabold text-xs flex flex-col items-center gap-0.5 cursor-pointer shadow-2xs transition-all active:scale-95"
              >
                <span>+ 1% Block</span>
                <span className="text-[10px] font-medium opacity-80">({targetVal} ÷ 100 = {blockOne})</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock(50, '50%')}
                className="p-2.5 rounded-xl border bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300 font-extrabold text-xs flex flex-col items-center gap-0.5 cursor-pointer shadow-2xs transition-all active:scale-95"
              >
                <span>+ 50% Block</span>
                <span className="text-[10px] font-medium opacity-80">(Half of {targetVal} = {blockFifty})</span>
              </button>
            </div>
          </div>

          {/* Active Stacking Tray */}
          <div
            className="p-4 rounded-xl border space-y-3 shadow-xs"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                Active Lego Construction ({activeBlocks.length} blocks):
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono">
                  {totalPercent}% of {targetVal}
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  = £{totalCalculated}
                </span>
              </div>
            </div>

            {activeBlocks.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                Tap the buttons above to snap 10%, 5%, or 1% Lego blocks together!
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {activeBlocks.map((b) => {
                  const val = (targetVal * b.pct) / 100;
                  return (
                    <div
                      key={b.id}
                      className="px-3 py-1.5 rounded-lg border flex items-center gap-2 bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-200 text-xs font-bold shadow-2xs animate-scaleIn"
                    >
                      <span>🧱 {b.label} (£{val})</span>
                      <button
                        type="button"
                        onClick={() => removeBlock(b.id)}
                        className="text-slate-400 hover:text-red-500 cursor-pointer ml-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Formula sum string */}
            {activeBlocks.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>
                  {activeBlocks.map((b) => `£${(targetVal * b.pct) / 100}`).join(' + ')} = £{totalCalculated}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-sans font-black">
                  🎯 {totalPercent}% calculated mentally!
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    /* ----------------------------------------------------
     * 20. FDP REVERSE PERCENTAGE TRICK (x% of y = y% of x)
     * ---------------------------------------------------- */
    case 'fdp_reverse_trick': {
      const [exampleIdx, setExampleIdx] = useState<number>(0);
      const [isFlipped, setIsFlipped] = useState<boolean>(false);

      const examples = [
        {
          x: 16,
          y: 50,
          originalStr: '16% of 50',
          flippedStr: '50% of 16',
          originalThinking: '16% of 50 sounds awkward...',
          flippedThinking: '50% of 16 just means HALF of 16 = 8!',
          result: 8,
        },
        {
          x: 8,
          y: 25,
          originalStr: '8% of 25',
          flippedStr: '25% of 8',
          originalThinking: '8% of 25 sounds tricky...',
          flippedThinking: '25% of 8 just means ONE QUARTER (1/4) of 8 = 2!',
          result: 2,
        },
        {
          x: 4,
          y: 75,
          originalStr: '4% of 75',
          flippedStr: '75% of 4',
          originalThinking: '4% of 75 takes long to calculate...',
          flippedThinking: '75% of 4 means THREE QUARTERS (3/4) of 4 = 3!',
          result: 3,
        },
        {
          x: 12,
          y: 50,
          originalStr: '12% of 50',
          flippedStr: '50% of 12',
          originalThinking: '12% of 50 requires division...',
          flippedThinking: '50% of 12 is simply half of 12 = 6!',
          result: 6,
        },
      ];

      const cur = examples[exampleIdx];

      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-purple-500/10 border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="font-extrabold text-purple-700 dark:text-purple-300">
              ✨ The Reverse Percentage Magic Trick: <MathView math="x\\% \\text{ of } y = y\\% \\text{ of } x" />
            </span>
            <span className="font-medium text-purple-900 dark:text-purple-200">
              Swap tricky numbers to create instant mental calculations!
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {examples.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setExampleIdx(idx);
                  setIsFlipped(false);
                  playSound('click');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                  exampleIdx === idx
                    ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                    : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}
              >
                {ex.originalStr}
              </button>
            ))}
          </div>

          {/* Interactive Flip Card Container */}
          <div
            className="p-5 rounded-2xl border text-center space-y-4 shadow-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
          >
            <div className="flex items-center justify-center gap-4">
              <div className={`p-4 rounded-xl border transition-all duration-500 ${!isFlipped ? 'bg-amber-500/15 border-amber-500/40 scale-105 shadow-md' : 'opacity-40 border-slate-300'}`}>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Standard Way</span>
                <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">{cur.originalStr}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsFlipped(!isFlipped);
                  playSound('whoosh');
                }}
                className="p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                title="Click to Flip!"
              >
                <RefreshCw size={20} className={isFlipped ? 'rotate-180 transition-transform duration-500' : 'transition-transform duration-500'} />
              </button>

              <div className={`p-4 rounded-xl border transition-all duration-500 ${isFlipped ? 'bg-emerald-500/15 border-emerald-500/40 scale-105 shadow-md' : 'opacity-40 border-slate-300'}`}>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Magic Flipped Way</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{cur.flippedStr}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
              {isFlipped ? (
                <div className="space-y-1">
                  <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm block">
                    ⚡ {cur.flippedThinking}
                  </span>
                  <span>Answer = {cur.result}! Because both sides equal <MathView math={`\\frac{${cur.x} \\times ${cur.y}}{100} = ${cur.result}`} />.</span>
                </div>
              ) : (
                <span>Tap the purple circle to flip the numbers and solve in 1 second!</span>
              )}
            </div>
          </div>
        </div>
      );
    }

    /* ----------------------------------------------------
     * 21. PLACE VALUE SHIFT (Multiplying / Dividing by 10, 100, 1000)
     * ---------------------------------------------------- */
    case 'place_value_shift': {
      const [shiftFactor, setShiftFactor] = useState<number>(100);
      const baseNum = 3.4;
      const computedResult = Number((baseNum * shiftFactor).toFixed(3));

      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-blue-500/10 border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="font-extrabold text-blue-700 dark:text-blue-300">
              The Digit Slide Dance: The decimal point NEVER moves!
            </span>
            <span className="font-medium text-blue-900 dark:text-blue-200">
              Digits slide across columns to multiply or divide
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: '× 10 (Slide 1 Left)', factor: 10 },
              { label: '× 100 (Slide 2 Left)', factor: 100 },
              { label: '× 1,000 (Slide 3 Left)', factor: 1000 },
              { label: '÷ 10 (Slide 1 Right)', factor: 0.1 },
            ].map((opt) => (
              <button
                key={opt.factor}
                type="button"
                onClick={() => {
                  setShiftFactor(opt.factor);
                  playSound('click');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                  shiftFactor === opt.factor
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Place Value Column Display */}
          <div
            className="p-4 rounded-xl border space-y-3 shadow-xs"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
          >
            <div className="text-center font-mono text-lg font-black text-blue-600 dark:text-blue-400">
              {baseNum} {shiftFactor >= 1 ? `× ${shiftFactor}` : `÷ ${1 / shiftFactor}`} = {computedResult}
            </div>

            <div className="grid grid-cols-5 gap-1 text-center font-mono text-xs">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 block">Thousands</span>
                <span className="text-sm font-black">{computedResult >= 1000 ? Math.floor((computedResult / 1000) % 10) : '-'}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 block">Hundreds</span>
                <span className="text-sm font-black">{computedResult >= 100 ? Math.floor((computedResult / 100) % 10) : '-'}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 block">Tens</span>
                <span className="text-sm font-black">{computedResult >= 10 ? Math.floor((computedResult / 10) % 10) : '-'}</span>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300">
                <span className="text-[10px] font-bold block">Ones</span>
                <span className="text-sm font-black">{Math.floor(computedResult) % 10}</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                <span className="text-[10px] font-bold block">Tenths</span>
                <span className="text-sm font-black">{Math.floor((computedResult * 10) % 10)}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    /* ----------------------------------------------------
     * 22. NEGATIVE THERMOMETER (Sub-Zero Elevator)
     * ---------------------------------------------------- */
    case 'negative_thermometer': {
      const [startTemp, setStartTemp] = useState<number>(2);
      const [dropAmount, setDropAmount] = useState<number>(5);
      const endTemp = startTemp - dropAmount;

      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-cyan-500/10 border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="font-extrabold text-cyan-700 dark:text-cyan-300">
              ❄️ Sub-Zero Winter Thermometer &amp; Number Elevator
            </span>
            <span className="font-medium text-cyan-900 dark:text-cyan-200">
              Count back through zero: {startTemp}°C − {dropAmount}°C = {endTemp}°C
            </span>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">Start:</span>
              {[2, 5, 0, -2].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setStartTemp(t);
                    playSound('click');
                  }}
                  className={`px-2 py-1 rounded-md font-black border text-xs cursor-pointer ${
                    startTemp === t ? 'bg-cyan-600 text-white border-cyan-700' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {t}°C
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">Drop by:</span>
              {[3, 5, 7].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDropAmount(d);
                    playSound('click');
                  }}
                  className={`px-2 py-1 rounded-md font-black border text-xs cursor-pointer ${
                    dropAmount === d ? 'bg-rose-600 text-white border-rose-700' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {d}°C
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Number Line */}
          <div
            className="p-4 rounded-xl border space-y-3 shadow-xs"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              {[-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((val) => {
                const isStart = val === startTemp;
                const isEnd = val === endTemp;
                const isZero = val === 0;

                return (
                  <div key={val} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${
                        isEnd
                          ? 'bg-rose-600 text-white border-rose-700 scale-125 shadow-sm'
                          : isStart
                          ? 'bg-cyan-600 text-white border-cyan-700 scale-110 shadow-sm'
                          : isZero
                          ? 'bg-amber-400 text-black border-amber-500'
                          : val < 0
                          ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-300'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200'
                      }`}
                    >
                      {val}
                    </div>
                    {isZero && <span className="text-[8px] font-bold text-amber-500">ZERO</span>}
                  </div>
                );
              })}
            </div>

            <div className="text-center font-bold text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
              Calculation: <span className="font-mono font-black text-rose-600 dark:text-rose-400">{startTemp} − {dropAmount} = {endTemp}°C</span> (Travels {dropAmount} steps left past 0!)
            </div>
          </div>
        </div>
      );
    }

    /* ----------------------------------------------------
     * 23. RATIO SQUASH DRINK MIXTURE
     * ---------------------------------------------------- */
    case 'ratio_squash_drink':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-amber-700 dark:text-amber-300">
              🍹 Part-to-Part vs Part-to-Whole: 1 Part Squash to 4 Parts Water
            </span>
            <span className="font-bold text-xs text-amber-800 dark:text-amber-200">
              Total Parts = 1 + 4 = 5 parts
            </span>
          </div>

          <div
            className="p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-around gap-4 shadow-xs"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
          >
            {/* Visual Glass */}
            <div className="w-24 h-40 border-4 border-slate-300 dark:border-slate-600 rounded-b-2xl overflow-hidden flex flex-col justify-end relative shadow-inner bg-slate-50 dark:bg-slate-900">
              <div className="w-full h-4/5 bg-cyan-400/80 flex items-center justify-center text-[10px] font-black text-cyan-900 border-t border-cyan-300">
                Water (4/5)
              </div>
              <div className="w-full h-1/5 bg-amber-500 flex items-center justify-center text-[10px] font-black text-white">
                Squash (1/5)
              </div>
            </div>

            {/* Explanatory Cards */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg border bg-amber-500/10 border-amber-500/20">
                <span className="font-bold text-amber-800 dark:text-amber-300 block">Ratio (Part to Part):</span>
                <span className="font-black text-sm">1 : 4 (Squash : Water)</span>
              </div>
              <div className="p-2.5 rounded-lg border bg-cyan-500/10 border-cyan-500/20">
                <span className="font-bold text-cyan-800 dark:text-cyan-300 block">Fraction (Part to Whole):</span>
                <span className="font-black text-sm">Squash is 1/5 of the total drink!</span>
              </div>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 24. RATIO RECIPE SCALING
     * ---------------------------------------------------- */
    case 'ratio_recipe_scaling': {
      const [people, setPeople] = useState<number>(10);
      const flourPerPerson = 50; // g
      const totalFlour = people * flourPerPerson;

      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
              🥞 The 1-Portion Unit Rate Trick: Scaling Recipes
            </span>
            <span className="font-medium text-emerald-900 dark:text-emerald-200">
              Find 1 portion first (divide), then multiply for {people} people!
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="font-bold text-slate-500">Target Servings:</span>
            {[2, 4, 8, 10, 12].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPeople(p);
                  playSound('click');
                }}
                className={`px-3 py-1 rounded-lg font-black border cursor-pointer ${
                  people === p ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {p} people
              </button>
            ))}
          </div>

          <div
            className="p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs shadow-xs"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
          >
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-1">
              <span className="font-bold text-blue-800 dark:text-blue-300 block">Step 1: Unit Rate (1 Person)</span>
              <span className="font-mono text-xs">200 g flour ÷ 4 people = <strong>50 g / person</strong></span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Step 2: Scale for {people} People</span>
              <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                {people} × 50 g = {totalFlour} g of flour!
              </span>
            </div>
          </div>
        </div>
      );
    }

    /* ----------------------------------------------------
     * 25. RATIO DIFFERENCE PUZZLES
     * ---------------------------------------------------- */
    case 'ratio_difference_board':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-purple-500/10 border-purple-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-purple-700 dark:text-purple-300">
              🧩 Difference Puzzles: When Someone Gets MORE
            </span>
            <span className="font-bold text-purple-800 dark:text-purple-200">
              Liam &amp; Maya (5:3). Liam gets 6 MORE stickers.
            </span>
          </div>

          <div
            className="p-4 rounded-xl border space-y-3 shadow-xs"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
          >
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-16 font-black text-slate-700 dark:text-slate-300">Maya (3):</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="w-10 h-8 rounded bg-blue-500 text-white font-bold flex items-center justify-center text-xs">
                      3
                    </div>
                  ))}
                </div>
                <span className="font-bold ml-2">= 9 stickers</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-16 font-black text-slate-700 dark:text-slate-300">Liam (5):</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="w-10 h-8 rounded bg-blue-500 text-white font-bold flex items-center justify-center text-xs">
                      3
                    </div>
                  ))}
                  {[4, 5].map((n) => (
                    <div key={n} className="w-10 h-8 rounded bg-amber-500 text-white font-black flex items-center justify-center text-xs animate-pulse">
                      3
                    </div>
                  ))}
                </div>
                <span className="font-bold ml-2 text-amber-600 dark:text-amber-400">= 15 stickers (+6 more!)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              Difference = 5 − 3 = 2 parts. If 2 parts = 6 stickers, 1 part = 3 stickers!
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 26. BIDMAS BRACKETS BOARD
     * ---------------------------------------------------- */
    case 'bidmas_brackets_board':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-amber-700 dark:text-amber-300">
              👑 VIP Brackets: Jump Straight to the Front of the Queue!
            </span>
            <span className="font-bold text-amber-800 dark:text-amber-200">
              Brackets override normal multiplication order
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Without Brackets:</span>
              <div className="text-base font-mono font-black">2 + 3 × 4</div>
              <div className="text-slate-600 dark:text-slate-300">
                Step 1: Multiply first (3 × 4 = 12)<br />
                Step 2: Add 2 ➔ <strong className="text-blue-600 dark:text-blue-400">14</strong>
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/30 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">With VIP Brackets:</span>
              <div className="text-base font-mono font-black text-amber-600 dark:text-amber-400">(2 + 3) × 4</div>
              <div className="text-slate-700 dark:text-slate-200">
                Step 1: Inside brackets first (2 + 3 = 5)<br />
                Step 2: Multiply 5 × 4 ➔ <strong className="text-emerald-600 dark:text-emerald-400">20</strong>
              </div>
            </div>
          </div>
        </div>
      );

    /* ----------------------------------------------------
     * 27. BIDMAS LEFT TO RIGHT (Equal Rank Twins)
     * ---------------------------------------------------- */
    case 'bidmas_left_to_right':
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 rounded-xl border bg-blue-500/10 border-blue-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-blue-700 dark:text-blue-300">
              📖 Equal Rank Twins: Work strictly LEFT TO RIGHT!
            </span>
            <span className="font-bold text-blue-800 dark:text-blue-200">
              (÷ and × are tied) &amp; (+ and − are tied)
            </span>
          </div>

          <div
            className="p-4 rounded-xl border space-y-3 shadow-xs"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
          >
            <div className="text-base font-mono font-black text-center text-blue-600 dark:text-blue-400">
              12 ÷ 3 × 2
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200">
                <span className="font-black block">✓ Correct (Left to Right):</span>
                12 ÷ 3 = 4, then 4 × 2 = <strong className="text-sm">8</strong>
              </div>

              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-800 dark:text-red-200">
                <span className="font-black block">✗ Common Mistake:</span>
                Doing 3 × 2 = 6 first, then 12 ÷ 6 = 2 (Wrong!)
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};
