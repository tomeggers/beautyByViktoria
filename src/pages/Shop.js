import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabaseService from '../services/supabaseService';
import PromoSection from '../components/PromoSection';
import '../assets/styles/shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    customer_name: '',
    email: '',
    fulfillment: 'pickup',
    address: '',
    notes: '',
  });
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    supabaseService.getShopProducts()
      .then(data => setProducts(data || []))
      .catch(() => setError('Failed to load products. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Cart helpers ──

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const updateQty = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // ── Grouped products ──
  const grouped = products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  // ── Checkout ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (cart.length === 0) return;

    setSubmitting(true);
    try {
      const orderItems = cart.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      }));

      const order = await supabaseService.createShopOrder({
        customer_name: form.customer_name,
        email: form.email,
        fulfillment: form.fulfillment,
        address: form.fulfillment === 'delivery' ? form.address : null,
        notes: form.notes || null,
        items: orderItems,
        marketing_consent: marketingConsent,
      });

      // Fire & forget notification emails
      supabaseService.sendNotification('order_submitted', {
        orderId: order.id,
        customer_name: form.customer_name,
        email: form.email,
        fulfillment: form.fulfillment,
        address: form.address,
        notes: form.notes,
        items: orderItems,
      }).catch(err => console.error('Order notification failed:', err));

      setSubmitted(true);
      setCart([]);
    } catch (err) {
      console.error('Order submission failed:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──
  if (submitted) {
    return (
      <div className="shop-container">
        <div className="shop-success">
          <div className="success-icon">✓</div>
          <h2>Order Received!</h2>
          <p>Thanks, <strong>{form.customer_name}</strong>! Viktoria will be in touch shortly to confirm your order and arrange {form.fulfillment === 'pickup' ? 'pickup' : 'delivery'}.</p>
          <button className="shop-btn-primary" onClick={() => { setSubmitted(false); setCheckoutMode(false); setCartOpen(false); setForm({ customer_name: '', email: '', fulfillment: 'pickup', address: '', notes: '' }); }}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-container">
      <div className="shop-content">
        <PromoSection />
        <h1 className="shop-title">Viktoria's Beauty Shop</h1>
        <p className="shop-subtitle">Premium skincare available for purchase. Place an order and I'll be in touch to confirm.</p>
        <p className="shop-gst-notice">All prices are in NZD and include GST.</p>

        {loading && <p className="shop-loading">Loading products...</p>}
        {error && <p className="shop-error">{error}</p>}

        {!loading && products.length === 0 && !error && (
          <div className="shop-empty">
            <p>Products coming soon — check back shortly!</p>
          </div>
        )}

        {Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="shop-category">
            <h2 className="shop-category-title">{category}</h2>
            <div className="shop-grid">
              {items.map(product => {
                const inCart = cart.find(i => i.id === product.id);
                return (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      {product.image_url
                        ? <img src={product.image_url} alt={product.name} loading="lazy" />
                        : <div className="product-placeholder"><span>Dermalogica</span></div>
                      }
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      {product.description && <p className="product-desc">{product.description}</p>}
                      <div className="product-footer">
                        <span className="product-price">{product.price}</span>
                        {product.stock === 0 ? (
                          <span style={{ fontSize: '0.82rem', color: '#c0392b', fontWeight: 600, padding: '8px 0' }}>Out of stock</span>
                        ) : inCart ? (
                          <div className="qty-control">
                            <button onClick={() => updateQty(product.id, inCart.quantity - 1)}>−</button>
                            <span>{inCart.quantity}</span>
                            <button onClick={() => updateQty(product.id, inCart.quantity + 1)}>+</button>
                          </div>
                        ) : (
                          <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* ── Floating cart bar ── */}
      {cartCount > 0 && !cartOpen && (
        <div className="cart-bar" onClick={() => setCartOpen(true)}>
          <span className="cart-bar-count">{cartCount} item{cartCount !== 1 ? 's' : ''} in cart</span>
          <span className="cart-bar-action">View Cart →</span>
        </div>
      )}

      {/* ── Cart / Checkout drawer ── */}
      {cartOpen && (
        <div className="cart-overlay" onClick={() => { setCartOpen(false); setCheckoutMode(false); }}>
          <div className="cart-drawer" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h2>{checkoutMode ? 'Checkout' : 'Your Cart'}</h2>
              <button className="cart-close" onClick={() => { setCartOpen(false); setCheckoutMode(false); }}>×</button>
            </div>

            {!checkoutMode ? (
              <>
                {cart.length === 0 ? (
                  <p className="cart-empty">Your cart is empty.</p>
                ) : (
                  <>
                    <ul className="cart-items">
                      {cart.map(item => (
                        <li key={item.id} className="cart-item">
                          <div className="cart-item-info">
                            <span className="cart-item-name">{item.name}</span>
                            <span className="cart-item-price">{item.price}</span>
                          </div>
                          <div className="cart-item-controls">
                            <div className="qty-control">
                              <button onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                            </div>
                            <button className="cart-remove" onClick={() => removeFromCart(item.id)}>Remove</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <button className="shop-btn-primary cart-checkout-btn" onClick={() => setCheckoutMode(true)}>
                      Proceed to Checkout
                    </button>
                  </>
                )}
              </>
            ) : (
              <form onSubmit={handleSubmit} className="checkout-form">
                <div className="checkout-summary">
                  <h3>Order Summary</h3>
                  <ul className="summary-list">
                    {cart.map(item => (
                      <li key={item.id}>{item.name} × {item.quantity} — {item.price}</li>
                    ))}
                  </ul>
                </div>

                <div className="form-field">
                  <label>Full Name *</label>
                  <input type="text" required value={form.customer_name}
                    onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))}
                    placeholder="Your name" />
                </div>

                <div className="form-field">
                  <label>Email *</label>
                  <input type="email" required value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="your@email.com" />
                </div>

                <div className="form-field">
                  <label>How would you like to receive your order?</label>
                  <div className="fulfillment-options">
                    <label className={`fulfillment-option ${form.fulfillment === 'pickup' ? 'selected' : ''}`}>
                      <input type="radio" name="fulfillment" value="pickup"
                        checked={form.fulfillment === 'pickup'}
                        onChange={() => setForm(p => ({ ...p, fulfillment: 'pickup' }))} />
                      <span>🏠 Pick Up</span>
                      <small>Collect from Viktoria in Richmond</small>
                    </label>
                    <label className={`fulfillment-option ${form.fulfillment === 'delivery' ? 'selected' : ''}`}>
                      <input type="radio" name="fulfillment" value="delivery"
                        checked={form.fulfillment === 'delivery'}
                        onChange={() => setForm(p => ({ ...p, fulfillment: 'delivery' }))} />
                      <span>📦 Delivery</span>
                      <small>Shipped to your address</small>
                    </label>
                  </div>
                </div>

                {form.fulfillment === 'delivery' && (
                  <div className="form-field">
                    <label>Delivery Address *</label>
                    <textarea required value={form.address}
                      onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                      placeholder="Street address, city, postcode"
                      rows="2" />
                  </div>
                )}

                <div className="form-field">
                  <label>Additional Notes</label>
                  <textarea value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Any questions or special requests..."
                    rows="2" />
                </div>

                <div className="checkout-consent">
                  <p className="privacy-notice">
                    Your details are used to process your order and communicate about fulfilment.
                    See our <Link to="/privacy">Privacy Policy</Link>.
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

                {error && <p className="shop-error">{error}</p>}

                <div className="checkout-actions">
                  <button type="submit" className="shop-btn-primary" disabled={submitting}>
                    {submitting ? 'Placing Order...' : 'Place Order'}
                  </button>
                  <button type="button" className="shop-btn-secondary" onClick={() => setCheckoutMode(false)}>
                    ← Back to Cart
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;