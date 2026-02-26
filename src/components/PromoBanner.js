import { useState, useEffect } from 'react';
import supabaseService from '../services/supabaseService';
import '../assets/styles/PromoBanner.css';

const DISMISS_KEY = 'promo_dismissed';
const PROMO_CLASS = 'has-promo';

export default function PromoBanner() {
  const [promo, setPromo] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const loadPromo = async () => {
      try {
        const data = await supabaseService.getActivePromotion();
        if (data) {
          const dismissedId = sessionStorage.getItem(DISMISS_KEY);
          if (dismissedId === data.id) {
            setDismissed(true);
          }
          setPromo(data);
        }
      } catch (err) {
        console.warn('Could not load promotion:', err);
      }
    };
    loadPromo();
  }, []);

  // Add/remove the has-promo class so header, nav, and main shift down correctly
  useEffect(() => {
    const shouldShow = promo && !dismissed;
    if (shouldShow) {
      document.documentElement.classList.add(PROMO_CLASS);
    } else {
      document.documentElement.classList.remove(PROMO_CLASS);
    }
    return () => {
      document.documentElement.classList.remove(PROMO_CLASS);
    };
  }, [promo, dismissed]);

  const handleDismiss = () => {
    if (promo) {
      sessionStorage.setItem(DISMISS_KEY, promo.id);
    }
    setDismissed(true);
  };

  if (!promo || dismissed) return null;

  return (
    <div
      className="promo-banner"
      style={{ backgroundColor: promo.bg_color || '#2a4e3a' }}
    >
      <div className="promo-banner-inner">
        <div className="promo-banner-text">
          {promo.title && <span className="promo-title">{promo.title}</span>}
          <span className="promo-message">{promo.message}</span>
        </div>
        <button
          className="promo-dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss promotion"
        >
          ×
        </button>
      </div>
    </div>
  );
}
