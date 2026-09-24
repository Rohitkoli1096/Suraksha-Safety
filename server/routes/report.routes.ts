import { Router } from 'express';
import { dbStore } from '../services/dbStore.js';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/reports
router.get('/', (req, res) => {
  try {
    const { category, status } = req.query;
    let list = [...dbStore.reports];

    if (category && category !== 'ALL') {
      list = list.filter((r) => r.category === category);
    }
    if (status && status !== 'ALL') {
      list = list.filter((r) => r.status === status);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch incident reports' });
  }
});

// POST /api/reports
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { title, category, description, imageUrl, location } = req.body;

    if (!title || !description || !category) {
      res.status(400).json({ success: false, message: 'Title, category, and description are required' });
      return;
    }

    const user = dbStore.users.find((u) => u.id === req.user?.id);

    const newReport = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: req.user?.id || 'anon',
      authorName: user?.name || req.user?.name || 'Citizen Reporter',
      title: title.trim(),
      category,
      description: description.trim(),
      imageUrl: imageUrl || '',
      location: {
        latitude: location?.latitude || 28.6139,
        longitude: location?.longitude || 77.209,
        address: location?.address || 'Reported Location',
      },
      status: 'SUBMITTED' as const,
      adminNotes: '',
      upvotesCount: 0,
      upvotedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.reports.unshift(newReport);

    res.status(201).json({
      success: true,
      message: 'Safety hazard report submitted for municipal verification',
      data: newReport,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create report' });
  }
});

// POST /api/reports/:id/upvote
router.post('/:id/upvote', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const report = dbStore.reports.find((r) => r.id === id);
    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found' });
      return;
    }

    const hasUpvoted = report.upvotedBy.includes(userId);
    if (hasUpvoted) {
      report.upvotedBy = report.upvotedBy.filter((uId) => uId !== userId);
      report.upvotesCount = Math.max(0, report.upvotesCount - 1);
    } else {
      report.upvotedBy.push(userId);
      report.upvotesCount += 1;
    }

    res.json({
      success: true,
      data: {
        id: report.id,
        upvotesCount: report.upvotesCount,
        hasUpvoted: !hasUpvoted,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to toggle upvote' });
  }
});

// PATCH /api/reports/:id/status (Admin only)
router.patch('/:id/status', authenticateToken, requireRole(['ADMIN']), (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const report = dbStore.reports.find((r) => r.id === id);
    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found' });
      return;
    }

    report.status = status;
    if (adminNotes !== undefined) {
      report.adminNotes = adminNotes;
    }
    report.updatedAt = new Date().toISOString();

    // Notify author if known
    dbStore.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: report.userId,
      type: 'REPORT_STATUS_CHANGED',
      title: `Report Status Updated: ${report.title}`,
      message: `Your report status was changed to ${status}. ${adminNotes ? `Officer remarks: "${adminNotes}"` : ''}`,
      linkUrl: '/reports',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: report,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update report status' });
  }
});

export default router;
