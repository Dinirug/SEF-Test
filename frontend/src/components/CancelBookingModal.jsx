import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

export const CancelBookingModal = ({ reservation, onClose, onCancelled }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  if (!reservation) return null;

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.put(`/reservations/${reservation.id}/cancel`, {
        reason: reason.trim() || 'Cancelled by user'
      });
      success(`Reservation ${reservation.reservationNumber} has been cancelled.`);
      if (onCancelled) onCancelled(res.data);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel reservation.';
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ color: '#f87171' }}>
            <AlertTriangle size={20} />
            Cancel Reservation
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleCancelSubmit}>
          <div className="modal-body">
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', marginBottom: '16px' }}>
              Are you sure you want to cancel reservation <strong>{reservation.reservationNumber}</strong> for <strong>{reservation.equipmentName}</strong>?
            </p>

            <div className="form-group">
              <label className="form-label">Reason for Cancellation (Optional)</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="e.g. Project scope changed, rescheduled experiment, equipment no longer needed..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Keep Reservation
            </button>
            <button
              type="submit"
              className="btn-danger btn-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
