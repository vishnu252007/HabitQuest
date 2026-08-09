import { Router } from 'express';
import authRoutes from './auth';
import habitsRoutes from './habits';
import logsRoutes from './logs';
import statsRoutes from './stats';

const router = Router();

router.use('/auth', authRoutes);
router.use('/habits', habitsRoutes);
router.use('/logs', logsRoutes);
router.use('/stats', statsRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
