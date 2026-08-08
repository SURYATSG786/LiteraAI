import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import routes from './routes/index.js';
import { assertStoreWritable, getDbStatus } from './services/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Allow local Vite on localhost or 127.0.0.1
const corsOrigin = process.env.CORS_ORIGIN || true;
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || corsOrigin === true || corsOrigin === '*') return cb(null, true);
    const allowed = String(corsOrigin).split(',').map((s) => s.trim());
    if (allowed.includes(origin)) return cb(null, true);
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
    return cb(null, true); // learning app: never block browser clients in local/dev
  },
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (_req, res) => {
  try {
    const db = getDbStatus();
    res.json({
      status: 'ok',
      service: 'literaai',
      time: new Date().toISOString(),
      database: db,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.use('/api', routes);

const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

try {
  const db = assertStoreWritable();
  console.log(`LiteraAI database ready (${db.engine}) — ${db.users} users at ${db.path}`);
} catch (err) {
  console.error('FATAL: database is not writable:', err);
  process.exit(1);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LiteraAI API listening on http://localhost:${PORT}`);
  console.log('Auth routes: POST /api/auth/register , POST /api/auth/login , GET /api/health');
});

export default app;
