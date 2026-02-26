import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/legal.css';

const Terms = () => {
  return (
    <div className="legal-page">
      <h1>Terms & Conditions</h1>
      <p className="legal-updated">Last updated: 19 February 2026</p>

      <p>
        These terms and conditions govern your use of the Beauty by Viktoria website
        (beautybyviktoria.com) and the services and products offered through it. By using
        this website, you agree to these terms.
      </p>

      <h2>1. About Us</h2>
      <p>
        Beauty by Viktoria is a beauty therapy business based in Richmond, Nelson 7020,
        New Zealand. We offer beauty treatments and services by appointment, as well as
        skincare products available for purchase through our online shop.
      </p>

      <h2>2. Booking Appointments</h2>
      <ul>
        <li>Submitting a booking request through our website does not guarantee an appointment. All bookings are subject to confirmation by Viktoria.</li>
        <li>You will receive confirmation of your appointment via email or phone.</li>
        <li>Please ensure the contact details you provide are accurate so we can reach you.</li>
      </ul>

      <h2>3. Cancellation Policy</h2>
      <ul>
        <li>If you need to cancel or reschedule an appointment, please provide at least <strong>24 hours' notice</strong>.</li>
        <li>Cancellations with less than 24 hours' notice may incur a <strong>50% fee</strong> of the booked service price.</li>
        <li>No-shows without prior notice will be charged the full service fee.</li>
      </ul>

      <h2>4. Shop Orders</h2>
      <ul>
        <li>All prices displayed in our shop are in New Zealand Dollars (NZD) and include GST (15%).</li>
        <li>Placing an order through our website is a request to purchase. Your order is confirmed once Viktoria contacts you to arrange payment and fulfilment.</li>
        <li>We reserve the right to decline or cancel orders due to stock availability or other reasons.</li>
        <li>Delivery costs (if applicable) will be confirmed before your order is finalised.</li>
      </ul>

      <h2>5. Pricing</h2>
      <p>
        All prices on this website are displayed in New Zealand Dollars and include GST.
        We reserve the right to update our prices at any time. The price applicable to your
        booking or order is the price displayed at the time of your request.
      </p>

      <h2>6. Returns and Refunds</h2>
      <p>
        Our returns and refund practices are governed by the New Zealand Consumer Guarantees
        Act. For full details, please see our{' '}
        <Link to="/returns">Returns & Refund Policy</Link>.
      </p>

      <h2>7. Your Responsibilities</h2>
      <ul>
        <li>You agree to provide accurate and complete information when making bookings or placing orders.</li>
        <li>Please inform us of any allergies, skin conditions, or medical considerations before your appointment.</li>
        <li>You are responsible for arriving on time for your appointments.</li>
      </ul>

      <h2>8. Limitation of Liability</h2>
      <p>
        While we take every reasonable care in providing our services and products, Beauty
        by Viktoria is not liable for any indirect or consequential loss arising from the
        use of our website, services, or products, except where required by New Zealand law
        (including the Consumer Guarantees Act).
      </p>

      <h2>9. Privacy</h2>
      <p>
        Your personal information is handled in accordance with our{' '}
        <Link to="/privacy">Privacy Policy</Link> and the New Zealand Privacy Act 2020.
      </p>

      <h2>10. Governing Law</h2>
      <p>
        These terms are governed by the laws of New Zealand. Any disputes will be subject
        to the jurisdiction of the New Zealand courts.
      </p>

      <h2>11. Changes to These Terms</h2>
      <p>
        We may update these terms from time to time. Changes will be posted on this page
        with an updated date. Continued use of the website after changes are posted
        constitutes acceptance of the updated terms.
      </p>

      <h2>12. Contact Us</h2>
      <div className="legal-contact">
        <p><strong>Beauty by Viktoria</strong></p>
        <p>Richmond, Nelson 7020, New Zealand</p>
        <p>Phone: +64 (021) 881 498</p>
      </div>
    </div>
  );
};

export default Terms;
