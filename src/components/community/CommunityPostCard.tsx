import React, { useState } from 'react';
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Clock,
  MoreHorizontal,
  Send,
  Trash2,
  Flag,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CommunityPost, CommunityComment } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface CommunityPostCardProps {
  post: CommunityPost;
  onUpvote: (postId: string) => void;
  onAddComment: (postId: string, content: string) => Promise<boolean>;
  onDeletePost?: (postId: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  onReportPost?: (postId: string) => void;
  isSaved?: boolean;
  onToggleSave?: (postId: string) => void;
}

export const CommunityPostCard: React.FC<CommunityPostCardProps> = ({
  post,
  onUpvote,
  onAddComment,
  onDeletePost,
  onDeleteComment,
  onReportPost,
  isSaved = false,
  onToggleSave,
}) => {
  const { user } = useAuthStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  const isAuthor = user?.id === post.userId;
  const isAdmin = user?.role === 'ADMIN';
  const hasUpvoted = user ? post.upvotedBy?.includes(user.id) : false;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/community#${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Suraksha Safety: ${post.title}`,
          text: post.content.slice(0, 100),
          url: shareUrl,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    const success = await onAddComment(post.id, commentText.trim());
    if (success) {
      setCommentText('');
      setShowComments(true);
    }
    setIsSubmittingComment(false);
  };

  const commentsList = post.comments || [];
  const commentsCount = commentsList.length;

  const isLongContent = post.content.length > 280;
  const displayedContent = isLongContent && !isContentExpanded
    ? `${post.content.slice(0, 260)}...`
    : post.content;

  // Verification & Role Styling
  const isOfficial = post.authorRole === 'ADMIN' || post.title.toLowerCase().includes('police') || post.authorName.toLowerCase().includes('police');
  const isVolunteerGuardian = post.authorName.toLowerCase().includes('priya') || post.authorRole === 'USER';

  return (
    <article
      id={post.id}
      className={`bg-white rounded-2xl border transition-all duration-200 p-5 sm:p-6 space-y-4 shadow-xs hover:border-slate-300 ${
        post.isFlagged ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200/90'
      }`}
    >
      {/* Top Header: Author Lockup & Verification */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar with fallback */}
          {post.authorAvatar || isOfficial ? (
            <img
              src={
                post.authorAvatar ||
                '/src/assets/images/safety_official_avatar_1790173396514.jpg'
              }
              alt={post.authorName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">
              {post.authorName.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-sm text-slate-900">{post.authorName}</span>

              {/* Trust & Verification Badges */}
              {isOfficial ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verified Official</span>
                </span>
              ) : isVolunteerGuardian ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" />
                  <span>Verified Contributor</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 font-medium">Community Member</span>
              )}
            </div>

            {/* Quiet Unboxed Metadata with · separator */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <span>{new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{post.locationName || 'Delhi NCR Metro Zone'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Category Label & Action Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
              post.category === 'UPDATE'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                : post.category === 'ALERT'
                ? 'bg-rose-50 text-rose-800 border border-rose-200/60'
                : post.category === 'COMMUNITY_WATCH'
                ? 'bg-amber-50 text-amber-900 border border-amber-200/60'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200/60'
            }`}
          >
            {post.category.replace('_', ' ')}
          </span>

          {/* More options menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Discussion options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-xs">
                {(isAuthor || isAdmin) && onDeletePost && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDeletePost(post.id);
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Discussion</span>
                  </button>
                )}
                {onReportPost && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onReportPost(post.id);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                  >
                    <Flag className="w-3.5 h-3.5 text-amber-600" />
                    <span>Report Content</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleShare();
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Copy Link</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title & Body */}
      <div className="space-y-2">
        <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-snug">
          {post.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
          {displayedContent}
        </p>

        {isLongContent && (
          <button
            type="button"
            onClick={() => setIsContentExpanded(!isContentExpanded)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            {isContentExpanded ? (
              <>
                <span>Show less</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Read full report</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Flagged warning if applicable */}
      {post.isFlagged && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>This discussion has been flagged by community members for moderator verification.</span>
        </div>
      )}

      {/* Interaction Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Helpful Button */}
          <button
            type="button"
            onClick={() => onUpvote(post.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              hasUpvoted
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200/80'
            }`}
            title="Mark as helpful safety guidance"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'text-white' : 'text-indigo-600'}`} />
            <span className="tabular-nums">{post.upvotes}</span>
            <span className="hidden sm:inline">Helpful</span>
          </button>

          {/* Comments Toggle */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
              showComments
                ? 'bg-slate-100 text-slate-900'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span className="tabular-nums">{commentsCount}</span>
            <span className="hidden sm:inline">Comments</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1 px-2.5 py-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
            title="Share discussion"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="text-xs font-medium hidden sm:inline">
              {copiedShare ? 'Copied!' : 'Share'}
            </span>
          </button>

          {/* Bookmark Button */}
          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(post.id)}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isSaved
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save discussion'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          {commentsList.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-1">
              No replies yet. Be the first to share local context or transit advice.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {commentsList.map((cmt) => {
                const isCommentAuthor = user?.id === cmt.userId;
                return (
                  <div
                    key={cmt.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{cmt.authorName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(cmt.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {(isCommentAuthor || isAdmin) && onDeleteComment && (
                        <button
                          type="button"
                          onClick={() => onDeleteComment(post.id, cmt.id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <p className="text-slate-700 leading-relaxed">{cmt.content}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Comment Input Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add verified neighborhood perspective or transit detail..."
                className="flex-1 px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-3 h-3" />
                <span className="hidden sm:inline">Reply</span>
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Sign in to contribute your comments and safety updates.
            </p>
          )}
        </div>
      )}
    </article>
  );
};
