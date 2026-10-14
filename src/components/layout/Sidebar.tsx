import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Layers,
  Kanban,
  Flag,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { ViewType } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    sidebarCollapsed,
    toggleSidebar,
    summaryStats,
  } = useProject();

  const navItems: { id: ViewType; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'tasks',
      label: 'All Tasks',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: summaryStats.total,
    },
    {
      id: 'phases',
      label: 'Phases',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'kanban',
      label: 'Kanban',
      icon: <Kanban className="w-4 h-4" />,
    },
    {
      id: 'milestones',
      label: 'Milestones',
      icon: <Flag className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-200 ease-in-out bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 ${
        sidebarCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-14 px-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          {!sidebarCollapsed && (
            <div className="truncate">
              <span className="text-sm font-semibold text-white tracking-tight">
                Tracker
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!sidebarCollapsed && (
                <>
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-blue-700 text-blue-100'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
