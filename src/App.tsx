import React from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { PhasesView } from './components/phases/PhasesView';
import { KanbanView } from './components/kanban/KanbanView';
import { MilestonesView } from './components/milestones/MilestonesView';
import { SettingsView } from './components/settings/SettingsView';
import { TaskDetailModal } from './components/tasks/TaskDetailModal';
import { TaskFormModal } from './components/tasks/TaskFormModal';
import { ConfirmDialog } from './components/ui/ConfirmDialog';

const AppContent: React.FC = () => {
  const {
    currentView,
    sidebarCollapsed,
    deletingTask,
    closeDeleteConfirm,
    deleteTask,
  } = useProject();

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'tasks':
        return <TasksView />;
      case 'phases':
        return <PhasesView />;
      case 'kanban':
        return <KanbanView />;
      case 'milestones':
        return <MilestonesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          sidebarCollapsed ? 'pl-16' : 'pl-56'
        }`}
      >
        <Header />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <TaskDetailModal />
      <TaskFormModal />

      {/* Delete Task Confirmation */}
      {deletingTask && (
        <ConfirmDialog
          isOpen={Boolean(deletingTask)}
          onClose={closeDeleteConfirm}
          onConfirm={() => {
            if (deletingTask) deleteTask(deletingTask.id);
          }}
          title={`Delete Task: ${deletingTask.id}?`}
          message={`Are you sure you want to delete "${deletingTask.title}"? This action will remove the task and any references to it.`}
          confirmLabel="Delete Task"
          isDestructive={true}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
};

export default App;
