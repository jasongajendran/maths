import React, { useState } from 'react';
import { MathView } from '../MathView';
import { Sparkles, Info, RefreshCw, Compass, ArrowRight } from 'lucide-react';
import { ReadableCard } from '../ReadableCard';
import { AudioButton } from '../AudioButton';

export const CoordinatesTransformStudio: React.FC = () => {
  const [pointX, setPointX] = useState<number>(3);
  const [pointY, setPointY] = useState<number>(2);
  const [transformType, setTransformType] = useState<'none' | 'reflectX' | 'reflectY' | 'translate'>('none');
  const [transX, setTransX] = useState<number>(2);
  const [transY, setTransY] = useState<number>(-3);

  // Compute transformed point
  let newX = pointX;
  let newY = pointY;
  let transformDescription = 'Original Point A';

  if (transformType === 'reflectX') {
    newX = pointX;
    newY = -pointY;
    transformDescription = `Reflected across X-axis (y = 0): (x, y) ➔ (x, -y)`;
  } else if (transformType === 'reflectY') {
    newX = -pointX;
    newY = pointY;
    transformDescription = `Reflected across Y-axis (x = 0): (x, y) ➔ (-x, y)`;
  } else if (transformType === 'translate') {
    newX = pointX + transX;
    newY = pointY + transY;
    transformDescription = `Translated by vector (${transX >= 0 ? '+' + transX : transX}, ${transY >= 0 ? '+' + transY : transY})`;
  }

  // Grid coordinates range: -5 to +5
  const gridSize = 10;
  const scale = 24; // px per grid unit
  const center = (gridSize * scale) / 2;

  const toSvgX = (x: number) => center + x * scale;
  const toSvgY = (y: number) => center - y * scale;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header card */}
      <ReadableCard
        id="coords-tool-header"
        ariaLabel="Coordinates and Transformations Studio"
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
              <Compass size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                4-Quadrant Coordinates &amp; Reflection Sandbox
              </h2>
              <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Interactive Cartesian grid plotting, reflection mirror lines, and vector translations.
              </p>
            </div>
          </div>
          <AudioButton
            id="audio-coords-tool-intro"
            textToRead="Welcome to the Coordinates and Transformation Studio. Plot points across all 4 quadrants using the (x, y) along the corridor and up the stairs rule. Test reflections across the x-axis and y-axis, or apply translation vectors in real time."
            label="Tool Overview"
            size="sm"
          />
        </div>
      </ReadableCard>

      {/* Interactive Controls & Canvas */}
      <div
        className="p-5 border rounded-2xl shadow-xs space-y-4"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-card)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Point coordinate sliders */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="coord-x" className="text-xs font-bold text-blue-600 dark:text-blue-400">
                X (Corridor):
              </label>
              <input
                id="coord-x"
                type="range"
                min="-5"
                max="5"
                value={pointX}
                onChange={(e) => setPointX(parseInt(e.target.value))}
                className="w-24 accent-blue-600 cursor-pointer"
              />
              <span className="font-mono text-xs font-bold w-6">{pointX}</span>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="coord-y" className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Y (Stairs):
              </label>
              <input
                id="coord-y"
                type="range"
                min="-5"
                max="5"
                value={pointY}
                onChange={(e) => setPointY(parseInt(e.target.value))}
                className="w-24 accent-emerald-600 cursor-pointer"
              />
              <span className="font-mono text-xs font-bold w-6">{pointY}</span>
            </div>
          </div>

          {/* Transformation selectors */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTransformType('none')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                transformType === 'none'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}
            >
              Plot Only
            </button>
            <button
              type="button"
              onClick={() => setTransformType('reflectX')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                transformType === 'reflectX'
                  ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}
            >
              Reflect X-Axis
            </button>
            <button
              type="button"
              onClick={() => setTransformType('reflectY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                transformType === 'reflectY'
                  ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}
            >
              Reflect Y-Axis
            </button>
            <button
              type="button"
              onClick={() => setTransformType('translate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                transformType === 'translate'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}
            >
              Translate Vector
            </button>
          </div>
        </div>

        {/* Translation delta controls if active */}
        {transformType === 'translate' && (
          <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-extrabold text-amber-800 dark:text-amber-200">
              Vector Translation Controls:
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="font-bold">ΔX:</span>
                {[-3, -2, 1, 2, 3].map((dx) => (
                  <button
                    key={dx}
                    type="button"
                    onClick={() => setTransX(dx)}
                    className={`px-2 py-0.5 rounded font-mono font-bold border cursor-pointer ${
                      transX === dx ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800'
                    }`}
                  >
                    {dx > 0 ? `+${dx}` : dx}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold">ΔY:</span>
                {[-3, -2, 1, 2, 3].map((dy) => (
                  <button
                    key={dy}
                    type="button"
                    onClick={() => setTransY(dy)}
                    className={`px-2 py-0.5 rounded font-mono font-bold border cursor-pointer ${
                      transY === dy ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800'
                    }`}
                  >
                    {dy > 0 ? `+${dy}` : dy}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4 Quadrants SVG Canvas */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 border rounded-xl overflow-x-auto">
          <svg
            width={gridSize * scale}
            height={gridSize * scale}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
          >
            {/* Grid Lines */}
            {Array.from({ length: gridSize + 1 }).map((_, i) => (
              <React.Fragment key={i}>
                <line
                  x1={i * scale}
                  y1={0}
                  x2={i * scale}
                  y2={gridSize * scale}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-700"
                  strokeWidth={1}
                />
                <line
                  x1={0}
                  y1={i * scale}
                  x2={gridSize * scale}
                  y2={i * scale}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-700"
                  strokeWidth={1}
                />
              </React.Fragment>
            ))}

            {/* Axes */}
            {/* X-axis */}
            <line
              x1={0}
              y1={center}
              x2={gridSize * scale}
              y2={center}
              stroke="currentColor"
              className={transformType === 'reflectX' ? 'text-purple-600' : 'text-slate-500'}
              strokeWidth={transformType === 'reflectX' ? 3 : 2}
            />
            {/* Y-axis */}
            <line
              x1={center}
              y1={0}
              x2={center}
              y2={gridSize * scale}
              stroke="currentColor"
              className={transformType === 'reflectY' ? 'text-purple-600' : 'text-slate-500'}
              strokeWidth={transformType === 'reflectY' ? 3 : 2}
            />

            {/* Axis labels */}
            <text x={gridSize * scale - 12} y={center - 6} fontSize="10" fontWeight="bold" fill="#64748b">
              X
            </text>
            <text x={center + 6} y={12} fontSize="10" fontWeight="bold" fill="#64748b">
              Y
            </text>

            {/* Quadrant labels */}
            <text x={center + 40} y={center - 40} fontSize="10" fontWeight="bold" fill="#94a3b8">
              Q1 (+, +)
            </text>
            <text x={center - 80} y={center - 40} fontSize="10" fontWeight="bold" fill="#94a3b8">
              Q2 (−, +)
            </text>
            <text x={center - 80} y={center + 60} fontSize="10" fontWeight="bold" fill="#94a3b8">
              Q3 (−, −)
            </text>
            <text x={center + 40} y={center + 60} fontSize="10" fontWeight="bold" fill="#94a3b8">
              Q4 (+, −)
            </text>

            {/* Original Point A */}
            <circle
              cx={toSvgX(pointX)}
              cy={toSvgY(pointY)}
              r={6}
              className="fill-blue-600 stroke-white stroke-2 shadow-sm"
            />
            <text
              x={toSvgX(pointX) + 8}
              y={toSvgY(pointY) - 6}
              fontSize="11"
              fontWeight="black"
              fill="#2563eb"
            >
              A ({pointX}, {pointY})
            </text>

            {/* Transformed Point A' */}
            {transformType !== 'none' && (
              <>
                {/* Connecting line */}
                <line
                  x1={toSvgX(pointX)}
                  y1={toSvgY(pointY)}
                  x2={toSvgX(newX)}
                  y2={toSvgY(newY)}
                  stroke="#a855f7"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                />
                <circle
                  cx={toSvgX(newX)}
                  cy={toSvgY(newY)}
                  r={6}
                  className="fill-purple-600 stroke-white stroke-2 shadow-sm animate-pulse"
                />
                <text
                  x={toSvgX(newX) + 8}
                  y={toSvgY(newY) - 6}
                  fontSize="11"
                  fontWeight="black"
                  fill="#9333ea"
                >
                  A' ({newX}, {newY})
                </text>
              </>
            )}
          </svg>
        </div>

        {/* Summary Card */}
        <div className="p-4 rounded-xl border bg-black/5 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="space-y-0.5">
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              📌 {transformDescription}
            </span>
            <div className="font-mono font-bold text-slate-600 dark:text-slate-400">
              Original: <span className="text-blue-600">A({pointX}, {pointY})</span>
              {transformType !== 'none' && (
                <span> ➔ Transformed: <span className="text-purple-600">A'({newX}, {newY})</span></span>
              )}
            </div>
          </div>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            Rule: Along the corridor (X), then up/down the stairs (Y)
          </span>
        </div>
      </div>
    </div>
  );
};
