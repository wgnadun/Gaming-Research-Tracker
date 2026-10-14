export type PhaseId = 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Completed';

export interface Task {
  id: string; // e.g. "P0-01"
  title: string;
  description: string;
  phase: PhaseId;
  priority: Priority;
  status: TaskStatus;
  dependencies: string[]; // List of Task IDs
  estimatedEffort: number; // in hours
  targetDate: string; // YYYY-MM-DD
  completedDate: string | null; // YYYY-MM-DD or null
  notes: string;
  references: string[]; // URLs or documentation references
  acceptanceCriteria: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhaseInfo {
  id: PhaseId;
  code: string;
  name: string;
  goal: string;
  order: number;
}

export interface Milestone {
  id: string; // e.g. "M1"
  code: string;
  title: string;
  phase: PhaseId;
  description: string;
  targetDate: string;
  completedDate: string | null;
  isCompleted: boolean;
}

export interface ProjectSettings {
  researchTitle: string;
  applicationName: string;
  projectStartDate: string;
  targetCompletionDate: string;
  defaultPhase: PhaseId;
  theme: 'light' | 'dark';
}

export interface AppData {
  version: number;
  settings: ProjectSettings;
  tasks: Task[];
  lastUpdated?: string;
}

export type ViewType = 
  | 'dashboard' 
  | 'tasks' 
  | 'phases' 
  | 'kanban' 
  | 'milestones' 
  | 'settings';
