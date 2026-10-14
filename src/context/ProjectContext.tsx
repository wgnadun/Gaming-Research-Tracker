import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Task,
  ProjectSettings,
  ViewType,
  TaskStatus,
  PhaseId,
} from '../types';
import { taskRepository } from '../services/taskRepository';
import {
  calculateSummaryStats,
  calculatePhaseProgress,
  calculateMilestones,
  getCurrentPhase,
  SummaryStats,
  PhaseProgress,
} from '../utils/calculations';

interface ProjectContextType {
  tasks: Task[];
  settings: ProjectSettings;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;

  // Computed metrics
  summaryStats: SummaryStats;
  phaseProgress: PhaseProgress[];
  currentPhase: PhaseProgress;

  // Filter & Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPhaseFilter: string;
  setSelectedPhaseFilter: (phase: string) => void;
  selectedPriorityFilter: string;
  setSelectedPriorityFilter: (priority: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (status: string) => void;
  resetFilters: () => void;

  // Modals & Panels
  selectedTask: Task | null;
  openTaskDetail: (task: Task) => void;
  closeTaskDetail: () => void;

  taskFormOpen: boolean;
  editingTask: Task | null;
  openCreateTask: (defaultPhase?: PhaseId) => void;
  openEditTask: (task: Task) => void;
  closeTaskForm: () => void;

  deletingTask: Task | null;
  openDeleteConfirm: (task: Task) => void;
  closeDeleteConfirm: () => void;

  // CRUD Operations
  createTask: (data: Omit<Task, 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  changeTaskStatus: (id: string, newStatus: TaskStatus) => void;

  // Settings & Theme
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  updateSettings: (newSettings: Partial<ProjectSettings>) => void;

  // Import / Export / Reset
  exportData: () => string;
  importData: (jsonString: string) => { success: boolean; error?: string; count?: number };
  resetData: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialData = taskRepository.getData();
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks);
  const [settings, setSettings] = useState<ProjectSettings>(initialData.settings);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modal states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskFormOpen, setTaskFormOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Sync theme with DOM
  useEffect(() => {
    const isDark = settings.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persist tasks whenever tasks state changes
  const persistTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    taskRepository.saveTasks(newTasks);
  }, []);

  // Persist settings whenever settings state changes
  const persistSettings = useCallback((newSettings: ProjectSettings) => {
    setSettings(newSettings);
    taskRepository.saveSettings(newSettings);
  }, []);

  // Computed metrics
  const summaryStats = useMemo(() => calculateSummaryStats(tasks), [tasks]);
  const phaseProgress = useMemo(() => calculatePhaseProgress(tasks), [tasks]);
  const currentPhase = useMemo(() => getCurrentPhase(phaseProgress), [phaseProgress]);

  // Task Operations
  const createTask = useCallback((data: Omit<Task, 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...data,
      id: data.id.trim(),
      createdAt: now,
      updatedAt: now,
    };

    persistTasks([newTask, ...tasks]);
  }, [tasks, persistTasks]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const now = new Date().toISOString();
    const updated = tasks.map((t) => {
      if (t.id !== id) return t;

      let completedDate = updates.completedDate !== undefined ? updates.completedDate : t.completedDate;
      if (updates.status === 'Completed' && !completedDate) {
        completedDate = new Date().toISOString().slice(0, 10);
      } else if (updates.status && updates.status !== 'Completed' && updates.completedDate === undefined) {
        completedDate = null;
      }

      return {
        ...t,
        ...updates,
        completedDate,
        updatedAt: now,
      };
    });

    persistTasks(updated);

    // Keep selectedTask in sync if viewing detail
    if (selectedTask && selectedTask.id === id) {
      const updatedItem = updated.find((t) => t.id === id);
      if (updatedItem) setSelectedTask(updatedItem);
    }
  }, [tasks, selectedTask, persistTasks]);

  const deleteTask = useCallback((id: string) => {
    const remaining = tasks.filter((t) => t.id !== id);
    persistTasks(remaining);
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask(null);
    }
  }, [tasks, selectedTask, persistTasks]);

  const changeTaskStatus = useCallback((id: string, newStatus: TaskStatus) => {
    updateTask(id, { status: newStatus });
  }, [updateTask]);

  // Filter reset
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedPhaseFilter('all');
    setSelectedPriorityFilter('all');
    setSelectedStatusFilter('all');
  }, []);

  // Modal helpers
  const openTaskDetail = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  const closeTaskDetail = useCallback(() => {
    setSelectedTask(null);
  }, []);

  const openCreateTask = useCallback((defaultPhase?: PhaseId) => {
    setEditingTask(null);
    setTaskFormOpen(true);
  }, []);

  const openEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  }, []);

  const closeTaskForm = useCallback(() => {
    setTaskFormOpen(false);
    setEditingTask(null);
  }, []);

  const openDeleteConfirm = useCallback((task: Task) => {
    setDeletingTask(task);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeletingTask(null);
  }, []);

  // Theme & Settings
  const toggleTheme = useCallback(() => {
    const next = settings.theme === 'dark' ? 'light' : 'dark';
    persistSettings({ ...settings, theme: next });
  }, [settings, persistSettings]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<ProjectSettings>) => {
    persistSettings({ ...settings, ...newSettings });
  }, [settings, persistSettings]);

  // Import / Export / Reset
  const exportData = useCallback(() => {
    return taskRepository.exportJSON();
  }, []);

  const importData = useCallback((jsonString: string) => {
    const res = taskRepository.importJSON(jsonString);
    if (res.success) {
      const fresh = taskRepository.getData();
      setTasks(fresh.tasks);
      setSettings(fresh.settings);
    }
    return res;
  }, []);

  const resetData = useCallback(() => {
    const fresh = taskRepository.resetToDefaults();
    setTasks(fresh.tasks);
    setSettings(fresh.settings);
    setSelectedTask(null);
    setEditingTask(null);
  }, []);

  const value = {
    tasks,
    settings,
    currentView,
    setCurrentView,
    summaryStats,
    phaseProgress,
    currentPhase,
    searchQuery,
    setSearchQuery,
    selectedPhaseFilter,
    setSelectedPhaseFilter,
    selectedPriorityFilter,
    setSelectedPriorityFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    resetFilters,
    selectedTask,
    openTaskDetail,
    closeTaskDetail,
    taskFormOpen,
    editingTask,
    openCreateTask,
    openEditTask,
    closeTaskForm,
    deletingTask,
    openDeleteConfirm,
    closeDeleteConfirm,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    sidebarCollapsed,
    toggleSidebar,
    toggleTheme,
    updateSettings,
    exportData,
    importData,
    resetData,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
