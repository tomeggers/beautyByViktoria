import { useState, useEffect } from 'react';
import supabaseService from '../services/supabaseService';
import '../assets/styles/PromoSection.css';

export default function PromoSection() {
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    supabaseService.getActivePromotion('section')
      .then(data => setPromo(data))
      .catch(err => console.warn('Could not load promo section:', err));
  }, []);

  if (!promo) return null;

  return (
    <div className="promo-section" style={{ '--promo-color': promo.bg_color || '#2a4e3a' }}>
      <div className="promo-section-inner">
        {promo.image_url && (
          <div className="promo-section-image">
            <img src={promo.image_url} alt={promo.title} />
          </div>
        )}
        <div className="promo-section-text">
          {promo.title && <h2 className="promo-section-title">{promo.title}</h2>}
          <p className="promo-section-message">{promo.message}</p>
        </div>
      </div>
    </div>
  );
}
