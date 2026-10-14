import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useProject } from '../../context/ProjectContext';
import { ProgressBar } from '../ui/ProgressBar';
import { PriorityBadge, PhaseBadge, StatusBadge } from '../ui/Badge';
import {
  getStatusDistribution,
  getCompletionTimeline,
  getNextAvailableTasks,
  getBlockedTasks,
  getRecentlyCompletedTasks,
} from '../../utils/calculations';

export const DashboardView: React.FC = () => {
  const {
    tasks,
    summaryStats,
    phaseProgress,
    currentPhase,
    setCurrentView,
    openTaskDetail,
    setSelectedPhaseFilter,
  } = useProject();

  const statusDistribution = getStatusDistribution(summaryStats);
  const completionTimeline = getCompletionTimeline(tasks);
  const nextAvailable = getNextAvailableTasks(tasks, 5);
  const blockedTasks = getBlockedTasks(tasks);
  const recentlyCompleted = getRecentlyCompletedTasks(tasks, 4);

  const goToPhase = (phaseId: string) => {
    setSelectedPhaseFilter(phaseId);
    setCurrentView('tasks');
  };

  return (
    <div className="space-y-5">
      {/* 1. Five Simple Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Tasks */}
        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Tasks</span>
          <div className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {summaryStats.total}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">8 phases</span>
        </div>

        {/* Completed */}
        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Completed</span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {summaryStats.completed}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{summaryStats.completedEffortHours} hrs done</span>
        </div>

        {/* In Progress */}
        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">In Progress</span>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {summaryStats.inProgress}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">active work</span>
        </div>

        {/* Blocked */}
        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Blocked</span>
          <div className={`text-xl font-bold mt-1 ${summaryStats.blocked > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
            {summaryStats.blocked}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {summaryStats.blocked > 0 ? 'needs review' : 'none'}
          </span>
        </div>

        {/* Overall Completion */}
        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Overall Progress</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{summaryStats.completionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${summaryStats.completionPercentage}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {summaryStats.completed} of {summaryStats.total} finished
          </span>
        </div>
      </div>

      {/* 2. Progress by Phase & Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Phase Breakdown */}
        <div className="lg:col-span-2 p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Phase Progress
            </h2>
            <button
              type="button"
              onClick={() => setCurrentView('phases')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              <span>View details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {phaseProgress.map((p) => {
              const isActive = p.phase === currentPhase.phase;

              return (
                <div
                  key={p.phase}
                  onClick={() => goToPhase(p.phase)}
                  className={`p-2.5 rounded-md border cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs ${
                    isActive
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
                      {p.code}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                      {p.name}
                    </span>
                    {isActive && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 shrink-0">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {p.completed}/{p.total}
                    </span>
                    <div className="w-20">
                      <ProgressBar
                        value={p.completionPercentage}
                        size="sm"
                        color={p.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}
                      />
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 w-8 text-right">
                      {p.completionPercentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Status Breakdown Chart */}
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Status Distribution
            </h2>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                    formatter={(val: any, name: any) => [`${val} tasks`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {statusDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Actionable Lists: Next Up & Recent / Blocked */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Next Available Tasks */}
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Next Available Tasks
            </h2>
            <button
              type="button"
              onClick={() => setCurrentView('tasks')}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              All tasks
            </button>
          </div>

          <div className="space-y-2">
            {nextAvailable.length > 0 ? (
              nextAvailable.map((t) => (
                <div
                  key={t.id}
                  onClick={() => openTaskDetail(t)}
                  className="p-2.5 rounded border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {t.id}
                      </span>
                      <PhaseBadge phase={t.phase} />
                    </div>
                    <span className="text-slate-800 dark:text-slate-200 font-medium truncate block">
                      {t.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={t.priority} />
                    <span className="text-slate-400 font-mono text-[11px]">{t.estimatedEffort}h</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-2">No pending tasks with met dependencies.</p>
            )}
          </div>
        </div>

        {/* Blocked or Recently Completed */}
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {blockedTasks.length > 0 ? (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-3">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Blocked Tasks ({blockedTasks.length})</span>
              </div>
              <div className="space-y-2 mb-4">
                {blockedTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => openTaskDetail(t)}
                    className="p-2.5 rounded border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 cursor-pointer text-xs"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-mono font-bold text-rose-700 dark:text-rose-400">{t.id}</span>
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <span className="text-slate-800 dark:text-slate-200 font-medium block truncate">
                      {t.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Recently Completed
            </h2>
            <button
              type="button"
              onClick={() => setCurrentView('kanban')}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              Kanban
            </button>
          </div>

          <div className="space-y-2">
            {recentlyCompleted.length > 0 ? (
              recentlyCompleted.map((t) => (
                <div
                  key={t.id}
                  onClick={() => openTaskDetail(t)}
                  className="p-2.5 rounded border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-mono font-bold text-slate-500 mr-2">{t.id}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                      {t.title}
                    </span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] shrink-0">
                    {t.completedDate}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-2">No completed tasks recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
