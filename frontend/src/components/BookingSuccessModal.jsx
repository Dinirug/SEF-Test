import React, { useEffect } from 'react';
import { CheckCircle, Calendar, MapPin, Hash, Sparkles, ArrowRight, Download, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BookingSuccessModal = ({ reservation, onClose, onViewMyBookings }) => {
  useEffect(() => {
    // Launch celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  if (!reservation) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div style={{ textAlign: 'center', padding: '32px 24px 20px 24px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
            }}
          >
            <CheckCircle size={36} color="white" />
          </div>

          <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Reservation Confirmed!</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '24px' }}>
            Your booking request has been registered in the campus equipment system.
          </p>

          {/* Digital Pass Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
              borderRadius: '16px',
              border: '1px dashed rgba(99, 102, 241, 0.4)',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '24px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Booking Reference</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#818cf8', fontFamily: 'monospace' }}>
                  {reservation.reservationNumber}
                </div>
              </div>

              <span className={`status-badge status-${reservation.status}`} style={{ position: 'static' }}>
                {reservation.status}
              </span>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Equipment</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{reservation.equipmentName}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Tag: {reservation.equipmentAssetTag}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px', fontSize: '0.84rem' }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Pickup Schedule</div>
                <div style={{ fontWeight: 600, color: '#cbd5e1' }}>
                  {new Date(reservation.startDateTime).toLocaleDateString()} at {new Date(reservation.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Return By</div>
                <div style={{ fontWeight: 600, color: '#cbd5e1' }}>
                  {new Date(reservation.endDateTime).toLocaleDateString()} at {new Date(reservation.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#06b6d4', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
              <MapPin size={15} />
              <span>Location: <strong>{reservation.location}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Browse Catalog
            </button>
            <button
              className="btn-primary"
              style={{ flex: 1.2 }}
              onClick={() => {
                onClose();
                if (onViewMyBookings) onViewMyBookings();
              }}
            >
              View My Bookings
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
