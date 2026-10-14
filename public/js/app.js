/**
 * NexusOps // Gaming Research Task Tracker
 * Interactive Frontend Controller
 */

// Application State
const state = {
  tasks: [],
  stats: null,
  metadata: { categories: [], games: [], tags: [] },
  filters: {
    search: '',
    game: 'all',
    category: 'all',
    priority: 'all',
    sortBy: 'updated'
  },
  currentView: 'board', // 'board' or 'list'
  selectedTask: null
};

// DOM Element References
const elements = {
  // Stats
  statTotal: document.getElementById('statTotal'),
  statActive: document.getElementById('statActive'),
  statHours: document.getElementById('statHours'),
  statHoursEst: document.getElementById('statHoursEst'),
  statRate: document.getElementById('statRate'),
  statProgressFill: document.getElementById('statProgressFill'),
  statGamesCount: document.getElementById('statGamesCount'),

  // Filters & Controls
  searchInput: document.getElementById('searchInput'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  filterGame: document.getElementById('filterGame'),
  filterCategory: document.getElementById('filterCategory'),
  filterPriority: document.getElementById('filterPriority'),
  sortBy: document.getElementById('sortBy'),
  viewBoardBtn: document.getElementById('viewBoardBtn'),
  viewListBtn: document.getElementById('viewListBtn'),
  btnResetSeed: document.getElementById('btnResetSeed'),
  btnExportData: document.getElementById('btnExportData'),
  btnNewTask: document.getElementById('btnNewTask'),
  btnClearFilters: document.getElementById('btnClearFilters'),

  // Views
  boardView: document.getElementById('boardView'),
  listView: document.getElementById('listView'),
  emptyState: document.getElementById('emptyState'),
  listTableBody: document.getElementById('listTableBody'),

  // Kanban Columns
  tasksBacklog: document.getElementById('tasksBacklog'),
  tasksInProgress: document.getElementById('tasksInProgress'),
  tasksTesting: document.getElementById('tasksTesting'),
  tasksCompleted: document.getElementById('tasksCompleted'),
  countBacklog: document.getElementById('countBacklog'),
  countInProgress: document.getElementById('countInProgress'),
  countTesting: document.getElementById('countTesting'),
  countCompleted: document.getElementById('countCompleted'),

  // Detail Modal
  detailModal: document.getElementById('detailModal'),
  btnDetailClose: document.getElementById('btnDetailClose'),
  detailGame: document.getElementById('detailGame'),
  detailCategory: document.getElementById('detailCategory'),
  detailPriority: document.getElementById('detailPriority'),
  detailStatus: document.getElementById('detailStatus'),
  detailTitle: document.getElementById('detailTitle'),
  detailLoggedHours: document.getElementById('detailLoggedHours'),
  detailEstHours: document.getElementById('detailEstHours'),
  detailUpdatedAt: document.getElementById('detailUpdatedAt'),
  detailHypothesis: document.getElementById('detailHypothesis'),
  detailFindings: document.getElementById('detailFindings'),
  detailReferences: document.getElementById('detailReferences'),
  detailTags: document.getElementById('detailTags'),
  btnDetailDelete: document.getElementById('btnDetailDelete'),
  btnDetailEdit: document.getElementById('btnDetailEdit'),

  // Form Modal
  formModal: document.getElementById('formModal'),
  formModalTitle: document.getElementById('formModalTitle'),
  btnFormClose: document.getElementById('btnFormClose'),
  btnFormCancel: document.getElementById('btnFormCancel'),
  taskForm: document.getElementById('taskForm'),
  formTaskId: document.getElementById('formTaskId'),
  formTitle: document.getElementById('formTitle'),
  formGame: document.getElementById('formGame'),
  formCategory: document.getElementById('formCategory'),
  formStatus: document.getElementById('formStatus'),
  formPriority: document.getElementById('formPriority'),
  formLoggedHours: document.getElementById('formLoggedHours'),
  formEstHours: document.getElementById('formEstHours'),
  formHypothesis: document.getElementById('formHypothesis'),
  formFindings: document.getElementById('formFindings'),
  formReferences: document.getElementById('formReferences'),
  formTags: document.getElementById('formTags'),
  gameSuggestions: document.getElementById('gameSuggestions'),

  // Toasts
  toastContainer: document.getElementById('toastContainer')
};

// API Helpers
const API = {
  async fetchTasks(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/tasks?${qs}`);
    if (!res.ok) throw new Error('Failed to load tasks');
    return res.json();
  },

  async fetchStats() {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to load stats');
    return res.json();
  },

  async fetchMeta() {
    const res = await fetch('/api/meta');
    if (!res.ok) throw new Error('Failed to load metadata');
    return res.json();
  },

  async createTask(data) {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create task');
    }
    return res.json();
  },

  async updateTask(id, data) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update task');
    }
    return res.json();
  },

  async deleteTask(id) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.json();
  },

  async resetSeed() {
    const res = await fetch('/api/reset-seed', {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to reset seed');
    return res.json();
  }
};

// Notification Toast
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
  toast.innerHTML = `
    <span>${type === 'error' ? '⚠️' : '⚡'}</span>
    <span>${message}</span>
  `;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Data Loading & Sync
async function reloadData() {
  try {
    const [tasksRes, statsRes, metaRes] = await Promise.all([
      API.fetchTasks(state.filters),
      API.fetchStats(),
      API.fetchMeta()
    ]);

    state.tasks = tasksRes.data || [];
    state.stats = statsRes.data || null;
    state.metadata = metaRes.data || { categories: [], games: [], tags: [] };

    updateMetadataDropdowns();
    renderStats();
    renderTasks();
  } catch (err) {
    console.error('Data reload error:', err);
    showToast(err.message, 'error');
  }
}

// Populate Category & Game options dynamically
function updateMetadataDropdowns() {
  const currentCategory = state.filters.category;
  const currentGame = state.filters.game;

  // Category Filter
  elements.filterCategory.innerHTML = '<option value="all">All Disciplines</option>' +
    state.metadata.categories.map(c => `<option value="${escapeHtml(c)}" ${c === currentCategory ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('');

  // Game Filter
  elements.filterGame.innerHTML = '<option value="all">All Games</option>' +
    state.metadata.games.map(g => `<option value="${escapeHtml(g)}" ${g === currentGame ? 'selected' : ''}>${escapeHtml(g)}</option>`).join('');

  // Form Game Datalist Suggestions
  elements.gameSuggestions.innerHTML = state.metadata.games.map(g => `<option value="${escapeHtml(g)}"></option>`).join('');
}

// Render Stats Banner
function renderStats() {
  if (!state.stats) return;
  const s = state.stats;

  elements.statTotal.textContent = s.total;
  elements.statGamesCount.textContent = `${s.uniqueGamesCount} Target ${s.uniqueGamesCount === 1 ? 'Game' : 'Games'}`;
  elements.statActive.textContent = s.activeDeepDives;
  elements.statHours.textContent = `${s.totalLoggedHours}h`;
  elements.statHoursEst.textContent = `Est: ${s.totalEstimatedHours}h`;
  elements.statRate.textContent = `${s.completionRate}%`;
  elements.statProgressFill.style.width = `${Math.min(100, s.completionRate)}%`;
}

// Render Tasks based on active view
function renderTasks() {
  const hasTasks = state.tasks.length > 0;

  if (!hasTasks) {
    elements.boardView.style.display = 'none';
    elements.listView.style.display = 'none';
    elements.emptyState.style.display = 'block';
    return;
  }

  elements.emptyState.style.display = 'none';

  if (state.currentView === 'board') {
    elements.boardView.style.display = 'grid';
    elements.listView.style.display = 'none';
    renderBoard();
  } else {
    elements.boardView.style.display = 'none';
    elements.listView.style.display = 'block';
    renderList();
  }
}

// Render Kanban Board
function renderBoard() {
  const columns = {
    backlog: [],
    'in-progress': [],
    testing: [],
    completed: []
  };

  state.tasks.forEach(task => {
    if (columns[task.status]) {
      columns[task.status].push(task);
    } else {
      columns.backlog.push(task);
    }
  });

  // Update counts
  elements.countBacklog.textContent = columns.backlog.length;
  elements.countInProgress.textContent = columns['in-progress'].length;
  elements.countTesting.textContent = columns.testing.length;
  elements.countCompleted.textContent = columns.completed.length;

  // Render cards into columns
  renderColumn(elements.tasksBacklog, columns.backlog);
  renderColumn(elements.tasksInProgress, columns['in-progress']);
  renderColumn(elements.tasksTesting, columns.testing);
  renderColumn(elements.tasksCompleted, columns.completed);
}

function renderColumn(container, tasks) {
  if (tasks.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 24px 10px; color: var(--text-dim); font-size: 0.8rem; font-style: italic;">No studies in this stage</div>`;
    return;
  }

  container.innerHTML = tasks.map(task => createTaskCardHtml(task)).join('');

  // Add click listeners
  container.querySelectorAll('.task-card').forEach(card => {
    const id = card.dataset.id;
    card.addEventListener('click', (e) => {
      // Ignore if clicking action buttons inside card
      if (e.target.closest('.btn-card-action')) return;
      openDetailModal(id);
    });
  });

  // Add advance status button listeners
  container.querySelectorAll('.btn-advance').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      await advanceTaskStatus(id);
    });
  });
}

// Generate HTML for a Kanban Card
function createTaskCardHtml(task) {
  const priorityClass = `priority-${task.priority || 'medium'}`;
  const nextStatusLabel = getNextStatusLabel(task.status);

  return `
    <div class="task-card" data-id="${task.id}">
      <div class="task-card-header">
        <span class="game-pill" title="${escapeHtml(task.game)}">${escapeHtml(task.game)}</span>
        <span class="priority-badge ${priorityClass}">${task.priority}</span>
      </div>

      <h3 class="task-card-title">${escapeHtml(task.title)}</h3>
      
      ${task.hypothesis ? `<p class="task-card-hypothesis">${escapeHtml(task.hypothesis)}</p>` : ''}

      <div class="task-card-footer">
        <div class="task-hours-badge">
          <span>${task.loggedHours || 0}</span> / ${task.estimatedHours || 0} hrs
        </div>
        <div class="task-card-actions">
          <button class="btn-card-action btn-advance" data-id="${task.id}" title="Advance to ${nextStatusLabel}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

// Render Table List View
function renderList() {
  elements.listTableBody.innerHTML = state.tasks.map(task => {
    const priorityClass = `priority-${task.priority || 'medium'}`;
    const statusClass = `status-${task.status}`;

    return `
      <tr data-id="${task.id}" class="table-row-item" style="cursor: pointer;">
        <td><span class="status-badge ${statusClass}">${formatStatusName(task.status)}</span></td>
        <td><span class="priority-badge ${priorityClass}">${task.priority}</span></td>
        <td style="font-weight: 600; color: #fff;">${escapeHtml(task.title)}</td>
        <td><span class="game-pill">${escapeHtml(task.game)}</span></td>
        <td style="color: var(--text-muted); font-size: 0.85rem;">${escapeHtml(task.category)}</td>
        <td style="font-family: var(--font-mono); font-size: 0.82rem;">${task.loggedHours || 0} / ${task.estimatedHours || 0}h</td>
        <td>
          <div class="tags-container">
            ${(task.tags || []).slice(0, 2).map(tag => `<span class="tag-badge">#${escapeHtml(tag)}</span>`).join('')}
          </div>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn-card-action btn-table-view" data-id="${task.id}" title="View Details">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button class="btn-card-action btn-table-advance" data-id="${task.id}" title="Advance Status">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  elements.listTableBody.querySelectorAll('.table-row-item').forEach(row => {
    const id = row.dataset.id;
    row.addEventListener('click', (e) => {
      if (e.target.closest('.btn-card-action')) return;
      openDetailModal(id);
    });
  });

  elements.listTableBody.querySelectorAll('.btn-table-view').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDetailModal(btn.dataset.id);
    });
  });

  elements.listTableBody.querySelectorAll('.btn-table-advance').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await advanceTaskStatus(btn.dataset.id);
    });
  });
}

// Next Status Logic (cyclic workflow)
function getNextStatus(current) {
  const order = ['backlog', 'in-progress', 'testing', 'completed'];
  const idx = order.indexOf(current);
  if (idx === -1 || idx === order.length - 1) return 'backlog';
  return order[idx + 1];
}

function getNextStatusLabel(current) {
  const next = getNextStatus(current);
  return formatStatusName(next);
}

function formatStatusName(status) {
  switch (status) {
    case 'backlog': return 'Backlog';
    case 'in-progress': return 'In Progress';
    case 'testing': return 'Testing / Bench';
    case 'completed': return 'Documented';
    default: return status;
  }
}

async function advanceTaskStatus(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  const nextStatus = getNextStatus(task.status);
  try {
    await API.updateTask(id, { status: nextStatus });
    showToast(`Status updated to ${formatStatusName(nextStatus)}`);
    await reloadData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Detail Modal
function openDetailModal(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  state.selectedTask = task;

  elements.detailGame.textContent = task.game;
  elements.detailCategory.textContent = task.category;
  elements.detailPriority.textContent = task.priority;
  elements.detailPriority.className = `priority-badge priority-${task.priority}`;
  elements.detailStatus.textContent = formatStatusName(task.status);
  elements.detailStatus.className = `status-badge status-${task.status}`;

  elements.detailTitle.textContent = task.title;
  elements.detailLoggedHours.textContent = `${task.loggedHours || 0} hrs`;
  elements.detailEstHours.textContent = `${task.estimatedHours || 0} hrs`;
  elements.detailUpdatedAt.textContent = new Date(task.updatedAt || Date.now()).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  elements.detailHypothesis.textContent = task.hypothesis || 'No hypothesis logged for this study.';
  elements.detailFindings.textContent = task.findings || 'Pending investigation and laboratory benchmarking.';

  // References list
  if (Array.isArray(task.references) && task.references.length > 0) {
    elements.detailReferences.innerHTML = task.references.map(ref => {
      const isUrl = ref.startsWith('http://') || ref.startsWith('https://');
      return `<li>${isUrl ? `<a href="${escapeHtml(ref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ref)} ↗</a>` : escapeHtml(ref)}</li>`;
    }).join('');
  } else {
    elements.detailReferences.innerHTML = `<li style="color: var(--text-dim); font-style: italic;">No external references linked.</li>`;
  }

  // Tags list
  if (Array.isArray(task.tags) && task.tags.length > 0) {
    elements.detailTags.innerHTML = task.tags.map(tag => `<span class="tag-badge">#${escapeHtml(tag)}</span>`).join('');
  } else {
    elements.detailTags.innerHTML = `<span style="color: var(--text-dim); font-size: 0.8rem;">No tags</span>`;
  }

  elements.detailModal.style.display = 'flex';
}

function closeDetailModal() {
  elements.detailModal.style.display = 'none';
  state.selectedTask = null;
}

// Form Modal (Create & Edit)
function openCreateModal() {
  elements.formModalTitle.textContent = 'NEW RESEARCH STUDY';
  elements.taskForm.reset();
  elements.formTaskId.value = '';
  elements.formStatus.value = 'backlog';
  elements.formPriority.value = 'medium';
  elements.formLoggedHours.value = '0';
  elements.formEstHours.value = '4';
  elements.formModal.style.display = 'flex';
  setTimeout(() => elements.formTitle.focus(), 50);
}

function openEditModal(task) {
  elements.formModalTitle.textContent = 'EDIT RESEARCH STUDY';
  elements.formTaskId.value = task.id;
  elements.formTitle.value = task.title;
  elements.formGame.value = task.game;
  elements.formCategory.value = task.category;
  elements.formStatus.value = task.status;
  elements.formPriority.value = task.priority;
  elements.formLoggedHours.value = task.loggedHours || 0;
  elements.formEstHours.value = task.estimatedHours || 0;
  elements.formHypothesis.value = task.hypothesis || '';
  elements.formFindings.value = task.findings || '';
  elements.formReferences.value = (task.references || []).join('\n');
  elements.formTags.value = (task.tags || []).join(', ');

  elements.formModal.style.display = 'flex';
  setTimeout(() => elements.formTitle.focus(), 50);
}

function closeFormModal() {
  elements.formModal.style.display = 'none';
}

// Export JSON
function exportDataAsJson() {
  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.tasks, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", jsonStr);
  dlAnchor.setAttribute("download", `gaming_research_tasks_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
  showToast('Research data exported successfully');
}

// Helper: Escape HTML string
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Setup Event Listeners
function setupEventListeners() {
  // Search with debounce
  let searchTimeout = null;
  elements.searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    elements.btnClearSearch.style.display = val ? 'block' : 'none';
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.filters.search = val;
      reloadData();
    }, 250);
  });

  elements.btnClearSearch.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.btnClearSearch.style.display = 'none';
    state.filters.search = '';
    reloadData();
  });

  // Filter dropdowns
  elements.filterGame.addEventListener('change', (e) => {
    state.filters.game = e.target.value;
    reloadData();
  });

  elements.filterCategory.addEventListener('change', (e) => {
    state.filters.category = e.target.value;
    reloadData();
  });

  elements.filterPriority.addEventListener('change', (e) => {
    state.filters.priority = e.target.value;
    reloadData();
  });

  elements.sortBy.addEventListener('change', (e) => {
    state.filters.sortBy = e.target.value;
    reloadData();
  });

  // Clear all filters button in empty state
  elements.btnClearFilters.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.btnClearSearch.style.display = 'none';
    state.filters.search = '';
    state.filters.game = 'all';
    state.filters.category = 'all';
    state.filters.priority = 'all';
    state.filters.sortBy = 'updated';
    elements.filterGame.value = 'all';
    elements.filterCategory.value = 'all';
    elements.filterPriority.value = 'all';
    elements.sortBy.value = 'updated';
    reloadData();
  });

  // View switchers
  elements.viewBoardBtn.addEventListener('click', () => {
    if (state.currentView === 'board') return;
    state.currentView = 'board';
    elements.viewBoardBtn.classList.add('active');
    elements.viewListBtn.classList.remove('active');
    renderTasks();
  });

  elements.viewListBtn.addEventListener('click', () => {
    if (state.currentView === 'list') return;
    state.currentView = 'list';
    elements.viewListBtn.classList.add('active');
    elements.viewBoardBtn.classList.remove('active');
    renderTasks();
  });

  // Header buttons
  elements.btnNewTask.addEventListener('click', openCreateModal);
  elements.btnExportData.addEventListener('click', exportDataAsJson);
  elements.btnResetSeed.addEventListener('click', async () => {
    if (confirm('Reset to initial gaming research sample data? Any unexported custom tasks will be overwritten.')) {
      try {
        await API.resetSeed();
        showToast('Sample gaming research studies loaded!');
        await reloadData();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  });

  // Detail Modal actions
  elements.btnDetailClose.addEventListener('click', closeDetailModal);
  elements.detailModal.addEventListener('click', (e) => {
    if (e.target === elements.detailModal) closeDetailModal();
  });

  elements.btnDetailEdit.addEventListener('click', () => {
    if (!state.selectedTask) return;
    const taskToEdit = { ...state.selectedTask };
    closeDetailModal();
    openEditModal(taskToEdit);
  });

  elements.btnDetailDelete.addEventListener('click', async () => {
    if (!state.selectedTask) return;
    if (confirm(`Are you sure you want to delete "${state.selectedTask.title}"?`)) {
      try {
        await API.deleteTask(state.selectedTask.id);
        showToast('Research study deleted');
        closeDetailModal();
        await reloadData();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  });

  // Form Modal actions
  elements.btnFormClose.addEventListener('click', closeFormModal);
  elements.btnFormCancel.addEventListener('click', closeFormModal);
  elements.formModal.addEventListener('click', (e) => {
    if (e.target === elements.formModal) closeFormModal();
  });

  // Form Submit
  elements.taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = elements.formTaskId.value;

    const payload = {
      title: elements.formTitle.value.trim(),
      game: elements.formGame.value.trim(),
      category: elements.formCategory.value,
      status: elements.formStatus.value,
      priority: elements.formPriority.value,
      loggedHours: parseFloat(elements.formLoggedHours.value) || 0,
      estimatedHours: parseFloat(elements.formEstHours.value) || 0,
      hypothesis: elements.formHypothesis.value.trim(),
      findings: elements.formFindings.value.trim(),
      references: elements.formReferences.value,
      tags: elements.formTags.value
    };

    try {
      if (id) {
        await API.updateTask(id, payload);
        showToast('Study updated successfully!');
      } else {
        await API.createTask(payload);
        showToast('New research study initialized!');
      }
      closeFormModal();
      await reloadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (elements.formModal.style.display === 'flex') closeFormModal();
      if (elements.detailModal.style.display === 'flex') closeDetailModal();
    }
    // Ctrl+N or Alt+N to create new task
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      openCreateModal();
    }
  });
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  reloadData();
});
