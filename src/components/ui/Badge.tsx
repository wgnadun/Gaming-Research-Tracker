import React from 'react';
import { Priority, TaskStatus, PhaseId } from '../../types';

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  switch (priority) {
    case 'Critical':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/50">
          Critical
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
          High
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          Medium
        </span>
      );
    case 'Low':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-500 dark:bg-slate-850 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
          Low
        </span>
      );
  }
};

export const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  switch (status) {
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Completed
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          In Progress
        </span>
      );
    case 'Blocked':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Blocked
        </span>
      );
    case 'Not Started':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Not Started
        </span>
      );
  }
};

export const PhaseBadge: React.FC<{ phase: PhaseId }> = ({ phase }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
      {phase}
    </span>
  );
};
