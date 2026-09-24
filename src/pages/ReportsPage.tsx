import React, { useEffect, useState } from 'react';
import {
  FileText,
  AlertTriangle,
  MapPin,
  Camera,
  Plus,
  ThumbsUp,
  Filter,
  CheckCircle,
  Clock,
  Send,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSOSStore } from '../store/sosStore';
import { api } from '../api/client';
import { Report, ReportCategory } from '../types';

export const ReportsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentLocation, requestLocation } = useSOSStore();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReportCategory>('STREET_LIGHTING');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [address, setAddress] = useState('Near Metro Station, Outer Ring Road');
  const [submitting, setSubmitting] = useState(false);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories: { label: string; value: ReportCategory }[] = [
    { label: 'Broken Street Lighting', value: 'STREET_LIGHTING' },
    { label: 'Harassment Blackspot', value: 'HARASSMENT_HAZARD' },
    { label: 'Deserted / Dark Alley', value: 'DESERTED_AREA' },
    { label: 'Poor Visibility Stretch', value: 'POOR_VISIBILITY' },
    { label: 'Suspicious Activity', value: 'SUSPICIOUS_ACTIVITY' },
    { label: 'Broken Civic Infrastructure', value: 'INFRASTRUCTURE_ISSUE' },
  ];

  const fetchReports = async () => {
    setLoading(true);
    const query = selectedCategory !== 'ALL' ? `?category=${selectedCategory}` : '';
    const res = await api.get<Report[]>(`/reports${query}`);
    if (res.success && res.data) {
      setReports(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
    requestLocation();
  }, [selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    const loc = currentLocation || { latitude: 28.6139, longitude: 77.209, address };

    const res = await api.post('/reports', {
      title,
      category,
      description,
      imageUrl,
      location: {
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: address || loc.address || 'Reported Location',
      },
    });

    setSubmitting(false);

    if (res.success && res.data) {
      setReports([res.data, ...reports]);
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setImageUrl('');
    }
  };

  const handleUpvote = async (reportId: string) => {
    if (!user) return;
    const res = await api.post<{ id: string; upvotesCount: number; hasUpvoted: boolean }>(
      `/reports/${reportId}/upvote`
    );
    if (res.success && res.data) {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, upvotesCount: res.data!.upvotesCount } : r))
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Submit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Civic Hazard Blackspots &amp; Remediation</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Hazard Incident Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Citizen-reported urban hazards, unlit streets, and blackspots submitted directly to municipal command centers.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Hazard</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            selectedCategory === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setSelectedCategory(c.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === c.value
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">Loading incident reports...</div>
        ) : reports.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900 text-base">No reported hazards in this category</h3>
            <p className="text-xs text-slate-500 mt-1">This corridor is currently clear of reported blackspots.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
            >
              {report.imageUrl && (
                <div className="h-44 w-full overflow-hidden bg-slate-100">
                  <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-5 space-y-3 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                    {report.category.replace('_', ' ')}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      report.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : report.status === 'IN_PROGRESS'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {report.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">{report.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{report.description}</p>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{report.location.address}</span>
                  </p>
                  <p className="text-slate-400">
                    Reported by {report.authorName} • {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {report.adminNotes && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                    <span className="font-bold text-slate-900">Municipal Desk Note:</span> {report.adminNotes}
                  </div>
                )}
              </div>

              {/* Bottom Card Action */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleUpvote(report.id)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Upvote ({report.upvotesCount})</span>
                </button>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Verified Citizen Entry</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Hazard Report */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900">Report Civic Hazard / Blackspot</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hazard Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken high-mast lamp near subway exit"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReportCategory)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description &amp; Safety Hazard Details
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the issue (e.g. Dark stretch of 200m after 8 PM, high pedestrian risk)..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Location / Street Landmark
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Pillar 148, Outer Ring Road, New Delhi"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Image Attachment URL (Optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-200 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'File Hazard Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
