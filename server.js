import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'tasks.json');

const app = express();
app.use(express.json());

let tasks = existsSync(DATA_FILE) ? JSON.parse(readFileSync(DATA_FILE, 'utf-8')) : [];

function save() {
  writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
  }
  const task = { id: uuidv4(), title: title.trim(), completed: false, createdAt: new Date().toISOString() };
  tasks.push(task);
  save();
  res.status(201).json(task);
});

app.patch('/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found.' });

  const { completed, title } = req.body;
  if (typeof completed !== 'undefined') {
    if (typeof completed !== 'boolean') return res.status(400).json({ error: 'completed must be a boolean.' });
    task.completed = completed;
  }
  if (typeof title !== 'undefined') {
    if (typeof title !== 'string' || title.trim() === '') return res.status(400).json({ error: 'Title must be a non-empty string.' });
    task.title = title.trim();
  }
  save();
  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found.' });
  tasks.splice(index, 1);
  save();
  res.status(204).send();
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
  app.get('*', (req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')));
}

export default app;

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
