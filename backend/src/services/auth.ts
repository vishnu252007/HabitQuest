import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { users } from '../db/schema';
import { env } from '../config/env';
import { ApiError } from '../middleware/errorHandler';
import { SignupInput, LoginInput } from '../utils/validators';

function generateToken(userId: number): string {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

function sanitizeUser(user: typeof users.$inferSelect) {
  const { password: _p, ...safe } = user;
  return safe;
}

export const AuthService = {
  async signup(data: SignupInput) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .get();

    if (existing) {
      throw new ApiError(409, 'Email already registered', 'EMAIL_EXISTS');
    }

    const existingUsername = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, data.username))
      .get();

    if (existingUsername) {
      throw new ApiError(409, 'Username already taken', 'USERNAME_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await db
      .insert(users)
      .values({
        email: data.email,
        username: data.username,
        password: hashedPassword,
      })
      .returning()
      .get();

    const token = generateToken(result.id);
    return { user: sanitizeUser(result), token };
  },

  async login(data: LoginInput) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .get();

    if (!user) {
      throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const token = generateToken(user.id);
    return { user: sanitizeUser(user), token };
  },

  async googleAuth(email: string, username: string) {
    const targetEmail = email && email.includes('@') ? email : 'google.demo.user@gmail.com';
    let user = await db
      .select()
      .from(users)
      .where(eq(users.email, targetEmail))
      .get();

    if (!user) {
      const hashedPassword = await bcrypt.hash('GoogleOAuthSecret123!', 10);
      user = await db
        .insert(users)
        .values({
          email: targetEmail,
          username: (username || 'Google_User').replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000),
          password: hashedPassword,
        })
        .returning()
        .get();
    }

    const token = generateToken(user.id);
    return { user: sanitizeUser(user), token };
  },

  async getMe(userId: number) {
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
    return sanitizeUser(user);
  },
};
