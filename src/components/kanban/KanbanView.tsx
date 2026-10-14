import React, { useState } from 'react';
import { Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Task, TaskStatus } from '../../types';
import { PriorityBadge, PhaseBadge } from '../ui/Badge';

const COLUMNS: { id: TaskStatus; title: string; countColor: string }[] = [
  { id: 'Not Started', title: 'Not Started', countColor: 'text-slate-500' },
  { id: 'In Progress', title: 'In Progress', countColor: 'text-blue-600 dark:text-blue-400' },
  { id: 'Blocked', title: 'Blocked', countColor: 'text-rose-600 dark:text-rose-400' },
  { id: 'Completed', title: 'Completed', countColor: 'text-emerald-600 dark:text-emerald-400' },
];

export const KanbanView: React.FC = () => {
  const { tasks, changeTaskStatus, openTaskDetail, openCreateTask } = useProject();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      changeTaskStatus(taskId, columnId);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const moveTask = (task: Task, direction: 'prev' | 'next') => {
    const statusOrder: TaskStatus[] = ['Not Started', 'In Progress', 'Blocked', 'Completed'];
    const currentIndex = statusOrder.indexOf(task.status);
    if (direction === 'next' && currentIndex < statusOrder.length - 1) {
      changeTaskStatus(task.id, statusOrder[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      changeTaskStatus(task.id, statusOrder[currentIndex - 1]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Drag cards or use arrow buttons to update task status
        </span>
        <button
          type="button"
          onClick={() => openCreateTask()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-start min-h-[580px]">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-lg border transition-all flex flex-col bg-slate-50/70 dark:bg-slate-900/40 ${
                isOver
                  ? 'border-blue-400 dark:border-blue-700 bg-blue-50/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {col.title}
                </span>
                <span className={`font-mono font-bold ${col.countColor}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="p-2 space-y-2 overflow-y-auto max-h-[75vh]">
                {colTasks.length === 0 ? (
                  <div className="h-24 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded text-xs text-slate-400 italic">
                    No tasks
                  </div>
                ) : (
                  colTasks.map((t) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t.id)}
                      onClick={() => openTaskDetail(t)}
                      className={`p-3 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs cursor-pointer transition-all ${
                        draggedTaskId === t.id ? 'opacity-40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                          {t.id}
                        </span>
                        <div className="flex items-center gap-1">
                          <PhaseBadge phase={t.phase} />
                          <PriorityBadge priority={t.priority} />
                        </div>
                      </div>

                      <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">
                        {t.title}
                      </h3>

                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                        <span className="font-mono">{t.targetDate || 'No date'}</span>

                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {col.id !== 'Not Started' && (
                            <button
                              type="button"
                              onClick={() => moveTask(t, 'prev')}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600"
                              title="Move left"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {col.id !== 'Completed' && (
                            <button
                              type="button"
                              onClick={() => moveTask(t, 'next')}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600"
                              title="Move right"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
