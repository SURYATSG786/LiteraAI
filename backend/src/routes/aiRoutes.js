import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { coachAdvice, ttsHandler } from '../controllers/aiController.js';

const router = Router();

router.post('/coach', requireAuth, coachAdvice);
router.post('/coach-advice', requireAuth, coachAdvice);
router.post('/ai/tts', ttsHandler);

export default router;
