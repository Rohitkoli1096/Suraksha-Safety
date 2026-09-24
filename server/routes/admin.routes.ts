import { Router } from 'express';
import { dbStore } from '../services/dbStore.js';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes
router.use(authenticateToken, requireRole(['ADMIN']));

// GET /api/admin/stats
router.get('/stats', (req: AuthRequest, res) => {
  try {
    const totalUsers = dbStore.users.length;
    const activeSOSEvents = dbStore.sosAlerts.filter((a) => a.status === 'ACTIVE').length;
    const totalReports = dbStore.reports.length;
    const pendingReports = dbStore.reports.filter((r) => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length;
    const resolvedReports = dbStore.reports.filter((r) => r.status === 'RESOLVED').length;
    const totalCommunityPosts = dbStore.communityPosts.length;

    res.json({
      success: true,
      data: {
        totalUsers,
        activeSOSEvents,
        totalReports,
        pendingReports,
        resolvedReports,
        totalCommunityPosts,
        systemStatus: 'ONLINE',
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve admin stats' });
  }
});

// GET /api/admin/users
router.get('/users', (req: AuthRequest, res) => {
  try {
    const safeUsers = dbStore.users.map(({ passwordHash, refreshToken, ...u }) => u);
    res.json({ success: true, data: safeUsers });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users' });
  }
});

// GET /api/admin/sos-events
router.get('/sos-events', (req: AuthRequest, res) => {
  try {
    const alerts = [...dbStore.sosAlerts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json({ success: true, data: alerts });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve SOS events' });
  }
});

export default router;
