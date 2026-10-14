import { Task, PhaseId, Milestone } from '../types';
import { PHASE_LIST, PHASES } from '../data/phases';
import { INITIAL_MILESTONES } from '../data/milestones';

export interface SummaryStats {
  total: number;
  completed: number;
  inProgress: number;
  blocked: number;
  notStarted: number;
  completionPercentage: number;
  totalEffortHours: number;
  completedEffortHours: number;
}

export interface PhaseProgress {
  phase: PhaseId;
  code: string;
  name: string;
  goal: string;
  order: number;
  total: number;
  completed: number;
  inProgress: number;
  blocked: number;
  notStarted: number;
  completionPercentage: number;
  isCompleted: boolean;
}

export interface StatusDistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface CompletionTimelineItem {
  date: string;
  completedCount: number;
  cumulativeCompleted: number;
  taskTitles: string[];
}

/**
 * Calculate high-level project summary metrics
 */
export function calculateSummaryStats(tasks: Task[]): SummaryStats {
  const total = tasks.length;
  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      blocked: 0,
      notStarted: 0,
      completionPercentage: 0,
      totalEffortHours: 0,
      completedEffortHours: 0,
    };
  }

  let completed = 0;
  let inProgress = 0;
  let blocked = 0;
  let notStarted = 0;
  let totalEffortHours = 0;
  let completedEffortHours = 0;

  for (const t of tasks) {
    totalEffortHours += t.estimatedEffort || 0;
    if (t.status === 'Completed') {
      completed++;
      completedEffortHours += t.estimatedEffort || 0;
    } else if (t.status === 'In Progress') {
      inProgress++;
    } else if (t.status === 'Blocked') {
      blocked++;
    } else {
      notStarted++;
    }
  }

  const completionPercentage = Math.round((completed / total) * 100);

  return {
    total,
    completed,
    inProgress,
    blocked,
    notStarted,
    completionPercentage,
    totalEffortHours,
    completedEffortHours,
  };
}

/**
 * Calculate progress broken down by development phase (P0 to P7)
 */
export function calculatePhaseProgress(tasks: Task[]): PhaseProgress[] {
  return PHASE_LIST.map((phaseInfo) => {
    const phaseTasks = tasks.filter((t) => t.phase === phaseInfo.id);
    const total = phaseTasks.length;
    const completed = phaseTasks.filter((t) => t.status === 'Completed').length;
    const inProgress = phaseTasks.filter((t) => t.status === 'In Progress').length;
    const blocked = phaseTasks.filter((t) => t.status === 'Blocked').length;
    const notStarted = phaseTasks.filter((t) => t.status === 'Not Started').length;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      phase: phaseInfo.id,
      code: phaseInfo.code,
      name: phaseInfo.name,
      goal: phaseInfo.goal,
      order: phaseInfo.order,
      total,
      completed,
      inProgress,
      blocked,
      notStarted,
      completionPercentage,
      isCompleted: total > 0 && completed === total,
    };
  });
}

/**
 * Determine the current active development phase
 * (The earliest phase with incomplete tasks, or P7 if all completed)
 */
export function getCurrentPhase(phaseProgressList: PhaseProgress[]): PhaseProgress {
  for (const p of phaseProgressList) {
    if (p.completionPercentage < 100) {
      return p;
    }
  }
  return phaseProgressList[phaseProgressList.length - 1] || {
    phase: 'P0',
    code: 'Phase P0',
    name: 'Project Foundations',
    goal: 'Establish the development environment and software architecture.',
    order: 0,
    total: 0,
    completed: 0,
    inProgress: 0,
    blocked: 0,
    notStarted: 0,
    completionPercentage: 100,
    isCompleted: true,
  };
}

/**
 * Check if a task has unmet dependencies
 */
export function getUnmetDependencies(task: Task, allTasks: Task[]): Task[] {
  if (!task.dependencies || task.dependencies.length === 0) {
    return [];
  }

  const taskMap = new Map<string, Task>();
  for (const t of allTasks) {
    taskMap.set(t.id, t);
  }

  const unmet: Task[] = [];
  for (const depId of task.dependencies) {
    const depTask = taskMap.get(depId);
    if (!depTask || depTask.status !== 'Completed') {
      if (depTask) {
        unmet.push(depTask);
      } else {
        // Missing dependency placeholder
        unmet.push({
          id: depId,
          title: `Unknown Task (${depId})`,
          description: '',
          phase: task.phase,
          priority: 'Medium',
          status: 'Not Started',
          dependencies: [],
          estimatedEffort: 0,
          targetDate: '',
          completedDate: null,
          notes: '',
          references: [],
          acceptanceCriteria: '',
          createdAt: '',
          updatedAt: '',
        });
      }
    }
  }

  return unmet;
}

/**
 * Filter next available tasks:
 * Tasks not completed whose dependencies ARE all completed, prioritized
 */
export function getNextAvailableTasks(tasks: Task[], limit: number = 6): Task[] {
  const priorityRank: Record<string, number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const phaseRank: Record<PhaseId, number> = {
    P0: 0, P1: 1, P2: 2, P3: 3, P4: 4, P5: 5, P6: 6, P7: 7
  };

  const available = tasks.filter((t) => {
    if (t.status === 'Completed') return false;
    const unmet = getUnmetDependencies(t, tasks);
    return unmet.length === 0;
  });

  return available.sort((a, b) => {
    // Priority first
    const pDiff = (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
    if (pDiff !== 0) return pDiff;

    // Phase order second
    const phDiff = (phaseRank[a.phase] || 0) - (phaseRank[b.phase] || 0);
    if (phDiff !== 0) return phDiff;

    // Target date third
    return (a.targetDate || '').localeCompare(b.targetDate || '');
  }).slice(0, limit);
}

/**
 * Get blocked tasks requiring attention
 */
export function getBlockedTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.status === 'Blocked');
}

/**
 * Get recently completed tasks
 */
export function getRecentlyCompletedTasks(tasks: Task[], limit: number = 5): Task[] {
  return tasks
    .filter((t) => t.status === 'Completed')
    .sort((a, b) => {
      const dateA = a.completedDate || a.updatedAt || '';
      const dateB = b.completedDate || b.updatedAt || '';
      return dateB.localeCompare(dateA);
    })
    .slice(0, limit);
}

/**
 * Generate task status distribution chart data
 */
export function getStatusDistribution(stats: SummaryStats): StatusDistributionItem[] {
  return [
    { name: 'Completed', value: stats.completed, color: '#10b981' }, // green-500
    { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' }, // blue-500
    { name: 'Blocked', value: stats.blocked, color: '#ef4444' }, // red-500
    { name: 'Not Started', value: stats.notStarted, color: '#94a3b8' }, // slate-400
  ].filter((item) => item.value > 0);
}

/**
 * Generate tasks completed over time chart data
 */
export function getCompletionTimeline(tasks: Task[]): CompletionTimelineItem[] {
  const completedTasks = tasks.filter((t) => t.status === 'Completed' && t.completedDate);
  if (completedTasks.length === 0) return [];

  // Group by date
  const dateMap = new Map<string, Task[]>();
  for (const t of completedTasks) {
    const d = t.completedDate!;
    const existing = dateMap.get(d) || [];
    existing.push(t);
    dateMap.set(d, existing);
  }

  const sortedDates = Array.from(dateMap.keys()).sort();
  let cumulative = 0;

  return sortedDates.map((date) => {
    const dateTasks = dateMap.get(date)!;
    cumulative += dateTasks.length;
    return {
      date,
      completedCount: dateTasks.length,
      cumulativeCompleted: cumulative,
      taskTitles: dateTasks.map((t) => t.title),
    };
  });
}

/**
 * Calculate milestones with dynamic auto-completion status
 */
export function calculateMilestones(tasks: Task[]): Milestone[] {
  return INITIAL_MILESTONES.map((m) => {
    const phaseTasks = tasks.filter((t) => t.phase === m.phase);
    const total = phaseTasks.length;
    const completed = phaseTasks.filter((t) => t.status === 'Completed').length;
    const isCompleted = total > 0 && completed === total;

    let latestCompletedDate: string | null = null;
    if (isCompleted) {
      const dates = phaseTasks
        .map((t) => t.completedDate)
        .filter((d): d is string => Boolean(d))
        .sort();
      latestCompletedDate = dates.length > 0 ? dates[dates.length - 1] : new Date().toISOString().slice(0, 10);
    }

    return {
      ...m,
      isCompleted,
      completedDate: latestCompletedDate,
    };
  });
}
