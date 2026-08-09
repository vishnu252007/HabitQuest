import { Router, Request, Response, NextFunction } from 'express';
import { HabitService } from '../services/habit';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createHabitSchema, updateHabitSchema } from '../utils/validators';
import { sendSuccess } from '../utils/response';

const router = Router();

// All habit routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/habits:
 *   get:
 *     summary: Get all habits for the current user
 *     tags: [Habits]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const habits = await HabitService.getHabits(req.userId);
    sendSuccess(res, habits);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/habits:
 *   post:
 *     summary: Create a new habit
 *     tags: [Habits]
 *     security: [{ bearerAuth: [] }]
 */
router.post(
  '/',
  validate(createHabitSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const habit = await HabitService.createHabit(req.userId, req.body);
      sendSuccess(res, habit, 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/habits/{id}:
 *   put:
 *     summary: Update a habit
 *     tags: [Habits]
 *     security: [{ bearerAuth: [] }]
 */
router.put(
  '/:id',
  validate(updateHabitSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const habit = await HabitService.updateHabit(req.userId, Number(req.params.id), req.body);
      sendSuccess(res, habit);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/habits/{id}:
 *   delete:
 *     summary: Delete (soft) a habit
 *     tags: [Habits]
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await HabitService.deleteHabit(req.userId, Number(req.params.id));
    sendSuccess(res, { message: 'Habit deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
