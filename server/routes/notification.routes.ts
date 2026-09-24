import { Router } from 'express';
import { dbStore } from '../services/dbStore.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const list = dbStore.notifications
      .filter((n) => n.userId === req.user?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = list.filter((n) => !n.read).length;

    res.json({
      success: true,
      data: {
        notifications: list,
        unreadCount,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const notif = dbStore.notifications.find((n) => n.id === id && n.userId === req.user?.id);

    if (!notif) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    notif.read = true;
    res.json({ success: true, message: 'Notification marked as read', data: notif });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

// POST /api/notifications/read-all
router.post('/read-all', authenticateToken, (req: AuthRequest, res) => {
  try {
    dbStore.notifications.forEach((n) => {
      if (n.userId === req.user?.id) {
        n.read = true;
      }
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
});

export default router;
