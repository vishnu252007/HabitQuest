import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { signupSchema, loginSchema } from '../utils/validators';
import { sendSuccess } from '../utils/response';

const router = Router();

router.post(
  '/signup',
  validate(signupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthService.signup(req.body);
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthService.login(req.body);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/google',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, username } = req.body;
      const result = await AuthService.googleAuth(
        email || 'google.user@gmail.com',
        username || 'Google User'
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/me',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await AuthService.getMe(req.userId);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
