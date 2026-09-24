import { Router } from 'express';
import { dbStore } from '../services/dbStore.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/community
router.get('/', (req, res) => {
  try {
    const { category } = req.query;
    let list = [...dbStore.communityPosts];

    if (category && category !== 'ALL') {
      list = list.filter((p) => p.category === category);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch community posts' });
  }
});

// POST /api/community
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { title, content, category = 'SAFETY_TIP', locationName = '' } = req.body;

    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Title and content are required' });
      return;
    }

    const user = dbStore.users.find((u) => u.id === req.user?.id);

    const newPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: req.user?.id || 'anon',
      authorName: user?.name || req.user?.name || 'Citizen Contributor',
      authorRole: (req.user?.role || 'USER') as any,
      title: title.trim(),
      content: content.trim(),
      category: category as any,
      locationName: locationName.trim(),
      upvotes: 0,
      upvotedBy: [],
      comments: [],
      isFlagged: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.communityPosts.unshift(newPost);

    res.status(201).json({
      success: true,
      message: 'Community safety post published',
      data: newPost,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create community post' });
  }
});

// POST /api/community/:id/upvote
router.post('/:id/upvote', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const post = dbStore.communityPosts.find((p) => p.id === id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    const hasUpvoted = post.upvotedBy.includes(userId);
    if (hasUpvoted) {
      post.upvotedBy = post.upvotedBy.filter((u) => u !== userId);
      post.upvotes = Math.max(0, post.upvotes - 1);
    } else {
      post.upvotedBy.push(userId);
      post.upvotes += 1;
    }

    res.json({
      success: true,
      data: {
        id: post.id,
        upvotes: post.upvotes,
        hasUpvoted: !hasUpvoted,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to toggle upvote' });
  }
});

// POST /api/community/:id/comment
router.post('/:id/comment', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
      return;
    }

    const post = dbStore.communityPosts.find((p) => p.id === id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    const user = dbStore.users.find((u) => u.id === req.user?.id);

    const newComment = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      postId: post.id,
      userId: req.user?.id || 'anon',
      authorName: user?.name || req.user?.name || 'Citizen',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    post.comments.push(newComment);

    res.status(201).json({
      success: true,
      message: 'Comment posted',
      data: newComment,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
});

// DELETE /api/community/:id (Author or Admin)
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const postIndex = dbStore.communityPosts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    const post = dbStore.communityPosts[postIndex];
    if (post.userId !== userId && userRole !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized to delete this discussion' });
      return;
    }

    dbStore.communityPosts.splice(postIndex, 1);
    res.json({ success: true, message: 'Post removed successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete discussion' });
  }
});

// DELETE /api/community/:id/comment/:commentId (Author or Admin)
router.delete('/:id/comment/:commentId', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const post = dbStore.communityPosts.find((p) => p.id === id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    const commentIndex = post.comments.findIndex((c) => c.id === commentId);
    if (commentIndex === -1) {
      res.status(404).json({ success: false, message: 'Comment not found' });
      return;
    }

    const comment = post.comments[commentIndex];
    if (comment.userId !== userId && userRole !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
      return;
    }

    post.comments.splice(commentIndex, 1);
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
});

// POST /api/community/:id/report
router.post('/:id/report', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Unverified or misleading safety claim' } = req.body;

    const post = dbStore.communityPosts.find((p) => p.id === id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    post.isFlagged = true;
    res.json({ success: true, message: 'Discussion flagged for moderator review. Thank you for keeping the community safe.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to report discussion' });
  }
});

export default router;
