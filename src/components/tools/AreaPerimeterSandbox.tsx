import React, { useState } from 'react';
import { MathView } from '../MathView';
import { ReadableCard } from '../ReadableCard';

export const AreaPerimeterSandbox: React.FC = () => {
  const [shape, setShape] = useState<'rectangle' | 'triangle' | 'parallelogram'>('rectangle');
  const [length, setLength] = useState<number>(6);
  const [width, setWidth] = useState<number>(4);

  let area = 0;
  let perimeterText = '';
  let formulaText = '';
  let speechText = '';

  if (shape === 'rectangle') {
    area = length * width;
    const perimeter = 2 * (length + width);
    perimeterText = `Perimeter = 2 × (${length} + ${width}) = ${perimeter} cm`;
    formulaText = `\\text{Area} = ${length} \\times ${width} = ${area}\\text{ cm}^2`;
    speechText = `Rectangle with length ${length} centimetres and width ${width} centimetres. Area is ${length} times ${width} equals ${area} square centimetres. Perimeter is ${perimeter} centimetres.`;
  } else if (shape === 'triangle') {
    area = (length * width) / 2;
    formulaText = `\\text{Area} = \\frac{${length} \\times ${width}}{2} = ${area}\\text{ cm}^2`;
    perimeterText = `Perimeter depends on side lengths (add all 3 outer sides)`;
    speechText = `Triangle with base ${length} centimetres and vertical height ${width} centimetres. Area is half times base times height, which is ${length} times ${width} divided by 2, giving ${area} square centimetres.`;
  } else {
    area = length * width;
    formulaText = `\\text{Area} = \\text{Base} \\times \\text{Perp Height} = ${length} \\times ${width} = ${area}\\text{ cm}^2`;
    perimeterText = `Perimeter = 2 × (base + slant side)`;
    speechText = `Parallelogram with base ${length} centimetres and perpendicular height ${width} centimetres. Area is ${length} times ${width} equals ${area} square centimetres.`;
  }

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
              Interactive Sandbox
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              Primary 5 & 6
            </span>
          </div>
          <h3
            className="text-lg sm:text-xl font-extrabold mt-1"
            style={{ color: 'var(--text-primary)' }}
          >
            Area & Perimeter Visual Grid Sandbox
          </h3>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Adjust dimensions to see how 2D grid squares fill the space and how perimeter bounds the shape. Click to read aloud.
          </p>
        </div>
      </div>

      {/* Shape Selector */}
      <div className="flex flex-wrap gap-2">
        {(['rectangle', 'triangle', 'parallelogram'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setShape(s)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer border"
            style={{
              backgroundColor: shape === s ? 'var(--accent-primary)' : 'var(--bg-card-subtle)',
              borderColor: shape === s ? 'var(--accent-primary)' : 'var(--border-card)',
              color: shape === s ? 'var(--accent-contrast)' : 'var(--text-primary)',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Grid Canvas & Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Visual Box */}
        <div
          className="flex flex-col items-center justify-center p-6 rounded-2xl border min-h-[200px]"
          style={{
            backgroundColor: 'var(--bg-card-subtle)',
            borderColor: 'var(--border-card)',
          }}
        >
          <div
            className={`transition-all duration-300 border-2 relative flex items-center justify-center ${
              shape === 'triangle' ? 'rounded-none' : 'rounded-lg'
            }`}
            style={{
              width: `${Math.min(220, length * 22)}px`,
              height: `${Math.min(180, width * 22)}px`,
              backgroundColor: 'var(--reading-highlight-bg)',
              borderColor: 'var(--accent-primary)',
            }}
          >
            {/* Dimension labels */}
            <span
              className="absolute -top-5 text-[11px] font-bold"
              style={{ color: 'var(--text-secondary)' }}
            >
              {length} cm (Length/Base)
            </span>
            <span
              className="absolute -left-12 text-[11px] font-bold -rotate-90"
              style={{ color: 'var(--text-secondary)' }}
            >
              {width} cm
            </span>

            <span
              className="text-xs font-black px-2 py-1 rounded shadow-2xs border"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-card-strong)',
              }}
            >
              Area: {area} cm²
            </span>
          </div>
        </div>

        {/* Sliders and results */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase flex justify-between" style={{ color: 'var(--text-secondary)' }}>
              <span>{shape === 'triangle' ? 'Base Length' : 'Length'}: {length} cm</span>
            </label>
            <input
              type="range"
              min="2"
              max="12"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer mt-1"
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                accentColor: 'var(--accent-primary)',
              }}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase flex justify-between" style={{ color: 'var(--text-secondary)' }}>
              <span>{shape === 'triangle' ? 'Vertical Height' : 'Width / Height'}: {width} cm</span>
            </label>
            <input
              type="range"
              min="2"
              max="10"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer mt-1"
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                accentColor: 'var(--accent-primary)',
              }}
            />
          </div>

          {/* Results Box - Click to Read! */}
          <ReadableCard
            id="area-tool-results"
            textToRead={speechText}
            highlightStyle="inner"
            className="p-4 rounded-xl border space-y-2 shadow-2xs"
            ariaLabel="Area and perimeter calculation results"
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-extrabold uppercase"
                style={{ color: 'var(--accent-primary)' }}
              >
                Area Formula:
              </span>
              <MathView math={formulaText} />
            </div>

            <div
              className="text-xs pt-1 border-t"
              style={{
                borderColor: 'var(--border-card)',
                color: 'var(--text-secondary)',
              }}
            >
              <strong>Perimeter rule:</strong> {perimeterText}
            </div>
          </ReadableCard>
        </div>
      </div>
    </div>
  );
};
