import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token topilmadi' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret') as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Yaroqsiz token' });
  }
};
