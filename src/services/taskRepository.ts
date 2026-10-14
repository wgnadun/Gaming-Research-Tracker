import { Task, ProjectSettings, AppData, PhaseId } from '../types';
import { INITIAL_TASKS } from '../data/initialTasks';

const STORAGE_KEY = 'research_implementation_tracker_data_v1';
const CURRENT_SCHEMA_VERSION = 1;

export const DEFAULT_SETTINGS: ProjectSettings = {
  researchTitle: 'A Performance-Aware Agentic AI Framework for Adaptive 3D Asset Optimization in Real-Time Game Engines',
  applicationName: 'Research Implementation Tracker',
  projectStartDate: '2026-10-14',
  targetCompletionDate: '2027-03-31',
  defaultPhase: 'P0',
  theme: 'light',
};

export interface ITaskRepository {
  getData(): AppData;
  saveData(data: AppData): void;
  getTasks(): Task[];
  saveTasks(tasks: Task[]): void;
  getSettings(): ProjectSettings;
  saveSettings(settings: ProjectSettings): void;
  exportJSON(): string;
  importJSON(jsonString: string): { success: boolean; error?: string; count?: number };
  resetToDefaults(): AppData;
}

export class LocalStorageTaskRepository implements ITaskRepository {
  private memoryCache: AppData | null = null;

  private getInitialData(): AppData {
    return {
      version: CURRENT_SCHEMA_VERSION,
      settings: { ...DEFAULT_SETTINGS },
      tasks: [...INITIAL_TASKS],
      lastUpdated: new Date().toISOString(),
    };
  }

  public getData(): AppData {
    if (this.memoryCache) {
      return this.memoryCache;
    }

    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return this.getInitialData();
      }

      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = this.getInitialData();
        this.saveData(initial);
        return initial;
      }

      const parsed = JSON.parse(raw) as Partial<AppData>;

      // Validate structure and version
      if (!parsed || !Array.isArray(parsed.tasks)) {
        console.warn('Corrupted storage detected. Re-initializing with default tasks.');
        const initial = this.getInitialData();
        this.saveData(initial);
        return initial;
      }

      const validatedData: AppData = {
        version: parsed.version || CURRENT_SCHEMA_VERSION,
        settings: {
          ...DEFAULT_SETTINGS,
          ...(parsed.settings || {}),
        },
        tasks: parsed.tasks,
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };

      this.memoryCache = validatedData;
      return validatedData;
    } catch (err) {
      console.error('Error reading from LocalStorage:', err);
      return this.getInitialData();
    }
  }

  public saveData(data: AppData): void {
    try {
      const dataToSave: AppData = {
        ...data,
        version: CURRENT_SCHEMA_VERSION,
        lastUpdated: new Date().toISOString(),
      };

      this.memoryCache = dataToSave;

      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      }
    } catch (err) {
      console.error('Error writing to LocalStorage:', err);
    }
  }

  public getTasks(): Task[] {
    return this.getData().tasks;
  }

  public saveTasks(tasks: Task[]): void {
    const current = this.getData();
    this.saveData({
      ...current,
      tasks,
    });
  }

  public getSettings(): ProjectSettings {
    return this.getData().settings;
  }

  public saveSettings(settings: ProjectSettings): void {
    const current = this.getData();
    this.saveData({
      ...current,
      settings,
    });
  }

  public exportJSON(): string {
    const data = this.getData();
    return JSON.stringify(data, null, 2);
  }

  public importJSON(jsonString: string): { success: boolean; error?: string; count?: number } {
    try {
      const parsed = JSON.parse(jsonString);

      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Invalid JSON file: not an object.' };
      }

      let importedTasks: Task[] = [];
      let importedSettings: Partial<ProjectSettings> = {};

      if (Array.isArray(parsed.tasks)) {
        importedTasks = parsed.tasks;
        if (parsed.settings && typeof parsed.settings === 'object') {
          importedSettings = parsed.settings;
        }
      } else if (Array.isArray(parsed)) {
        importedTasks = parsed;
      } else {
        return { success: false, error: 'JSON does not contain a valid tasks array.' };
      }

      // Validate task items schema
      const validTasks: Task[] = [];
      for (const t of importedTasks) {
        if (!t.id || !t.title || !t.phase || !t.status) {
          return { success: false, error: `Invalid task record encountered (Missing id/title/phase/status): ${JSON.stringify(t)}` };
        }
        validTasks.push({
          id: String(t.id).trim(),
          title: String(t.title).trim(),
          description: String(t.description || ''),
          phase: t.phase as PhaseId,
          priority: t.priority || 'Medium',
          status: t.status || 'Not Started',
          dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
          estimatedEffort: Number(t.estimatedEffort) || 0,
          targetDate: t.targetDate || '',
          completedDate: t.completedDate || null,
          notes: String(t.notes || ''),
          references: Array.isArray(t.references) ? t.references : [],
          acceptanceCriteria: String(t.acceptanceCriteria || ''),
          createdAt: t.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      const updatedData: AppData = {
        version: CURRENT_SCHEMA_VERSION,
        settings: {
          ...this.getSettings(),
          ...importedSettings,
        },
        tasks: validTasks,
        lastUpdated: new Date().toISOString(),
      };

      this.saveData(updatedData);
      return { success: true, count: validTasks.length };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Failed to parse JSON: ${msg}` };
    }
  }

  public resetToDefaults(): AppData {
    const defaultData = this.getInitialData();
    this.saveData(defaultData);
    return defaultData;
  }
}

export const taskRepository = new LocalStorageTaskRepository();
