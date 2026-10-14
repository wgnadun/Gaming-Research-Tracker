import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Modal } from '../ui/Modal';
import { PhaseId, Priority, TaskStatus } from '../../types';
import { PHASE_LIST } from '../../data/phases';

export const TaskFormModal: React.FC = () => {
  const {
    tasks,
    taskFormOpen,
    editingTask,
    closeTaskForm,
    createTask,
    updateTask,
  } = useProject();

  const isEditing = Boolean(editingTask);

  const [id, setId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [phase, setPhase] = useState<PhaseId>('P0');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Not Started');
  const [dependenciesInput, setDependenciesInput] = useState<string>('');
  const [estimatedEffort, setEstimatedEffort] = useState<number>(4);
  const [targetDate, setTargetDate] = useState<string>('');
  const [completedDate, setCompletedDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [referencesInput, setReferencesInput] = useState<string>('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingTask) {
      setId(editingTask.id);
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setPhase(editingTask.phase);
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setDependenciesInput((editingTask.dependencies || []).join(', '));
      setEstimatedEffort(editingTask.estimatedEffort || 0);
      setTargetDate(editingTask.targetDate || '');
      setCompletedDate(editingTask.completedDate || '');
      setNotes(editingTask.notes || '');
      setReferencesInput((editingTask.references || []).join('\n'));
      setAcceptanceCriteria(editingTask.acceptanceCriteria || '');
    } else {
      const phaseTasks = tasks.filter((t) => t.phase === phase);
      const nextNum = String(phaseTasks.length + 1).padStart(2, '0');
      setId(`${phase}-${nextNum}`);
      setTitle('');
      setDescription('');
      setPhase('P0');
      setPriority('Medium');
      setStatus('Not Started');
      setDependenciesInput('');
      setEstimatedEffort(4);
      setTargetDate('');
      setCompletedDate('');
      setNotes('');
      setReferencesInput('');
      setAcceptanceCriteria('');
    }
    setError('');
  }, [editingTask, taskFormOpen, tasks, phase]);

  const handlePhaseChange = (newPhase: PhaseId) => {
    setPhase(newPhase);
    if (!isEditing) {
      const phaseTasks = tasks.filter((t) => t.phase === newPhase);
      const nextNum = String(phaseTasks.length + 1).padStart(2, '0');
      setId(`${newPhase}-${nextNum}`);
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    if (newStatus === 'Completed' && !completedDate) {
      setCompletedDate(new Date().toISOString().slice(0, 10));
    } else if (newStatus !== 'Completed') {
      setCompletedDate('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!id.trim()) {
      setError('Task ID is required (e.g. P0-01).');
      return;
    }

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    if (!isEditing && tasks.some((t) => t.id.toLowerCase() === id.trim().toLowerCase())) {
      setError(`Task ID "${id.trim()}" already exists.`);
      return;
    }

    const dependencies = dependenciesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const references = referencesInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const taskPayload = {
      id: id.trim(),
      title: title.trim(),
      description: description.trim(),
      phase,
      priority,
      status,
      dependencies,
      estimatedEffort: Number(estimatedEffort) || 0,
      targetDate: targetDate || '',
      completedDate: status === 'Completed' ? completedDate || new Date().toISOString().slice(0, 10) : null,
      notes: notes.trim(),
      references,
      acceptanceCriteria: acceptanceCriteria.trim(),
    };

    if (isEditing && editingTask) {
      updateTask(editingTask.id, taskPayload);
    } else {
      createTask(taskPayload);
    }

    closeTaskForm();
  };

  return (
    <Modal
      isOpen={taskFormOpen}
      onClose={closeTaskForm}
      title={isEditing ? `Edit Task ${editingTask?.id}` : 'Create Task'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        {error && (
          <div className="p-2.5 rounded bg-red-50 text-red-600 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
              Task ID
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={isEditing}
              placeholder="e.g. P0-01"
              required
              className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono disabled:opacity-60 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
              Phase
            </label>
            <select
              value={phase}
              onChange={(e) => handlePhaseChange(e.target.value as PhaseId)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
            >
              {PHASE_LIST.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
            Task Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement Mesh Simplification"
            required
            className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Implementation details, notes..."
            className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
              Estimated Hours
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={estimatedEffort}
              onChange={(e) => setEstimatedEffort(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
            Dependencies (comma-separated Task IDs, e.g. P0-01, P0-02)
          </label>
          <input
            type="text"
            value={dependenciesInput}
            onChange={(e) => setDependenciesInput(e.target.value)}
            placeholder="e.g. P0-01"
            className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
            Acceptance Criteria
          </label>
          <input
            type="text"
            value={acceptanceCriteria}
            onChange={(e) => setAcceptanceCriteria(e.target.value)}
            placeholder="Condition required to mark complete"
            className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Technical notes or findings..."
            className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
            References (one per line)
          </label>
          <textarea
            value={referencesInput}
            onChange={(e) => setReferencesInput(e.target.value)}
            rows={1}
            placeholder="https://..."
            className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={closeTaskForm}
            className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
          >
            {isEditing ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
