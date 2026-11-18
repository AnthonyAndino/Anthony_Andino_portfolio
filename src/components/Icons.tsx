import React from 'react';

export const ArrowUpRight: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (
  <svg
    className={`inline-block flex-shrink-0 ${className}`}
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3.5 10.5L10.5 3.5M10.5 3.5H5.5M10.5 3.5V8.5" />
  </svg>
);

export const ArrowRight: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (
  <svg
    className={`inline-block flex-shrink-0 ${className}`}
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11" />
  </svg>
);

export const Checkmark: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    className={`inline-block flex-shrink-0 ${className}`}
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2.5 7.5L5.5 10.5L11.5 3.5" />
  </svg>
);

export const CloseX: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    className={`inline-block flex-shrink-0 ${className}`}
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 3L11 11M11 3L3 11" />
  </svg>
);
