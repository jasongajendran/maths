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
      return `<span class="font-mono text-indigo-700">${math}</span>`;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`overflow-x-auto py-2 px-3 my-2 bg-slate-900/5 dark:bg-slate-800/40 rounded-lg text-slate-900 text-center font-serif text-lg ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block mx-0.5 text-slate-900 font-serif ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
