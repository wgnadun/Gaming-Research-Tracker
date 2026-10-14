import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  size = 'md',
  showLabel = false,
  color = 'bg-blue-600 dark:bg-blue-500',
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          <span>Progress</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`${color} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
