import { eq, and } from 'drizzle-orm';
import { db } from '../config/database';
import { habits } from '../db/schema';
import { ApiError } from '../middleware/errorHandler';
import { CreateHabitInput, UpdateHabitInput } from '../utils/validators';

export const HabitService = {
  async getHabits(userId: number) {
    return db.select().from(habits).where(eq(habits.user_id, userId));
  },

  async createHabit(userId: number, data: CreateHabitInput) {
    const result = await db
      .insert(habits)
      .values({
        user_id: userId,
        name: data.name,
        description: data.description ?? null,
        emoji: data.emoji,
        color: data.color,
        category: data.category,
        frequency: data.frequency,
        point_value: data.point_value,
      })
      .returning()
      .get();

    return result;
  },

  async updateHabit(userId: number, habitId: number, data: UpdateHabitInput) {
    const habit = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, habitId), eq(habits.user_id, userId)))
      .get();

    if (!habit) throw new ApiError(404, 'Habit not found', 'HABIT_NOT_FOUND');

    const updated = await db
      .update(habits)
      .set({ ...data, updated_at: new Date().toISOString() })
      .where(and(eq(habits.id, habitId), eq(habits.user_id, userId)))
      .returning()
      .get();

    return updated;
  },

  async deleteHabit(userId: number, habitId: number) {
    const habit = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, habitId), eq(habits.user_id, userId)))
      .get();

    if (!habit) throw new ApiError(404, 'Habit not found', 'HABIT_NOT_FOUND');

    // Soft delete
    await db
      .update(habits)
      .set({ is_active: false, updated_at: new Date().toISOString() })
      .where(eq(habits.id, habitId));
  },
};
