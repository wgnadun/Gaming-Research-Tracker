import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertTriangle,
  Sun,
  Moon,
  Save,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { PHASE_LIST } from '../../data/phases';
import { PhaseId } from '../../types';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    resetData,
    tasks,
  } = useProject();

  const [researchTitle, setResearchTitle] = useState(settings.researchTitle);
  const [projectStartDate, setProjectStartDate] = useState(settings.projectStartDate);
  const [targetCompletionDate, setTargetCompletionDate] = useState(settings.targetCompletionDate);
  const [defaultPhase, setDefaultPhase] = useState<PhaseId>(settings.defaultPhase);
  const [savedNotice, setSavedNotice] = useState(false);
  const [importNotice, setImportNotice] = useState<{ message: string; isError?: boolean } | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      researchTitle,
      projectStartDate,
      targetCompletionDate,
      defaultPhase,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleExportJSON = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `research_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importData(content);
      if (res.success) {
        setImportNotice({ message: `Imported ${res.count} tasks successfully.` });
      } else {
        setImportNotice({ message: res.error || 'Import failed.', isError: true });
      }
      setTimeout(() => setImportNotice(null), 5000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Project Settings Card */}
      <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h2 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
          Research Configuration
        </h2>

        <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
          {savedNotice && (
            <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
              <Check className="w-4 h-4" />
              <span>Settings saved.</span>
            </div>
          )}

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
              Thesis / Project Title
            </label>
            <input
              type="text"
              value={researchTitle}
              onChange={(e) => setResearchTitle(e.target.value)}
              required
              className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={projectStartDate}
                onChange={(e) => setProjectStartDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Target Completion Date
              </label>
              <input
                type="date"
                value={targetCompletionDate}
                onChange={(e) => setTargetCompletionDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Default Phase
              </label>
              <select
                value={defaultPhase}
                onChange={(e) => setDefaultPhase(e.target.value as PhaseId)}
                className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {PHASE_LIST.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </form>
      </div>

      {/* Theme Preference */}
      <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200 block">Theme</span>
          <span className="text-slate-400 text-[11px]">Choose Light or Dark interface</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => updateSettings({ theme: 'light' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs ${
              settings.theme === 'light'
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 font-semibold'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </button>
          <button
            type="button"
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs ${
              settings.theme === 'dark'
                ? 'bg-slate-800 border-slate-600 text-slate-100 font-semibold'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Data Backup */}
      <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200 block">Backup & Restore</span>
          <span className="text-slate-400 text-[11px] block mt-0.5">
            LocalStorage contains {tasks.length} tasks. Export JSON to keep a file backup or restore on another machine.
          </span>
        </div>

        {importNotice && (
          <div
            className={`p-2.5 rounded text-xs font-medium border flex items-center gap-2 ${
              importNotice.isError
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {importNotice.isError ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            <span>{importNotice.message}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded border border-slate-200 dark:border-slate-700"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Backup</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-900 ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Predefined 65 Tasks</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={resetData}
        title="Reset to 65 Predefined Tasks?"
        message="This will restore all tasks back to the default predefined state. Custom changes will be replaced."
        confirmLabel="Reset Tasks"
        isDestructive={true}
      />
    </div>
  );
};
