import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  List,
  AlertTriangle,
  Clock,
  Trash2,
  Edit,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Priority, TaskStatus } from '../../types';
import { PriorityBadge, PhaseBadge } from '../ui/Badge';
import { PHASE_LIST } from '../../data/phases';
import { getUnmetDependencies } from '../../utils/calculations';

export const TasksView: React.FC = () => {
  const {
    tasks,
    searchQuery,
    setSearchQuery,
    selectedPhaseFilter,
    setSelectedPhaseFilter,
    selectedPriorityFilter,
    setSelectedPriorityFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    resetFilters,
    openTaskDetail,
    openEditTask,
    openDeleteConfirm,
    openCreateTask,
    changeTaskStatus,
  } = useProject();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'id' | 'priority' | 'date'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter & Search Logic
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          (t.dependencies && t.dependencies.some((d) => d.toLowerCase().includes(q)))
      );
    }

    if (selectedPhaseFilter !== 'all') {
      result = result.filter((t) => t.phase === selectedPhaseFilter);
    }

    if (selectedPriorityFilter !== 'all') {
      result = result.filter((t) => t.priority === selectedPriorityFilter);
    }

    if (selectedStatusFilter !== 'all') {
      result = result.filter((t) => t.status === selectedStatusFilter);
    }

    const priorityRank: Record<Priority, number> = {
      Critical: 4,
      High: 3,
      Medium: 2,
      Low: 1,
    };

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'priority') {
        cmp = priorityRank[b.priority] - priorityRank[a.priority];
      } else if (sortBy === 'date') {
        cmp = (a.targetDate || '9999').localeCompare(b.targetDate || '9999');
      } else {
        cmp = a.id.localeCompare(b.id, undefined, { numeric: true });
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [
    tasks,
    searchQuery,
    selectedPhaseFilter,
    selectedPriorityFilter,
    selectedStatusFilter,
    sortBy,
    sortOrder,
  ]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedPhaseFilter !== 'all' ||
    selectedPriorityFilter !== 'all' ||
    selectedStatusFilter !== 'all';

  return (
    <div className="space-y-3">
      {/* Search and Filters Bar */}
      <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by ID, title, keywords..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 justify-end">
            {/* View Switch */}
            <div className="flex items-center rounded-md border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-label="Table view"
                className={`p-1 rounded text-xs transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Table"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-1 rounded text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Add Task Button */}
            <button
              type="button"
              onClick={() => openCreateTask()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Phase Filter */}
          <select
            value={selectedPhaseFilter}
            onChange={(e) => setSelectedPhaseFilter(e.target.value)}
            className="py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Phases</option>
            {PHASE_LIST.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Sort */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-slate-400 text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="id">Task ID</option>
              <option value="priority">Priority</option>
              <option value="date">Target Date</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
              aria-label={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:underline px-1.5"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Task Count Summary */}
      <div className="text-xs text-slate-400 px-1">
        Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredTasks.length}</span> of {tasks.length} tasks
      </div>

      {/* Table View */}
      {filteredTasks.length === 0 ? (
        <div className="p-8 text-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
          No tasks match your filters.
        </div>
      ) : viewMode === 'table' ? (
        <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Phase</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTasks.map((t) => {
                  const unmet = getUnmetDependencies(t, tasks);
                  const isBlocked = unmet.length > 0 && t.status !== 'Completed';

                  return (
                    <tr
                      key={t.id}
                      onClick={() => openTaskDetail(t)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {t.id}
                      </td>
                      <td className="py-2.5 px-3 min-w-[220px]">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {t.title}
                        </span>
                        {isBlocked && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Prereqs: {unmet.map((d) => d.id).join(', ')}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <PhaseBadge phase={t.phase} />
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td
                        className="py-2.5 px-3 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          aria-label={`Change status for task ${t.id}`}
                          value={t.status}
                          onChange={(e) => changeTaskStatus(t.id, e.target.value as TaskStatus)}
                          className="text-xs py-0.5 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Blocked">Blocked</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {t.targetDate || '—'}
                      </td>
                      <td
                        className="py-2.5 px-3 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditTask(t)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteConfirm(t)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => openTaskDetail(t)}
              className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  {t.id}
                </span>
                <div className="flex items-center gap-1.5">
                  <PhaseBadge phase={t.phase} />
                  <PriorityBadge priority={t.priority} />
                </div>
              </div>

              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                {t.title}
              </h3>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                {t.description}
              </p>

              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                <span>{t.status}</span>
                <span className="font-mono">{t.targetDate || 'No date'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
