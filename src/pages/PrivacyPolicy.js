import React from 'react';
import '../assets/styles/legal.css';

const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last updated: 19 February 2026</p>

      <p>
        Beauty by Viktoria ("we", "us", "our") is committed to protecting your personal
        information in accordance with the New Zealand Privacy Act 2020. This policy explains
        what information we collect, why we collect it, how we use it, and your rights.
      </p>

      <h2>1. What Information We Collect</h2>
      <p>We may collect the following personal information when you use our website:</p>
      <ul>
        <li><strong>Booking requests:</strong> your name, email address, phone number, preferred date and time, selected treatments, and any notes you provide.</li>
        <li><strong>Shop orders:</strong> your name, email address, delivery address (if applicable), and order details.</li>
        <li><strong>Marketing preferences:</strong> whether you have opted in to receive promotional communications from us.</li>
      </ul>

      <h2>2. Why We Collect Your Information</h2>
      <p>We collect your personal information for the following purposes:</p>
      <ul>
        <li>To process and confirm your booking requests.</li>
        <li>To fulfil and manage your product orders.</li>
        <li>To communicate with you about your appointments or orders (e.g., confirmations, rescheduling, follow-ups).</li>
        <li>To send you promotional offers and updates, but only if you have opted in to receive them.</li>
      </ul>

      <h2>3. How We Store and Protect Your Information</h2>
      <p>
        Your personal information is stored securely using Supabase, a cloud-hosted database
        platform. This means your data may be stored on servers located outside of New Zealand.
        We take reasonable steps to ensure your information is protected from unauthorised access,
        loss, or misuse, including the use of encrypted connections (HTTPS) and access controls.
      </p>

      <h2>4. Who We Share Your Information With</h2>
      <p>We may share your personal information with:</p>
      <ul>
        <li><strong>Supabase:</strong> our database and hosting provider, for secure data storage.</li>
        <li><strong>Email service providers:</strong> to send you booking confirmations, order notifications, and (if you opted in) marketing communications.</li>
      </ul>
      <p>
        We do not sell, rent, or trade your personal information to any third parties. We only
        share information as necessary to provide our services to you.
      </p>

      <h2>5. Marketing Communications</h2>
      <p>
        We will only send you promotional emails or offers if you have given us your express
        consent by opting in (e.g., ticking the marketing checkbox on our booking or order form).
        You can withdraw your consent at any time by using the unsubscribe link in any marketing
        email, or by contacting us directly.
      </p>

      <h2>6. Your Rights</h2>
      <p>Under the Privacy Act 2020, you have the right to:</p>
      <ul>
        <li><strong>Access</strong> the personal information we hold about you.</li>
        <li><strong>Request corrections</strong> if any of your information is inaccurate or out of date.</li>
        <li><strong>Ask us to delete</strong> your personal information where it is no longer needed for the purpose it was collected.</li>
        <li><strong>Withdraw consent</strong> for marketing communications at any time.</li>
      </ul>
      <p>
        To exercise any of these rights, please contact us using the details below. We will
        respond to your request within 20 working days.
      </p>

      <h2>7. How Long We Keep Your Information</h2>
      <p>
        We retain your personal information only for as long as it is needed to fulfil the
        purposes described in this policy, or as required by law. Booking and order records
        are retained for a reasonable period to support our business operations and customer service.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this privacy policy from time to time. Any changes will be posted on this
        page with an updated date. We encourage you to review this policy periodically.
      </p>

      <h2>9. Contact Us (Privacy Officer)</h2>
      <div className="legal-contact">
        <p><strong>Beauty by Viktoria</strong></p>
        <p>Richmond, Nelson 7020, New Zealand</p>
        <p>Phone: +64 (021) 881 498</p>
        <p>
          If you have any questions or concerns about how we handle your personal information,
          or if you wish to make a complaint, please contact us using the details above. You also
          have the right to lodge a complaint with the{' '}
          <a href="https://www.privacy.org.nz" target="_blank" rel="noopener noreferrer">
            Office of the Privacy Commissioner
          </a>.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
