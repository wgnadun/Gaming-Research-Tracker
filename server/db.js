const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

const INITIAL_SEEDS = [
  {
    id: 'grt-001',
    title: 'Boss Aggro Pacing & Input Reading Detection',
    game: 'Elden Ring',
    category: 'AI & Combat Mechanics',
    status: 'in-progress',
    priority: 'critical',
    hypothesis: 'Analyze whether late-game bosses (e.g. Malenia, Radagon) trigger counter-animations based on player heal button inputs or player startup recovery frames.',
    findings: 'Found direct event hooks listening to flask usage state within 2 frames of player startup animation. Boss stance recovery frames dictate responsiveness.',
    references: [
      'https://gdc.gdconf.com/archive',
      'FromSoftware AI State Machine decompilation analysis notes'
    ],
    tags: ['soulslike', 'ai', 'combat-design', 'frame-data'],
    estimatedHours: 10,
    loggedHours: 6.5,
    createdAt: '2026-10-10T10:00:00.000Z',
    updatedAt: '2026-10-13T14:30:00.000Z'
  },
  {
    id: 'grt-002',
    title: 'Path Tracing Denoising & Frametime Consistency in Night City',
    game: 'Cyberpunk 2077',
    category: 'Engine & Graphics',
    status: 'testing',
    priority: 'high',
    hypothesis: 'Quantify frametime variance (1% lows) using ReSTIR Direct Illumination + Ray Reconstruction vs classic screen-space reflections in dense urban neon scenes.',
    findings: 'ReSTIR DI stabilizes specular bounce flickering significantly; 1% low frametimes improved by 18% with Ray Reconstruction enabled over DLSS 3.1 standard denoiser.',
    references: [
      'NVIDIA Developer Ray Reconstruction Whitepaper',
      'Digital Foundry REDengine 4 analysis'
    ],
    tags: ['ray-tracing', 'graphics', 'frametime', 'engine'],
    estimatedHours: 16,
    loggedHours: 12,
    createdAt: '2026-10-08T09:15:00.000Z',
    updatedAt: '2026-10-14T11:20:00.000Z'
  },
  {
    id: 'grt-003',
    title: 'Physics Constraint Solver & Multi-Body Weld Durability',
    game: 'Zelda: Tears of the Kingdom',
    category: 'Physics & Mechanics',
    status: 'in-progress',
    priority: 'critical',
    hypothesis: 'Deconstruct Havok sub-stepping and joint torque limits during multi-rotational fan propulsion on custom physics crafts.',
    findings: 'Discovered joint tensile strength degrades when angular velocity exceeds 720 deg/s without counterbalancing counter-weights.',
    references: [
      'Nintendo GDC 2024: The Physics Behind Tears of the Kingdom',
      'Hyrule Engineering Club community stress tests'
    ],
    tags: ['physics', 'emergent-gameplay', 'nintendo', 'havok'],
    estimatedHours: 14,
    loggedHours: 9,
    createdAt: '2026-10-11T12:00:00.000Z',
    updatedAt: '2026-10-14T08:45:00.000Z'
  },
  {
    id: 'grt-004',
    title: 'Narrative Branching Complexity & Fail-Forward State Machines',
    game: 'Baldurs Gate 3',
    category: 'Narrative & Worldbuilding',
    status: 'completed',
    priority: 'high',
    hypothesis: 'Map how quest objectives in Act 3 avoid hard game-over states when major companion NPCs are eliminated prior to climax encounters.',
    findings: 'Larian implements tertiary fallback actors and dynamic letter/journal discoveries to bypass missing quest givers seamlessly.',
    references: [
      'Larian Studios GDC Dialogue System breakdown',
      'D&D 5e Quest Hierarchy taxonomy document'
    ],
    tags: ['dialogue-tree', 'narrative', 'rpg', 'quest-design'],
    estimatedHours: 18,
    loggedHours: 18,
    createdAt: '2026-10-01T15:00:00.000Z',
    updatedAt: '2026-10-12T17:00:00.000Z'
  },
  {
    id: 'grt-005',
    title: 'Boon Synergy Probabilities & RNG Weight Modulation',
    game: 'Hades II',
    category: 'Game Economy & Balance',
    status: 'backlog',
    priority: 'medium',
    hypothesis: 'Determine whether legendary boon roll weights increase conditionally based on existing god tier-1 affinities or room reroll counts.',
    findings: 'Initial sample size of 50 runs suggests dual-boon prerequisites enforce a 12% baseline trigger chance.',
    references: [
      'Supergiant Games Roguelike Progression Architecture talk',
      'Community speedrunner boon seed analyzer'
    ],
    tags: ['roguelite', 'rng', 'balance', 'math-model'],
    estimatedHours: 8,
    loggedHours: 1.5,
    createdAt: '2026-10-12T16:20:00.000Z',
    updatedAt: '2026-10-12T16:20:00.000Z'
  },
  {
    id: 'grt-006',
    title: 'Sub-tick Client Interpolation & Peeker Advantage Measurement',
    game: 'Valorant',
    category: 'Multiplayer & Netcode',
    status: 'completed',
    priority: 'high',
    hypothesis: 'Measure the exact round-trip photon-to-hit confirmation window across client ping variations from 15ms to 75ms on 128-tick servers.',
    findings: 'Riot Games client movement prediction clamps maximum extrapolation to 48ms, effectively bounding peeker advantage within human visual reaction thresholds.',
    references: [
      'Riot Games Tech Blog: 128-Tick Server Architecture',
      'LatencyFleX high-speed camera test methodology'
    ],
    tags: ['netcode', 'esports', 'fps', 'latency'],
    estimatedHours: 15,
    loggedHours: 15,
    createdAt: '2026-09-28T11:00:00.000Z',
    updatedAt: '2026-10-09T19:30:00.000Z'
  },
  {
    id: 'grt-007',
    title: 'Dual Reality Asset Streaming & Mind Place Dimension Switch Latency',
    game: 'Alan Wake 2',
    category: 'Engine & Graphics',
    status: 'backlog',
    priority: 'medium',
    hypothesis: 'Examine Northlight Engine direct memory swaps between the Dark Place and Saga’s Mind Room to determine whether geometry remains resident in VRAM.',
    findings: '',
    references: [
      'Remedy Entertainment Northlight Engine presentation',
      'GPU memory profiling via RenderDoc'
    ],
    tags: ['engine', 'streaming', 'horror', 'vram'],
    estimatedHours: 6,
    loggedHours: 0,
    createdAt: '2026-10-14T07:15:00.000Z',
    updatedAt: '2026-10-14T07:15:00.000Z'
  }
];

class TaskDatabase {
  constructor() {
    this.ensureDataFile();
  }

  ensureDataFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      this.writeTasks(INITIAL_SEEDS);
    }
  }

  readTasks() {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        return [];
      }
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading tasks database:', err);
      return [];
    }
  }

  writeTasks(tasks) {
    try {
      const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(tasks, null, 2), 'utf8');
      fs.renameSync(tempFile, DATA_FILE);
      return true;
    } catch (err) {
      console.error('Error writing tasks database:', err);
      return false;
    }
  }

  getAll(filters = {}) {
    let tasks = this.readTasks();

    const { search, category, game, status, priority, sortBy } = filters;

    if (search) {
      const q = search.toLowerCase().trim();
      tasks = tasks.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.game && t.game.toLowerCase().includes(q)) ||
        (t.hypothesis && t.hypothesis.toLowerCase().includes(q)) ||
        (t.findings && t.findings.toLowerCase().includes(q)) ||
        (Array.isArray(t.tags) && t.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    if (category && category !== 'all') {
      tasks = tasks.filter(t => t.category === category);
    }

    if (game && game !== 'all') {
      tasks = tasks.filter(t => t.game === game);
    }

    if (status && status !== 'all') {
      tasks = tasks.filter(t => t.status === status);
    }

    if (priority && priority !== 'all') {
      tasks = tasks.filter(t => t.priority === priority);
    }

    if (sortBy) {
      tasks.sort((a, b) => {
        if (sortBy === 'priority') {
          const rank = { critical: 4, high: 3, medium: 2, low: 1 };
          return (rank[b.priority] || 0) - (rank[a.priority] || 0);
        }
        if (sortBy === 'hours') {
          return (b.loggedHours || 0) - (a.loggedHours || 0);
        }
        if (sortBy === 'game') {
          return (a.game || '').localeCompare(b.game || '');
        }
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }
        // default: updatedAt desc
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      });
    }

    return tasks;
  }

  getById(id) {
    const tasks = this.readTasks();
    return tasks.find(t => t.id === id) || null;
  }

  create(data) {
    const tasks = this.readTasks();
    const now = new Date().toISOString();
    const id = 'grt-' + crypto.randomBytes(3).toString('hex');

    const newTask = {
      id,
      title: (data.title || 'Untitled Research Study').trim(),
      game: (data.game || 'General Gaming').trim(),
      category: data.category || 'AI & Combat Mechanics',
      status: data.status || 'backlog',
      priority: data.priority || 'medium',
      hypothesis: data.hypothesis || '',
      findings: data.findings || '',
      references: Array.isArray(data.references) 
        ? data.references 
        : (data.references ? data.references.split('\n').map(s => s.trim()).filter(Boolean) : []),
      tags: Array.isArray(data.tags)
        ? data.tags
        : (data.tags ? data.tags.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : []),
      estimatedHours: Number(data.estimatedHours) || 0,
      loggedHours: Number(data.loggedHours) || 0,
      createdAt: now,
      updatedAt: now
    };

    tasks.unshift(newTask);
    this.writeTasks(tasks);
    return newTask;
  }

  update(id, updates) {
    const tasks = this.readTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    const existing = tasks[index];
    const now = new Date().toISOString();

    let formattedReferences = existing.references;
    if (updates.references !== undefined) {
      formattedReferences = Array.isArray(updates.references)
        ? updates.references
        : updates.references.split('\n').map(s => s.trim()).filter(Boolean);
    }

    let formattedTags = existing.tags;
    if (updates.tags !== undefined) {
      formattedTags = Array.isArray(updates.tags)
        ? updates.tags
        : updates.tags.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    }

    const updatedTask = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      references: formattedReferences,
      tags: formattedTags,
      estimatedHours: updates.estimatedHours !== undefined ? Number(updates.estimatedHours) : existing.estimatedHours,
      loggedHours: updates.loggedHours !== undefined ? Number(updates.loggedHours) : existing.loggedHours,
      updatedAt: now
    };

    tasks[index] = updatedTask;
    this.writeTasks(tasks);
    return updatedTask;
  }

  delete(id) {
    const tasks = this.readTasks();
    const initialLen = tasks.length;
    const remaining = tasks.filter(t => t.id !== id);
    if (remaining.length === initialLen) return false;
    this.writeTasks(remaining);
    return true;
  }

  getStats() {
    const tasks = this.readTasks();
    const total = tasks.length;
    const backlog = tasks.filter(t => t.status === 'backlog').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const testing = tasks.filter(t => t.status === 'testing').length;
    const completed = tasks.filter(t => t.status === 'completed').length;

    const totalLoggedHours = tasks.reduce((sum, t) => sum + (Number(t.loggedHours) || 0), 0);
    const totalEstimatedHours = tasks.reduce((sum, t) => sum + (Number(t.estimatedHours) || 0), 0);

    const gameCounts = {};
    const categoryCounts = {};
    const priorityCounts = { critical: 0, high: 0, medium: 0, low: 0 };

    tasks.forEach(t => {
      if (t.game) {
        gameCounts[t.game] = (gameCounts[t.game] || 0) + 1;
      }
      if (t.category) {
        categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
      }
      if (t.priority && priorityCounts[t.priority] !== undefined) {
        priorityCounts[t.priority]++;
      }
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      backlog,
      inProgress,
      testing,
      completed,
      activeDeepDives: inProgress + testing,
      completionRate,
      totalLoggedHours: Math.round(totalLoggedHours * 10) / 10,
      totalEstimatedHours: Math.round(totalEstimatedHours * 10) / 10,
      gameCounts,
      categoryCounts,
      priorityCounts,
      uniqueGamesCount: Object.keys(gameCounts).length
    };
  }

  getMetadata() {
    const tasks = this.readTasks();
    const categories = new Set([
      'AI & Combat Mechanics',
      'Engine & Graphics',
      'Physics & Mechanics',
      'Game Economy & Balance',
      'Narrative & Worldbuilding',
      'Multiplayer & Netcode',
      'Audio & Sound Design',
      'UX & Player Psychology'
    ]);
    const games = new Set();
    const tags = new Set();

    tasks.forEach(t => {
      if (t.category) categories.add(t.category);
      if (t.game) games.add(t.game);
      if (Array.isArray(t.tags)) {
        t.tags.forEach(tag => tags.add(tag));
      }
    });

    return {
      categories: Array.from(categories).sort(),
      games: Array.from(games).sort(),
      tags: Array.from(tags).sort()
    };
  }

  resetSeed() {
    this.writeTasks(INITIAL_SEEDS);
    return INITIAL_SEEDS;
  }
}

module.exports = new TaskDatabase();
