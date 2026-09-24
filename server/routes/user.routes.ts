import { Router } from 'express';
import { dbStore } from '../services/dbStore.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/user/profile
router.get('/profile', authenticateToken, (req: AuthRequest, res) => {
  try {
    const user = dbStore.users.find((u) => u.id === req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { passwordHash, refreshToken, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// PUT /api/user/profile
router.put('/profile', authenticateToken, (req: AuthRequest, res) => {
  try {
    const user = dbStore.users.find((u) => u.id === req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { name, phone, avatarUrl, bloodGroup, address, medicalConditions } = req.body;

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (address !== undefined) user.address = address;
    if (medicalConditions !== undefined) user.medicalConditions = medicalConditions;

    user.updatedAt = new Date().toISOString();

    const { passwordHash, refreshToken, ...safeUser } = user;
    res.json({ success: true, message: 'Profile updated successfully', data: safeUser });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// POST /api/user/emergency-contacts
router.post('/emergency-contacts', authenticateToken, (req: AuthRequest, res) => {
  try {
    const user = dbStore.users.find((u) => u.id === req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { name, phone, relationship, notifyOnSOS = true } = req.body;

    if (!name || !phone || !relationship) {
      res.status(400).json({ success: false, message: 'Name, phone, and relationship are required' });
      return;
    }

    const newContact = {
      id: `ec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim(),
      notifyOnSOS: Boolean(notifyOnSOS),
    };

    user.emergencyContacts.push(newContact);
    user.updatedAt = new Date().toISOString();

    res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      data: user.emergencyContacts,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to add contact' });
  }
});

// DELETE /api/user/emergency-contacts/:id
router.delete('/emergency-contacts/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const user = dbStore.users.find((u) => u.id === req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { id } = req.params;
    user.emergencyContacts = user.emergencyContacts.filter((c) => c.id !== id);
    user.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Emergency contact removed',
      data: user.emergencyContacts,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete contact' });
  }
});

// GET /api/user/settings
router.get('/settings', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id || '';
    let settings = dbStore.settings.get(userId);

    if (!settings) {
      settings = {
        userId,
        sosCountdownDurationSeconds: 5,
        sirenAudioEnabled: true,
        autoShareLocationOnSOS: true,
        smsAlertsEnabled: true,
        pushNotificationsEnabled: true,
        shakeToSOSGestureEnabled: true,
        highContrastTheme: false,
        theme: 'system',
      };
      dbStore.settings.set(userId, settings);
    }

    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to load settings' });
  }
});

// PUT /api/user/settings
router.put('/settings', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id || '';
    let settings = dbStore.settings.get(userId);

    if (!settings) {
      settings = {
        userId,
        sosCountdownDurationSeconds: 5,
        sirenAudioEnabled: true,
        autoShareLocationOnSOS: true,
        smsAlertsEnabled: true,
        pushNotificationsEnabled: true,
        shakeToSOSGestureEnabled: true,
        highContrastTheme: false,
        theme: 'system',
      };
    }

    const updated = {
      ...settings,
      ...req.body,
      userId, // protect userId
    };

    dbStore.settings.set(userId, updated);

    res.json({ success: true, message: 'Settings saved', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to save settings' });
  }
});

export default router;
