import React from 'react';
import {
  Calendar,
  Clock,
  ExternalLink,
  Edit,
  Trash2,
  AlertTriangle,
  Link as LinkIcon,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Modal } from '../ui/Modal';
import { PriorityBadge, StatusBadge, PhaseBadge } from '../ui/Badge';
import { TaskStatus } from '../../types';
import { getUnmetDependencies } from '../../utils/calculations';

export const TaskDetailModal: React.FC = () => {
  const {
    tasks,
    selectedTask,
    closeTaskDetail,
    openEditTask,
    openDeleteConfirm,
    changeTaskStatus,
  } = useProject();

  if (!selectedTask) return null;

  const unmetDependencies = getUnmetDependencies(selectedTask, tasks);
  const isBlockedByDeps = unmetDependencies.length > 0;

  const handleStatusChange = (newStatus: TaskStatus) => {
    changeTaskStatus(selectedTask.id, newStatus);
  };

  return (
    <Modal
      isOpen={Boolean(selectedTask)}
      onClose={closeTaskDetail}
      title={`${selectedTask.id} - ${selectedTask.title}`}
      subtitle={`Phase ${selectedTask.phase}`}
      maxWidth="xl"
    >
      <div className="space-y-4 text-xs">
        {/* Top Badges & Status Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5">
            <PhaseBadge phase={selectedTask.phase} />
            <PriorityBadge priority={selectedTask.priority} />
            <StatusBadge status={selectedTask.status} />
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="task-detail-status" className="text-slate-500 font-medium">Status:</label>
            <select
              id="task-detail-status"
              value={selectedTask.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              className="py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium focus:outline-none"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Dependency Alert */}
        {isBlockedByDeps && (
          <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Prerequisites not yet completed: {unmetDependencies.map((d) => d.id).join(', ')}</span>
          </div>
        )}

        {/* Description */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Description
          </span>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {selectedTask.description || 'No description provided.'}
          </p>
        </div>

        {/* Acceptance Criteria */}
        {selectedTask.acceptanceCriteria && (
          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
              Acceptance Criteria
            </span>
            <p className="text-slate-700 dark:text-slate-300">
              {selectedTask.acceptanceCriteria}
            </p>
          </div>
        )}

        {/* Effort & Dates */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-slate-400 block text-[10px]">Effort</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              {selectedTask.estimatedEffort || 0} hrs
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Target Date</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-400" />
              {selectedTask.targetDate || 'None'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Completed Date</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {selectedTask.completedDate || 'Pending'}
            </span>
          </div>
        </div>

        {/* Implementation Notes */}
        {selectedTask.notes && (
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Implementation Notes
            </span>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
              {selectedTask.notes}
            </div>
          </div>
        )}

        {/* References */}
        {selectedTask.references && selectedTask.references.length > 0 && (
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <LinkIcon className="w-3 h-3" /> References
            </span>
            <ul className="space-y-1">
              {selectedTask.references.map((ref, i) => {
                const isUrl = ref.startsWith('http://') || ref.startsWith('https://');
                return (
                  <li key={i}>
                    {isUrl ? (
                      <a
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        <span>{ref}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400 font-mono">{ref}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => openDeleteConfirm(selectedTask)}
            className="flex items-center gap-1 text-rose-600 hover:text-rose-700 text-xs font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeTaskDetail}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => openEditTask(selectedTask)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
