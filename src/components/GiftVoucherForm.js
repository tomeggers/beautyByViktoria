import React, { useState } from 'react';
import supabaseService from '../services/supabaseService';
import '../assets/styles/booking_form.css';

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const GiftVoucherForm = () => {
  const [formData, setFormData] = useState({
    purchaser_name: '',
    purchaser_email: '',
    purchaser_phone: '',
    recipient_name: '',
    amount: '',
    delivery_method: 'pickup',
    pickup_date: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseFloat(formData.amount) < 25) {
      setError('Minimum voucher amount is $25.');
      return;
    }
    if (formData.delivery_method === 'pickup' && !formData.pickup_date) {
      setError('Please select a preferred pickup date.');
      return;
    }

    setLoading(true);
    try {
      await supabaseService.createGiftVoucher(formData);
      await supabaseService.sendNotification('voucher_submitted', formData);
      setSubmitted(true);
    } catch (err) {
      console.error('Gift voucher submission error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="booking-form-container">
        <div className="booking-form-custom">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎁</div>
            <h2 style={{ color: '#2a4e3a', marginBottom: '12px' }}>Thank you!</h2>
            <p style={{ color: '#555', fontSize: '1rem' }}>
              We've received your gift voucher request. We'll be in touch shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-form-container">
      <form className="booking-form-custom" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="form-section-title">Your Details</h2>

          <div className="form-field">
            <label>Full Name *</label>
            <input
              type="text"
              name="purchaser_name"
              value={formData.purchaser_name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-field">
            <label>Email *</label>
            <input
              type="email"
              name="purchaser_email"
              value={formData.purchaser_email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-field">
            <label>Phone *</label>
            <input
              type="tel"
              name="purchaser_phone"
              value={formData.purchaser_phone}
              onChange={handleChange}
              placeholder="Your phone number"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-section-title">Voucher Details</h2>

          <div className="form-field">
            <label>Who is this for? (optional)</label>
            <input
              type="text"
              name="recipient_name"
              value={formData.recipient_name}
              onChange={handleChange}
              placeholder="Recipient's name"
            />
          </div>

          <div className="form-field">
            <label>Voucher Amount ($) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="$25 minimum"
              min="25"
              step="1"
              required
            />
          </div>

          <div className="form-field">
            <label>Delivery Method *</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, delivery_method: 'pickup', pickup_date: '' }))}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: formData.delivery_method === 'pickup' ? '#6B9E7A' : '#ddd',
                  background: formData.delivery_method === 'pickup' ? '#6B9E7A' : 'white',
                  color: formData.delivery_method === 'pickup' ? 'white' : '#555',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Pick up in person
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, delivery_method: 'email', pickup_date: '' }))}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: formData.delivery_method === 'email' ? '#6B9E7A' : '#ddd',
                  background: formData.delivery_method === 'email' ? '#6B9E7A' : 'white',
                  color: formData.delivery_method === 'email' ? 'white' : '#555',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Email it to me
              </button>
            </div>
          </div>

          {formData.delivery_method === 'pickup' && (
            <div className="form-field">
              <label>Preferred Pickup Date *</label>
              <input
                type="date"
                name="pickup_date"
                value={formData.pickup_date}
                onChange={handleChange}
                min={tomorrow()}
                required
              />
            </div>
          )}

          <div className="form-field">
            <label>Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special requests or messages..."
              rows="3"
            />
          </div>
        </div>

        {error && (
          <div style={{ color: '#c0392b', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>
        )}

        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Request Gift Voucher'}
        </button>
      </form>
    </div>
  );
};

export default GiftVoucherForm;
