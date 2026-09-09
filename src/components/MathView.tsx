import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch {
      return `<span class="font-mono font-bold" style="color: var(--accent-primary);">${math}</span>`;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`overflow-x-auto py-2 px-3 my-2 rounded-xl text-center font-serif text-lg border transition-colors ${className}`}
        style={{
          backgroundColor: 'var(--bg-card-subtle)',
          borderColor: 'var(--border-card)',
          color: 'var(--text-primary)',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block mx-0.5 font-serif transition-colors ${className}`}
      style={{ color: 'var(--text-primary)' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
