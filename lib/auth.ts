import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign(
    { userId, role },
    process.env.NEXTAUTH_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    ) as { userId: string; role: string };
  } catch (error) {
    return null;
  }
}






