import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardList, 
  Search, 
  CheckCircle, 
  XCircle, 
  ArrowUpRight, 
  PackageCheck, 
  RotateCcw, 
  RefreshCw, 
  Calendar, 
  User, 
  MapPin, 
  FileText 
} from 'lucide-react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

export const AdminReservationsView = () => {
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Return modal state
  const [returnModalRes, setReturnModalRes] = useState(null);
  const [returnNotes, setReturnNotes] = useState('All accessories and cables returned in clean, undamaged condition.');
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);

  const { success, error } = useToast();

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: 1,
        pageSize: 100,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/reservations', { params });
      setReservations(res.data.items);
      setTotalCount(res.data.totalCount);
    } catch (err) {
      error('Failed to load reservations.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, error]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleUpdateStatus = async (resId, newStatus, extraData = {}) => {
    try {
      await api.put(`/reservations/${resId}/status`, {
        status: newStatus,
        ...extraData
      });
      success(`Reservation status updated to ${newStatus}.`);
      fetchReservations();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update reservation status.';
      error(msg);
    }
  };

  const handleRejectPrompt = (res) => {
    const reason = prompt(`Enter rejection reason for reservation ${res.reservationNumber}:`);
    if (reason === null) return;
    handleUpdateStatus(res.id, 'Rejected', { rejectionReason: reason.trim() || 'Schedule conflict' });
  };

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (!returnModalRes) return;

    setIsProcessingReturn(true);
    try {
      await api.put(`/reservations/${returnModalRes.id}/status`, {
        status: 'Returned',
        returnConditionNotes: returnNotes.trim()
      });
      success(`Item successfully checked in and marked Returned.`);
      setReturnModalRes(null);
      fetchReservations();
    } catch (err) {
      error('Failed to complete equipment return.');
    } finally {
      setIsProcessingReturn(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>All Student Reservations</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
            Review, approve, check out, and inspect returned campus equipment.
          </p>
        </div>

        <button className="btn-secondary btn-sm" onClick={fetchReservations} title="Refresh reservations">
          <RefreshCw size={15} />
          Refresh List
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by student name, email, student ID, or reservation #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '180px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses ({totalCount})</option>
          <option value="Pending">Pending Approval</option>
          <option value="Approved">Approved (Ready for Pickup)</option>
          <option value="CheckedOut">Checked Out (Active Loan)</option>
          <option value="Returned">Returned / Completed</option>
          <option value="Cancelled">Cancelled by Student</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Reservations Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ref #</th>
              <th>Student / User</th>
              <th>Equipment Item</th>
              <th>Reservation Dates</th>
              <th>Status</th>
              <th>Purpose & Notes</th>
              <th style={{ textAlign: 'right' }}>Admin Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Loading reservations list...
                </td>
              </tr>
            ) : reservations.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No reservations match the selected filter.
                </td>
              </tr>
            ) : (
              reservations.map((res) => {
                const startD = new Date(res.startDateTime);
                const endD = new Date(res.endDateTime);

                return (
                  <tr key={res.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#818cf8', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {res.reservationNumber}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {new Date(res.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{res.userName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        {res.studentId || res.userEmail}
                      </div>
                      {res.department && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {res.department}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{res.equipmentName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#06b6d4' }}>
                        Tag: {res.equipmentAssetTag}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                        <strong>Pickup:</strong> {startD.toLocaleDateString()} {startD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                        <strong>Due:</strong> {endD.toLocaleDateString()} {endD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td>
                      <span className={`status-badge status-${res.status}`} style={{ position: 'static', padding: '3px 8px', fontSize: '0.72rem' }}>
                        {res.status}
                      </span>
                    </td>

                    <td style={{ maxWidth: '220px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={res.purpose}>
                        "{res.purpose}"
                      </div>
                      {res.returnConditionNotes && (
                        <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '2px' }}>
                          Return: {res.returnConditionNotes}
                        </div>
                      )}
                      {res.rejectionReason && (
                        <div style={{ fontSize: '0.72rem', color: '#f87171', marginTop: '2px' }}>
                          Rejection: {res.rejectionReason}
                        </div>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {res.status === 'Pending' && (
                          <>
                            <button
                              className="btn-success btn-sm"
                              onClick={() => handleUpdateStatus(res.id, 'Approved', { adminNotes: 'Approved by admin' })}
                              title="Approve booking"
                            >
                              <CheckCircle size={13} />
                              Approve
                            </button>
                            <button
                              className="btn-danger btn-sm"
                              onClick={() => handleRejectPrompt(res)}
                              title="Reject booking"
                            >
                              <XCircle size={13} />
                              Reject
                            </button>
                          </>
                        )}

                        {res.status === 'Approved' && (
                          <button
                            className="btn-primary btn-sm"
                            onClick={() => handleUpdateStatus(res.id, 'CheckedOut', { adminNotes: 'Item handed over to student at tech desk' })}
                            title="Mark item as checked out/picked up"
                          >
                            <PackageCheck size={13} />
                            Check Out
                          </button>
                        )}

                        {res.status === 'CheckedOut' && (
                          <button
                            className="btn-success btn-sm"
                            onClick={() => {
                              setReturnModalRes(res);
                              setReturnNotes('All accessories and cables returned in clean, undamaged condition.');
                            }}
                            title="Inspect and check in returned item"
                          >
                            <RotateCcw size={13} />
                            Check In / Return
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Return Inspection Modal */}
      {returnModalRes && (
        <div className="modal-overlay" onClick={() => setReturnModalRes(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: '#34d399' }}>
                <RotateCcw size={18} />
                Check In Returned Equipment
              </div>
              <button className="modal-close-btn" onClick={() => setReturnModalRes(null)}>
                <XCircle size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmReturn}>
              <div className="modal-body">
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '14px' }}>
                  Checking in <strong>{returnModalRes.equipmentName}</strong> ({returnModalRes.equipmentAssetTag}) from student <strong>{returnModalRes.userName}</strong>.
                </p>

                <div className="form-group">
                  <label className="form-label">Return Condition Inspection Notes *</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="e.g. Inspected, zero physical damage, lens clean, power brick included..."
                    required
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setReturnModalRes(null)}
                  disabled={isProcessingReturn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-success btn-sm"
                  disabled={isProcessingReturn}
                >
                  {isProcessingReturn ? 'Processing Check In...' : 'Confirm Item Check-In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
