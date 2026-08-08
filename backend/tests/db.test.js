import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { pathToFileURL } from 'url';

test('json store saves every registration and login event', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'literaai-store-'));
  process.env.DATA_DIR = tmp;

  const modUrl = pathToFileURL(path.resolve('src/services/db.js')).href + `?t=${Date.now()}`;
  const mod = await import(modUrl);

  const status = mod.assertStoreWritable();
  assert.equal(status.ok, true);
  assert.equal(status.engine, 'sqlite');

  const user = mod.createUser({
    name: 'T. SURYA',
    email: 'suryatamilendkran@gmail.com',
    password: 'hash-Password1',
    preferred_language: 'en',
    education_level: 'Primary School',
  });
  assert.equal(user.email, 'suryatamilendkran@gmail.com');
  assert.equal(user.password, undefined);

  let threw = false;
  try {
    mod.createUser({
      name: 'Dup',
      email: 'suryatamilendkran@gmail.com',
      password: 'hash-Password1',
      preferred_language: 'en',
      education_level: 'Primary School',
    });
  } catch (err) {
    threw = true;
    assert.equal(err.status, 409);
  }
  assert.equal(threw, true);

  const found = mod.getUserWithPassword('suryatamilendkran@gmail.com');
  assert.equal(found.password, 'hash-Password1');

  mod.recordLoginEvent({
    userId: found.id,
    email: found.email,
    success: true,
    ip: '127.0.0.1',
  });
  mod.recordLoginEvent({
    userId: null,
    email: 'nope@example.com',
    success: false,
  });

  const finalStatus = mod.getDbStatus();
  assert.equal(finalStatus.users, 1);
  assert.equal(finalStatus.registrations, 1);
  assert.equal(finalStatus.login_events, 2);
});
