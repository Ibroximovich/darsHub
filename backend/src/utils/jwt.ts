import jwt from 'jsonwebtoken';

export const TOKEN_TTL_DAYS = 20;
export const REFRESH_THRESHOLD_SECONDS = 24 * 60 * 60;

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export const generateToken = (user: TokenPayload) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your_secret',
    { expiresIn: `${TOKEN_TTL_DAYS}d` }
  );
};

export const shouldRefreshToken = (payload: { exp?: number }) => {
  if (!payload.exp) return false;

  const now = Math.floor(Date.now() / 1000);
  const remainingSeconds = payload.exp - now;

  return remainingSeconds > 0 && remainingSeconds <= REFRESH_THRESHOLD_SECONDS;
};
