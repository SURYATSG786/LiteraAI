import {
  createUser,
  getUserWithPassword,
  recordLoginEvent,
  sanitizeUser,
} from '../services/db.js';
import {
  hashPassword,
  comparePassword,
  signToken,
  passwordStrengthOk,
  LANGUAGES,
  EDUCATION_LEVELS,
} from '../utils/auth.js';

export function register(req, res) {
  try {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const preferred_language = body.preferred_language;
    const education_level = body.education_level;

    if (!name || !email || !password || !preferred_language || !education_level) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }
    if (!LANGUAGES.includes(preferred_language)) {
      return res.status(400).json({ error: 'Invalid preferred language' });
    }
    if (!EDUCATION_LEVELS.includes(education_level)) {
      return res.status(400).json({ error: 'Invalid education level' });
    }
    if (!passwordStrengthOk(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters and include a letter and a number',
      });
    }

    const user = createUser({
      name,
      email,
      password: hashPassword(password),
      preferred_language,
      education_level,
    });

    const token = signToken(user);
    return res.status(201).json({ token, user, message: 'Registration successful' });
  } catch (err) {
    console.error('register failed:', err);
    return res.status(err.status || 500).json({ error: err.message || 'Registration failed' });
  }
}

export function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = getUserWithPassword(email);
    const meta = {
      email,
      ip: req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.socket?.remoteAddress || null,
      userAgent: req.headers['user-agent'] || null,
    };
    if (!user || !comparePassword(password, user.password)) {
      recordLoginEvent({ ...meta, userId: user?.id || null, success: false });
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    recordLoginEvent({ ...meta, userId: user.id, success: true });
    const safe = sanitizeUser(user);
    res.json({ token: signToken(safe), user: safe });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
}
