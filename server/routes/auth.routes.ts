
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore, type StoredUser } from '../services/dbStore.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === 'production'
    ? ''
    : 'suraksha-local-development-secret-change-before-deployment');

const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  (process.env.NODE_ENV === 'production'
    ? ''
    : 'suraksha-local-refresh-secret-change-before-deployment');

function validateJwtSecrets(): boolean {
  return Boolean(JWT_SECRET && JWT_REFRESH_SECRET);
}

function createTokens(user: StoredUser) {
  if (!validateJwtSecrets()) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be configured.');
  }

  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
}

function safeUser(user: StoredUser) {
  const { passwordHash: _passwordHash, refreshToken: _refreshToken, ...result } = user;
  return result;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body ?? {};

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof phone !== 'string'
    ) {
      res.status(400).json({
        success: false,
        message: 'Name, email, password and phone are required.',
      });
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (cleanName.length < 2 || cleanName.length > 100) {
      res.status(400).json({
        success: false,
        message: 'Name must contain between 2 and 100 characters.',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({
        success: false,
        message: 'Enter a valid email address.',
      });
      return;
    }

    if (password.length < 8 || password.length > 128) {
      res.status(400).json({
        success: false,
        message: 'Password must contain between 8 and 128 characters.',
      });
      return;
    }

    if (cleanPhone.length < 7 || cleanPhone.length > 20) {
      res.status(400).json({
        success: false,
        message: 'Enter a valid phone number.',
      });
      return;
    }

    const existingUser = dbStore.users.find(
      (user) => user.email.toLowerCase() === cleanEmail
    );

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();

    // Public registration must NEVER assign privileged roles.
    const newUser: StoredUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      phone: cleanPhone,
      role: 'USER',
      avatarUrl: '',
      bloodGroup: '',
      address: '',
      medicalConditions: '',
      refreshToken: '',
      emergencyContacts: [
        {
          id: `ec_${Date.now()}_1`,
          name: 'National Emergency Response (112)',
          phone: '112',
          relationship: 'Helpline',
          notifyOnSOS: true,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const { accessToken, refreshToken } = createTokens(newUser);

    newUser.refreshToken = refreshToken;
    dbStore.users.push(newUser);

    dbStore.settings.set(newUser.id, {
      userId: newUser.id,
      sosCountdownDurationSeconds: 5,
      sirenAudioEnabled: true,
      autoShareLocationOnSOS: true,
      smsAlertsEnabled: true,
      pushNotificationsEnabled: true,
      shakeToSOSGestureEnabled: true,
      highContrastTheme: false,
      theme: 'system',
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        accessToken,
        refreshToken,
        user: safeUser(newUser),
      },
    });
  } catch (error) {
    console.error('Registration error:', error);

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = dbStore.users.find(
      (item) => item.email.toLowerCase() === cleanEmail
    );

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const { accessToken, refreshToken } = createTokens(user);

    user.refreshToken = refreshToken;
    user.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Authentication successful.',
      data: {
        accessToken,
        refreshToken,
        user: safeUser(user),
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = dbStore.users.find(
      (item) => item.id === req.user?.id
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
      return;
    }

    res.json({
      success: true,
      data: safeUser(user),
    });
  } catch (error) {
    console.error('Profile retrieval error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.',
    });
  }
});

export default router;
