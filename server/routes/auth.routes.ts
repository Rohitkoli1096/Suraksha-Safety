import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore } from '../services/dbStore.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'suraksha_production_super_secret_jwt_key_2026_change_in_prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'suraksha_production_refresh_token_super_secret_2026';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      res.status(400).json({ success: false, message: 'All fields (name, email, password, phone) are required.' });
      return;
    }

    const existingUser = dbStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const userRole: 'USER' | 'ADMIN' | 'RESPONDER' = role === 'ADMIN' ? 'ADMIN' : 'USER';
    const newUser: import('../services/dbStore.js').StoredUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      phone: phone.trim(),
      role: userRole,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.users.push(newUser);

    const accessToken = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const refreshToken = jwt.sign({ id: newUser.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

    newUser.refreshToken = refreshToken;

    // Default settings
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

    const { passwordHash: _, refreshToken: __, ...userSafe } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        accessToken,
        refreshToken,
        user: userSafe,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = dbStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
    user.refreshToken = refreshToken;

    const { passwordHash: _, refreshToken: __, ...userSafe } = user;

    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        accessToken,
        refreshToken,
        user: userSafe,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = dbStore.users.find((u) => u.id === req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User account not found' });
      return;
    }

    const { passwordHash: _, refreshToken: __, ...userSafe } = user;
    res.json({ success: true, data: userSafe });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile' });
  }
});

export default router;
