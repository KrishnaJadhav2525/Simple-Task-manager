import { useState } from 'react';

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleEdit = async () => {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === task.title) { setEditing(false); setEditTitle(task.title); return; }
    try {
      setLoading(true);
      await onEdit(task.id, trimmed);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      setLoading(true);
      setError(null);
      await onToggle(task.id, !task.completed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await onDelete(task.id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <li style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 0',
      borderBottom: '1px solid #eee',
      opacity: loading ? 0.5 : 1,
    }}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={handleToggle}
        disabled={loading}
        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
      />
      {editing ? (
        <input
          autoFocus
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleEdit}
          onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') { setEditing(false); setEditTitle(task.title); } }}
          disabled={loading}
          style={{ flex: 1, fontSize: '14px', padding: '2px 6px', border: '1px solid #3b82f6', borderRadius: '4px' }}
        />
      ) : (
        <span
          onClick={() => { setEditing(true); setEditTitle(task.title); }}
          title="Click to edit"
          style={{
            flex: 1, fontSize: '14px', cursor: 'text',
            textDecoration: task.completed ? 'line-through' : 'none',
            color: task.completed ? '#999' : '#111',
          }}
        >
          {task.title}
        </span>
      )}
      <span style={{ fontSize: '11px', color: '#bbb', whiteSpace: 'nowrap' }}>
        {new Date(task.createdAt).toLocaleDateString()}
      </span>
      <button
        onClick={handleDelete}
        disabled={loading}
        style={{
          padding: '4px 12px',
          fontSize: '13px',
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Delete
      </button>
      {error && <span style={{ color: 'red', fontSize: '12px' }}>{error}</span>}
    </li>
  );
}
