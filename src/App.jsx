import { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import AddTaskForm from './components/AddTaskForm';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks.');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (title) => {
    const res = await fetch('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || 'Failed to add task.');
    }
    const task = await res.json();
    setTasks((prev) => [...prev, task]);
  };

  const toggleTask = async (id, completed) => {
    const res = await fetch(`/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || 'Failed to update task.');
    }
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const editTask = async (id, title) => {
    const res = await fetch(`/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || 'Failed to update task.');
    }
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const deleteTask = async (id) => {
    const res = await fetch(`/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || 'Failed to delete task.');
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const filtered = tasks.filter((t) =>
    filter === 'all' ? true : filter === 'completed' ? t.completed : !t.completed
  );

  return (
    <div style={{ maxWidth: '620px', margin: '40px auto', padding: '0 16px', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '24px' }}>Task Manager</h1>
      <AddTaskForm onAdd={addTask} />
      {loading && <p style={{ color: '#555' }}>Loading tasks...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {['all', 'active', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 12px', fontSize: '13px', borderRadius: '4px', border: '1px solid #ccc',
                  background: filter === f ? '#3b82f6' : '#fff',
                  color: filter === f ? '#fff' : '#333',
                  cursor: 'pointer',
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <TaskList tasks={filtered} onToggle={toggleTask} onDelete={deleteTask} onEdit={editTask} />
        </>
      )}
    </div>
  );
}
