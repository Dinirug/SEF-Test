import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Package, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ShieldAlert, 
  Sparkles, 
  LogIn 
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const EquipmentDetailModal = ({ equipment, onClose, onBookingSuccess }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { success, error, warning } = useToast();

  // Reservation form state
  // Default to tomorrow 09:00 AM to 3 days later 17:00 PM
  const getTomorrowIso = (addDays = 1, hour = 9) => {
    const d = new Date();
    d.setDate(d.getDate() + addDays);
    d.setHours(hour, 0, 0, 0);
    // Format YYYY-MM-DDTHH:mm
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [startDateTime, setStartDateTime] = useState(() => getTomorrowIso(1, 9));
  const [endDateTime, setEndDateTime] = useState(() => getTomorrowIso(4, 17));
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse specifications
  let specsObj = {};
  try {
    specsObj = typeof equipment.specifications === 'string'
      ? JSON.parse(equipment.specifications || '{}')
      : equipment.specifications || {};
  } catch (e) {
    specsObj = { Details: equipment.specifications };
  }

  // Calculate duration in days
  const startDate = new Date(startDateTime);
  const endDate = new Date(endDateTime);
  const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
  const isDurationValid = durationDays > 0 && durationDays <= equipment.maxBorrowDays;

  // Real-time availability check when dates change
  useEffect(() => {
    if (!startDateTime || !endDateTime || startDate >= endDate) {
      setAvailabilityResult(null);
      return;
    }

    const checkAvailability = async () => {
      setIsCheckingAvailability(true);
      try {
        const res = await api.post('/reservations/check-availability', {
          equipmentId: equipment.id,
          startDateTime: new Date(startDateTime).toISOString(),
          endDateTime: new Date(endDateTime).toISOString()
        });
        setAvailabilityResult(res.data);
      } catch (err) {
        console.error('Availability check error', err);
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    const timer = setTimeout(checkAvailability, 400);
    return () => clearTimeout(timer);
  }, [equipment.id, startDateTime, endDateTime]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (!isDurationValid) {
      warning(`Reservation duration must be between 1 hour and ${equipment.maxBorrowDays} days.`);
      return;
    }

    if (!purpose.trim()) {
      warning('Please enter the coursework/project purpose for this booking.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/reservations', {
        equipmentId: equipment.id,
        startDateTime: new Date(startDateTime).toISOString(),
        endDateTime: new Date(endDateTime).toISOString(),
        quantity: parseInt(quantity, 10),
        purpose: purpose.trim(),
        notes: notes.trim() || null
      });

      success('Reservation request submitted successfully!');
      if (onBookingSuccess) {
        onBookingSuccess(response.data);
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit reservation. Please check dates.';
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>{equipment.name}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px' }}>
          {/* Left Column: Equipment Overview & Specs */}
          <div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', height: '230px', marginBottom: '16px', background: '#0f172a' }}>
              <img
                src={equipment.imageUrl}
                alt={equipment.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <span className={`status-badge status-${equipment.status}`} style={{ position: 'static' }}>
                {equipment.status} ({equipment.availableQuantity} of {equipment.totalQuantity} in stock)
              </span>
              <span className="brand-badge" style={{ fontSize: '0.78rem' }}>
                Asset Tag: {equipment.assetTag}
              </span>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '18px' }}>
              {equipment.description}
            </p>

            {/* Specifications Table */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '8px', color: '#818cf8' }}>Technical Specifications</h4>
              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                {Object.entries(specsObj).map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '5px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      fontSize: '0.84rem'
                    }}
                  >
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>{key}</span>
                    <span style={{ color: '#f8fafc', textAlign: 'right', maxWidth: '65%' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location & Terms */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4' }}>
                <MapPin size={16} />
                <span>Pickup Location: <strong>{equipment.location}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#94a3b8' }}>
                <ShieldAlert size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{equipment.termsAndConditions}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Reservation Form */}
          <div style={{ background: 'rgba(17, 24, 39, 0.9)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#818cf8" />
              Book Equipment
            </h3>

            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label className="form-label">Pickup Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Return Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  required
                />
              </div>

              {/* Duration Info & Real-Time Availability Indicator */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  background: isDurationValid ? 'rgba(99, 102, 241, 0.1)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${isDurationValid ? 'rgba(99, 102, 241, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
                  fontSize: '0.84rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Requested Borrow Duration:</span>
                  <strong>{durationDays > 0 ? `${durationDays.toFixed(1)} days` : 'Invalid Range'}</strong>
                </div>

                {durationDays > equipment.maxBorrowDays && (
                  <div style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <AlertTriangle size={14} />
                    Exceeds maximum limit of {equipment.maxBorrowDays} days.
                  </div>
                )}

                {availabilityResult && (
                  <div style={{ marginTop: '6px', color: availabilityResult.isAvailable ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {availabilityResult.isAvailable ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    {availabilityResult.message}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Quantity Needed</label>
                <input
                  type="number"
                  min="1"
                  max={equipment.totalQuantity}
                  className="form-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Coursework / Project Purpose *</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g. CS4100 Computer Vision final project experiments, needing CUDA GPU for model training..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Special Requests / Notes (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Need extra HDMI cable or dual battery kit if possible"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {isAuthenticated ? (
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                  disabled={isSubmitting || !isDurationValid || (availabilityResult && !availabilityResult.isAvailable)}
                >
                  {isSubmitting ? 'Confirming Reservation...' : 'Confirm & Request Reservation'}
                </button>
              ) : (
                <div>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ width: '100%', padding: '12px' }}
                    onClick={() => openAuthModal('login')}
                  >
                    <LogIn size={16} />
                    Sign In to Reserve Item
                  </button>
                  <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.78rem', color: '#94a3b8' }}>
                    University student or staff credentials required.
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
