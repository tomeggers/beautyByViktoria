import React, { useState } from 'react';
import BookingForm from '../components/BookingForm';
import GiftVoucherForm from '../components/GiftVoucherForm';
import '../assets/styles/book_now.css';

function Book_now() {
  const [view, setView] = useState('booking');

  return (
    <div className="book-now-page">
      <main className="booking-container">
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '24px' }}>
          <button
            onClick={() => setView('booking')}
            style={{
              padding: '12px 28px',
              borderRadius: '8px 0 0 8px',
              border: '2px solid #6B9E7A',
              background: view === 'booking' ? '#6B9E7A' : 'white',
              color: view === 'booking' ? 'white' : '#6B9E7A',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            Book Appointment
          </button>
          <button
            onClick={() => setView('voucher')}
            style={{
              padding: '12px 28px',
              borderRadius: '0 8px 8px 0',
              border: '2px solid #6B9E7A',
              borderLeft: 'none',
              background: view === 'voucher' ? '#6B9E7A' : 'white',
              color: view === 'voucher' ? 'white' : '#6B9E7A',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            Gift Voucher
          </button>
        </div>

        {view === 'booking' ? <BookingForm /> : <GiftVoucherForm />}
      </main>
    </div>
  );
}

export default Book_now;
