import React from 'react';
import { Sun, Moon, Plus, Menu } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const Header: React.FC = () => {
  const {
    currentView,
    settings,
    toggleTheme,
    toggleSidebar,
    openCreateTask,
  } = useProject();

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    tasks: 'All Tasks',
    phases: 'Development Phases',
    kanban: 'Kanban Board',
    milestones: 'Milestones',
    settings: 'Settings',
  };

  return (
    <header className="sticky top-0 z-20 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between transition-colors">
      {/* Left: View title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="lg:hidden p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-md"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          {viewTitles[currentView] || 'Research Tracker'}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* New Task Button */}
        <button
          type="button"
          onClick={() => openCreateTask()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
