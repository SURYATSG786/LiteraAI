import { findUserById } from '../services/db.js';
import { getCoachAdvice } from '../services/gemini.js';
import { synthesizeSpeech } from '../services/tts.js';

export async function coachAdvice(req, res) {
  try {
    const user = findUserById(req.user.id);
    const advice = await getCoachAdvice({
      name: user.name,
      assessment_score: user.assessment_score,
      current_path: user.current_path,
      lessons_completed: user.course_progress?.lessons_completed || [],
      checkpoint_passed: user.course_progress?.checkpoint_passed,
      streak: user.streak,
      xp: user.xp,
      preferred_language: user.preferred_language || 'en',
      ...(req.body?.user_progress || {}),
    });
    res.json(advice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function ttsHandler(req, res) {
  try {
    const { text, language } = req.body || {};
    const clean = String(text || '').trim();
    if (!clean) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const result = await synthesizeSpeech(clean.slice(0, 500), language || 'en');
    res.json(result);
  } catch (err) {
    console.warn('TTS failed:', err.message);
    res.status(502).json({ error: 'TTS synthesis failed', reason: err.message });
  }
}
