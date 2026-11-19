
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === 'production'
    ? ''
    : 'suraksha-local-development-secret-change-before-deployment');

const VALID_ROLES = ['USER', 'ADMIN', 'RESPONDER'] as const;

export type UserRole = (typeof VALID_ROLES)[number];

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUserPayload;
}

function isValidPayload(
  payload: string | jwt.JwtPayload
): payload is jwt.JwtPayload & AuthenticatedUserPayload {
  if (typeof payload === 'string') return false;

  return (
    typeof payload.id === 'string' &&
    typeof payload.email === 'string' &&
    typeof payload.name === 'string' &&
    VALID_ROLES.includes(payload.role as UserRole)
  );
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!JWT_SECRET) {
    res.status(500).json({
      success: false,
      message: 'Authentication is not configured on this server.',
    });
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Access token required. Please sign in.',
    });
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access token is missing.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!isValidPayload(decoded)) {
      res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.',
    });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
      return;
    }

    next();
  };
}
