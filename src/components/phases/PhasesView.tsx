import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { PhaseId } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { PriorityBadge, StatusBadge } from '../ui/Badge';

export const PhasesView: React.FC = () => {
  const { tasks, phaseProgress, openTaskDetail, openCreateTask } = useProject();

  const [expandedPhases, setExpandedPhases] = useState<Record<PhaseId, boolean>>({
    P0: true,
    P1: false,
    P2: false,
    P3: false,
    P4: false,
    P5: false,
    P6: false,
    P7: false,
  });

  const toggleExpand = (phaseId: PhaseId) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Click on any phase to view or hide its tasks</span>
      </div>

      <div className="space-y-2.5">
        {phaseProgress.map((p) => {
          const isExpanded = expandedPhases[p.phase];
          const phaseTasks = tasks.filter((t) => t.phase === p.phase);

          return (
            <div
              key={p.phase}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
            >
              {/* Header */}
              <div
                onClick={() => toggleExpand(p.phase)}
                className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                    {p.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {p.name}
                    </h2>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {p.goal}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-mono">
                    {p.completed}/{p.total}
                  </span>
                  <div className="w-20">
                    <ProgressBar
                      value={p.completionPercentage}
                      size="sm"
                      color={p.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}
                    />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 w-8 text-right">
                    {p.completionPercentage}%
                  </span>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between py-1 text-xs">
                    <span className="text-slate-400 font-medium">
                      Tasks ({phaseTasks.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => openCreateTask(p.phase)}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to {p.phase}</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {phaseTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => openTaskDetail(t)}
                        className="p-2.5 rounded border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0">
                            {t.id}
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {t.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <PriorityBadge priority={t.priority} />
                          <StatusBadge status={t.status} />
                          <span className="text-[11px] text-slate-400 font-mono w-10 text-right">
                            {t.estimatedEffort}h
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
