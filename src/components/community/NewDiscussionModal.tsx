import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Send,
  ShieldCheck,
  AlertCircle,
  Eye,
  Edit3,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface NewDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    category: 'SAFETY_TIP' | 'ALERT' | 'UPDATE' | 'COMMUNITY_WATCH';
    locationName: string;
  }) => Promise<boolean>;
}

export const NewDiscussionModal: React.FC<NewDiscussionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'SAFETY_TIP' | 'ALERT' | 'UPDATE' | 'COMMUNITY_WATCH'>('SAFETY_TIP');
  const [locationName, setLocationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setContent('');
      setCategory('SAFETY_TIP');
      setLocationName('');
      setErrorMsg(null);
      setActiveTab('EDIT');
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a clear topic title for the safety discussion.');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('Please describe the safety guidance or neighborhood context.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    const success = await onSubmit({
      title: title.trim(),
      content: content.trim(),
      category,
      locationName: locationName.trim(),
    });
    setIsSubmitting(false);

    if (success) {
      onClose();
    } else {
      setErrorMsg('Failed to publish discussion. Please check your network and try again.');
    }
  };

  const TITLE_LIMIT = 120;
  const CONTENT_LIMIT = 1500;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h2 id="modal-title" className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
              Start Safety Discussion
            </h2>
            <p className="text-xs text-slate-500">
              Share verified transit tips, hazard observations, or safe corridors.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls: Edit vs Live Preview */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/30">
          <button
            type="button"
            onClick={() => setActiveTab('EDIT')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'EDIT'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Compose Post</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PREVIEW')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'PREVIEW'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Card Preview</span>
          </button>
        </div>

        {/* Content Body */}
        {activeTab === 'EDIT' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Topic / Summary Headline *
                </label>
                <span className={`text-[10px] font-mono ${title.length > TITLE_LIMIT ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                  {title.length}/{TITLE_LIMIT}
                </span>
              </div>
              <input
                ref={titleInputRef}
                type="text"
                required
                maxLength={TITLE_LIMIT}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Well-lit corridor with active shopkeepers after 9 PM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="SAFETY_TIP">Safety Tip / Commuter Recommendation</option>
                  <option value="ALERT">Hazard Alert / Watch Out</option>
                  <option value="UPDATE">Civic Facility / Police Booth Update</option>
                  <option value="COMMUNITY_WATCH">Neighborhood Patrol / Volunteer Escort</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                  Landmark / Transit Corridor
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Hauz Khas Metro Gate 2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Content Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Safety Guidance Details *
                </label>
                <span className={`text-[10px] font-mono ${content.length > CONTENT_LIMIT ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                  {content.length}/{CONTENT_LIMIT}
                </span>
              </div>
              <textarea
                required
                rows={5}
                maxLength={CONTENT_LIMIT}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share actionable details: lighting conditions, safe waiting spots, presence of PCR vans, or transit alternatives that help citizens travel securely..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Guidelines Disclaimer */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Verified Public Safety Standard</span>
              </div>
              <p>
                All posts are public to community members. Do not include personal contact numbers, private addresses, or panic rumors.
              </p>
            </div>

            {/* Form Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Discussion</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Live Preview Mode */
          <div className="p-6 space-y-5">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">{user?.name || 'Citizen Contributor'}</span>
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 rounded font-medium">
                        Contributor
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Just now · {locationName || 'Delhi NCR Metro Zone'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800">
                  {category.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {title || 'Discussion title preview'}
                </h4>
                <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">
                  {content || 'Guidance content preview will appear here as you type...'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('EDIT')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Back to Editing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
