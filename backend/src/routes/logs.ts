import { Router, Request, Response, NextFunction } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../config/database';
import { habits, daily_logs } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { toggleLogSchema, addNoteSchema } from '../utils/validators';
import { GamificationService } from '../services/gamification';
import { ApiError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';

const router = Router();
router.use(authMiddleware);

/**
 * GET /api/logs/all
 * Returns all daily logs for current user
 */
router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await db
      .select()
      .from(daily_logs)
      .where(eq(daily_logs.user_id, req.userId));

    sendSuccess(res, logs);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/logs/date/:date
 * Returns all logs for a specific date for the current user
 */
router.get('/date/:date', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ApiError(400, 'Invalid date format — use YYYY-MM-DD', 'INVALID_DATE');
    }

    const logs = await db
      .select()
      .from(daily_logs)
      .where(and(eq(daily_logs.user_id, req.userId), eq(daily_logs.log_date, date)));

    sendSuccess(res, logs);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/logs/toggle
 * Toggle a habit completion for a date. Creates log if not exists, toggles completed if exists.
 */
router.post(
  '/toggle',
  validate(toggleLogSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { habit_id, log_date } = req.body as { habit_id: number; log_date: string };

      // Verify habit belongs to user
      const habit = await db
        .select()
        .from(habits)
        .where(and(eq(habits.id, habit_id), eq(habits.user_id, req.userId)))
        .get();

      if (!habit) throw new ApiError(404, 'Habit not found', 'HABIT_NOT_FOUND');

      // Find existing log
      const existing = await db
        .select()
        .from(daily_logs)
        .where(
          and(
            eq(daily_logs.habit_id, habit_id),
            eq(daily_logs.user_id, req.userId),
            eq(daily_logs.log_date, log_date)
          )
        )
        .get();

      let log;
      let pointsDelta = 0;

      if (existing) {
        // Toggle completion
        const newCompleted = !existing.completed;
        pointsDelta = newCompleted ? habit.point_value : -habit.point_value;

        log = await db
          .update(daily_logs)
          .set({ completed: newCompleted, updated_at: new Date().toISOString() })
          .where(eq(daily_logs.id, existing.id))
          .returning()
          .get();
      } else {
        // Create new completed log
        pointsDelta = habit.point_value;
        log = await db
          .insert(daily_logs)
          .values({
            user_id: req.userId,
            habit_id,
            log_date,
            completed: true,
          })
          .returning()
          .get();
      }

      // Award/deduct points
      const pointsResult = await GamificationService.awardPoints(req.userId, pointsDelta);

      // Update streak
      const streakResult = await GamificationService.updateStreak(req.userId, habit_id);

      // Check achievements (only on completion)
      if (log.completed) {
        await GamificationService.checkAndAwardAchievements(req.userId);
      }

      sendSuccess(res, {
        log,
        points: pointsResult,
        streak: streakResult,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /api/logs/:id/note
 * Add or update a note on a log entry
 */
router.put('/:id/note', validate(addNoteSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logId = Number(req.params.id);
    const { notes } = req.body;

    const log = await db
      .select()
      .from(daily_logs)
      .where(and(eq(daily_logs.id, logId), eq(daily_logs.user_id, req.userId)))
      .get();

    if (!log) throw new ApiError(404, 'Log not found', 'LOG_NOT_FOUND');

    const updated = await db
      .update(daily_logs)
      .set({ notes, updated_at: new Date().toISOString() })
      .where(eq(daily_logs.id, logId))
      .returning()
      .get();

    sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
});

export default router;
