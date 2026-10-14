require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Gaming Research Task Tracker API',
    timestamp: new Date().toISOString()
  });
});

// Get all tasks with optional filters
app.get('/api/tasks', (req, res) => {
  try {
    const { search, category, game, status, priority, sortBy } = req.query;
    const tasks = db.getAll({ search, category, game, status, priority, sortBy });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve tasks' });
  }
});

// Get single task by ID
app.get('/api/tasks/:id', (req, res) => {
  try {
    const task = db.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve task' });
  }
});

// Create new task
app.post('/api/tasks', (req, res) => {
  try {
    const { title, game } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const newTask = db.create(req.body);
    res.status(201).json({ success: true, data: newTask, message: 'Research task created' });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const updated = db.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, data: updated, message: 'Task updated successfully' });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const deleted = db.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, message: 'Research task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve stats' });
  }
});

// Metadata (categories, games, tags)
app.get('/api/meta', (req, res) => {
  try {
    const meta = db.getMetadata();
    res.json({ success: true, data: meta });
  } catch (err) {
    console.error('Error fetching metadata:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve metadata' });
  }
});

// Reset seed data
app.post('/api/reset-seed', (req, res) => {
  try {
    const seeds = db.resetSeed();
    res.json({ success: true, message: 'Sample research data reset successfully', count: seeds.length });
  } catch (err) {
    console.error('Error resetting seed:', err);
    res.status(500).json({ success: false, error: 'Failed to reset seed data' });
  }
});

// Fallback to index.html for SPA routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🎮 Gaming Research Tracker server running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📊 API endpoints ready at /api/tasks & /api/stats`);
  console.log(`===============================================`);
});
