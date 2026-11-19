
import { Router } from 'express';
import { dbStore, type StoredSOSAlert } from '../services/dbStore.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

const VALID_ACTIVATION_SOURCES = [
  'ONE_TOUCH_BUTTON',
  'SAFETY_TIMER_EXPIRED',
  'VOICE_TRIGGER',
  'SHAKE_GESTURE',
] as const;

function isValidCoordinate(value: unknown, min: number, max: number): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

// POST /api/sos/trigger
router.post('/trigger', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const user = dbStore.users.find((item) => item.id === userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    const {
      location,
      activationSource = 'ONE_TOUCH_BUTTON',
      notes = '',
    } = req.body ?? {};

    if (
      !location ||
      !isValidCoordinate(location.latitude, -90, 90) ||
      !isValidCoordinate(location.longitude, -180, 180)
    ) {
      res.status(400).json({
        success: false,
        message: 'A valid GPS location is required. Please enable location access and try again.',
      });
      return;
    }

    if (
      !VALID_ACTIVATION_SOURCES.includes(
        activationSource as (typeof VALID_ACTIVATION_SOURCES)[number]
      )
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid SOS activation source.',
      });
      return;
    }

    if (typeof notes !== 'string' || notes.length > 1000) {
      res.status(400).json({
        success: false,
        message: 'Notes must be text and cannot exceed 1000 characters.',
      });
      return;
    }

    const existingActive = dbStore.sosAlerts.find(
      (alert) =>
        alert.userId === userId &&
        (alert.status === 'ACTIVE' || alert.status === 'COUNTDOWN')
    );

    if (existingActive) {
      res.json({
        success: true,
        message: 'An active SOS session already exists.',
        data: existingActive,
      });
      return;
    }

    // This project currently simulates contact notifications.
    // Do not report these as real SMS or calls.
    const contacts: StoredSOSAlert['notifiedContacts'] =
      (user.emergencyContacts || []).map((contact) => ({
        name: contact.name,
        phone: contact.phone,
        status: 'SIMULATED_DEV_MODE',
      }));

    const now = new Date().toISOString();

    const newAlert: StoredSOSAlert = {
      id: `sos_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      status: 'ACTIVE',
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy:
          typeof location.accuracy === 'number' &&
          Number.isFinite(location.accuracy) &&
          location.accuracy >= 0
            ? location.accuracy
            : 0,
        address:
          typeof location.address === 'string'
            ? location.address.slice(0, 500)
            : 'Address unavailable; GPS coordinates recorded.',
      },
      countdownSeconds: 0,
      notifiedContacts: contacts,
      activationSource,
      notes: notes.trim(),
      createdAt: now,
      updatedAt: now,
    };

    dbStore.sosAlerts.unshift(newAlert);

    dbStore.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: user.id,
      type: 'SOS_ALERT',
      title: 'SOS alert activated',
      message:
        'Your SOS event has been recorded. Contact notifications are currently in simulated development mode.',
      linkUrl: '/sos',
      read: false,
      createdAt: now,
    });

    res.status(201).json({
      success: true,
      message:
        'SOS event recorded. Contact notifications are simulated and have not been sent.',
      data: newAlert,
    });
  } catch (error) {
    console.error('SOS trigger error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to trigger SOS.',
    });
  }
});

// GET /api/sos/active
router.get('/active', authenticateToken, (req: AuthRequest, res) => {
  try {
    const activeAlert = dbStore.sosAlerts.find(
      (alert) =>
        alert.userId === req.user?.id &&
        (alert.status === 'ACTIVE' || alert.status === 'COUNTDOWN')
    );

    res.json({
      success: true,
      data: activeAlert || null,
    });
  } catch (error) {
    console.error('Active SOS retrieval error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve active SOS status.',
    });
  }
});

// POST /api/sos/:id/resolve
router.post('/:id/resolve', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { resolutionReason = 'I am safe now / False alarm' } = req.body ?? {};

    const alert = dbStore.sosAlerts.find((item) => item.id === id);

    if (!alert) {
      res.status(404).json({
        success: false,
        message: 'SOS alert not found.',
      });
      return;
    }

    if (alert.userId !== req.user?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to resolve this alert.',
      });
      return;
    }

    if (alert.status === 'RESOLVED' || alert.status === 'CANCELLED') {
      res.status(409).json({
        success: false,
        message: 'This SOS alert has already been closed.',
        data: alert,
      });
      return;
    }

    if (
      typeof resolutionReason !== 'string' ||
      resolutionReason.trim().length === 0 ||
      resolutionReason.length > 500
    ) {
      res.status(400).json({
        success: false,
        message: 'Provide a valid resolution reason.',
      });
      return;
    }

    const now = new Date().toISOString();

    alert.status = 'RESOLVED';
    alert.resolvedAt = now;
    alert.resolutionReason = resolutionReason.trim();
    alert.updatedAt = now;

    res.json({
      success: true,
      message: 'SOS event marked as resolved.',
      data: alert,
    });
  } catch (error) {
    console.error('SOS resolution error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to resolve SOS alert.',
    });
  }
});

// GET /api/sos/history
router.get('/history', authenticateToken, (req: AuthRequest, res) => {
  try {
    const history = dbStore.sosAlerts
      .filter((alert) => alert.userId === req.user?.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('SOS history error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to load SOS history.',
    });
  }
});

export default router;
