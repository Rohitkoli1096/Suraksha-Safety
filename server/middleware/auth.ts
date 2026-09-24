import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../services/dbStore.js';
import { UserModel } from '../models/User.js';
import { isDbFallback } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'suraksha_production_super_secret_jwt_key_2026_change_in_prod';

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'RESPONDER';
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUserPayload;
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ success: false, message: 'Access token required. Please sign in.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUserPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(403).json({ success: false, message: 'Invalid or expired session token. Please log in again.' });
  }
}

export function requireRole(allowedRoles: ('USER' | 'ADMIN' | 'RESPONDER')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden. This action requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}
