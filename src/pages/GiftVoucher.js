import React from 'react';
import GiftVoucherForm from '../components/GiftVoucherForm';
import '../assets/styles/book_now.css';

function GiftVoucher() {
  return (
    <div className="book-now-page">
      <main className="booking-container">
        <GiftVoucherForm />
      </main>
    </div>
  );
}

export default GiftVoucher;
