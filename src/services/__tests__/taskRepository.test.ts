import { describe, it, expect } from 'vitest';
import { LocalStorageTaskRepository } from '../taskRepository';

describe('LocalStorageTaskRepository', () => {
  it('loads 65 predefined tasks on first initialization', () => {
    const repo = new LocalStorageTaskRepository();
    const tasks = repo.getTasks();
    expect(tasks.length).toBe(65);
    expect(tasks[0].id).toBe('P0-01');
    expect(tasks[tasks.length - 1].id).toBe('P7-09');
  });

  it('exports valid JSON data containing settings and tasks', () => {
    const repo = new LocalStorageTaskRepository();
    const jsonStr = repo.exportJSON();
    expect(jsonStr).toBeTruthy();
    const parsed = JSON.parse(jsonStr);
    expect(parsed.tasks).toBeDefined();
    expect(parsed.tasks.length).toBe(65);
    expect(parsed.settings.researchTitle).toContain('A Performance-Aware Agentic AI Framework');
  });

  it('validates schema when importing valid and invalid JSON', () => {
    const repo = new LocalStorageTaskRepository();
    
    // Invalid JSON
    const invalidRes = repo.importJSON('not a json');
    expect(invalidRes.success).toBe(false);

    // Missing required fields
    const badSchema = repo.importJSON(JSON.stringify([{ someField: 123 }]));
    expect(badSchema.success).toBe(false);

    // Valid import
    const validTask = {
      id: 'P0-99',
      title: 'Imported Custom Task',
      description: 'Testing import',
      phase: 'P0',
      priority: 'Low',
      status: 'Not Started',
      dependencies: [],
      estimatedEffort: 2,
      targetDate: '',
      completedDate: null,
      notes: '',
      references: [],
      acceptanceCriteria: '',
    };
    const validRes = repo.importJSON(JSON.stringify({ tasks: [validTask] }));
    expect(validRes.success).toBe(true);
    expect(validRes.count).toBe(1);

    // Reset back to defaults
    const reset = repo.resetToDefaults();
    expect(reset.tasks.length).toBe(65);
  });
});
