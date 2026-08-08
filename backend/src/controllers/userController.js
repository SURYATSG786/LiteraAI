import { findUserById, updateUser, bumpActivity } from '../services/db.js';
import { LANGUAGES, EDUCATION_LEVELS } from '../utils/auth.js';

export function getMe(req, res) {
  try {
    const user = findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    bumpActivity(user.id);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function updateMe(req, res) {
  try {
    const user = findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { name, preferred_language, education_level } = req.body || {};
    const updates = {};
    if (name) updates.name = String(name).trim();
    if (preferred_language) {
      if (!LANGUAGES.includes(preferred_language)) {
        return res.status(400).json({ error: 'Invalid preferred language' });
      }
      updates.preferred_language = preferred_language;
    }
    if (education_level) {
      if (!EDUCATION_LEVELS.includes(education_level)) {
        return res.status(400).json({ error: 'Invalid education level' });
      }
      updates.education_level = education_level;
    }

    const updated = updateUser(user.id, updates);
    res.json({ user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
