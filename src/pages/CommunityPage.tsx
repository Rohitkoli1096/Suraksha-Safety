import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Users,
  Plus,
  ShieldCheck,
  Radio,
  FileCheck2,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  BookmarkCheck,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';
import { CommunityPost } from '../types';
import { CommunityPostCard } from '../components/community/CommunityPostCard';
import {
  CommunityFilterBar,
  CommunityCategoryFilter,
  CommunitySortOption,
} from '../components/community/CommunityFilterBar';
import { CommunitySidebar } from '../components/community/CommunitySidebar';
import { NewDiscussionModal } from '../components/community/NewDiscussionModal';
import { CommunitySkeleton } from '../components/community/CommunitySkeleton';

export const CommunityPage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filters & Search
  const [currentCategory, setCurrentCategory] = useState<CommunityCategoryFilter>('ALL');
  const [currentSort, setCurrentSort] = useState<CommunitySortOption>('LATEST');
  const [searchQuery, setSearchQuery] = useState('');

  // Local saved bookmarks
  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('suraksha_saved_posts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<CommunityPost[]>('/community');
      if (res.success && res.data) {
        setPosts(res.data);
      } else {
        setError(res.message || 'Unable to retrieve community discussions.');
      }
    } catch (err: any) {
      setError('Network communication failed. Please check connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Check query parameter for deep-linking action
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsCreateModalOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Handle Create Post
  const handleCreatePost = async (data: {
    title: string;
    content: string;
    category: 'SAFETY_TIP' | 'ALERT' | 'UPDATE' | 'COMMUNITY_WATCH';
    locationName: string;
  }): Promise<boolean> => {
    try {
      const res = await api.post<CommunityPost>('/community', data);
      if (res.success && res.data) {
        setPosts([res.data, ...posts]);
        showToast('Discussion published to community forum successfully.');
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // Handle Upvote / Helpful
  const handleUpvote = async (postId: string) => {
    if (!user) {
      showToast('Please sign in to mark discussions as helpful.');
      return;
    }

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasUpvoted = p.upvotedBy?.includes(user.id);
          const nextUpvotes = hasUpvoted ? Math.max(0, p.upvotes - 1) : p.upvotes + 1;
          const nextUpvotedBy = hasUpvoted
            ? (p.upvotedBy || []).filter((id) => id !== user.id)
            : [...(p.upvotedBy || []), user.id];
          return { ...p, upvotes: nextUpvotes, upvotedBy: nextUpvotedBy };
        }
        return p;
      })
    );

    try {
      const res = await api.post<{ id: string; upvotes: number; hasUpvoted: boolean }>(
        `/community/${postId}/upvote`
      );
      if (res.success && res.data) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, upvotes: res.data!.upvotes } : p
          )
        );
      }
    } catch (e) {
      // Rollback on network failure
      fetchPosts();
    }
  };

  // Handle Add Comment
  const handleAddComment = async (postId: string, content: string): Promise<boolean> => {
    if (!user) {
      showToast('Please sign in to reply to discussions.');
      return false;
    }

    try {
      const res = await api.post(`/community/${postId}/comment`, { content });
      if (res.success && res.data) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                comments: [...(p.comments || []), res.data],
              };
            }
            return p;
          })
        );
        showToast('Comment submitted.');
        return true;
      }
      return false;
    } catch (e) {
      showToast('Failed to post reply.');
      return false;
    }
  };

  // Handle Delete Post
  const handleDeletePost = async (postId: string) => {
    try {
      const res = await api.delete(`/community/${postId}`);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        showToast('Discussion removed.');
      } else {
        showToast(res.message || 'Failed to delete discussion.');
      }
    } catch {
      showToast('Failed to delete discussion.');
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      const res = await api.delete(`/community/${postId}/comment/${commentId}`);
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                comments: (p.comments || []).filter((c) => c.id !== commentId),
              };
            }
            return p;
          })
        );
        showToast('Comment deleted.');
      }
    } catch {
      showToast('Failed to delete comment.');
    }
  };

  // Handle Report Post
  const handleReportPost = async (postId: string) => {
    try {
      const res = await api.post(`/community/${postId}/report`, {
        reason: 'Reported by citizen for moderator verification',
      });
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, isFlagged: true } : p))
        );
        showToast('Discussion flagged for moderator verification.');
      }
    } catch {
      showToast('Unable to submit flag.');
    }
  };

  // Toggle Save / Bookmark
  const handleToggleSave = (postId: string) => {
    setSavedPostIds((prev) => {
      const next = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      try {
        localStorage.setItem('suraksha_saved_posts', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(
      savedPostIds.includes(postId)
        ? 'Discussion removed from saved.'
        : 'Discussion saved to your profile.'
    );
  };

  // Filtering & Sorting Calculation
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    // Filter by Category
    if (currentCategory !== 'ALL') {
      if (currentCategory === 'TRANSIT') {
        result = result.filter(
          (p) =>
            p.title.toLowerCase().includes('metro') ||
            p.title.toLowerCase().includes('transit') ||
            p.title.toLowerCase().includes('bus') ||
            p.content.toLowerCase().includes('metro') ||
            p.content.toLowerCase().includes('transit')
        );
      } else {
        result = result.filter((p) => p.category === currentCategory);
      }
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          (p.locationName && p.locationName.toLowerCase().includes(q)) ||
          p.authorName.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (currentSort === 'MOST_HELPFUL') {
      result.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (currentSort === 'MOST_DISCUSSED') {
      result.sort((a, b) => ((b.comments || []).length) - ((a.comments || []).length));
    } else {
      // LATEST
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [posts, currentCategory, currentSort, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/home" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">Community Safety</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-indigo-700" aria-current="page">
            Community Forum
          </span>
        </nav>

        {/* Page Header Lockup */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Verified Public Safety Network</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Community Safety Forum
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Share verified neighborhood safety information, transit updates, community alerts, and helpful local guidance across urban corridors.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={fetchPosts}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
              title="Refresh discussion feed"
              aria-label="Refresh feed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Discussion</span>
            </button>
          </div>
        </header>

        {/* Community Status Strip */}
        <section aria-label="Community Status Overview" className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-bold text-slate-900">Community Network Active</span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-slate-600 hidden sm:inline">Real-time localized citizen guardianship</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <strong className="text-slate-900 font-mono font-bold">2,481</strong>
                <span>active contributors</span>
              </div>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5">
                <strong className="text-indigo-700 font-mono font-bold">128</strong>
                <span>discussions this week</span>
              </div>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5">
                <strong className="text-emerald-700 font-mono font-bold">24</strong>
                <span>verified updates</span>
              </div>
            </div>
          </div>
        </section>

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          {/* Main Feed Column (8 Columns on desktop) */}
          <main className="col-span-12 lg:col-span-8 space-y-5">
            {/* Filter and Search Bar */}
            <CommunityFilterBar
              currentCategory={currentCategory}
              onSelectCategory={setCurrentCategory}
              currentSort={currentSort}
              onSelectSort={setCurrentSort}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalCount={filteredAndSortedPosts.length}
            />

            {/* Content States */}
            {loading ? (
              <CommunitySkeleton />
            ) : error ? (
              /* Error State */
              <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <h3 className="font-bold text-slate-900 text-base">Unable to load community discussions</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">{error}</p>
                <button
                  type="button"
                  onClick={fetchPosts}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Connection</span>
                </button>
              </div>
            ) : filteredAndSortedPosts.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-2xl border border-slate-200/90 p-10 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-slate-900">No discussions found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery
                      ? `No discussions match "${searchQuery}". Try modifying your search keyword or clearing category filters.`
                      : 'No safety discussions have been shared in this category yet. Be the first to share verified neighborhood guidance.'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentCategory('ALL');
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ New Discussion</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Stream of Post Cards */
              <div className="space-y-4">
                {filteredAndSortedPosts.map((post) => (
                  <CommunityPostCard
                    key={post.id}
                    post={post}
                    onUpvote={handleUpvote}
                    onAddComment={handleAddComment}
                    onDeletePost={handleDeletePost}
                    onDeleteComment={handleDeleteComment}
                    onReportPost={handleReportPost}
                    isSaved={savedPostIds.includes(post.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Right Information Sidebar (4 Columns on desktop) */}
          <div className="col-span-12 lg:col-span-4">
            <CommunitySidebar
              onSelectTopicTag={(topic) => setSearchQuery(topic)}
              onOpenNewDiscussion={() => setIsCreateModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* New Discussion Modal */}
      <NewDiscussionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};
