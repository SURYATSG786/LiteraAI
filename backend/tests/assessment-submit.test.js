import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { pathToFileURL } from 'url';

test('submitAssessment correctly scores answers and updates user assessment_score', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'literaai-assessment-'));
  process.env.DATA_DIR = tmp;

  const dbModule = await import(pathToFileURL(path.resolve('src/services/db.js')).href + `?t=${Date.now()}`);
  const seedModule = await import(pathToFileURL(path.resolve('src/utils/seed_assessment.js')).href + `?t=${Date.now()}`);
  const controllerModule = await import(pathToFileURL(path.resolve('src/controllers/assessmentController.js')).href + `?t=${Date.now()}`);

  const user = dbModule.createUser({
    name: 'Test Student',
    email: 'assessment_test@school.test',
    password: 'Password1',
    preferred_language: 'en',
    education_level: 'Primary School',
  });

  const bank = seedModule.ASSESSMENT_DATA.find((a) => a.education_level === 'Primary School');

  // Submit correct answers for all questions (10/10 -> 100%)
  const answers100 = bank.questions.map((q) => ({
    question_id: q.id,
    answer_index: q.correct_index,
  }));

  let resData = null;
  const res = {
    json(data) {
      resData = data;
    },
    status(code) {
      return this;
    },
  };

  controllerModule.submitAssessment({ user: { id: user.id }, body: { answers: answers100 } }, res);

  assert.ok(resData);
  assert.equal(resData.score, 100);
  assert.equal(resData.user.assessment_score, 100);

  // Re-fetch user from DB
  let updatedUser = dbModule.findUserById(user.id);
  assert.equal(updatedUser.assessment_score, 100);

  // Test partial score (5 correct, 5 wrong -> 50%)
  const answers50 = bank.questions.map((q, idx) => ({
    question_id: q.id,
    answer_index: idx < 5 ? q.correct_index : (q.correct_index + 1) % 4,
  }));

  controllerModule.submitAssessment({ user: { id: user.id }, body: { answers: answers50 } }, res);

  assert.equal(resData.score, 50);
  assert.equal(resData.user.assessment_score, 50);

  updatedUser = dbModule.findUserById(user.id);
  assert.equal(updatedUser.assessment_score, 50);
});
