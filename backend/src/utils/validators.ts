import { z } from 'zod';

// ──────────────────────────────
// AUTH SCHEMAS
// ──────────────────────────────
export const signupSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  username: z
    .string({ required_error: 'Username is required' })
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, _ and -')
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

// ──────────────────────────────
// HABIT SCHEMAS
// ──────────────────────────────
export const createHabitSchema = z.object({
  name: z
    .string({ required_error: 'Habit name is required' })
    .min(1, 'Habit name is required')
    .max(100, 'Habit name is too long')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  emoji: z.string().default('✅'),
  color: z.string().default('#3B82F6'),
  category: z.string().default('health'),
  frequency: z.string().default('daily'),
  point_value: z.number().int().min(1).max(100).default(10),
});

export const updateHabitSchema = createHabitSchema.partial().extend({
  is_active: z.boolean().optional(),
});

// ──────────────────────────────
// LOG SCHEMAS
// ──────────────────────────────
export const toggleLogSchema = z.object({
  habit_id: z.number({ required_error: 'habit_id is required' }).int().positive(),
  log_date: z
    .string({ required_error: 'log_date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const addNoteSchema = z.object({
  notes: z.string().max(500, 'Note must be less than 500 characters').optional().nullable(),
});

// ──────────────────────────────
// EXPORTED TYPES
// ──────────────────────────────
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type ToggleLogInput = z.infer<typeof toggleLogSchema>;
