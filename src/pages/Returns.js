import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/legal.css';

const Returns = () => {
  return (
    <div className="legal-page">
      <h1>Returns & Refund Policy</h1>
      <p className="legal-updated">Last updated: 19 February 2026</p>

      <p>
        At Beauty by Viktoria, we want you to be happy with your purchase. This policy
        outlines your rights under New Zealand consumer law and how we handle returns
        and refunds.
      </p>

      <h2>1. Your Rights Under the Consumer Guarantees Act</h2>
      <p>
        Under the New Zealand Consumer Guarantees Act 1993, products we sell must be of
        acceptable quality, fit for purpose, and match their description. If a product
        you purchase from us fails to meet these guarantees, you are entitled to a remedy.
      </p>
      <ul>
        <li><strong>Minor fault:</strong> We may choose to repair, replace, or refund the product.</li>
        <li><strong>Major fault</strong> (cannot be fixed, or is a serious defect): You can choose a replacement or a full refund.</li>
      </ul>
      <p>
        These rights apply regardless of any other policy and cannot be excluded. You will
        not be charged for returning a faulty product.
      </p>

      <h2>2. Change-of-Mind Returns</h2>
      <p>
        Due to the nature of skincare products and for hygiene reasons, we do not accept
        returns for change of mind. Please review product details carefully before placing
        your order. If you have questions about whether a product is right for you, please
        contact us before purchasing.
      </p>

      <h2>3. How to Request a Return</h2>
      <p>
        If you believe a product is faulty or does not match its description, please contact
        us as soon as possible:
      </p>
      <ul>
        <li>Phone: +64 (021) 881 498</li>
        <li>Describe the issue and, if possible, include a photo of the product.</li>
      </ul>
      <p>
        We will assess your request and let you know the next steps. Faulty products should
        be returned in their original packaging where possible.
      </p>

      <h2>4. Service Cancellations</h2>
      <p>For beauty treatment appointments:</p>
      <ul>
        <li>Please provide at least <strong>24 hours' notice</strong> if you need to cancel or reschedule.</li>
        <li>Cancellations with less than 24 hours' notice may incur a <strong>50% fee</strong>.</li>
        <li>If a service does not meet the Consumer Guarantees Act standard of reasonable care and skill, you may be entitled to have the service performed again or receive a refund.</li>
      </ul>

      <h2>5. Refund Method</h2>
      <p>
        Refunds will be issued using the same method as your original payment, or as
        otherwise agreed. We aim to process refunds within 5 working days of approving
        your return.
      </p>

      <h2>6. Contact Us</h2>
      <div className="legal-contact">
        <p><strong>Beauty by Viktoria</strong></p>
        <p>Richmond, Nelson 7020, New Zealand</p>
        <p>Phone: +64 (021) 881 498</p>
        <p>
          For more information about your consumer rights, visit{' '}
          <a href="https://www.consumerprotection.govt.nz" target="_blank" rel="noopener noreferrer">
            Consumer Protection NZ
          </a>.
        </p>
      </div>
    </div>
  );
};

export default Returns;
