import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  CalendarClock, 
  AlertTriangle, 
  Layers, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle, 
  Activity, 
  ArrowUpRight, 
  RefreshCw,
  UserPlus,
  ShieldCheck,
  X
} from 'lucide-react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

export const AdminDashboardView = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    staffId: '',
    department: 'Central IT & Equipment Desk',
    phoneNumber: ''
  });

  const { success, error } = useToast();

  const fetchDashboardStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data);
    } catch (err) {
      error('Failed to load admin dashboard analytics.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingAdmin(true);
    try {
      await api.post('/auth/create-admin', adminFormData);
      success(`Administrator account for "${adminFormData.fullName}" created successfully!`);
      setIsCreateAdminOpen(false);
      setAdminFormData({
        fullName: '',
        email: '',
        password: '',
        staffId: '',
        department: 'Central IT & Equipment Desk',
        phoneNumber: ''
      });
      fetchDashboardStats();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create administrator account.';
      error(msg);
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const handleQuickApprove = async (reservationId) => {
    try {
      await api.put(`/reservations/${reservationId}/status`, {
        status: 'Approved',
        adminNotes: 'Quick approved from Admin Dashboard'
      });
      success('Reservation approved successfully.');
      fetchDashboardStats();
    } catch (err) {
      error('Failed to approve reservation.');
    }
  };

  const handleQuickReject = async (reservationId) => {
    const reason = prompt('Please enter the reason for rejection:');
    if (reason === null) return; // cancelled prompt

    try {
      await api.put(`/reservations/${reservationId}/status`, {
        status: 'Rejected',
        rejectionReason: reason.trim() || 'Schedule conflict / maintenance',
        adminNotes: 'Rejected via quick action'
      });
      success('Reservation rejected.');
      fetchDashboardStats();
    } catch (err) {
      error('Failed to reject reservation.');
    }
  };

  if (isLoading || !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
        Loading Administrator Command Center...
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', marginBottom: '6px' }}>Admin Command Center</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Live university equipment inventory tracking, approvals, and loan metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary btn-sm" onClick={() => setIsCreateAdminOpen(true)}>
            <UserPlus size={15} />
            Add Admin Staff
          </button>
          <button className="btn-secondary btn-sm" onClick={fetchDashboardStats}>
            <RefreshCw size={15} />
            Refresh Stats
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Equipment Types</div>
            <div className="stat-value">{stats.totalEquipment}</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
              {stats.availableEquipment} units currently available
            </div>
          </div>
          <div className="stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Package size={26} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Active Loans (Checked Out)</div>
            <div className="stat-value" style={{ color: '#06b6d4' }}>{stats.activeLoans}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
              On loan to students
            </div>
          </div>
          <div className="stat-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <CalendarClock size={26} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Pending Approval Requests</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.pendingRequests}</div>
            <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px' }}>
              Requires administrator action
            </div>
          </div>
          <div className="stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <AlertTriangle size={26} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Fleet Utilization Rate</div>
            <div className="stat-value" style={{ color: '#a855f7' }}>{stats.utilizationRate}%</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
              {stats.totalStudents} registered students
            </div>
          </div>
          <div className="stat-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <TrendingUp size={26} />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Pending Approvals & Category Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Pending Approval Queue */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#f59e0b" />
              Pending Student Approvals
            </h3>
            <button
              className="btn-secondary btn-sm"
              onClick={() => onNavigate('admin-reservations')}
            >
              View All ({stats.pendingRequests})
            </button>
          </div>

          {stats.pendingApprovals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
              <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 8px auto' }} />
              <div>All reservation requests have been processed!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.pendingApprovals.map((req) => (
                <div
                  key={req.id}
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{req.equipmentName}</span>
                      <span style={{ fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace' }}>
                        {req.reservationNumber}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      Requested by: <strong>{req.userName}</strong> ({req.studentId || req.userEmail})
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                      {new Date(req.startDateTime).toLocaleDateString()} - {new Date(req.endDateTime).toLocaleDateString()} • Purpose: "{req.purpose}"
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-success btn-sm"
                      onClick={() => handleQuickApprove(req.id)}
                      title="Approve booking"
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button
                      className="btn-danger btn-sm"
                      onClick={() => handleQuickReject(req.id)}
                      title="Reject booking"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#818cf8" />
            Equipment Inventory Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats.categoryDistribution.map((cat, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>{cat.categoryName}</span>
                  <span style={{ color: '#94a3b8' }}>
                    {cat.count} items ({cat.percentage}%)
                  </span>
                </div>
                <div style={{ height: '8px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${cat.percentage}%`,
                      background: idx % 2 === 0 ? 'linear-gradient(90deg, #4f46e5, #06b6d4)' : 'linear-gradient(90deg, #a855f7, #ec4899)',
                      borderRadius: '4px'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent System Audit Logs */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="#06b6d4" />
          Recent Equipment System Activity
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {stats.recentActivities.map((act) => (
            <div
              key={act.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.2)',
                fontSize: '0.85rem'
              }}
            >
              <div>
                <span style={{ fontWeight: 600, color: '#818cf8', marginRight: '8px' }}>
                  [{act.title}]
                </span>
                <span style={{ color: '#cbd5e1' }}>{act.description}</span>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.timestamp).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Administrator Account Modal */}
      {isCreateAdminOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateAdminOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: '#34d399' }}>
                <ShieldCheck size={20} />
                Create Administrator Account
              </div>
              <button className="modal-close-btn" onClick={() => setIsCreateAdminOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateAdminSubmit}>
              <div className="modal-body">
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '16px' }}>
                  Grant full campus staff permissions to oversee inventory, edit equipment, and approve student requests.
                </p>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. Robert Vance"
                    value={adminFormData.fullName}
                    onChange={(e) => setAdminFormData({ ...adminFormData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">University Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. robert.vance@university.edu"
                    value={adminFormData.email}
                    onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Staff ID</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ADM-2026-104"
                      value={adminFormData.staffId}
                      onChange={(e) => setAdminFormData({ ...adminFormData, staffId: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department / Unit</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Central IT & Lab Desk"
                      value={adminFormData.department}
                      onChange={(e) => setAdminFormData({ ...adminFormData, department: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+1 (555) 019-2831"
                    value={adminFormData.phoneNumber}
                    onChange={(e) => setAdminFormData({ ...adminFormData, phoneNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Temporary Password (min 6 chars) *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Set temporary login password"
                    value={adminFormData.password}
                    onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setIsCreateAdminOpen(false)}
                  disabled={isSubmittingAdmin}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary btn-sm"
                  disabled={isSubmittingAdmin}
                >
                  {isSubmittingAdmin ? 'Creating Administrator...' : 'Create Admin Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
