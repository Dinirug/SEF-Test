import React, { useState, useEffect, useCallback } from 'react';
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  Trash2, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  RefreshCw, 
  ChevronRight,
  Printer,
  Sparkles
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CancelBookingModal } from '../components/CancelBookingModal';

export const MyReservationsView = ({ onBrowseCatalog }) => {
  const { user, isAuthenticated } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingRes, setCancellingRes] = useState(null);
  const { error } = useToast();

  const fetchMyReservations = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(false);
    try {
      const res = await api.get('/reservations/my');
      setReservations(res.data);
    } catch (err) {
      error('Failed to load your reservations.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, error]);

  useEffect(() => {
    fetchMyReservations();
  }, [fetchMyReservations]);

  const filteredReservations = reservations.filter((r) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING') return r.status === 'Pending';
    if (activeTab === 'ACTIVE') return r.status === 'CheckedOut' || r.status === 'Approved';
    if (activeTab === 'COMPLETED') return r.status === 'Returned';
    if (activeTab === 'CANCELLED') return r.status === 'Cancelled' || r.status === 'Rejected';
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>My Equipment Bookings</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Track and manage your campus equipment reservations, pickup passes, and return schedules.
        </p>
      </div>

      {/* Filter Tabs Bar */}
      <div className="filter-tabs-bar">
        <button
          className={`filter-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          All Bookings ({reservations.length})
        </button>
        <button
          className={`filter-tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
          onClick={() => setActiveTab('ACTIVE')}
        >
          Active & Approved ({reservations.filter((r) => r.status === 'CheckedOut' || r.status === 'Approved').length})
        </button>
        <button
          className={`filter-tab-btn ${activeTab === 'PENDING' ? 'active' : ''}`}
          onClick={() => setActiveTab('PENDING')}
        >
          Pending Approval ({reservations.filter((r) => r.status === 'Pending').length})
        </button>
        <button
          className={`filter-tab-btn ${activeTab === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setActiveTab('COMPLETED')}
        >
          Returned / Completed ({reservations.filter((r) => r.status === 'Returned').length})
        </button>
        <button
          className={`filter-tab-btn ${activeTab === 'CANCELLED' ? 'active' : ''}`}
          onClick={() => setActiveTab('CANCELLED')}
        >
          Cancelled / Rejected ({reservations.filter((r) => r.status === 'Cancelled' || r.status === 'Rejected').length})
        </button>

        <button
          className="btn-secondary btn-sm"
          style={{ marginLeft: 'auto' }}
          onClick={fetchMyReservations}
          title="Refresh bookings"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          Loading your bookings...
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', margin: '20px 0' }}>
          <CalendarCheck size={48} color="#64748b" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Bookings in This Tab</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 16px auto' }}>
            {activeTab === 'ALL'
              ? "You haven't reserved any campus equipment yet."
              : `No reservations found under the "${activeTab.toLowerCase()}" filter.`}
          </p>
          <button className="btn-primary btn-sm" onClick={onBrowseCatalog}>
            Browse Equipment Catalog
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredReservations.map((res) => {
            const startD = new Date(res.startDateTime);
            const endD = new Date(res.endDateTime);
            const canCancel = res.canCancel;

            return (
              <div
                key={res.id}
                className="glass-card"
                style={{
                  padding: '20px 24px',
                  display: 'grid',
                  gridTemplateColumns: '100px 1.5fr 1.2fr 180px',
                  gap: '20px',
                  alignItems: 'center'
                }}
              >
                {/* Equipment Thumbnail */}
                <div style={{ width: '90px', height: '80px', borderRadius: '10px', overflow: 'hidden', background: '#0f172a' }}>
                  <img
                    src={res.equipmentImageUrl}
                    alt={res.equipmentName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#818cf8', fontFamily: 'monospace' }}>
                      {res.reservationNumber}
                    </span>
                    <span className={`status-badge status-${res.status}`} style={{ position: 'static', padding: '2px 8px', fontSize: '0.72rem' }}>
                      {res.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>
                    {res.equipmentName}
                  </h3>

                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="#06b6d4" />
                    <span>{res.location}</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '6px', fontStyle: 'italic' }}>
                    Purpose: "{res.purpose}"
                  </div>
                </div>

                {/* Dates Schedule */}
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Pickup Time:</span>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                      {startD.toLocaleDateString()} at {startD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Return Due Date:</span>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                      {endD.toLocaleDateString()} at {endD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  {canCancel && (
                    <button
                      className="btn-danger btn-sm"
                      onClick={() => setCancellingRes(res)}
                      style={{ width: '100%' }}
                    >
                      <Trash2 size={13} />
                      Cancel Booking
                    </button>
                  )}

                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Booked on {new Date(res.createdAt).toLocaleDateString()}
                  </div>

                  {res.rejectionReason && (
                    <div style={{ fontSize: '0.75rem', color: '#f87171', textAlign: 'right' }}>
                      Rejection: {res.rejectionReason}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingRes && (
        <CancelBookingModal
          reservation={cancellingRes}
          onClose={() => setCancellingRes(null)}
          onCancelled={() => fetchMyReservations()}
        />
      )}
    </div>
  );
};
