import React, { useEffect, useState } from 'react';
import {
  Shield,
  ShieldAlert,
  Users,
  FileText,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { api } from '../api/client';
import { SOSAlert, Report, UserProfile } from '../types';

interface AdminStats {
  totalUsers: number;
  activeSOSEvents: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  totalCommunityPosts: number;
  systemStatus: string;
}

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [sosEvents, setSosEvents] = useState<SOSAlert[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SOS' | 'REPORTS' | 'USERS'>('OVERVIEW');
  const [loading, setLoading] = useState(true);

  // Status update note modal
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [newStatus, setNewStatus] = useState<string>('IN_PROGRESS');
  const [adminNotes, setAdminNotes] = useState<string>('');

  const fetchAdminData = async () => {
    setLoading(true);
    const [statsRes, sosRes, reportsRes, usersRes] = await Promise.all([
      api.get<AdminStats>('/admin/stats'),
      api.get<SOSAlert[]>('/admin/sos-events'),
      api.get<Report[]>('/reports'),
      api.get<UserProfile[]>('/admin/users'),
    ]);

    if (statsRes.success && statsRes.data) setStats(statsRes.data);
    if (sosRes.success && sosRes.data) setSosEvents(sosRes.data);
    if (reportsRes.success && reportsRes.data) setReports(reportsRes.data);
    if (usersRes.success && usersRes.data) setUsersList(usersRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateReportStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    const res = await api.patch(`/reports/${selectedReport.id}/status`, {
      status: newStatus,
      adminNotes,
    });

    if (res.success && res.data) {
      setReports((prev) => prev.map((r) => (r.id === selectedReport.id ? res.data : r)));
      setSelectedReport(null);
      fetchAdminData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Central Municipal Command &amp; Control Desk</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Suraksha Administrator Command
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time urban distress dispatch monitoring, hazard ticket remediation, and citizen accounts.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-2 self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {/* 4 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered Citizens</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats?.totalUsers || 0}</p>
          <span className="text-[10px] text-emerald-600 font-bold">100% Verified Identifiers</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-red-200 shadow-xs bg-red-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">Active SOS Distress</span>
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-black text-red-600 mt-2">{stats?.activeSOSEvents || 0}</p>
          <span className="text-[10px] text-red-500 font-bold">Priority Telemetry Broadcasting</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Hazard Reports</span>
            <FileText className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats?.totalReports || 0}</p>
          <span className="text-[10px] text-slate-500 font-medium">
            {stats?.pendingReports || 0} Pending Verification
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">System Telemetry Health</span>
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2">100% UP</p>
          <span className="text-[10px] text-slate-500 font-medium">Gateway Latency: 14ms</span>
        </div>
      </div>

      {/* Tabs Strip */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {(['OVERVIEW', 'SOS', 'REPORTS', 'USERS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === tab
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'OVERVIEW'
              ? 'Operational Feed'
              : tab === 'SOS'
              ? `SOS Incidents (${sosEvents.length})`
              : tab === 'REPORTS'
              ? `Hazard Moderation (${reports.length})`
              : `Citizens (${usersList.length})`}
          </button>
        ))}
      </div>

      {/* Tab: SOS Incidents */}
      {(activeTab === 'OVERVIEW' || activeTab === 'SOS') && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Emergency Distress Logs</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Citizen Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Trigger Source</th>
                  <th className="p-3">GPS Location</th>
                  <th className="p-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sosEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{event.userName}</td>
                    <td className="p-3 text-slate-600">{event.userPhone}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          event.status === 'ACTIVE'
                            ? 'bg-red-100 text-red-800 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{event.activationSource.replace('_', ' ')}</td>
                    <td className="p-3 text-slate-500">{event.location.address}</td>
                    <td className="p-3 text-slate-400">
                      {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Hazard Moderation */}
      {(activeTab === 'OVERVIEW' || activeTab === 'REPORTS') && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <span>Hazard Reports Remediation Desk</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Title &amp; Category</th>
                  <th className="p-3">Reporter</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Upvotes</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{report.title}</p>
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                        {report.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{report.authorName}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          report.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : report.status === 'IN_PROGRESS'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{report.upvotesCount}</td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setNewStatus(report.status);
                          setAdminNotes(report.adminNotes || '');
                        }}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Users List */}
      {activeTab === 'USERS' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
            Registered Users &amp; Roles ({usersList.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Guardians</th>
                  <th className="p-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3 text-slate-600">{u.phone}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{u.emergencyContacts?.length || 0}</td>
                    <td className="p-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Update Report Status</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="font-bold text-slate-800 text-sm">{selectedReport.title}</p>

            <form onSubmit={handleUpdateReportStatus} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Change Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Municipal Action Note
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Dispatched electrical crew to replace sodium lamps. Work order #MC-9921."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="w-1/2 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
