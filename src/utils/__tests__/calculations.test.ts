import { describe, it, expect } from 'vitest';
import {
  calculateSummaryStats,
  calculatePhaseProgress,
  getUnmetDependencies,
  getNextAvailableTasks,
  calculateMilestones,
} from '../calculations';
import { Task } from '../../types';

describe('calculations utility', () => {
  const sampleTasks: Task[] = [
    {
      id: 'P0-01',
      title: 'Foundation Task 1',
      description: '',
      phase: 'P0',
      priority: 'Critical',
      status: 'Completed',
      dependencies: [],
      estimatedEffort: 10,
      targetDate: '2026-10-15',
      completedDate: '2026-10-15',
      notes: '',
      references: [],
      acceptanceCriteria: '',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'P0-02',
      title: 'Foundation Task 2',
      description: '',
      phase: 'P0',
      priority: 'High',
      status: 'In Progress',
      dependencies: ['P0-01'],
      estimatedEffort: 5,
      targetDate: '2026-10-18',
      completedDate: null,
      notes: '',
      references: [],
      acceptanceCriteria: '',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'P0-03',
      title: 'Blocked Task',
      description: '',
      phase: 'P0',
      priority: 'Medium',
      status: 'Blocked',
      dependencies: ['P0-02'],
      estimatedEffort: 8,
      targetDate: '2026-10-20',
      completedDate: null,
      notes: '',
      references: [],
      acceptanceCriteria: '',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'P1-01',
      title: 'Phase 1 Dependent Task',
      description: '',
      phase: 'P1',
      priority: 'High',
      status: 'Not Started',
      dependencies: ['P0-01'],
      estimatedEffort: 6,
      targetDate: '2026-10-25',
      completedDate: null,
      notes: '',
      references: [],
      acceptanceCriteria: '',
      createdAt: '',
      updatedAt: '',
    },
  ];

  it('correctly calculates summary stats', () => {
    const stats = calculateSummaryStats(sampleTasks);
    expect(stats.total).toBe(4);
    expect(stats.completed).toBe(1);
    expect(stats.inProgress).toBe(1);
    expect(stats.blocked).toBe(1);
    expect(stats.notStarted).toBe(1);
    expect(stats.completionPercentage).toBe(25);
    expect(stats.totalEffortHours).toBe(29);
    expect(stats.completedEffortHours).toBe(10);
  });

  it('correctly calculates phase progress', () => {
    const progress = calculatePhaseProgress(sampleTasks);
    const p0 = progress.find((p) => p.phase === 'P0');
    expect(p0).toBeDefined();
    expect(p0?.total).toBe(3);
    expect(p0?.completed).toBe(1);
    expect(p0?.inProgress).toBe(1);
    expect(p0?.completionPercentage).toBe(33);

    const p1 = progress.find((p) => p.phase === 'P1');
    expect(p1?.total).toBe(1);
    expect(p1?.completed).toBe(0);
    expect(p1?.completionPercentage).toBe(0);
  });

  it('checks unmet dependencies accurately', () => {
    const taskP03 = sampleTasks.find((t) => t.id === 'P0-03')!;
    const unmetP03 = getUnmetDependencies(taskP03, sampleTasks);
    // P0-02 is In Progress, not Completed, so it's unmet
    expect(unmetP03.length).toBe(1);
    expect(unmetP03[0].id).toBe('P0-02');

    const taskP101 = sampleTasks.find((t) => t.id === 'P1-01')!;
    const unmetP101 = getUnmetDependencies(taskP101, sampleTasks);
    // P0-01 is Completed, so unmet should be empty
    expect(unmetP101.length).toBe(0);
  });

  it('identifies next available tasks with met dependencies', () => {
    const available = getNextAvailableTasks(sampleTasks);
    // P0-02 has dependency P0-01 (completed), status In Progress -> available
    // P1-01 has dependency P0-01 (completed), status Not Started -> available
    // P0-03 has dependency P0-02 (unmet) -> NOT available
    // P0-01 is already completed -> NOT in next available
    const ids = available.map((t) => t.id);
    expect(ids).toContain('P0-02');
    expect(ids).toContain('P1-01');
    expect(ids).not.toContain('P0-03');
    expect(ids).not.toContain('P0-01');
  });

  it('marks milestones completed only when all phase tasks are completed', () => {
    const allP0Completed: Task[] = sampleTasks.map((t) =>
      t.phase === 'P0' ? { ...t, status: 'Completed', completedDate: '2026-10-15' } : t
    );
    const milestones = calculateMilestones(allP0Completed);
    const m1 = milestones.find((m) => m.id === 'M1');
    expect(m1?.isCompleted).toBe(true);

    const m2 = milestones.find((m) => m.id === 'M2');
    expect(m2?.isCompleted).toBe(false);
  });
});
