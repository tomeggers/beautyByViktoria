import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabaseService from '../services/supabaseService';
import '../assets/styles/booking_form.css';

const BookingForm = () => {
  const [treatments, setTreatments] = useState({ all: [], grouped: {} });
  const [selectedTreatments, setSelectedTreatments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time_range_start: '',
    time_range_end: '',
    notes: '',
    calendarView: 'WEEK'
  });
  const [loading, setLoading] = useState(false);
  const [loadingTreatments, setLoadingTreatments] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Rebooking state
  const [rebookingId, setRebookingId] = useState(null);
  const [rebookingLoading, setRebookingLoading] = useState(false);

  useEffect(() => {
    loadTreatments();
    checkForRebooking();
  }, []);

  useEffect(() => {
    if (submitted) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [submitted]);

  const checkForRebooking = async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('rebooking');
    if (!id) return;

    setRebookingId(id);
    setRebookingLoading(true);

    try {
      const data = await supabaseService.getRebookingData(id);
      if (!data) {
        setError('This rebooking link is no longer valid. Please submit a new booking request.');
        setRebookingLoading(false);
        return;
      }

      // Pre-fill form with original booking data
      setFormData(prev => ({
        ...prev,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        notes: data.notes || '',
      }));

      // Pre-select treatments once the treatment list is loaded
      if (data.booking_treatments) {
        setSelectedTreatments(data.booking_treatments.map(bt => ({
          id: bt.treatment_id,
          name: bt.treatment_name,
          duration_minutes: bt.duration_minutes,
          price: bt.price,
        })));
      }
    } catch (err) {
      console.error('Error loading rebooking data:', err);
      setError('Could not load your booking details. Please submit a new booking request.');
    } finally {
      setRebookingLoading(false);
    }
  };

  const loadTreatments = async () => {
    try {
      const data = await supabaseService.getTreatments();
      setTreatments(data);
    } catch (err) {
      console.error('Error loading treatments:', err);
      setError('Failed to load treatments. Please refresh the page.');
    } finally {
      setLoadingTreatments(false);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleTreatment = (treatment) => {
    setSelectedTreatments(prev => {
      const exists = prev.find(t => t.id === treatment.id);
      if (exists) {
        return prev.filter(t => t.id !== treatment.id);
      }
      return [...prev, treatment];
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getTotals = () => {
    let duration = 0;
    let price = 0;
    let hasPOA = false;

    selectedTreatments.forEach(t => {
      if (t.duration_minutes) duration += t.duration_minutes;
      const priceNum = parseFloat(t.price.replace(/[^0-9.]/g, ''));
      if (!isNaN(priceNum)) {
        price += priceNum;
      } else {
        hasPOA = true;
      }
    });

    return {
      duration,
      price: hasPOA ? `$${price}+` : `$${price}`,
      hasPOA
    };
  };

  // Hour and minute options for time selectors
  const hourOptions = [];
  for (let h = 8; h <= 19; h++) {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    hourOptions.push({ value: String(h).padStart(2, '0'), label: `${displayHour} ${period}` });
  }

  const minuteOptions = [];
  for (let m = 0; m < 60; m += 5) {
    minuteOptions.push({ value: String(m).padStart(2, '0'), label: String(m).padStart(2, '0') });
  }

  const getTimeValue = (field) => {
    const val = formData[field];
    if (!val) return { hour: '', minute: '' };
    const [hour, minute] = val.split(':');
    return { hour, minute };
  };

  const handleTimeChange = (field, part, value) => {
    const current = getTimeValue(field);
    if (part === 'hour') {
      current.hour = value;
      if (!current.minute) current.minute = '00';
    }
    if (part === 'minute') {
      current.minute = value;
      if (!current.hour) current.hour = '08';
    }
    const timeStr = current.hour ? `${current.hour}:${current.minute}` : '';
    setFormData(prev => ({ ...prev, [field]: timeStr }));
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedTreatments.length === 0) {
      setError('Please select at least one treatment.');
      return;
    }

    // Validate time range
    if (formData.time_range_start && formData.time_range_end) {
      const startTime = new Date(`2000-01-01T${formData.time_range_start}`);
      const endTime = new Date(`2000-01-01T${formData.time_range_end}`);

      if (endTime <= startTime) {
        setError('End time must be after start time.');
        return;
      }
    }

    setLoading(true);

    try {
      if (rebookingId) {
        // REBOOKING: Update the existing booking with new date/time
        await supabaseService.submitRebooking(rebookingId, {
          date: formData.date,
          time_range_start: formData.time_range_start,
          time_range_end: formData.time_range_end,
          notes: formData.notes,
        });
        setSubmitted(true);

        // Send notification that a rebooking was submitted
        const notifData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          date: formData.date,
          time_range_start: formData.time_range_start,
          time_range_end: formData.time_range_end,
          notes: formData.notes,
          total_price: totals.price,
          treatments: selectedTreatments.map(t => ({ name: t.name, duration_minutes: t.duration_minutes, price: t.price }))
        };
        supabaseService.sendNotification('booking_submitted', notifData)
          .then(result => console.log('Rebooking notification result:', result))
          .catch(err => console.error('Rebooking notification failed:', err));
      } else {
        // NORMAL BOOKING: Create new booking
        await supabaseService.createBooking({
          ...formData,
          treatments: selectedTreatments,
          marketing_consent: marketingConsent
        });
        setSubmitted(true);

        // Send notification emails
        const notifData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          date: formData.date,
          time_range_start: formData.time_range_start,
          time_range_end: formData.time_range_end,
          notes: formData.notes,
          total_price: totals.price,
          treatments: selectedTreatments.map(t => ({ name: t.name, duration_minutes: t.duration_minutes, price: t.price }))
        };
        supabaseService.sendNotification('booking_submitted', notifData)
          .then(result => console.log('Notification result:', result))
          .catch(err => console.error('Notification failed:', err));
      }
    } catch (err) {
      console.error('Error submitting booking:', err);
      setError(rebookingId
        ? 'Failed to update your booking. This link may have expired — please submit a new booking.'
        : 'Failed to submit booking. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="booking-form-container">
        <div className="booking-success">
          <div className="success-icon">&#10003;</div>
          <h2>{rebookingId ? 'Booking Updated!' : 'Booking Request Submitted!'}</h2>
          <p>Thank you, {formData.name}! {rebookingId
            ? 'Your new availability has been sent to Viktoria.'
            : 'Your booking request has been received.'
          }</p>
          <p>Viktoria will review your available times and confirm your appointment shortly.</p>
          {!rebookingId && (
            <button
              className="new-booking-btn"
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  date: '',
                  time_range_start: '',
                  time_range_end: '',
                  notes: '',
                  calendarView: 'WEEK'
                });
                setSelectedTreatments([]);
              }}
            >
              Make Another Booking
            </button>
          )}
        </div>
      </div>
    );
  }

  if (rebookingLoading) {
    return (
      <div className="booking-form-container">
        <div className="booking-form-custom" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p className="loading-text">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  const totals = getTotals();

  return (
    <div className="booking-form-container">
      <form onSubmit={handleSubmit} className="booking-form-custom">
        <h2>{rebookingId ? 'Choose a New Time' : 'Request an Appointment'}</h2>

        {rebookingId && (
          <div className="rebooking-banner">
            <p>Welcome back, <strong>{formData.name}</strong>! Your details and treatments are saved below. Just pick a new date and time.</p>
          </div>
        )}

        {/* Personal Details */}
        <div className="form-section">
          <h3>Your Details</h3>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
                readOnly={!!rebookingId}
                className={rebookingId ? 'read-only' : ''}
              />
            </div>
          </div>
          <div className="form-row two-col">
            <div className="form-field">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                readOnly={!!rebookingId}
                className={rebookingId ? 'read-only' : ''}
              />
            </div>
            <div className="form-field">
              <label htmlFor="phone">Phone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="021 123 4567"
                readOnly={!!rebookingId}
                className={rebookingId ? 'read-only' : ''}
              />
            </div>
          </div>
        </div>

        {/* Treatment Selection */}
        <div className="form-section">
          <h3>Select Treatment{selectedTreatments.length !== 1 ? 's' : ''}</h3>
          {loadingTreatments ? (
            <p className="loading-text">Loading treatments...</p>
          ) : (
            <div className="treatment-selector">
              {Object.entries(treatments.grouped).map(([category, items]) => (
                <div key={category} className="treatment-category">
                  <button
                    type="button"
                    className={`category-toggle ${expandedCategories[category] ? 'expanded' : ''}`}
                    onClick={() => toggleCategory(category)}
                  >
                    <span>{category}</span>
                    <span className="toggle-arrow">{expandedCategories[category] ? '\u25B2' : '\u25BC'}</span>
                  </button>
                  {expandedCategories[category] && (
                    <div className="treatment-items">
                      {items.map(treatment => {
                        const isSelected = selectedTreatments.some(t => t.id === treatment.id);
                        return (
                          <label
                            key={treatment.id}
                            className={`treatment-item ${isSelected ? 'selected' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleTreatment(treatment)}
                            />
                            <div className="treatment-info">
                              <span className="treatment-name">{treatment.name}</span>
                              <span className="treatment-meta">
                                {treatment.duration_minutes && `${treatment.duration_minutes} min`}
                                {treatment.duration_minutes && ' | '}
                                {treatment.price}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Selected summary */}
          {selectedTreatments.length > 0 && (
            <div className="selected-summary">
              <h4>Selected ({selectedTreatments.length}):</h4>
              <ul>
                {selectedTreatments.map(t => (
                  <li key={t.id}>
                    {t.name}
                    <button
                      type="button"
                      className="remove-treatment"
                      onClick={() => toggleTreatment(t)}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
              <div className="totals">
                {totals.duration > 0 && (
                  <span>Total time: ~{totals.duration} min</span>
                )}
                <span>Estimated price: {totals.price}</span>
              </div>
            </div>
          )}
        </div>

        {/* Date & Time Range */}
        <div className="form-section">
          <h3>{rebookingId ? 'Choose Your New Date & Time' : 'Preferred Date & Available Time Window'}</h3>
          <p className="helper-text">
            Check the calendar below to see available slots, then select your preferred date and time range.
          </p>

          {/* Embedded Calendar */}
          <div className="form-calendar-embed">
            <div className="form-calendar-header">
              <span className="calendar-label">📅 Available Slots</span>
              <div className="form-calendar-toggle">
                <button
                  type="button"
                  className={`form-toggle-btn ${formData.calendarView === 'WEEK' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, calendarView: 'WEEK' }))}
                >
                  Week
                </button>
                <button
                  type="button"
                  className={`form-toggle-btn ${formData.calendarView === 'AGENDA' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, calendarView: 'AGENDA' }))}
                >
                  List
                </button>
              </div>
            </div>
            <div className="form-calendar-container">
              <iframe
                src={`https://calendar.google.com/calendar/embed?src=5436e7de19f13b77edc7a51a6f8f2b689885079874af494899a3e9a17b0aa5fd%40group.calendar.google.com&ctz=${Intl.DateTimeFormat().resolvedOptions().timeZone}&mode=${formData.calendarView || 'WEEK'}&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0`}
                className="form-calendar-iframe"
                title="Available Slots Calendar"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getMinDate()}
                required
              />
            </div>
          </div>
          <div className="form-row two-col">
            <div className="form-field">
              <label>Available From *</label>
              <div className="time-split">
                <select
                  value={getTimeValue('time_range_start').hour}
                  onChange={(e) => handleTimeChange('time_range_start', 'hour', e.target.value)}
                  required
                >
                  <option value="">Hour</option>
                  {hourOptions.map(h => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </select>
                <span className="time-colon">:</span>
                <select
                  value={getTimeValue('time_range_start').minute}
                  onChange={(e) => handleTimeChange('time_range_start', 'minute', e.target.value)}
                  required
                >
                  <option value="">Min</option>
                  {minuteOptions.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-field">
              <label>Available Until *</label>
              <div className="time-split">
                <select
                  value={getTimeValue('time_range_end').hour}
                  onChange={(e) => handleTimeChange('time_range_end', 'hour', e.target.value)}
                  required
                >
                  <option value="">Hour</option>
                  {hourOptions.map(h => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </select>
                <span className="time-colon">:</span>
                <select
                  value={getTimeValue('time_range_end').minute}
                  onChange={(e) => handleTimeChange('time_range_end', 'minute', e.target.value)}
                  required
                >
                  <option value="">Min</option>
                  {minuteOptions.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="form-section">
          <div className="form-field">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Any allergies, preferences, or special requests..."
            />
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="cancellation-notice">
          <strong>Cancellation Policy:</strong> Please give 24 hours' notice if you need to cancel,
          otherwise a 50% fee may apply.
        </div>

        {/* Privacy & Consent */}
        <div className="form-section consent-section">
          <p className="privacy-notice">
            Your details are used to process your booking and communicate about your appointment.
            See our <Link to="/privacy">Privacy Policy</Link> for more information.
          </p>
          <label className="consent-checkbox">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
            />
            <span>I'd like to receive discounts and promotions from Beauty by Viktoria</span>
          </label>
        </div>

        {error && <div className="form-error">{error}</div>}

        <button type="submit" className="submit-btn" disabled={loading || selectedTreatments.length === 0}>
          {loading
            ? 'Submitting...'
            : rebookingId
              ? 'Submit New Time'
              : 'Request Booking'
          }
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
