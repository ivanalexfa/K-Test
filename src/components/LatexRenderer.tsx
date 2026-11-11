import React, { useMemo } from 'react';
import katex from 'katex';

interface LatexRendererProps {
  content: string;
  className?: string;
  blockMode?: boolean;
}

/**
 * Converts a LaTeX expression to HTML, or returns null when KaTeX cannot parse it.
 * Kept outside the JSX so rendering never happens inside a try/catch
 * (react-hooks/error-boundaries).
 */
function renderKatex(math: string, displayMode: boolean): string | null {
  try {
    return katex.renderToString(math, {
      displayMode,
      throwOnError: false,
      strict: false,
    });
  } catch {
    return null;
  }
}

/**
 * Renders mixed text containing inline LaTeX ($...$) and display LaTeX ($$...$$),
 * or pure LaTeX expressions when blockMode={true}.
 */
export const LatexRenderer: React.FC<LatexRendererProps> = ({
  content,
  className = '',
  blockMode = false,
}) => {
  const renderedParts = useMemo(() => {
    if (!content) return null;

    if (blockMode) {
      const html = renderKatex(content, true);
      if (html === null) return <code>{content}</code>;
      return (
        <div
          className="overflow-x-auto py-1"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    // Split by $$...$$ first, then by $...$
    const tokenRegex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
    const segments = content.split(tokenRegex);

    return segments.map((segment, index) => {
      if (segment.startsWith('$$') && segment.endsWith('$$')) {
        const math = segment.slice(2, -2).trim();
        const html = renderKatex(math, true);
        if (html === null) return <code key={index}>{math}</code>;
        return (
          <span
            key={index}
            className="block my-2 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }

      if (segment.startsWith('$') && segment.endsWith('$')) {
        const math = segment.slice(1, -1).trim();
        const html = renderKatex(math, false);
        if (html === null) return <code key={index}>{math}</code>;
        return (
          <span
            key={index}
            className="inline-block align-middle mx-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }

      // Handle line breaks in regular text
      const lines = segment.split('\n');
      return (
        <React.Fragment key={index}>
          {lines.map((line, lineIdx) => (
            <React.Fragment key={lineIdx}>
              {line}
              {lineIdx < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </React.Fragment>
      );
    });
  }, [content, blockMode]);

  return <span className={className}>{renderedParts}</span>;
};
