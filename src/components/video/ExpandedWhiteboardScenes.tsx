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
              <span className="text-xs font-bold text-stone-500">Pick tiles:</span>
              {[6, 7, 8, 9, 12, 13, 15, 16, 17].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setSelectedPrimeTestNum(n);
                    setAttemptedRows(2);
                    playSound('click');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    selectedPrimeTestNum === n
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs scale-105'
                      : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-stone-500">Rows:</span>
              {[1, 2, 3, 4].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setAttemptedRows(r);
                    playSound(selectedPrimeTestNum % r === 0 ? 'correct' : 'wrong');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    attemptedRows === r
                      ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                      : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Tile Grid */}
          <div className="p-4 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center min-h-[140px] gap-2">
            <div className="space-y-1.5">
              {Array.from({ length: attemptedRows }).map((_, rIdx) => {
                const rowCount = q + (rIdx < rem ? 1 : 0);
                return (
                  <div key={rIdx} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-stone-400 font-mono w-10 text-right">R{rIdx + 1}:</span>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: rowCount }).map((_, cIdx) => {
                        const isStickingOut = rIdx < rem && cIdx === rowCount - 1 && q > 0;
                        return (
                          <div
                            key={cIdx}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs font-black text-white shadow-2xs transition-all ${
                              isStickingOut ? 'bg-rose-500 animate-pulse ring-2 ring-rose-400' : 'bg-amber-500'
                            }`}
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
            <div className="mt-3 pt-3 border-t w-full text-center text-xs sm:text-sm font-extrabold">
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

          <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
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
            <span className="text-xs font-bold text-stone-500">Pick Square:</span>
            {[2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setSelectedSquareN(n);
                  playSound('click');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                  selectedSquareN === n
                    ? 'bg-blue-600 text-white border-blue-700 shadow-2xs scale-105'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                }`}
              >
                {n}² = {n * n}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center">
            <span className="text-xs font-black text-blue-600 dark:text-blue-400 mb-2">
              {selectedSquareN} wide × {selectedSquareN} high = {selectedSquareN * selectedSquareN} tiles (Square!)
            </span>
            <div
              className="grid gap-1.5 p-3 rounded-xl border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm"
              style={{
                gridTemplateColumns: `repeat(${selectedSquareN}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: selectedSquareN * selectedSquareN }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs"
                >
                  {idx + 1}
                </div>
              ))}
            </div>

            <div className="mt-4 p-2.5 rounded-lg border bg-blue-500/10 border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 w-full text-center">
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
            <span className="text-xs font-bold text-stone-500">Pick Cube:</span>
            {[1, 2, 3, 4].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setSelectedCubeN(c);
                  playSound('click');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                  selectedCubeN === c
                    ? 'bg-purple-600 text-white border-purple-700 shadow-2xs scale-105'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                }`}
              >
                {c}³ = {c * c * c}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center space-y-3">
            <span className="text-xs sm:text-sm font-black text-purple-700 dark:text-purple-300">
              {selectedCubeN} wide × {selectedCubeN} deep × {selectedCubeN} high = {selectedCubeN * selectedCubeN * selectedCubeN} Cubes
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {Array.from({ length: selectedCubeN }).map((_, lIdx) => (
                <div key={lIdx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-stone-400">Layer {lIdx + 1}</span>
                  <div
                    className="grid gap-1 p-1.5 rounded-lg border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20"
                    style={{ gridTemplateColumns: `repeat(${selectedCubeN}, minmax(0, 1fr))` }}
                  >
                    {Array.from({ length: selectedCubeN * selectedCubeN }).map((_, bIdx) => (
                      <div
                        key={bIdx}
                        className="w-6 h-6 rounded bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs"
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

          <div className="p-4 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-around py-3 px-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30">
              {[
                { num: 1, pair: 12, color: 'text-rose-500 border-rose-400' },
                { num: 2, pair: 6, color: 'text-amber-500 border-amber-400' },
                { num: 3, pair: 4, color: 'text-emerald-500 border-emerald-400' },
                { num: 4, pair: 3, color: 'text-emerald-500 border-emerald-400' },
                { num: 6, pair: 2, color: 'text-amber-500 border-amber-400' },
                { num: 12, pair: 1, color: 'text-rose-500 border-rose-400' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs ${item.color}`}>
                    {item.num}
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">× {item.pair}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 font-bold">
                1 × 12 = 12
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                2 × 6 = 12
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
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
              <div key={idx} className="p-2 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 space-y-1">
                <span className="text-[10px] font-bold text-stone-400 block">{col.title}</span>
                <span className="text-sm font-black text-sky-600 dark:text-sky-400 block">{col.val}</span>
                <span className="text-[9px] font-mono text-stone-400 block">{col.power}</span>
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

          <div className="p-4 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center w-1/3">
              <span className="text-[10px] font-bold uppercase text-rose-500 block">Roll Down</span>
              <span className="text-sm font-black text-rose-600 dark:text-rose-400">0, 1, 2, 3, 4</span>
              <p className="text-[10px] text-stone-500 mt-1">Stays at lower ten/hundred</p>
            </div>

            <div className="text-center font-black text-lg text-amber-500">
              ▲<br /><span className="text-xs">Peak 5</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center w-1/3">
              <span className="text-[10px] font-bold uppercase text-emerald-500 block">Climb Over</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">5, 6, 7, 8, 9</span>
              <p className="text-[10px] text-stone-500 mt-1">Rounds UP to next benchmark</p>
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
              The 100-Square Grid: Fractions, Decimals & Percentages
            </span>
            <span className="font-medium text-teal-900 dark:text-teal-200">
              Shaded: {fdpShadedCount} squares = {fdpShadedCount}% = {fdpShadedCount / 100}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-stone-500">Benchmarks:</span>
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
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                  fdpShadedCount === b.val
                    ? 'bg-teal-600 text-white border-teal-700 shadow-2xs'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-around gap-4">
            {/* 10x10 Mini Grid */}
            <div className="grid grid-cols-10 gap-0.5 p-1 rounded-lg border border-teal-500/40 bg-stone-100 dark:bg-stone-800">
              {Array.from({ length: 100 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[2px] transition-colors ${
                    idx < fdpShadedCount ? 'bg-teal-500' : 'bg-white dark:bg-stone-900'
                  }`}
                />
              ))}
            </div>

            {/* Equivalent Values */}
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-400 w-24">Fraction:</span>
                <span className="font-black text-teal-600 dark:text-teal-400">
                  {fdpShadedCount}/100 {fdpShadedCount === 50 && '(= 1/2)'} {fdpShadedCount === 25 && '(= 1/4)'} {fdpShadedCount === 75 && '(= 3/4)'} {fdpShadedCount === 10 && '(= 1/10)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-400 w-24">Decimal:</span>
                <span className="font-black text-teal-600 dark:text-teal-400">
                  {(fdpShadedCount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-400 w-24">Percentage:</span>
                <span className="font-black text-teal-600 dark:text-teal-400">
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
          <div className="p-3 rounded-xl border bg-indigo-500/10 border-indigo-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-indigo-700 dark:text-indigo-300">
              Ratio Bar Model: Sharing £35 in ratio 2:3
            </span>
            <span className="font-medium text-indigo-900 dark:text-indigo-200">
              5 equal parts total (£7 per block)
            </span>
          </div>

          <div className="p-4 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-14 text-xs font-black text-indigo-600 dark:text-indigo-400">Maya (2):</span>
                <div className="flex items-center gap-1">
                  <div className="w-16 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-black text-xs">£7</div>
                  <div className="w-16 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-black text-xs">£7</div>
                </div>
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">= £14</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-14 text-xs font-black text-purple-600 dark:text-purple-400">Liam (3):</span>
                <div className="flex items-center gap-1">
                  <div className="w-16 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center font-black text-xs">£7</div>
                  <div className="w-16 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center font-black text-xs">£7</div>
                  <div className="w-16 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center font-black text-xs">£7</div>
                </div>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300">= £21</span>
              </div>
            </div>

            <div className="pt-2 border-t flex items-center justify-between text-xs text-stone-500">
              <span>Total: £14 + £21 = £35</span>
              <span>1 Part = £35 ÷ 5 = £7</span>
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

          <div className="p-4 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 space-y-3">
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

            <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-center space-y-1 text-xs sm:text-sm">
              <span className="font-mono block text-stone-500">2 + (3 × 4)</span>
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

          <div className="p-4 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-around py-3 px-4 rounded-xl bg-stone-100 dark:bg-stone-800">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-stone-400">Left Pan</span>
                <div className="font-black text-sm text-amber-600 dark:text-amber-400">
                  {balanceStep === 1 && '2x + 3'}
                  {balanceStep === 2 && '2x (removed 3)'}
                  {balanceStep === 3 && 'x (divided by 2)'}
                </div>
              </div>

              <div className="text-xl font-black text-stone-400">=</div>

              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-stone-400">Right Pan</span>
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
                className={`px-3 py-1 rounded-lg text-xs font-bold border ${balanceStep === 1 ? 'bg-amber-500 text-white' : 'bg-white dark:bg-stone-800'}`}
              >
                Start: 2x + 3 = 11
              </button>
              <button
                type="button"
                onClick={() => { setBalanceStep(2); playSound('click'); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold border ${balanceStep === 2 ? 'bg-amber-500 text-white' : 'bg-white dark:bg-stone-800'}`}
              >
                Step 1: Subtract 3
              </button>
              <button
                type="button"
                onClick={() => { setBalanceStep(3); playSound('correct'); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold border ${balanceStep === 3 ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-stone-800'}`}
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
            <div className="p-3 rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30">
              <span className="font-black text-sm block">Kilometer (km)</span>
              <span className="text-[10px] text-stone-500 block">1,000 meters</span>
              <span className="text-[9px] text-emerald-600 block mt-1">× 1,000 to m</span>
            </div>
            <div className="p-3 rounded-xl border bg-teal-50 dark:bg-teal-950/20 border-teal-500/30">
              <span className="font-black text-sm block">Meter (m)</span>
              <span className="text-[10px] text-stone-500 block">Base Unit</span>
              <span className="text-[9px] text-teal-600 block mt-1">× 100 to cm</span>
            </div>
            <div className="p-3 rounded-xl border bg-cyan-50 dark:bg-cyan-950/20 border-cyan-500/30">
              <span className="font-black text-sm block">Centimeter (cm)</span>
              <span className="text-[10px] text-stone-500 block">1/100 of a meter</span>
              <span className="text-[9px] text-cyan-600 block mt-1">× 10 to mm</span>
            </div>
            <div className="p-3 rounded-xl border bg-blue-50 dark:bg-blue-950/20 border-blue-500/30">
              <span className="font-black text-sm block">Millimeter (mm)</span>
              <span className="text-[10px] text-stone-500 block">1/1,000 of a meter</span>
              <span className="text-[9px] text-blue-600 block mt-1">Tiny tip</span>
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
            <div className="p-3 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 space-y-1">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">1D: Perimeter</span>
              <span className="text-sm font-black text-stone-700 dark:text-stone-300 block">The Fence</span>
              <p className="text-[10px] text-stone-500">Walk around outside: 2(L + W) [cm, m]</p>
            </div>
            <div className="p-3 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 space-y-1">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block">2D: Area</span>
              <span className="text-sm font-black text-stone-700 dark:text-stone-300 block">Carpet Tiles</span>
              <p className="text-[10px] text-stone-500">Cover inside: L × W [cm², m²]</p>
            </div>
            <div className="p-3 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 space-y-1">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block">3D: Volume</span>
              <span className="text-sm font-black text-stone-700 dark:text-stone-300 block">Water Blocks</span>
              <p className="text-[10px] text-stone-500">Fill tank: L × W × H [cm³, m³]</p>
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
            <div className="p-2.5 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
              <span className="font-black text-amber-500 block">Acute</span>
              <span className="text-[10px] text-stone-400 block">&lt; 90°</span>
              <span className="text-[9px] text-stone-500 block">Cute & small</span>
            </div>
            <div className="p-2.5 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
              <span className="font-black text-emerald-500 block">Right Angle</span>
              <span className="text-[10px] text-stone-400 block">= 90°</span>
              <span className="text-[9px] text-stone-500 block">Book corner</span>
            </div>
            <div className="p-2.5 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
              <span className="font-black text-blue-500 block">Obtuse</span>
              <span className="text-[10px] text-stone-400 block">90° - 180°</span>
              <span className="text-[9px] text-stone-500 block">Wide open</span>
            </div>
            <div className="p-2.5 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
              <span className="font-black text-purple-500 block">Reflex</span>
              <span className="text-[10px] text-stone-400 block">&gt; 180°</span>
              <span className="text-[9px] text-stone-500 block">Bent backwards</span>
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

          <div className="p-4 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center space-y-2">
            <div className="font-mono font-black text-base text-indigo-600 dark:text-indigo-400">
              ( -3 , 4 )
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                x = -3 (3 units LEFT along corridor)
              </span>
              <span className="text-stone-400">→</span>
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
          <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-amber-700 dark:text-amber-300">
              7 Roman Symbols: Lucky Cows Drink Milk (L, C, D, M)
            </span>
            <span className="font-medium text-amber-900 dark:text-amber-200">
              Subtractive: IV = 4, IX = 9, XL = 40
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {[
              { sym: 'I', val: 1 },
              { sym: 'V', val: 5 },
              { sym: 'X', val: 10 },
              { sym: 'L', val: 50 },
              { sym: 'C', val: 100 },
              { sym: 'D', val: 500 },
              { sym: 'M', val: 1000 },
            ].map((r) => (
              <div key={r.sym} className="p-2 rounded-lg border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
                <span className="font-black text-sm text-amber-600 dark:text-amber-400 block">{r.sym}</span>
                <span className="text-[10px] text-stone-500 block">{r.val}</span>
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
            <div className="p-3 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 space-y-1">
              <span className="text-[10px] font-bold text-purple-500 block">Hey Diddle Diddle</span>
              <span className="font-black text-sm block">Median's the Middle</span>
              <p className="text-[10px] text-stone-500">Middle number in ascending order</p>
            </div>
            <div className="p-3 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 space-y-1">
              <span className="text-[10px] font-bold text-blue-500 block">Add & Divide</span>
              <span className="font-black text-sm block">For the Mean</span>
              <p className="text-[10px] text-stone-500">Total sum ÷ count of numbers</p>
            </div>
            <div className="p-3 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 space-y-1">
              <span className="text-[10px] font-bold text-amber-500 block">Most Popular</span>
              <span className="font-black text-sm block">The Mode</span>
              <p className="text-[10px] text-stone-500">Number appearing most times</p>
            </div>
            <div className="p-3 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 space-y-1">
              <span className="text-[10px] font-bold text-emerald-500 block">Difference</span>
              <span className="font-black text-sm block">The Range</span>
              <p className="text-[10px] text-stone-500">Highest value - Lowest value</p>
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
          <div className="p-3 rounded-xl border bg-indigo-500/10 border-indigo-500/20 flex items-center justify-between text-xs">
            <span className="font-extrabold text-indigo-700 dark:text-indigo-300">
              Singapore Comparison Bar Model: Liam has £12 more than Maya (Total £48)
            </span>
            <span className="font-medium text-indigo-900 dark:text-indigo-200">
              Subtract difference first: 48 - 12 = 36!
            </span>
          </div>

          <div className="p-4 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 space-y-3">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-16 font-black text-indigo-600 dark:text-indigo-400">Maya:</span>
                <div className="w-24 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-black">£18</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 font-black text-purple-600 dark:text-purple-400">Liam:</span>
                <div className="flex items-center gap-1">
                  <div className="w-24 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-black">£18</div>
                  <div className="w-16 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black">+£12</div>
                </div>
                <span className="font-bold text-purple-700 dark:text-purple-300">= £30</span>
              </div>
            </div>

            <div className="pt-2 border-t flex items-center justify-between text-xs text-stone-500">
              <span>Step 1: £48 - £12 = £36</span>
              <span>Step 2: £36 ÷ 2 = £18 (Maya)</span>
              <span>Step 3: £18 + £12 = £30 (Liam)</span>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};
