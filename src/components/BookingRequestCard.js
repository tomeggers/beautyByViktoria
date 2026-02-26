import React, { useState } from 'react';
import { VscCheck, VscClose, VscEye, VscEyeClosed } from 'react-icons/vsc';
import '../assets/styles/admin.css';

const BookingRequestCard = ({ booking, onApprove, onDecline }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [adminNotes, setAdminNotes] = useState(booking.admin_notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleApprove = async () => {
    setIsUpdating(true);
    try {
      await onApprove(booking.id, adminNotes);
    } catch (error) {
      console.error('Error approving booking:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecline = async () => {
    setIsUpdating(true);
    try {
      await onDecline(booking.id, adminNotes);
    } catch (error) {
      console.error('Error declining booking:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'declined': return '#f44336';
      case 'pending': return '#ff9800';
      case 'cancelled': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString + 'T00:00:00').toLocaleDateString('en-NZ', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    try {
      const [hours, minutes] = timeString.split(':');
      const h = parseInt(hours, 10);
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 || 12;
      return `${displayHour}:${minutes} ${period}`;
    } catch {
      return timeString;
    }
  };

  // Build treatment display from booking_treatments array
  const treatments = booking.booking_treatments || [];
  const treatmentDisplay = treatments.length > 0
    ? treatments.map(bt => bt.treatment_name).join(', ')
    : 'Not specified';

  return (
    <div className={`booking-card ${booking.status}`}>
      <div className="booking-header">
        <div className="booking-info">
          <h3>{booking.name || 'No Name'}</h3>
          <span className="booking-date">{formatDate(booking.date)}</span>
          <span className="booking-time">{formatTime(booking.time)}</span>
        </div>
        <div className="booking-actions">
          {booking.appointment_type === 'reschedule' && (
            <span className="appointment-type-badge">Reschedule</span>
          )}
          <span
            className="status-badge"
            style={{ backgroundColor: getStatusColor(booking.status) }}
          >
            {booking.status || 'pending'}
          </span>
          <button
            className="expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <VscEyeClosed /> : <VscEye />}
          </button>
        </div>
      </div>

      <div className="booking-summary">
        <p><strong>Treatment{treatments.length > 1 ? 's' : ''}:</strong> {treatmentDisplay}</p>
        <p><strong>Email:</strong> {booking.email || 'Not provided'}</p>
        <p><strong>Phone:</strong> {booking.phone || 'Not provided'}</p>
        {booking.total_duration && (
          <p><strong>Duration:</strong> {booking.total_duration} mins | <strong>Price:</strong> {booking.total_price}</p>
        )}
      </div>

      {isExpanded && (
        <div className="booking-details">
          {treatments.length > 1 && (
            <div className="treatments-breakdown">
              <h4>Treatments Breakdown:</h4>
              <ul>
                {treatments.map(bt => (
                  <li key={bt.id}>
                    {bt.treatment_name}
                    {bt.duration_minutes && ` (${bt.duration_minutes} min)`}
                    {bt.price && ` - ${bt.price}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="customer-notes">
            <h4>Customer Notes:</h4>
            <p>{booking.notes || 'No additional notes'}</p>
          </div>

          <div className="admin-section">
            <h4>Admin Notes:</h4>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add admin notes..."
              rows="3"
            />
          </div>

          {booking.status === 'pending' && (
            <div className="action-buttons">
              <button
                className="approve-btn"
                onClick={handleApprove}
                disabled={isUpdating}
              >
                <VscCheck /> {isUpdating ? 'Approving...' : 'Approve'}
              </button>
              <button
                className="decline-btn"
                onClick={handleDecline}
                disabled={isUpdating}
              >
                <VscClose /> {isUpdating ? 'Declining...' : 'Decline'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingRequestCard;
