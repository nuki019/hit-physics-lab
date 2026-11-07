import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({
  math,
  displayMode = false,
  className = '',
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return `<span class="text-rose-600 font-mono text-xs">${math}</span>`;
    }
  }, [math, displayMode]);

  return (
    <span
      className={`inline-block font-mono ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
