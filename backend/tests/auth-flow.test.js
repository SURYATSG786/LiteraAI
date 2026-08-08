import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { pathToFileURL } from 'url';
import { hashPassword, comparePassword } from '../src/utils/auth.js';

test('register + login round-trip stores learner and allows login', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'literaai-auth-'));
  process.env.DATA_DIR = tmp;

  const db = await import(pathToFileURL(path.resolve('src/services/db.js')).href + `?auth=${Date.now()}`);
  const password = 'Password1';
  const created = db.createUser({
    name: 'Student One',
    email: 'student1@school.test',
    password: hashPassword(password),
    preferred_language: 'ta',
    education_level: 'Primary School',
  });

  assert.ok(created.id);
  assert.equal(db.listUsers().length, 1);

  const row = db.getUserWithPassword('student1@school.test');
  assert.equal(comparePassword(password, row.password), true);
  assert.equal(comparePassword('WrongPass1', row.password), false);

  db.recordLoginEvent({ userId: row.id, email: row.email, success: true });
  const status = db.getDbStatus();
  assert.equal(status.engine, 'sqlite');
  assert.equal(status.users, 1);
  assert.equal(status.login_events, 1);
});
