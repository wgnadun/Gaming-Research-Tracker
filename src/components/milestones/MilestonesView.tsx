import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { calculateMilestones } from '../../utils/calculations';
import { ProgressBar } from '../ui/ProgressBar';

export const MilestonesView: React.FC = () => {
  const { tasks, setCurrentView, setSelectedPhaseFilter } = useProject();

  const milestones = calculateMilestones(tasks);
  const completedMilestones = milestones.filter((m) => m.isCompleted).length;

  const goToPhase = (phaseId: string) => {
    setSelectedPhaseFilter(phaseId);
    setCurrentView('tasks');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Milestones complete automatically when all phase tasks reach 100%</span>
        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
          {completedMilestones} of {milestones.length} Completed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {milestones.map((m) => {
          const phaseTasks = tasks.filter((t) => t.phase === m.phase);
          const totalTasks = phaseTasks.length;
          const completedTasks = phaseTasks.filter((t) => t.status === 'Completed').length;
          const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <div
              key={m.id}
              className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between text-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {m.code}
                    </span>
                    <span className="text-slate-400 font-mono">({m.phase})</span>
                  </div>
                  {m.isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono text-[11px]">
                      Target: {m.targetDate}
                    </span>
                  )}
                </div>

                <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {m.title}
                </h2>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {m.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{completedTasks}/{totalTasks} tasks</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{percentage}%</span>
                </div>
                <ProgressBar
                  value={percentage}
                  size="sm"
                  color={m.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}
                />
                <button
                  type="button"
                  onClick={() => goToPhase(m.phase)}
                  className="mt-2.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium inline-flex items-center gap-1"
                >
                  <span>View phase tasks</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
