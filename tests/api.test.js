import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('fs', () => ({
  existsSync: vi.fn(() => false),
  readFileSync: vi.fn(() => '[]'),
  writeFileSync: vi.fn(),
}));

import request from 'supertest';
import app from '../server.js';

beforeEach(async () => {
  const res = await request(app).get('/tasks');
  await Promise.all(res.body.map((t) => request(app).delete(`/tasks/${t.id}`)));
});

describe('GET /tasks', () => {
  it('returns an empty array initially', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /tasks', () => {
  it('creates a task', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Buy milk' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Buy milk');
    expect(res.body.completed).toBe(false);
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
  });

  it('rejects empty title', async () => {
    const res = await request(app).post('/tasks').send({ title: '   ' });
    expect(res.status).toBe(400);
  });

  it('rejects missing title', async () => {
    const res = await request(app).post('/tasks').send({});
    expect(res.status).toBe(400);
  });
});

describe('PATCH /tasks/:id', () => {
  it('updates completed status', async () => {
    const { body: task } = await request(app).post('/tasks').send({ title: 'Test' });
    const res = await request(app).patch(`/tasks/${task.id}`).send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('updates title', async () => {
    const { body: task } = await request(app).post('/tasks').send({ title: 'Old' });
    const res = await request(app).patch(`/tasks/${task.id}`).send({ title: 'New' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).patch('/tasks/nonexistent').send({ completed: true });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /tasks/:id', () => {
  it('deletes a task', async () => {
    const { body: task } = await request(app).post('/tasks').send({ title: 'Delete me' });
    const del = await request(app).delete(`/tasks/${task.id}`);
    expect(del.status).toBe(204);
    const list = await request(app).get('/tasks');
    expect(list.body.find((t) => t.id === task.id)).toBeUndefined();
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).delete('/tasks/nonexistent');
    expect(res.status).toBe(404);
  });
});
