import React from 'react';
import Header from '../components/Header/Header';
import '../assets/styles/book_now.css';
function Book_now() {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [viewMode, setViewMode] = React.useState('WEEK');
  const calendarEmbedUrl = `https://calendar.google.com/calendar/embed?src=5436e7de19f13b77edc7a51a6f8f2b689885079874af494899a3e9a17b0aa5fd%40group.calendar.google.com&ctz=${encodeURIComponent(userTimezone)}&mode=${viewMode}`;

  return (
    <div className="book-now-page">
      <Header />
      <main className="booking-container">
        <h1 className="booking-title">Book Your Appointment</h1>

        {/* View Toggle */}
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'WEEK' ? 'active' : ''}`}
            onClick={() => setViewMode('WEEK')}
          >
            Week View
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'AGENDA' ? 'active' : ''}`}
            onClick={() => setViewMode('AGENDA')}
          >
            Schedule View
          </button>
        </div>

        {/* Calendar Embed*/}
        <section className="calendar-section">
          <h2>{viewMode === 'AGENDA' ? "Upcoming Bookings" : "Weekly Availability"}</h2>
          <div className="calendar-embed-container">
            <iframe
              key={viewMode}
              src={calendarEmbedUrl}
              className="calendar-iframe"
              title="Booking Calendar"
            />
          </div>
          <p className="calendar-note">
            {viewMode === 'AGENDA' 
              ? "This shows currently booked appointments." 
              : "Use the calendar controls to navigate between weeks. Booked slots show as unavailable."}
          </p>
        </section>

        {/* Booking Form */}
        <div className="form-wrapper">
          <iframe 
            src="https://docs.google.com/forms/d/e/1FAIpQLScHPgXquL_FmqfJnkA-FRn3AOr0vdE_vCeFIXtL3PYlLQ2NdQ/viewform?pli=1&pli=1" 
            title="Booking Form"
            className="booking-form"
          ></iframe>
        </div>
      </main>
    </div>
  );
}

export default Book_now;