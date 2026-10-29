import React, { useMemo } from 'react';
import katex from 'katex';

interface LatexRendererProps {
  content: string;
  className?: string;
  blockMode?: boolean;
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
      try {
        const html = katex.renderToString(content, {
          displayMode: true,
          throwOnError: false,
          strict: false,
        });
        return (
          <div
            className="overflow-x-auto py-1"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return <code>{content}</code>;
      }
    }

    // Split by $$...$$ first, then by $...$
    const tokenRegex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
    const segments = content.split(tokenRegex);

    return segments.map((segment, index) => {
      if (segment.startsWith('$$') && segment.endsWith('$$')) {
        const math = segment.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
            strict: false,
          });
          return (
            <span
              key={index}
              className="block my-2 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <code key={index}>{math}</code>;
        }
      }

      if (segment.startsWith('$') && segment.endsWith('$')) {
        const math = segment.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
            strict: false,
          });
          return (
            <span
              key={index}
              className="inline-block align-middle mx-0.5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <code key={index}>{math}</code>;
        }
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
