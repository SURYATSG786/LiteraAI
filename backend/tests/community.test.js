import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { pathToFileURL } from 'url';

test('Community posts CRUD operations linked to real registered SQLite users', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'literaai-community-test-'));
  process.env.DATA_DIR = tmp;

  const modUrl = pathToFileURL(path.resolve('src/services/db.js')).href + `?t=${Date.now()}`;
  const mod = await import(modUrl);

  // 1. Create a real registered user in SQLite
  const user = mod.createUser({
    name: 'Lakshmi Narayanan',
    email: 'lakshmi@example.com',
    password: 'password123',
    preferred_language: 'ta',
    education_level: 'Primary School',
  });

  assert.ok(user.id, 'Registered user should have an ID');

  // 2. Verify initially no simulation posts exist
  const initialPosts = mod.getCommunityPosts();
  assert.ok(Array.isArray(initialPosts), 'Posts should be an array');
  assert.equal(initialPosts.length, 0, 'Initially zero simulated posts exist');

  // 3. Create a new community photo feedback post for the real registered user
  const photoPost = mod.createCommunityPost({
    userId: user.id,
    userName: user.name,
    type: 'photo_feedback',
    content: 'தமிழ் எழுத்து பயிற்சி படம் (Tamil handwriting practice photo)',
    imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    achievementMeta: null,
    language: 'ta',
  });

  assert.ok(photoPost.id, 'Post should have an assigned ID');
  assert.equal(photoPost.user_id, user.id);
  assert.equal(photoPost.user_name, 'Lakshmi Narayanan');
  assert.equal(photoPost.type, 'photo_feedback');
  assert.equal(photoPost.likes, 0);

  // 4. Like post in SQLite
  const likeResult = mod.likeCommunityPost(photoPost.id);
  assert.equal(likeResult.likes, 1, 'Likes count should be incremented to 1');

  // 5. Create an achievement post for registered user
  const achievementPost = mod.createCommunityPost({
    userId: user.id,
    userName: user.name,
    type: 'achievement',
    content: 'Completed 7-day streak milestone!',
    imageUrl: null,
    achievementMeta: { title: '7-Day Streak', badge: '🔥', streak: 7 },
    language: 'ta',
  });

  assert.equal(achievementPost.type, 'achievement');
  assert.equal(achievementPost.user_name, 'Lakshmi Narayanan');

  // 6. Retrieve posts from SQLite joined with users table
  const allPosts = mod.getCommunityPosts();
  assert.equal(allPosts.length, 2);
  assert.equal(allPosts[0].user_name, 'Lakshmi Narayanan');

  // 7. Delete post (Authorized)
  const delResult = mod.deleteCommunityPost(photoPost.id, user.id);
  assert.equal(delResult.success, true);

  // 8. Delete post (Unauthorized) should throw 403
  let threwUnauthorized = false;
  try {
    mod.deleteCommunityPost(achievementPost.id, 'other_user_id');
  } catch (err) {
    threwUnauthorized = true;
    assert.equal(err.status, 403);
  }
  assert.equal(threwUnauthorized, true, 'Deleting another user post must fail with 403');
});
