import React from 'react';

// Shared shimmering placeholders. The animation itself lives in index.css (.skeleton-bar)
// so it can respect prefers-reduced-motion in one place.

export const SkeletonBar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`skeleton-bar ${className}`} />
);

// Cycled widths/indents so the placeholder reads like nested code rather than a stack of equal bars.
const LINE_WIDTHS = ['w-3/4', 'w-1/2', 'w-5/6', 'w-2/3', 'w-2/5', 'w-3/5'];
const LINE_INDENTS = ['', 'ml-6', 'ml-6', 'ml-12', 'ml-6', ''];

interface SkeletonCodeLinesProps {
  lines?: number;
  showGutter?: boolean;
  className?: string;
}

export const SkeletonCodeLines: React.FC<SkeletonCodeLinesProps> = ({
  lines = 12,
  showGutter = true,
  className = '',
}) => (
  <div className={`space-y-2.5 py-2 ${className}`} aria-hidden="true">
    {Array.from({ length: lines }, (_, idx) => (
      <div key={idx} className="flex items-center px-4">
        {showGutter && <SkeletonBar className="w-6 mr-4 flex-shrink-0" />}
        <SkeletonBar className={`${LINE_WIDTHS[idx % LINE_WIDTHS.length]} ${LINE_INDENTS[idx % LINE_INDENTS.length]}`} />
      </div>
    ))}
  </div>
);
