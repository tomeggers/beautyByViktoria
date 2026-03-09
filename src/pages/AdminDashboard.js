import React, { useState, useEffect, useCallback } from 'react';
import supabaseService from '../services/supabaseService';
import { supabase } from '../config/supabase';
import Toast from '../components/Toast';
import '../assets/styles/admin.css';

const AdminDashboard = ({ onLogout }) => {
  const [bookings, setBookings] = useState([]);
  const [todaysBookings, setTodaysBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('pending');
  const [section, setSection] = useState('actions');

  const switchSection = (key) => {
    setSection(key);
    const defaults = { actions: 'pending', schedule: 'today', rebook: 'rebook', shop: 'addto', marketing: 'promos' };
    setTab(defaults[key]);
  };

  // Calendar state
  const [viewMode, setViewMode] = useState('WEEK');
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const calendarEmbedUrl = `https://calendar.google.com/calendar/embed?src=${process.env.REACT_APP_GOOGLE_CALENDAR_ID}&ctz=${encodeURIComponent(userTimezone)}&mode=${viewMode}&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0`;

  // Approval modal state
  const [approvalModal, setApprovalModal] = useState({
    isOpen: false,
    booking: null,
    selectedTime: '',
    clientType: 'new'
  });

  // Reschedule modal state
  const [rescheduleModal, setRescheduleModal] = useState({
    isOpen: false,
    booking: null,
    message: ''
  });

  // Decline modal state
  const [declineModal, setDeclineModal] = useState({
    isOpen: false,
    booking: null,
    message: ''
  });

  // ── Shop state ──
  const [orders, setOrders] = useState([]);
  const [shopProducts, setShopProducts] = useState([]);
  const [shopLoading, setShopLoading] = useState(false);

  // ── Vouchers state ──
  const [vouchers, setVouchers] = useState([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);

  const [orderModal, setOrderModal] = useState({ isOpen: false, order: null, message: '' });

  // ── Stock tab state ──
  const [stockProducts, setStockProducts] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockEdits, setStockEdits] = useState({}); // { [productId]: inputValue }

  // Toast notification state
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });
  const showToast = (type, message) => setToast({ visible: true, type, message });
  const closeToast = () => setToast(prev => ({ ...prev, visible: false }));

  const [expandedCats, setExpandedCats] = useState({});
  const toggleCat = (key) => setExpandedCats(prev => ({ ...prev, [key]: !prev[key] }));
  const [productSearch, setProductSearch] = useState('');

  // ── Email blast state ──
  const [emailBlast, setEmailBlast] = useState({ subject: '', body: '', imageUrl: '', audience: 'all', preview: false, sending: false });
  const [customerEmails, setCustomerEmails] = useState([]);
  const [emailsLoading, setEmailsLoading] = useState(false);

  // ── Stats state ──
  const [statsData, setStatsData] = useState({ bookings: [], orders: [] });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsMonth, setStatsMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [summersetPercent, setSummersetPercent] = useState('');

  // ── Approved tab month filter ──
  const [approvedMonth, setApprovedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // ── Rebook tab state ──
  const [rebookSearch, setRebookSearch] = useState('');
  const [rebookClients, setRebookClients] = useState([]);
  const [rebookLoading, setRebookLoading] = useState(false);
  const [rebookSearched, setRebookSearched] = useState(false);
  const [rebookTreatments, setRebookTreatments] = useState({ all: [], grouped: {} });
  const [selectedRebookClient, setSelectedRebookClient] = useState(null);
  const [rebookModal, setRebookModal] = useState({
    isOpen: false, sourceBooking: null,
    form: { date: '', time: '', clientType: 'returning', notes: '', selectedTreatments: [] }
  });
  const [rebookSubmitting, setRebookSubmitting] = useState(false);

  // ── Promotions state ──
  const [promotions, setPromotions] = useState([]);
  const [promosLoading, setPromosLoading] = useState(false);
  const [promoModal, setPromoModal] = useState({
    isOpen: false,
    editing: null,
    form: { title: '', message: '', is_active: false, bg_color: '#2a4e3a', type: 'banner', image_url: '' }
  });
  const [productModal, setProductModal] = useState({
    isOpen: false,
    editing: null,
    form: { name: '', category: '', description: '', price: '', image_url: '', display_order: 0, is_active: true }
  });

  // ── Banner image upload state ──
  const [bannerImages, setBannerImages] = useState([]);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [showBannerGallery, setShowBannerGallery] = useState(false);
  // ── Email blast image upload state ──
  const [emailImageUploading, setEmailImageUploading] = useState(false);
  const [showEmailGallery, setShowEmailGallery] = useState(false);
  // ── Product image upload state ──
  const [productImageUploading, setProductImageUploading] = useState(false);
  const [showProductGallery, setShowProductGallery] = useState(false);

  const loadShopData = useCallback(async () => {
    setShopLoading(true);
    try {
      const [ordersData, productsData] = await Promise.all([
        supabaseService.getShopOrders(),
        supabaseService.getAllShopProducts(),
      ]);
      setOrders(ordersData || []);
      setShopProducts(productsData || []);
    } catch (err) {
      console.error('Error loading shop data:', err);
    } finally {
      setShopLoading(false);
    }
  }, []);

  const loadStockData = useCallback(async () => {
    setStockLoading(true);
    try {
      const data = await supabaseService.getAllShopProducts();
      setStockProducts(data || []);
    } catch (err) {
      console.error('Error loading stock data:', err);
    } finally {
      setStockLoading(false);
    }
  }, []);

  const loadPromosData = useCallback(async () => {
    setPromosLoading(true);
    try {
      const data = await supabaseService.getAllPromotions();
      setPromotions(data || []);
    } catch (err) {
      console.error('Error loading promotions:', err);
    } finally {
      setPromosLoading(false);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await supabaseService.getBookings();
      setBookings(data);

      const todayData = await supabaseService.getTodaysBookings();
      setTodaysBookings(todayData);
    } catch (err) {
      setError('Failed to load bookings. Please try again.');
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    const unsubscribe = supabaseService.subscribeToBookings(() => {
      loadBookings();
    });
    return unsubscribe;
  }, [loadBookings]);

  useEffect(() => {
    const unsubscribe = supabaseService.subscribeToOrders(() => {
      loadShopData();
    });
    return unsubscribe;
  }, [loadShopData]);

  const loadEmailData = useCallback(async (audience = 'all') => {
    setEmailsLoading(true);
    try {
      const emails = await supabaseService.getUniqueCustomerEmails(audience);
      setCustomerEmails(emails);
    } catch (err) {
      console.error('Error loading emails:', err);
    } finally {
      setEmailsLoading(false);
    }
  }, []);

  const loadStatsData = useCallback(async (month) => {
    setStatsLoading(true);
    try {
      const [year, m] = month.split('-').map(Number);
      const startDate = `${year}-${String(m).padStart(2, '0')}-01`;
      const lastDay = new Date(year, m, 0).getDate();
      const endDate = `${year}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      const [bookings, orders] = await Promise.all([
        supabaseService.getBookingsForPeriod(startDate, endDate),
        supabaseService.getFulfilledOrdersForPeriod(startDate, endDate),
      ]);
      setStatsData({ bookings: bookings || [], orders: orders || [] });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'orders' || tab === 'addto') {
      loadShopData();
    }
    if (tab === 'promos') {
      loadPromosData();
    }
    if (tab === 'stock') {
      loadStockData();
    }
    if (tab === 'email') {
      loadEmailData(emailBlast.audience);
    }
    if (tab === 'stats') {
      loadStatsData(statsMonth);
    }
    if (tab === 'rebook' && rebookTreatments.all.length === 0) {
      supabaseService.getTreatments()
        .then(data => setRebookTreatments(data))
        .catch(err => console.error('Error loading treatments for rebook:', err));
    }
    if (tab === 'vouchers') {
      setVouchersLoading(true);
      supabaseService.getGiftVouchers()
        .then(setVouchers)
        .catch(err => console.error('Error loading vouchers:', err))
        .finally(() => setVouchersLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, loadShopData, loadPromosData, loadStockData, loadEmailData, loadStatsData, emailBlast.audience, statsMonth]);

  useEffect(() => {
    if (rebookSearch.trim().length < 2) return;
    const timer = setTimeout(() => {
      setRebookLoading(true);
      setRebookClients([]);
      setSelectedRebookClient(null);
      setRebookSearched(true);
      supabaseService.searchClientHistory(rebookSearch.trim())
        .then(clients => setRebookClients(clients))
        .catch(err => { console.error('Rebook search failed:', err); showToast('error', 'Search failed. Please try again.'); })
        .finally(() => setRebookLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [rebookSearch]);

  // ==================== ORDER RESPONSE ====================

  const openOrderModal = (order) => {
    const itemList = (order.shop_order_items || []).map(i => `• ${i.product_name} x${i.quantity} — ${i.price}`).join('\n');
    const defaultMessage = `Hi ${order.customer_name}!\n\nThank you for your order. I've received the following:\n\n${itemList}\n\nI'll be in touch shortly to arrange ${order.fulfillment === 'pickup' ? 'pickup' : 'delivery'}.\n\nThanks,\nViktoria`;
    setOrderModal({ isOpen: true, order, message: defaultMessage });
  };

  const closeOrderModal = () => setOrderModal({ isOpen: false, order: null, message: '' });

  const handleOrderResponse = async () => {
    if (!orderModal.message.trim()) { alert('Please write a message'); return; }
    try {
      await supabaseService.updateShopOrderStatus(orderModal.order.id, 'responded', orderModal.message);
      supabaseService.sendNotification('order_response', {
        orderId: orderModal.order.id,
        customer_name: orderModal.order.customer_name,
        email: orderModal.order.email,
        responseMessage: orderModal.message,
        items: orderModal.order.shop_order_items || [],
      }).catch(err => console.error('Order response email failed:', err));
      closeOrderModal();
      loadShopData();
    } catch (err) {
      console.error('Error responding to order:', err);
      alert('Failed to send response. Please try again.');
    }
  };

  const handleMarkFulfilled = async (order) => {
    if (!window.confirm(`Mark order for ${order.customer_name} as fulfilled?`)) return;
    try {
      await supabaseService.updateShopOrderStatus(order.id, 'fulfilled');
      // Deduct stock for each item — runs in background, refreshes stock tab if open
      const items = (order.shop_order_items || []).map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
      }));
      await supabaseService.deductStockForOrder(items);
      loadShopData();
      // Refresh stock list too so badge counts stay accurate
      if (tab === 'stock') loadStockData();
    } catch (err) {
      console.error('Failed to mark fulfilled:', err);
      alert('Failed to update order status.');
    }
  };

  const handleDeleteOrder = async (order) => {
    if (!window.confirm(`Delete order from ${order.customer_name}? This cannot be undone.`)) return;
    try {
      await supabaseService.deleteShopOrder(order.id);
      setOrders(prev => prev.filter(o => o.id !== order.id));
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert('Failed to delete order.');
    }
  };

  // ==================== VOUCHER MANAGEMENT ====================

  const handleVoucherStatus = async (voucher, newStatus) => {
    try {
      await supabaseService.updateGiftVoucherStatus(voucher.id, newStatus);
      if (newStatus === 'ready') {
        supabaseService.sendNotification('voucher_ready', {
          purchaser_name: voucher.purchaser_name,
          purchaser_email: voucher.purchaser_email,
          purchaser_phone: voucher.purchaser_phone,
          recipient_name: voucher.recipient_name,
          amount: voucher.amount,
          delivery_method: voucher.delivery_method,
          pickup_date: voucher.pickup_date,
          notes: voucher.notes,
        }).catch(err => console.error('Voucher ready email failed:', err));
      }
      setVouchers(prev => prev.map(v => v.id === voucher.id ? { ...v, status: newStatus } : v));
      showToast('success', newStatus === 'ready' ? 'Voucher marked as ready — client notified.' : 'Voucher marked as collected.');
    } catch (err) {
      console.error('Failed to update voucher status:', err);
      showToast('error', 'Failed to update voucher status.');
    }
  };

  // ==================== PRODUCT MANAGEMENT ====================

  const existingCategories = [...new Set(shopProducts.map(p => p.category))].filter(Boolean).sort();

  const openAddProduct = () => {
    setProductModal({
      isOpen: true,
      editing: null,
      form: { name: '', category: existingCategories[0] || '', description: '', price: '', image_url: '', display_order: 0, is_active: true }
    });
  };

  const openEditProduct = (product) => {
    setProductModal({
      isOpen: true,
      editing: product,
      form: { name: product.name, category: product.category, description: product.description || '', price: product.price, image_url: product.image_url || '', display_order: product.display_order, is_active: product.is_active }
    });
  };

  const closeProductModal = () => { setProductModal(prev => ({ ...prev, isOpen: false, editing: null })); setShowProductGallery(false); };

  const handleSaveProduct = async () => {
    const f = productModal.form;
    if (!f.name || !f.price || !f.category || f.category === '__new__') { alert('Name, category and price are required.'); return; }
    try {
      if (productModal.editing) {
        await supabaseService.updateShopProduct(productModal.editing.id, f);
      } else {
        await supabaseService.createShopProduct(f);
      }
      closeProductModal();
      loadShopData();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Please try again.');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await supabaseService.deleteShopProduct(product.id);
      loadShopData();
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  // ==================== PROMOTIONS MANAGEMENT ====================

  const openAddPromo = () => {
    setPromoModal({
      isOpen: true,
      editing: null,
      form: { title: '', message: '', is_active: false, bg_color: '#2a4e3a', type: 'banner', image_url: '' }
    });
  };

  const openEditPromo = (promo) => {
    setPromoModal({
      isOpen: true,
      editing: promo,
      form: { title: promo.title, message: promo.message, is_active: promo.is_active, bg_color: promo.bg_color || '#2a4e3a', type: promo.type || 'banner', image_url: promo.image_url || '' }
    });
  };

  const closePromoModal = () => {
    setPromoModal(prev => ({ ...prev, isOpen: false, editing: null }));
    setShowBannerGallery(false);
  };

  const loadBannerImages = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('banner-images')
        .list('', { sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;
      const imgs = (data || [])
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .map(f => ({
          name: f.name,
          url: supabase.storage.from('banner-images').getPublicUrl(f.name).data.publicUrl
        }));
      setBannerImages(imgs);
    } catch (err) {
      console.error('Failed to load banner images:', err);
    }
  };

  const uploadBannerImage = async (file) => {
    setBannerUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('banner-images')
        .upload(fileName, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('banner-images').getPublicUrl(fileName);
      setPromoModal(prev => ({ ...prev, form: { ...prev.form, image_url: data.publicUrl } }));
      await loadBannerImages();
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setBannerUploading(false);
    }
  };

  const uploadEmailImage = async (file) => {
    setEmailImageUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `email-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('banner-images')
        .upload(fileName, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('banner-images').getPublicUrl(fileName);
      setEmailBlast(prev => ({ ...prev, imageUrl: data.publicUrl }));
      await loadBannerImages();
    } catch (err) {
      console.error('Failed to upload email image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setEmailImageUploading(false);
    }
  };

  const uploadProductImage = async (file) => {
    setProductImageUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `product-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('banner-images')
        .upload(fileName, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('banner-images').getPublicUrl(fileName);
      setProductModal(prev => ({ ...prev, form: { ...prev.form, image_url: data.publicUrl } }));
      await loadBannerImages();
    } catch (err) {
      console.error('Failed to upload product image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setProductImageUploading(false);
    }
  };

  const handleSavePromo = async () => {
    const f = promoModal.form;
    if (!f.title || !f.message) { alert('Title and message are required.'); return; }
    try {
      if (promoModal.editing) {
        await supabaseService.updatePromotion(promoModal.editing.id, f);
      } else {
        await supabaseService.createPromotion(f);
      }
      closePromoModal();
      loadPromosData();
    } catch (err) {
      console.error('Error saving promotion:', err);
      alert('Failed to save promotion. Please try again.');
    }
  };

  const handleTogglePromo = async (promo) => {
    try {
      await supabaseService.updatePromotion(promo.id, { is_active: !promo.is_active });
      loadPromosData();
    } catch (err) {
      alert('Failed to update promotion.');
    }
  };

  const handleDeletePromo = async (promo) => {
    if (!window.confirm(`Delete promotion "${promo.title}"? This cannot be undone.`)) return;
    try {
      await supabaseService.deletePromotion(promo.id);
      loadPromosData();
    } catch (err) {
      alert('Failed to delete promotion.');
    }
  };

  // ==================== APPROVAL ====================

  const openApprovalModal = (booking) => {
    setApprovalModal({
      isOpen: true,
      booking,
      selectedTime: booking.time_range_start || '',
      clientType: booking.client_type || 'returning'
    });
  };

  const closeApprovalModal = () => {
    setApprovalModal({ isOpen: false, booking: null, selectedTime: '', clientType: 'returning' });
  };

  const handleApproveWithTime = async () => {
    if (!approvalModal.selectedTime) {
      alert('Please select a time for the appointment');
      return;
    }

    try {
      await supabaseService.updateBookingStatus(
        approvalModal.booking.id,
        'approved',
        {
          finalTime: approvalModal.selectedTime,
          clientType: approvalModal.clientType
        }
      );

      // Send confirmation email + create calendar event
      const booking = approvalModal.booking;
      const treatments = booking.booking_treatments || [];
      const treatmentNames = treatments.map(bt => bt.treatment_name).join(', ') || 'Appointment';

      closeApprovalModal();
      setBookings(prev => prev.map(b =>
        b.id === booking.id
          ? { ...b, status: 'approved', time: approvalModal.selectedTime, client_type: approvalModal.clientType }
          : b
      ));

      // Await notification so we can store the calendar event ID before refreshing
      const result = await supabaseService.sendNotification('approved', {
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        date: booking.date,
        time: approvalModal.selectedTime,
        clientType: approvalModal.clientType,
        treatmentNames,
        total_duration: booking.total_duration,
        total_price: booking.total_price,
        notes: booking.notes
      });

      // Store calendar event ID so cancel can remove it later
      if (result?.calendarEventId) {
        await supabaseService.updateBookingStatus(booking.id, 'approved', {
          finalTime: approvalModal.selectedTime,
          calendarEventId: result.calendarEventId
        }).catch(err => console.error('Failed to store calendar event ID:', err));
      }

      // Show contextual toast based on what succeeded
      if (!result) {
        showToast('error', 'Booking approved but notifications failed. Check Supabase edge function logs.');
      } else if (result.emailResults?.[0]?.ok && result.calendarEventId) {
        showToast('success', 'Booking approved — confirmation email sent and added to calendar.');
      } else if (result.emailResults?.[0]?.ok) {
        showToast('warning', 'Booking approved — email sent, but calendar event was not created. Check Google credentials in Supabase.');
      } else {
        showToast('warning', 'Booking approved, but the client email may not have been delivered. Contact them directly.');
      }

      loadBookings();
    } catch (err) {
      console.error('Error approving booking:', err);
      showToast('error', 'Failed to approve booking. Please try again.');
    }
  };

  // ==================== RESCHEDULE ====================

  const openRescheduleModal = (booking) => {
    const treatments = booking.booking_treatments || [];
    
    // Pre-fill with a template message
    const defaultMessage = `Hi ${booking.name}! Unfortunately I'm not available on ${formatDate(booking.date)} between ${formatTimeRange(booking.time_range_start, booking.time_range_end)}. 

Would you be able to do [suggest day] at [suggest time] instead? Let me know and I'll get you booked in!

Thanks,
Viktoria`;

    setRescheduleModal({
      isOpen: true,
      booking,
      message: defaultMessage
    });
  };

  const closeRescheduleModal = () => {
    setRescheduleModal({ isOpen: false, booking: null, message: '' });
  };

  const handleReschedule = async () => {
    if (!rescheduleModal.message.trim()) {
      alert('Please write a message for the client');
      return;
    }

    try {
      const booking = rescheduleModal.booking;
      const treatments = booking.booking_treatments || [];
      const treatmentNames = treatments.map(bt => bt.treatment_name).join(', ') || 'Appointment';

      await supabaseService.updateBookingStatus(
        booking.id,
        'rescheduled',
        { rescheduleMessage: rescheduleModal.message }
      );

      // Send reschedule email with full booking details - AWAIT THIS TO CATCH ERRORS
      const notificationResult = await supabaseService.sendNotification('rescheduled', {
        bookingId: booking.id,
        name: booking.name,
        email: booking.email,
        date: booking.date,
        time_range_start: booking.time_range_start,
        time_range_end: booking.time_range_end,
        treatmentNames,
        rescheduleMessage: rescheduleModal.message,
        calendar_event_id: booking.calendar_event_id,
        total_duration: booking.total_duration
      });

      // Check if notification was successful
      if (!notificationResult) {
        console.warn('Reschedule email may not have been sent');
        alert('Booking status updated, but email notification may have failed. Please contact the client directly.');
      }

      setBookings(prev => prev.map(b =>
        b.id === booking.id
          ? { ...b, status: 'rescheduled', reschedule_message: rescheduleModal.message }
          : b
      ));

      closeRescheduleModal();
      loadBookings();
    } catch (err) {
      console.error('Error rescheduling booking:', err);
      alert('Failed to reschedule booking. Please try again.');
    }
  };

  // ==================== DECLINE ====================

  const openDeclineModal = (booking) => {
    const treatments = booking.booking_treatments || [];
    
    const defaultMessage = `I apologise, but I'm unable to accommodate your requested appointment time. If you'd like to book for a different date, please feel free to submit a new request.`;
    
    setDeclineModal({
      isOpen: true,
      booking,
      message: defaultMessage
    });
  };

  const closeDeclineModal = () => {
    setDeclineModal({ isOpen: false, booking: null, message: '' });
  };

  const handleDeclineWithMessage = async () => {
    try {
      const booking = declineModal.booking;
      const treatments = booking.booking_treatments || [];
      const treatmentNames = treatments.map(bt => bt.treatment_name).join(', ') || 'Appointment';

      await supabaseService.updateBookingStatus(booking.id, 'declined');

      const declineResult = await supabaseService.sendNotification('declined', {
        name: booking.name,
        email: booking.email,
        date: booking.date,
        treatmentNames,
        declineMessage: declineModal.message,
        calendar_event_id: booking.calendar_event_id
      });

      setBookings(prev => prev.map(b =>
        b.id === booking.id ? { ...b, status: 'declined' } : b
      ));

      const emailOk = declineResult?.emailResults?.[0]?.ok;
      const calendarDeleted = declineResult?.calendarDeleted;
      const hadCalendarEvent = !!booking.calendar_event_id;

      if (emailOk && (!hadCalendarEvent || calendarDeleted)) {
        showToast('success', 'Booking declined — client notified by email and calendar event removed.');
      } else if (emailOk && hadCalendarEvent && !calendarDeleted) {
        showToast('warning', 'Booking declined — client notified, but calendar event could not be removed. Delete it manually.');
      } else if (!emailOk && (!hadCalendarEvent || calendarDeleted)) {
        showToast('warning', 'Booking declined, but the client email may not have been delivered. Contact them directly.');
      } else {
        showToast('warning', 'Booking declined, but email was not delivered and calendar event could not be removed. Check manually.');
      }

      closeDeclineModal();
      loadBookings();
    } catch (err) {
      console.error('Error declining booking:', err);
      showToast('error', 'Failed to decline booking. Please try again.');
    }
  };

  const handleDeclineWithoutEmail = async () => {
    try {
      const booking = declineModal.booking;

      await supabaseService.updateBookingStatus(booking.id, 'declined');

      const declineResult = await supabaseService.sendNotification('declined_no_email', {
        name: booking.name,
        calendar_event_id: booking.calendar_event_id
      });

      setBookings(prev => prev.map(b =>
        b.id === booking.id ? { ...b, status: 'declined' } : b
      ));

      const calendarDeleted = declineResult?.calendarDeleted;
      const hadCalendarEvent = !!booking.calendar_event_id;

      if (!hadCalendarEvent || calendarDeleted) {
        showToast('success', 'Booking declined — no email sent, calendar event removed.');
      } else {
        showToast('warning', 'Booking declined — no email sent, but calendar event could not be removed. Delete it manually.');
      }

      closeDeclineModal();
      loadBookings();
    } catch (err) {
      console.error('Error declining booking:', err);
      showToast('error', 'Failed to decline booking. Please try again.');
    }
  };

  // ==================== CANCEL ====================

  const handleCancelApproved = async (booking) => {
    if (!window.confirm(`Cancel appointment for ${booking.name} on ${formatDate(booking.date)} at ${formatTime(booking.time)}? This will send them a cancellation email and remove it from your calendar.`)) {
      return;
    }

    try {
      const treatments = booking.booking_treatments || [];
      const treatmentNames = treatments.map(bt => bt.treatment_name).join(', ') || 'Appointment';

      await supabaseService.updateBookingStatus(booking.id, 'cancelled');

      // Send cancellation email and delete from calendar
      const cancelResult = await supabaseService.sendNotification('cancelled', {
        name: booking.name,
        email: booking.email,
        date: booking.date,
        time: booking.time,
        treatmentNames,
        calendar_event_id: booking.calendar_event_id,
        total_duration: booking.total_duration
      });

      setBookings(prev => prev.map(b =>
        b.id === booking.id ? { ...b, status: 'cancelled' } : b
      ));

      if (cancelResult?.emailResults?.[0]?.ok) {
        showToast('success', 'Appointment cancelled — client has been notified by email.');
      } else {
        showToast('warning', 'Appointment cancelled, but the client email may not have been delivered. Contact them directly.');
      }

      loadBookings();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      showToast('error', 'Failed to cancel booking. Please try again.');
    }
  };

  const handleCancelRescheduled = async (booking) => {
    if (!window.confirm(`Cancel booking for ${booking.name}? They were asked to reschedule but this will cancel it entirely and send them an email.`)) {
      return;
    }

    try {
      await supabaseService.updateBookingStatus(booking.id, 'cancelled');

      const treatments = booking.booking_treatments || [];
      const treatmentNames = treatments.map(bt => bt.treatment_name).join(', ') || 'Appointment';

      supabaseService.sendNotification('declined', {
        name: booking.name,
        email: booking.email,
        date: booking.date,
        treatmentNames,
      });

      setBookings(prev => prev.map(b =>
        b.id === booking.id ? { ...b, status: 'cancelled' } : b
      ));

      loadBookings();
    } catch (err) {
      console.error('Error cancelling rescheduled booking:', err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const handleCancelRescheduledSilent = async (booking) => {
    if (!window.confirm(`Cancel booking for ${booking.name} without sending an email?`)) {
      return;
    }

    try {
      await supabaseService.updateBookingStatus(booking.id, 'cancelled');
      setBookings(prev => prev.map(b =>
        b.id === booking.id ? { ...b, status: 'cancelled' } : b
      ));
      loadBookings();
    } catch (err) {
      console.error('Error cancelling rescheduled booking:', err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  // ==================== REBOOK ====================

  const getConflictsForSlot = (date, startTime, durationMins) => {
    if (!date || !startTime) return [];
    const toMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const newStart = toMins(startTime);
    const newEnd = newStart + (durationMins || 60);
    return bookings.filter(b => {
      if (b.status !== 'approved' || b.date !== date || !b.time) return false;
      const existStart = toMins(b.time);
      const existEnd = existStart + (b.total_duration || 60);
      return newStart < existEnd && newEnd > existStart;
    });
  };

  const getNextAvailableTime = (date, durationMins) => {
    if (!date) return '09:00';
    const toMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const fromMins = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const bookingsOnDay = bookings
      .filter(b => b.status === 'approved' && b.date === date && b.time)
      .map(b => ({ start: toMins(b.time), end: toMins(b.time) + (b.total_duration || 60) }))
      .sort((a, b) => a.start - b.start);
    let candidate = toMins('08:00');
    const dayEnd = toMins('19:00');
    for (const b of bookingsOnDay) {
      if (candidate + (durationMins || 60) <= b.start) break;
      if (candidate < b.end) candidate = b.end;
    }
    return candidate + (durationMins || 60) <= dayEnd ? fromMins(candidate) : '';
  };

  const openRebookModal = (sourceBooking, client) => {
    const sourceTreatmentNames = (sourceBooking.booking_treatments || []).map(bt => bt.treatment_name);
    const preSelected = rebookTreatments.all.filter(t => sourceTreatmentNames.includes(t.name));
    const selectedTreatments = preSelected.length > 0
      ? preSelected
      : (sourceBooking.booking_treatments || []).map(bt => ({
          id: bt.treatment_id || null,
          name: bt.treatment_name,
          duration_minutes: bt.duration_minutes,
          price: bt.price,
        }));
    const approvedCount = client.bookings.filter(b => b.status === 'approved').length;
    setRebookModal({
      isOpen: true,
      sourceBooking,
      form: {
        date: '',
        time: '',
        clientType: approvedCount > 1 ? 'returning' : 'new',
        notes: sourceBooking.notes || '',
        selectedTreatments,
      }
    });
  };

  const closeRebookModal = () => {
    setRebookModal({ isOpen: false, sourceBooking: null, form: { date: '', time: '', clientType: 'returning', notes: '', selectedTreatments: [] } });
    setRebookSubmitting(false);
  };

  const handleRebookSubmit = async () => {
    const { form, sourceBooking } = rebookModal;
    if (!form.date) { alert('Please select a date.'); return; }
    if (!form.time) { alert('Please select a time.'); return; }
    if (form.selectedTreatments.length === 0) { alert('Please select at least one treatment.'); return; }

    const totalDuration = form.selectedTreatments.reduce((sum, t) => sum + (t.duration_minutes || 0), 0);
    const conflicts = getConflictsForSlot(form.date, form.time, totalDuration || 60);
    if (conflicts.length > 0) {
      const ok = window.confirm(`There is already a booking at this time (${conflicts.map(c => c.name).join(', ')}). Continue anyway?`);
      if (!ok) return;
    }

    const totalPrice = form.selectedTreatments.reduce((sum, t) => {
      const n = parseFloat((t.price || '').toString().replace(/[^0-9.]/g, ''));
      return sum + (isNaN(n) ? 0 : n);
    }, 0);
    const totalPriceStr = totalPrice > 0 ? `$${totalPrice.toFixed(0)}` : 'POA';
    const name = sourceBooking?.name || selectedRebookClient?.name || '';
    const email = sourceBooking?.email || selectedRebookClient?.email || '';
    const phone = sourceBooking?.phone || selectedRebookClient?.phone || '';

    setRebookSubmitting(true);
    try {
      const { id: bookingId } = await supabaseService.createAdminBooking({
        name, email, phone,
        date: form.date,
        time: form.time,
        notes: form.notes || null,
        treatments: form.selectedTreatments,
        clientType: form.clientType,
        totalDuration: totalDuration || null,
        totalPrice: totalPriceStr,
        sourceBookingId: sourceBooking?.id || null,
      });

      const treatmentNames = form.selectedTreatments.map(t => t.name || t.treatment_name).join(', ') || 'Appointment';
      const result = await supabaseService.sendNotification('approved', {
        name, email, phone,
        date: form.date,
        time: form.time,
        clientType: form.clientType,
        treatmentNames,
        total_duration: totalDuration || null,
        total_price: totalPriceStr,
        notes: form.notes || null,
      }).catch(err => { console.error('Rebook notification failed:', err); return null; });

      if (result?.calendarEventId) {
        await supabaseService.updateBookingStatus(bookingId, 'approved', {
          finalTime: form.time,
          calendarEventId: result.calendarEventId
        }).catch(err => console.error('Failed to store calendar event ID:', err));
      }

      closeRebookModal();
      loadBookings();

      if (!result) {
        showToast('warning', 'Booking created but notifications failed. Check Supabase edge function logs.');
      } else if (result.emailResults?.[0]?.ok && result.calendarEventId) {
        showToast('success', 'Booking created — confirmation email sent and added to calendar.');
      } else if (result.emailResults?.[0]?.ok) {
        showToast('warning', 'Booking created — email sent, but calendar event was not created.');
      } else {
        showToast('warning', 'Booking created, but the client email may not have been delivered.');
      }
    } catch (err) {
      console.error('Error creating rebook booking:', err);
      showToast('error', 'Failed to create booking. Please try again.');
    } finally {
      setRebookSubmitting(false);
    }
  };

  // ==================== HELPERS ====================

  const generateTimeOptions = (startTime, endTime) => {
    const options = [];
    const start = startTime ? new Date(`2000-01-01T${startTime}`) : new Date('2000-01-01T08:00');
    const end = endTime ? new Date(`2000-01-01T${endTime}`) : new Date('2000-01-01T18:00');

    let current = start;
    while (current <= end) {
      const timeStr = current.toTimeString().slice(0, 5);
      options.push(timeStr);
      current = new Date(current.getTime() + 15 * 60000);
    }

    return options;
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const rescheduledBookings = bookings.filter(b => b.status === 'rescheduled');

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString + 'T00:00:00').toLocaleDateString('en-NZ', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const h = parseInt(hours, 10);
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 || 12;
      return `${displayHour}:${minutes} ${period}`;
    } catch {
      return timeString;
    }
  };

  const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return 'Not specified';
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading your bookings...</div>
      </div>
    );
  }

  const timeOptions = approvalModal.booking
    ? generateTimeOptions(approvalModal.booking.time_range_start, approvalModal.booking.time_range_end)
    : [];

  return (
    <div className="admin-dashboard">
      <Toast toast={toast} onClose={closeToast} />
      <div className="dashboard-centered">
        <div className="bookings-section">
          <header className="admin-header">
            <div>
              <h1>Your Bookings</h1>
              <p className="header-subtitle">Manage your appointments</p>
            </div>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </header>

          {error && <div className="error-banner">{error}</div>}

          {/* Section bar — top-level navigation */}
          <div className="section-bar">
            <button
              className={`section-btn ${section === 'actions' ? 'active' : ''}`}
              onClick={() => switchSection('actions')}
            >
              <span className="section-icon">⚡</span>
              <span>Actions</span>
              {(pendingBookings.length + rescheduledBookings.length +
                orders.filter(o => o.status === 'pending').length +
                vouchers.filter(v => v.status === 'pending').length) > 0 && (
                <span className="section-count">
                  {pendingBookings.length + rescheduledBookings.length +
                   orders.filter(o => o.status === 'pending').length +
                   vouchers.filter(v => v.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              className={`section-btn ${section === 'schedule' ? 'active' : ''}`}
              onClick={() => switchSection('schedule')}
            >
              <span className="section-icon">📅</span>
              <span>Schedule</span>
              {todaysBookings.length > 0 && (
                <span className="section-count section-count-blue">{todaysBookings.length}</span>
              )}
            </button>
            <button
              className={`section-btn ${section === 'rebook' ? 'active' : ''}`}
              onClick={() => switchSection('rebook')}
            >
              <span className="section-icon">🔁</span>
              <span>Rebook</span>
            </button>
            <button
              className={`section-btn ${section === 'shop' ? 'active' : ''}`}
              onClick={() => switchSection('shop')}
            >
              <span className="section-icon">🛍️</span>
              <span>Shop</span>
            </button>
            <button
              className={`section-btn ${section === 'marketing' ? 'active' : ''}`}
              onClick={() => switchSection('marketing')}
            >
              <span className="section-icon">📣</span>
              <span>Marketing</span>
            </button>
          </div>

          {/* Sub-tab bar — changes based on active section */}
          <div className="tab-bar">
            {section === 'actions' && (
              <>
                <button
                  className={`tab ${tab === 'pending' ? 'active' : ''}`}
                  onClick={() => setTab('pending')}
                >
                  <span className="tab-icon">⏳</span>
                  Requests
                  {pendingBookings.length > 0 && <span className="tab-count">{pendingBookings.length}</span>}
                </button>
                <button
                  className={`tab ${tab === 'rescheduled' ? 'active' : ''}`}
                  onClick={() => setTab('rescheduled')}
                >
                  <span className="tab-icon">🔄</span>
                  Reschedule
                  {rescheduledBookings.length > 0 && <span className="tab-count-orange">{rescheduledBookings.length}</span>}
                </button>
                <button
                  className={`tab ${tab === 'orders' ? 'active' : ''}`}
                  onClick={() => setTab('orders')}
                >
                  <span className="tab-icon">🛍️</span>
                  Orders
                  {orders.filter(o => o.status === 'pending').length > 0 && (
                    <span className="tab-count">{orders.filter(o => o.status === 'pending').length}</span>
                  )}
                </button>
                <button
                  className={`tab ${tab === 'vouchers' ? 'active' : ''}`}
                  onClick={() => setTab('vouchers')}
                >
                  <span className="tab-icon">🎟️</span>
                  Vouchers
                  {vouchers.filter(v => v.status === 'pending').length > 0 && (
                    <span className="tab-count">{vouchers.filter(v => v.status === 'pending').length}</span>
                  )}
                </button>
              </>
            )}

            {section === 'schedule' && (
              <>
                <button
                  className={`tab ${tab === 'today' ? 'active' : ''}`}
                  onClick={() => setTab('today')}
                >
                  <span className="tab-icon">📅</span>
                  Today
                  {todaysBookings.length > 0 && <span className="tab-count-blue">{todaysBookings.length}</span>}
                </button>
                <button
                  className={`tab ${tab === 'approved' ? 'active' : ''}`}
                  onClick={() => setTab('approved')}
                >
                  <span className="tab-icon">✓</span>
                  Approved
                </button>
              </>
            )}

            {section === 'shop' && (
              <>
                <button
                  className={`tab ${tab === 'addto' ? 'active' : ''}`}
                  onClick={() => setTab('addto')}
                >
                  <span className="tab-icon">🎁</span>
                  Products
                </button>
                <button
                  className={`tab ${tab === 'stock' ? 'active' : ''}`}
                  onClick={() => setTab('stock')}
                >
                  <span className="tab-icon">📦</span>
                  Stock
                  {stockProducts.filter(p => p.stock !== null && p.stock === 0).length > 0 && (
                    <span className="tab-count" style={{ background: '#c0392b' }}>
                      {stockProducts.filter(p => p.stock !== null && p.stock === 0).length}
                    </span>
                  )}
                </button>
              </>
            )}

            {section === 'marketing' && (
              <>
                <button
                  className={`tab ${tab === 'promos' ? 'active' : ''}`}
                  onClick={() => setTab('promos')}
                >
                  <span className="tab-icon">🎉</span>
                  Promos
                </button>
                <button
                  className={`tab ${tab === 'email' ? 'active' : ''}`}
                  onClick={() => setTab('email')}
                >
                  <span className="tab-icon">✉️</span>
                  Email
                </button>
                <button
                  className={`tab ${tab === 'stats' ? 'active' : ''}`}
                  onClick={() => setTab('stats')}
                >
                  <span className="tab-icon">📊</span>
                  Stats
                </button>
              </>
            )}
          </div>

          {/* Helper text */}
          {tab === 'pending' && pendingBookings.length > 0 && (
            <div className="helper-text">
              👇 Review the client's available time window, then click "Set Time & Approve" or suggest a different time with "Reschedule"
            </div>
          )}

          {tab === 'today' && (
            <div className="today-header">
              <h2>{new Date().toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
            </div>
          )}

          <div className="bookings-list">
            {/* ==================== TODAY ==================== */}
            {tab === 'today' && (
              <>
                {todaysBookings.length === 0 ? (
                  <div className="no-bookings">
                    <div className="empty-icon">😌</div>
                    <h3>No appointments today</h3>
                    <p>Enjoy your day off!</p>
                  </div>
                ) : (
                  todaysBookings.map(booking => {
                    const treatments = booking.booking_treatments || [];
                    const treatmentNames = treatments.map(bt => bt.treatment_name).join(', ') || 'Not specified';

                    return (
                      <div key={booking.id} className="booking-card today">
                        <div className="card-header">
                          <div className="time-badge">{formatTime(booking.time)}</div>
                          <h3 className="client-name">{booking.name}</h3>
                          {booking.client_type && (
                            <span className={`client-type-pill ${booking.client_type}`}>
                              {booking.client_type === 'new' ? '⭐ New' : '🔁 Returning'}
                            </span>
                          )}
                        </div>

                        <div className="card-body">
                          <div className="info-row">
                            <span className="info-label">Treatment:</span>
                            <span className="info-value treatment">{treatmentNames}</span>
                          </div>

                          {booking.phone && (
                            <div className="info-row">
                              <span className="info-label">Phone:</span>
                              <a href={`tel:${booking.phone}`} className="info-value">{booking.phone}</a>
                            </div>
                          )}

                          {booking.notes && (
                            <div className="notes-box">
                              <span className="info-label">Notes:</span>
                              <p className="notes-text">{booking.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* ==================== PENDING ==================== */}
            {tab === 'pending' && (
              <>
                {pendingBookings.length === 0 ? (
                  <div className="no-bookings">
                    <div className="empty-icon">✨</div>
                    <h3>All caught up!</h3>
                    <p>No pending booking requests</p>
                  </div>
                ) : (
                  pendingBookings.map(booking => {
                    const treatments = booking.booking_treatments || [];
                    const treatmentNames = treatments.map(bt => bt.treatment_name).join(', ') || 'Not specified';

                    return (
                      <div key={booking.id} className="booking-card pending">
                        <div className="card-header">
                          <h3 className="client-name">{booking.name}</h3>
                          <span className="status-pill pending">⏳ Pending</span>
                        </div>

                        <div className="card-body">
                          <div className="info-row">
                            <span className="info-label">Treatment:</span>
                            <span className="info-value treatment">{treatmentNames}</span>
                          </div>

                          <div className="info-row">
                            <span className="info-label">Date:</span>
                            <span className="info-value datetime">{formatDate(booking.date)}</span>
                          </div>

                          <div className="info-row">
                            <span className="info-label">Available:</span>
                            <span className="info-value available-time">{formatTimeRange(booking.time_range_start, booking.time_range_end)}</span>
                          </div>

                          {booking.phone && (
                            <div className="info-row">
                              <span className="info-label">Phone:</span>
                              <a href={`tel:${booking.phone}`} className="info-value">{booking.phone}</a>
                            </div>
                          )}

                          {booking.email && (
                            <div className="info-row">
                              <span className="info-label">Email:</span>
                              <a href={`mailto:${booking.email}`} className="info-value">{booking.email}</a>
                            </div>
                          )}

                          {booking.notes && (
                            <div className="notes-box">
                              <span className="info-label">Notes:</span>
                              <p className="notes-text">{booking.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="card-actions">
                          <button
                            className="btn-approve"
                            onClick={() => openApprovalModal(booking)}
                          >
                            ✓ Set Time & Approve
                          </button>
                          <button
                            className="btn-reschedule"
                            onClick={() => openRescheduleModal(booking)}
                          >
                            🔄 Reschedule
                          </button>
                          <button
                            className="btn-decline"
                            onClick={() => openDeclineModal(booking)}
                          >
                            ✕ Decline
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* ==================== APPROVED ==================== */}
            {tab === 'approved' && (() => {
              const [selYear, selMonth] = approvedMonth.split('-').map(Number);
              const monthApproved = approvedBookings.filter(b => {
                if (!b.date) return false;
                const d = new Date(b.date + 'T00:00:00');
                return d.getFullYear() === selYear && d.getMonth() + 1 === selMonth;
              }).sort((a, b) => a.date < b.date ? -1 : 1);

              const newClients = monthApproved.filter(b => b.client_type === 'new').length;
              // eslint-disable-next-line no-unused-vars
              const returningClients = monthApproved.filter(b => b.client_type === 'returning').length;
              const today = new Date().toISOString().split('T')[0];
              const upcoming = monthApproved.filter(b => b.date >= today).length;

              const parsePrice = (p) => { const n = parseFloat((p || '').toString().replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; };
              const monthRevenue = monthApproved.reduce((sum, b) => sum + parsePrice(b.total_price), 0);

              const cardStyle = { flex: 1, background: '#f8f9fa', borderRadius: '10px', padding: '18px', textAlign: 'center', minWidth: '110px' };
              const cardValue = { fontSize: '1.8rem', fontWeight: 700, color: '#2a4e3a', margin: '4px 0' };
              const cardLabel = { fontSize: '0.8rem', color: '#888', margin: 0 };

              return (
                <>
                  <div className="addto-section-header" style={{ marginBottom: '16px' }}>
                    <h2 className="addto-section-title">✓ Approved Clients</h2>
                    <input
                      type="month"
                      value={approvedMonth}
                      onChange={e => setApprovedMonth(e.target.value)}
                      style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '6px 12px', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    <div style={cardStyle}>
                      <p style={cardLabel}>This Month</p>
                      <p style={cardValue}>{monthApproved.length}</p>
                      <p style={cardLabel}>approved</p>
                    </div>
                    <div style={cardStyle}>
                      <p style={cardLabel}>Upcoming</p>
                      <p style={cardValue}>{upcoming}</p>
                      <p style={cardLabel}>still ahead</p>
                    </div>
                    <div style={cardStyle}>
                      <p style={cardLabel}>New Clients</p>
                      <p style={cardValue}>{newClients}</p>
                      <p style={cardLabel}>⭐ first-timers</p>
                    </div>
                    <div style={cardStyle}>
                      <p style={cardLabel}>Revenue</p>
                      <p style={cardValue}>${monthRevenue.toFixed(0)}</p>
                      <p style={cardLabel}>this month</p>
                    </div>
                  </div>

                  {monthApproved.length === 0 ? (
                    <div className="no-bookings">
                      <div className="empty-icon">📅</div>
                      <h3>No approved bookings for this month</h3>
                      <p>Try selecting a different month above</p>
                    </div>
                  ) : (
                    monthApproved.map(booking => {
                      const treatments = booking.booking_treatments || [];
                      const treatmentNames = treatments.map(bt => bt.treatment_name).join(', ') || 'Not specified';
                      const isPast = booking.date < today;

                      return (
                        <div key={booking.id} className="booking-card approved" style={isPast ? { opacity: 0.65 } : {}}>
                          <div className="card-header">
                            <h3 className="client-name">{booking.name}</h3>
                            <span className="status-pill approved">{isPast ? '✓ Completed' : '✓ Confirmed'}</span>
                            {booking.client_type && (
                              <span className={`client-type-pill ${booking.client_type}`}>
                                {booking.client_type === 'new' ? '⭐ New' : '🔁 Returning'}
                              </span>
                            )}
                          </div>

                          <div className="card-body">
                            <div className="info-row">
                              <span className="info-label">Treatment:</span>
                              <span className="info-value treatment">{treatmentNames}</span>
                            </div>

                            <div className="info-row">
                              <span className="info-label">Date & Time:</span>
                              <span className="info-value datetime">{formatDate(booking.date)} at {formatTime(booking.time)}</span>
                            </div>

                            {booking.phone && (
                              <div className="info-row">
                                <span className="info-label">Phone:</span>
                                <a href={`tel:${booking.phone}`} className="info-value">{booking.phone}</a>
                              </div>
                            )}

                            {booking.email && (
                              <div className="info-row">
                                <span className="info-label">Email:</span>
                                <a href={`mailto:${booking.email}`} className="info-value">{booking.email}</a>
                              </div>
                            )}

                            {booking.notes && (
                              <div className="notes-box">
                                <span className="info-label">Notes:</span>
                                <p className="notes-text">{booking.notes}</p>
                              </div>
                            )}

                            {!isPast && (
                              <button
                                className="btn-cancel"
                                onClick={() => handleCancelApproved(booking)}
                                style={{ marginTop: '15px' }}
                              >
                                🗑️ Cancel Appointment
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </>
              );
            })()}

            {/* ==================== REBOOK ==================== */}
            {tab === 'rebook' && (
              <div>
                <div className="addto-section-header" style={{ marginBottom: '16px' }}>
                  <h2 className="addto-section-title">🔁 Rebook a Client</h2>
                </div>

                {!selectedRebookClient && (
                  <>
                    <input
                      type="text"
                      placeholder="Search client name or email..."
                      value={rebookSearch}
                      onChange={e => setRebookSearch(e.target.value)}
                      style={{ width: '100%', border: '1px solid #ddd', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' }}
                    />

                    {rebookLoading && (
                      <div className="no-bookings"><p>Searching...</p></div>
                    )}

                    {rebookSearched && !rebookLoading && rebookClients.length === 0 && (
                      <div className="no-bookings">
                        <div className="empty-icon">🔍</div>
                        <h3>No clients found</h3>
                        <p>Try a different name or email address</p>
                      </div>
                    )}

                    {!rebookSearched && !rebookLoading && (
                      <div className="no-bookings">
                        <div className="empty-icon">🔁</div>
                        <h3>Find a client to rebook</h3>
                        <p>Type their name or email above</p>
                      </div>
                    )}

                    {rebookClients.map(client => {
                      const lastBooking = client.bookings[0];
                      const approvedCount = client.bookings.filter(b => b.status === 'approved').length;
                      const lastTreatments = (lastBooking?.booking_treatments || []).map(bt => bt.treatment_name).join(', ') || 'No treatments';
                      return (
                        <div key={client.email || client.name} className="booking-card approved">
                          <div className="card-header" onClick={() => setSelectedRebookClient(client)} style={{ cursor: 'pointer' }}>
                            <h3 className="client-name">{client.name}</h3>
                            <span className="status-pill approved">{approvedCount} visit{approvedCount !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="card-body" onClick={() => setSelectedRebookClient(client)} style={{ cursor: 'pointer' }}>
                            {client.email && (
                              <div className="info-row">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{client.email}</span>
                              </div>
                            )}
                            {client.phone && (
                              <div className="info-row">
                                <span className="info-label">Phone:</span>
                                <span className="info-value">{client.phone}</span>
                              </div>
                            )}
                            <div className="info-row">
                              <span className="info-label">Last visit:</span>
                              <span className="info-value">{lastBooking?.date ? formatDate(lastBooking.date) : 'Unknown'}</span>
                            </div>
                            <div className="info-row">
                              <span className="info-label">Last treatment:</span>
                              <span className="info-value treatment">{lastTreatments}</span>
                            </div>
                          </div>
                          <div className="card-actions">
                            <button className="btn-approve" onClick={() => openRebookModal(lastBooking, client)}>
                              🔁 Rebook Last Visit
                            </button>
                            <button className="btn-reschedule" onClick={() => setSelectedRebookClient(client)}>
                              View History
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {selectedRebookClient && (
                  <div>
                    <button
                      onClick={() => setSelectedRebookClient(null)}
                      style={{ background: 'none', border: 'none', color: '#6B9E7A', cursor: 'pointer', fontSize: '0.9rem', padding: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      ← Back to search
                    </button>

                    <div className="booking-card approved" style={{ marginBottom: '16px' }}>
                      <div className="card-header">
                        <h3 className="client-name">{selectedRebookClient.name}</h3>
                      </div>
                      <div className="card-body">
                        {selectedRebookClient.email && (
                          <div className="info-row">
                            <span className="info-label">Email:</span>
                            <a href={`mailto:${selectedRebookClient.email}`} className="info-value">{selectedRebookClient.email}</a>
                          </div>
                        )}
                        {selectedRebookClient.phone && (
                          <div className="info-row">
                            <span className="info-label">Phone:</span>
                            <a href={`tel:${selectedRebookClient.phone}`} className="info-value">{selectedRebookClient.phone}</a>
                          </div>
                        )}
                      </div>
                    </div>

                    {(() => {
                      const totalVisits = selectedRebookClient.bookings.filter(b => b.status === 'approved').length;
                      const lastVisit = selectedRebookClient.bookings.find(b => b.status === 'approved');
                      const allTreatmentNames = selectedRebookClient.bookings.flatMap(b => (b.booking_treatments || []).map(bt => bt.treatment_name));
                      const freq = {};
                      allTreatmentNames.forEach(n => { freq[n] = (freq[n] || 0) + 1; });
                      const mostBooked = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
                      const cardStyle = { flex: 1, background: '#f8f9fa', borderRadius: '10px', padding: '14px', textAlign: 'center', minWidth: '90px' };
                      const cardValue = { fontSize: '1.5rem', fontWeight: 700, color: '#2a4e3a', margin: '4px 0' };
                      const cardLabel = { fontSize: '0.75rem', color: '#888', margin: 0 };
                      return (
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                          <div style={cardStyle}>
                            <p style={cardLabel}>Total Visits</p>
                            <p style={cardValue}>{totalVisits}</p>
                            <p style={cardLabel}>approved</p>
                          </div>
                          <div style={cardStyle}>
                            <p style={cardLabel}>Last Visit</p>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2a4e3a', margin: '4px 0' }}>{lastVisit ? formatDate(lastVisit.date) : '—'}</p>
                          </div>
                          <div style={cardStyle}>
                            <p style={cardLabel}>Most Booked</p>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2a4e3a', margin: '4px 0' }}>{mostBooked}</p>
                          </div>
                        </div>
                      );
                    })()}

                    <h3 style={{ fontSize: '1rem', color: '#444', marginBottom: '12px' }}>Booking History</h3>

                    {selectedRebookClient.bookings.map(booking => {
                      const treatments = booking.booking_treatments || [];
                      return (
                        <div key={booking.id} className="booking-card" style={{ marginBottom: '8px', borderLeft: `3px solid ${booking.status === 'approved' ? '#27ae60' : '#e0e0e0'}` }}>
                          <div className="card-header">
                            <span className="info-value datetime">{formatDate(booking.date)}{booking.time ? ` at ${formatTime(booking.time)}` : ''}</span>
                            <span className={`status-pill ${booking.status === 'approved' ? 'approved' : booking.status === 'pending' ? 'pending' : ''}`}>
                              {booking.status === 'approved' ? '✓ Approved' : booking.status === 'pending' ? '⏳ Pending' : booking.status === 'cancelled' ? '✕ Cancelled' : booking.status === 'declined' ? '✕ Declined' : booking.status}
                            </span>
                          </div>
                          <div className="card-body">
                            {treatments.length > 0 ? treatments.map(t => (
                              <div key={t.id} className="info-row" style={{ marginBottom: '2px' }}>
                                <span className="info-value treatment">{t.treatment_name}</span>
                                <span style={{ marginLeft: 'auto', color: '#888', fontSize: '0.85rem' }}>
                                  {t.duration_minutes ? `${t.duration_minutes} min` : ''}{t.price ? ` · ${t.price}` : ''}
                                </span>
                              </div>
                            )) : (
                              <div className="info-row"><span className="info-value">No treatment details</span></div>
                            )}
                          </div>
                          <div className="card-actions">
                            <button className="btn-approve" style={{ fontSize: '0.85rem', padding: '6px 12px' }} onClick={() => openRebookModal(booking, selectedRebookClient)}>
                              🔁 Rebook This
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ==================== RESCHEDULED ==================== */}
            {tab === 'rescheduled' && (
              <>
                {rescheduledBookings.length === 0 ? (
                  <div className="no-bookings">
                    <div className="empty-icon">🔄</div>
                    <h3>No rescheduled bookings</h3>
                    <p>Rescheduled requests will show here</p>
                  </div>
                ) : (
                  rescheduledBookings.map(booking => {
                    const treatments = booking.booking_treatments || [];
                    const treatmentNames = treatments.map(bt => bt.treatment_name).join(', ') || 'Not specified';

                    return (
                      <div key={booking.id} className="booking-card rescheduled">
                        <div className="card-header">
                          <h3 className="client-name">{booking.name}</h3>
                          <span className="status-pill rescheduled">🔄 Rescheduled</span>
                        </div>

                        <div className="card-body">
                          <div className="info-row">
                            <span className="info-label">Treatment:</span>
                            <span className="info-value treatment">{treatmentNames}</span>
                          </div>

                          <div className="info-row">
                            <span className="info-label">Original Date:</span>
                            <span className="info-value datetime">{formatDate(booking.date)}</span>
                          </div>

                          {booking.reschedule_message && (
                            <div className="reschedule-message-box">
                              <span className="info-label">Your message to client:</span>
                              <p className="reschedule-message">"{booking.reschedule_message}"</p>
                            </div>
                          )}

                          {booking.phone && (
                            <div className="info-row">
                              <span className="info-label">Phone:</span>
                              <a href={`tel:${booking.phone}`} className="info-value">{booking.phone}</a>
                            </div>
                          )}
                        </div>

                        <div className="card-actions" style={{ marginTop: '15px' }}>
                          <button
                            className="btn-cancel"
                            onClick={() => handleCancelRescheduled(booking)}
                          >
                            🗑️ Cancel & Email
                          </button>
                          <button
                            className="btn-cancel"
                            style={{ background: '#f0f0f0', color: '#666' }}
                            onClick={() => handleCancelRescheduledSilent(booking)}
                          >
                            🗑️ Cancel (no email)
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* ==================== ORDERS ==================== */}
            {tab === 'orders' && (
              <>
                {shopLoading ? (
                  <div className="no-bookings"><p>Loading orders...</p></div>
                ) : orders.length === 0 ? (
                  <div className="no-bookings">
                    <div className="empty-icon">🛍️</div>
                    <h3>No orders yet</h3>
                    <p>Shop orders will appear here</p>
                  </div>
                ) : (
                  orders.map(order => {
                    const items = order.shop_order_items || [];
                    return (
                      <div key={order.id} className={`booking-card ${order.status === 'fulfilled' ? 'approved' : order.status === 'responded' ? 'rescheduled' : 'pending'}`}>
                        <div className="card-header">
                          <h3 className="client-name">{order.customer_name}</h3>
                          <span className={`status-pill ${order.status === 'fulfilled' ? 'approved' : order.status === 'responded' ? 'rescheduled' : 'pending'}`}>
                            {order.status === 'fulfilled' ? '✓ Fulfilled' : order.status === 'responded' ? '📧 Responded' : '⏳ Pending'}
                          </span>
                        </div>
                        <div className="card-body">
                          <div className="info-row">
                            <span className="info-label">Email:</span>
                            <a href={`mailto:${order.email}`} className="info-value">{order.email}</a>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Fulfillment:</span>
                            <span className="info-value">{order.fulfillment === 'pickup' ? '🏠 Pickup' : `📦 Delivery — ${order.address || ''}`}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Items:</span>
                            <span className="info-value treatment">
                              {items.map(i => `${i.product_name} ×${i.quantity}`).join(', ') || '—'}
                            </span>
                          </div>
                          {order.notes && (
                            <div className="notes-box">
                              <span className="info-label">Notes:</span>
                              <p className="notes-text">{order.notes}</p>
                            </div>
                          )}
                          {order.response_message && (
                            <div className="reschedule-message-box">
                              <span className="info-label">Your response:</span>
                              <p className="reschedule-message">"{order.response_message}"</p>
                            </div>
                          )}
                          <div className="info-row" style={{ marginTop: '6px' }}>
                            <span className="info-label">Received:</span>
                            <span className="info-value">{new Date(order.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <div className="card-actions" style={{ position: 'relative' }}>
                          {order.status !== 'fulfilled' && (
                            <button className="btn-approve" onClick={() => openOrderModal(order)}>
                              📧 Respond to Order
                            </button>
                          )}
                          {order.status !== 'fulfilled' && (
                            <button className="btn-reschedule" onClick={() => handleMarkFulfilled(order)}>
                              ✓ Mark Fulfilled
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            title="Delete order"
                            style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', border: 'none', borderRadius: '50%', background: '#e8e8e8', color: '#999', cursor: 'pointer', fontSize: '14px', lineHeight: '26px', textAlign: 'center', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >×</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* ==================== VOUCHERS ==================== */}
            {tab === 'vouchers' && (
              <>
                {vouchersLoading ? (
                  <div className="no-bookings"><p>Loading vouchers...</p></div>
                ) : vouchers.length === 0 ? (
                  <div className="no-bookings">
                    <div className="empty-icon">🎟️</div>
                    <h3>No voucher requests yet</h3>
                    <p>Gift voucher requests will appear here</p>
                  </div>
                ) : (
                  vouchers.map(voucher => (
                    <div key={voucher.id} className={`booking-card ${voucher.status === 'collected' ? 'approved' : voucher.status === 'ready' ? 'rescheduled' : 'pending'}`}>
                      <div className="card-header">
                        <h3 className="client-name">{voucher.purchaser_name}</h3>
                        <span
                          className="status-pill"
                          style={{
                            background: voucher.status === 'collected' ? '#27ae60' : voucher.status === 'ready' ? '#2980b9' : '#e67e22',
                            color: 'white',
                          }}
                        >
                          {voucher.status === 'collected' ? '✓ Collected' : voucher.status === 'ready' ? '✉ Ready' : '⏳ Pending'}
                        </span>
                      </div>
                      <div className="card-body">
                        <div className="info-row">
                          <span className="info-label">Amount:</span>
                          <span className="info-value">${voucher.amount}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Email:</span>
                          <span className="info-value">{voucher.purchaser_email}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Phone:</span>
                          <span className="info-value">{voucher.purchaser_phone}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Delivery:</span>
                          <span className="info-value">{voucher.delivery_method === 'pickup' ? '🏠 Pickup' : '📧 Email'}</span>
                        </div>
                        {voucher.pickup_date && (
                          <div className="info-row">
                            <span className="info-label">Pickup date:</span>
                            <span className="info-value">{new Date(voucher.pickup_date).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        )}
                        {voucher.recipient_name && (
                          <div className="info-row">
                            <span className="info-label">For:</span>
                            <span className="info-value">{voucher.recipient_name}</span>
                          </div>
                        )}
                        {voucher.notes && (
                          <div className="notes-box">
                            <span className="info-label">Notes:</span>
                            <p className="notes-text">{voucher.notes}</p>
                          </div>
                        )}
                        <div className="info-row" style={{ marginTop: '6px' }}>
                          <span className="info-label">Received:</span>
                          <span className="info-value">{new Date(voucher.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                      <div className="card-actions">
                        {voucher.status === 'pending' && (
                          <button className="btn-approve" onClick={() => handleVoucherStatus(voucher, 'ready')}>
                            ✓ Mark Ready
                          </button>
                        )}
                        {voucher.status === 'ready' && (
                          <button className="btn-reschedule" onClick={() => handleVoucherStatus(voucher, 'collected')}>
                            ✓ Mark Collected
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* ==================== ADD TO ==================== */}
            {tab === 'addto' && (
              <>
                {/* ── Products section ── */}
                <div className="addto-section-header">
                  <h2 className="addto-section-title">📦 Shop Products</h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-approve"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={async () => {
                        const toActivate = shopProducts.filter(p => !p.is_active && p.stock !== null && p.stock > 0);
                        if (toActivate.length === 0) { alert('No hidden products with stock to activate.'); return; }
                        if (!window.confirm(`Set ${toActivate.length} product(s) with stock to visible?`)) return;
                        try {
                          await Promise.all(toActivate.map(p => supabaseService.updateShopProduct(p.id, { is_active: true })));
                          loadShopData();
                        } catch (err) {
                          alert('Failed to activate products.');
                        }
                      }}
                    >Activate Stocked</button>
                    <button className="btn-add-small" onClick={openAddProduct}>+ Add Product</button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  style={{ width: '100%', border: '1px solid #ddd', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' }}
                />
                {shopLoading ? (
                  <div className="no-bookings"><p>Loading...</p></div>
                ) : shopProducts.length === 0 ? (
                  <p style={{ color: '#aaa', fontStyle: 'italic', marginBottom: '28px' }}>No products yet — click "+ Add Product" to get started</p>
                ) : (
                  <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(shopProducts.filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())).reduce((acc, p) => {
                      if (!acc[p.category]) acc[p.category] = [];
                      acc[p.category].push(p);
                      return acc;
                    }, {})).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => (
                      <div key={category} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                        <button
                          onClick={() => toggleCat('prod_' + category)}
                          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: expandedCats['prod_' + category] ? '#f0f4f1' : '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, color: '#2a4e3a' }}
                        >
                          <span>{category} ({items.length})</span>
                          <span style={{ fontSize: '0.8rem', color: '#888' }}>{(expandedCats['prod_' + category] || productSearch) ? '▼' : '▶'}</span>
                        </button>
                        {(expandedCats['prod_' + category] || productSearch) && (
                          <div className="products-table-wrap">
                            <table className="products-table">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Price</th>
                                  <th>Active</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {[...items].sort((a, b) => {
                                  const rank = (p) => p.stock !== null && p.stock > 0 ? 0 : p.stock === null ? 1 : 2;
                                  return rank(a) - rank(b);
                                }).map(product => (
                                  <tr key={product.id}>
                                    <td>{product.name}</td>
                                    <td style={{ fontWeight: 600, color: '#6B9E7A' }}>{product.price}</td>
                                    <td>
                                      <button
                                        className={product.is_active ? 'status-pill approved' : 'status-pill pending'}
                                        style={{ border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                                        onClick={async () => {
                                          await supabaseService.updateShopProduct(product.id, { is_active: !product.is_active });
                                          loadShopData();
                                        }}
                                      >
                                        {product.is_active ? 'Visible' : 'Hidden'}
                                      </button>
                                    </td>
                                    <td>
                                      <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn-reschedule" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => openEditProduct(product)}>Edit</button>
                                        <button className="btn-decline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleDeleteProduct(product)}>Delete</button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </>
            )}

            {/* ==================== PROMOS ==================== */}
            {tab === 'promos' && (
              <>
                <div className="addto-section-header">
                  <h2 className="addto-section-title">🎉 Promotions</h2>
                  <button className="btn-add-small" onClick={openAddPromo}>+ Add Promotion</button>
                </div>
                {promosLoading ? (
                  <div className="no-bookings"><p>Loading...</p></div>
                ) : promotions.length === 0 ? (
                  <p style={{ color: '#aaa', fontStyle: 'italic' }}>No promotions yet — click "+ Add Promotion" to create one</p>
                ) : (
                  promotions.map(promo => (
                    <div key={promo.id} className={`booking-card ${promo.is_active ? 'approved' : ''}`}>
                      <div className="card-header">
                        <h3 className="client-name">{promo.title}</h3>
                        <span className="status-pill" style={{ background: '#e8ede9', color: '#555', fontSize: '0.72rem' }}>
                          {promo.type === 'section' ? '🖼 Section' : '📢 Banner'}
                        </span>
                        <button
                          className={promo.is_active ? 'status-pill approved' : 'status-pill pending'}
                          style={{ border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                          onClick={() => handleTogglePromo(promo)}
                        >
                          {promo.is_active ? '✓ Live' : '○ Hidden'}
                        </button>
                      </div>
                      <div className="card-body">
                        {promo.type === 'section' && promo.image_url && (
                          <div className="info-row">
                            <span className="info-label">Image:</span>
                            <img src={promo.image_url} alt="Promo" style={{ height: '60px', borderRadius: '6px', objectFit: 'cover', maxWidth: '120px' }} />
                          </div>
                        )}
                        <div className="info-row">
                          <span className="info-label">Message:</span>
                          <span className="info-value">{promo.message}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Colour:</span>
                          <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '16px', height: '16px', borderRadius: '3px', background: promo.bg_color, border: '1px solid #ddd', display: 'inline-block' }} />
                            {promo.bg_color}
                          </span>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button className="btn-reschedule" onClick={() => openEditPromo(promo)}>✏️ Edit</button>
                        <button className="btn-decline" onClick={() => handleDeletePromo(promo)}>🗑️ Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* ==================== STOCK ==================== */}
            {tab === 'stock' && (
              <>
                <div className="addto-section-header">
                  <h2 className="addto-section-title">📦 Stock Levels</h2>
                  {Object.keys(stockEdits).filter(id => stockEdits[id] !== '' && stockEdits[id] !== undefined).length > 0 && (
                    <button
                      className="btn-approve"
                      style={{ padding: '8px 18px', fontSize: '0.85rem', fontWeight: 600 }}
                      onClick={async () => {
                        const edits = Object.entries(stockEdits).filter(([, v]) => v !== '' && v !== undefined);
                        if (edits.length === 0) return;
                        try {
                          await Promise.all(edits.map(([id, val]) => supabaseService.updateProductStock(id, val)));
                          setStockEdits({});
                          loadStockData();
                        } catch (err) {
                          alert('Failed to update some stock values.');
                        }
                      }}
                    >
                      Save All ({Object.keys(stockEdits).filter(id => stockEdits[id] !== '' && stockEdits[id] !== undefined).length})
                    </button>
                  )}
                </div>
                <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: '12px', marginTop: '-8px' }}>
                  Set stock quantities per product. Leave blank to mark as untracked (no stock limit shown to customers). Stock auto-deducts when you mark an order as fulfilled.
                </p>
                {stockProducts.some(p => p.stock !== null) && (
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {(() => {
                      const tracked = stockProducts.filter(p => p.stock !== null);
                      const outOfStock = tracked.filter(p => p.stock === 0);
                      const lowStock = tracked.filter(p => p.stock > 0 && p.stock <= 5);
                      return (
                        <>
                          <span style={{ background: outOfStock.length > 0 ? '#fdecea' : '#eaf5ea', color: outOfStock.length > 0 ? '#c0392b' : '#2e7d32', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
                            🚫 Out of stock: {outOfStock.length}
                          </span>
                          <span style={{ background: lowStock.length > 0 ? '#fff8e1' : '#eaf5ea', color: lowStock.length > 0 ? '#b8860b' : '#2e7d32', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
                            ⚠️ Low stock (≤5): {lowStock.length}
                          </span>
                          <span style={{ background: '#eaf5ea', color: '#2e7d32', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
                            ✓ Tracked: {tracked.length}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  style={{ width: '100%', border: '1px solid #ddd', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' }}
                />
                {stockLoading ? (
                  <div className="no-bookings"><p>Loading...</p></div>
                ) : stockProducts.length === 0 ? (
                  <p style={{ color: '#aaa', fontStyle: 'italic' }}>No products yet — add products in the "Add to" tab first.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(stockProducts.filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())).reduce((acc, p) => {
                      if (!acc[p.category]) acc[p.category] = [];
                      acc[p.category].push(p);
                      return acc;
                    }, {})).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => (
                      <div key={category} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                        <button
                          onClick={() => toggleCat('stock_' + category)}
                          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: expandedCats['stock_' + category] ? '#f0f4f1' : '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, color: '#2a4e3a' }}
                        >
                          <span>{category} ({items.length})</span>
                          <span style={{ fontSize: '0.8rem', color: '#888' }}>{(expandedCats['stock_' + category] || productSearch) ? '▼' : '▶'}</span>
                        </button>
                        {(expandedCats['stock_' + category] || productSearch) && (
                          <div className="products-table-wrap">
                            <table className="products-table">
                              <thead>
                                <tr>
                                  <th>Product</th>
                                  <th style={{ textAlign: 'center' }}>Status</th>
                                  <th style={{ textAlign: 'center' }}>Current</th>
                                  <th style={{ textAlign: 'center' }}>Set Stock</th>
                                </tr>
                              </thead>
                              <tbody>
                                {items.map(product => {
                                  const editVal = stockEdits[product.id] !== undefined ? stockEdits[product.id] : '';
                                  const isOutOfStock = product.stock !== null && product.stock === 0;
                                  const isLow = product.stock !== null && product.stock > 0 && product.stock <= 3;
                                  return (
                                    <tr key={product.id}>
                                      <td style={{ fontWeight: 600 }}>{product.name}</td>
                                      <td style={{ textAlign: 'center' }}>
                                        {product.stock === null ? (
                                          <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Untracked</span>
                                        ) : isOutOfStock ? (
                                          <span className="status-pill pending" style={{ fontSize: '0.75rem' }}>Out of stock</span>
                                        ) : isLow ? (
                                          <span style={{ fontSize: '0.75rem', background: '#fff3cd', color: '#856404', border: '1px solid #ffc107', borderRadius: '20px', padding: '2px 10px', fontWeight: 600 }}>Low — {product.stock} left</span>
                                        ) : (
                                          <span className="status-pill approved" style={{ fontSize: '0.75rem' }}>In stock</span>
                                        )}
                                      </td>
                                      <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '1rem', color: isOutOfStock ? '#c0392b' : '#2a4e3a' }}>
                                        {product.stock === null ? '—' : product.stock}
                                      </td>
                                      <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                                          <button
                                            style={{ width: '30px', height: '30px', border: '1px solid #ddd', borderRadius: '6px', background: '#f5f5f5', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, color: '#c0392b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            onClick={() => {
                                              const current = editVal !== '' ? Number(editVal) : (product.stock ?? 0);
                                              setStockEdits(prev => ({ ...prev, [product.id]: String(Math.max(0, current - 1)) }));
                                            }}
                                          >−</button>
                                          <input
                                            type="number"
                                            min="0"
                                            placeholder="qty"
                                            value={editVal}
                                            onChange={e => setStockEdits(prev => ({ ...prev, [product.id]: e.target.value }))}
                                            style={{ width: '52px', border: '1px solid #ddd', borderRadius: '6px', padding: '6px 4px', fontSize: '0.9rem', outline: 'none', textAlign: 'center' }}
                                          />
                                          <button
                                            style={{ width: '30px', height: '30px', border: '1px solid #ddd', borderRadius: '6px', background: '#f5f5f5', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, color: '#2a4e3a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            onClick={() => {
                                              const current = editVal !== '' ? Number(editVal) : (product.stock ?? 0);
                                              setStockEdits(prev => ({ ...prev, [product.id]: String(current + 1) }));
                                            }}
                                          >+</button>
                                          <button
                                            className="btn-approve"
                                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                            disabled={editVal === '' || editVal === undefined}
                                            onClick={async () => {
                                              try {
                                                await supabaseService.updateProductStock(product.id, editVal);
                                                setStockEdits(prev => { const n = { ...prev }; delete n[product.id]; return n; });
                                                loadStockData();
                                              } catch (err) {
                                                alert('Failed to update stock.');
                                              }
                                            }}
                                          >
                                            Set
                                          </button>
                                          {product.stock !== null && (
                                            <button
                                              className="btn-reschedule"
                                              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                              title="Remove stock tracking for this product"
                                              onClick={async () => {
                                                if (!window.confirm(`Remove stock tracking for "${product.name}"?`)) return;
                                                try {
                                                  await supabaseService.updateProductStock(product.id, null);
                                                  loadStockData();
                                                } catch (err) {
                                                  alert('Failed to update stock.');
                                                }
                                              }}
                                            >
                                              Untrack
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ==================== EMAIL BLAST ==================== */}
            {tab === 'email' && (
              <>
                <div className="addto-section-header">
                  <h2 className="addto-section-title">✉️ Email Blast</h2>
                </div>
                <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: '16px', marginTop: '-8px' }}>
                  Send a branded email to your customers. Select your audience, compose your message, preview, and send.
                </p>

                {/* Audience picker */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Audience</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[{ key: 'all', label: 'All Customers' }, { key: 'bookings', label: 'Booking Customers' }, { key: 'orders', label: 'Shop Customers' }].map(opt => (
                        <button
                          key={opt.key}
                          className={emailBlast.audience === opt.key ? 'status-pill approved' : 'status-pill pending'}
                          style={{ border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '6px 14px' }}
                          onClick={() => {
                            setEmailBlast(prev => ({ ...prev, audience: opt.key }));
                            loadEmailData(opt.key);
                          }}
                        >{opt.label}</button>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>
                      {emailsLoading ? 'Loading...' : `${customerEmails.length} recipient${customerEmails.length !== 1 ? 's' : ''}`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Subject Line *</label>
                    <input
                      type="text"
                      placeholder="e.g. New Products Available!"
                      value={emailBlast.subject}
                      onChange={e => setEmailBlast(prev => ({ ...prev, subject: e.target.value }))}
                      style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '9px 12px', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Email Image (optional)</label>
                    {emailBlast.imageUrl && (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={emailBlast.imageUrl} alt="Email" style={{ height: '80px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #ddd' }} />
                        <button onClick={() => setEmailBlast(prev => ({ ...prev, imageUrl: '' }))} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', lineHeight: '20px', textAlign: 'center', padding: 0 }}>×</button>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 12px', border: '1px dashed #6B9E7A', borderRadius: '6px', cursor: emailImageUploading ? 'not-allowed' : 'pointer', fontSize: '0.85rem', color: '#6B9E7A', background: '#f0f7f2', opacity: emailImageUploading ? 0.7 : 1 }}>
                        {emailImageUploading ? 'Uploading…' : '↑ Upload from computer'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} disabled={emailImageUploading} onChange={e => { if (e.target.files[0]) uploadEmailImage(e.target.files[0]); e.target.value = ''; }} />
                      </label>
                      <button type="button" style={{ padding: '9px 14px', border: '1px solid #6B9E7A', borderRadius: '6px', background: '#fff', color: '#6B9E7A', cursor: 'pointer', fontSize: '0.85rem' }}
                        onClick={() => { const next = !showEmailGallery; setShowEmailGallery(next); if (next) loadBannerImages(); }}
                      >
                        {showEmailGallery ? 'Hide gallery' : 'Browse uploads'}
                      </button>
                    </div>
                    {showEmailGallery && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '160px', overflowY: 'auto', padding: '8px', background: '#f9f9f9', borderRadius: '6px', border: '1px solid #eee' }}>
                        {bannerImages.length === 0 ? (
                          <span style={{ color: '#aaa', fontSize: '0.8rem' }}>No images uploaded yet.</span>
                        ) : bannerImages.map(img => (
                          <img key={img.name} src={img.url} alt={img.name} title={img.name}
                            onClick={() => { setEmailBlast(prev => ({ ...prev, imageUrl: img.url })); setShowEmailGallery(false); }}
                            style={{ height: '64px', width: '64px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: emailBlast.imageUrl === img.url ? '2px solid #6B9E7A' : '2px solid transparent' }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Message *</label>
                    <textarea
                      rows="8"
                      className="reschedule-textarea"
                      style={{ fontSize: '0.9rem' }}
                      placeholder="Write your message here. Each paragraph will be nicely formatted in the email."
                      value={emailBlast.body}
                      onChange={e => setEmailBlast(prev => ({ ...prev, body: e.target.value }))}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn-reschedule"
                      style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                      onClick={() => setEmailBlast(prev => ({ ...prev, preview: !prev.preview }))}
                    >{emailBlast.preview ? 'Hide Preview' : 'Preview Email'}</button>
                    <button
                      className="btn-approve"
                      style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                      disabled={!emailBlast.subject || !emailBlast.body || customerEmails.length === 0 || emailBlast.sending}
                      onClick={async () => {
                        if (!window.confirm(`Send this email to ${customerEmails.length} customer${customerEmails.length !== 1 ? 's' : ''}?`)) return;
                        setEmailBlast(prev => ({ ...prev, sending: true }));
                        try {
                          const imgHtml = emailBlast.imageUrl ? `<img src="${emailBlast.imageUrl}" alt="" style="width:100%;max-width:540px;border-radius:8px;margin:0 0 20px;" />` : '';
                          const bodyHtml = emailBlast.body.split('\n\n').map(p => `<p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">${p.replace(/\n/g, '<br>')}</p>`).join('');
                          const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f8f9fa;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;"><tr><td align="center" style="padding:20px;"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.08);max-width:600px;width:100%;"><tr><td style="background:#6B9E7A;padding:25px;text-align:center;"><h1 style="color:white;margin:0;font-size:22px;font-weight:600;letter-spacing:1px;">Beauty by Viktoria</h1><p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Beauty Therapy</p></td></tr><tr><td style="padding:30px 25px;">${imgHtml}${bodyHtml}</td></tr><tr><td style="padding:20px 25px;text-align:center;border-top:1px solid #eee;"><p style="color:#555;font-size:13px;margin:0 0 4px;"><a href="mailto:viktoriashouseofbeauty@gmail.com" style="color:#6B9E7A;text-decoration:none;">viktoriashouseofbeauty@gmail.com</a></p><p style="color:#555;font-size:13px;margin:0 0 12px;"><a href="tel:021881498" style="color:#6B9E7A;text-decoration:none;">021 881 498</a></p><p style="color:#999;font-size:11px;margin:0;">Beauty by Viktoria &bull; Richmond, New Zealand</p></td></tr></table></td></tr></table></body></html>`;
                          const recipients = customerEmails.map(c => c.email);
                          const result = await supabaseService.sendEmailBlast(emailBlast.subject, html, recipients);
                          alert(`Email sent to ${result.sent} customer${result.sent !== 1 ? 's' : ''}${result.failed > 0 ? ` (${result.failed} failed)` : ''}`);
                          setEmailBlast(prev => ({ ...prev, sending: false }));
                        } catch (err) {
                          alert('Failed to send email blast: ' + err.message);
                          setEmailBlast(prev => ({ ...prev, sending: false }));
                        }
                      }}
                    >{emailBlast.sending ? 'Sending...' : `Send to ${customerEmails.length} Customer${customerEmails.length !== 1 ? 's' : ''}`}</button>
                  </div>
                </div>

                {/* Preview */}
                {emailBlast.preview && (
                  <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
                    <div style={{ background: '#6B9E7A', padding: '20px', textAlign: 'center' }}>
                      <h2 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: 600 }}>Beauty by Viktoria</h2>
                      <p style={{ color: 'rgba(255,255,255,0.85)', margin: '6px 0 0', fontSize: '13px' }}>Beauty Therapy</p>
                    </div>
                    <div style={{ padding: '24px 20px' }}>
                      {emailBlast.imageUrl && <img src={emailBlast.imageUrl} alt="" style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }} />}
                      {emailBlast.body ? emailBlast.body.split('\n\n').map((p, i) => (
                        <p key={i} style={{ color: '#333', fontSize: '14px', lineHeight: 1.6, margin: '0 0 14px' }}>{p}</p>
                      )) : <p style={{ color: '#aaa', fontStyle: 'italic' }}>Your message will appear here...</p>}
                    </div>
                    <div style={{ padding: '16px 20px', textAlign: 'center', borderTop: '1px solid #eee' }}>
                      <p style={{ color: '#999', fontSize: '11px', margin: 0 }}>Beauty by Viktoria &bull; Richmond, New Zealand</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ==================== STATS ==================== */}
            {tab === 'stats' && (() => {
              const parsePrice = (p) => { const n = parseFloat((p || '').toString().replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; };
              const monthBookings = statsData.bookings;
              const monthOrders = statsData.orders;

              // Week start (Monday) helper
              const getWeekStart = (dateStr) => {
                const d = new Date(dateStr + 'T00:00:00');
                const day = d.getDay();
                const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(d.setDate(diff));
                return monday.toISOString().split('T')[0];
              };

              // Day of week (0=Sun, 1=Mon ... 6=Sat)
              const getDow = (dateStr) => new Date(dateStr + 'T00:00:00').getDay();
              const summersetDays = [2, 3, 4]; // Tue, Wed, Thu

              const summersetBookings = monthBookings.filter(b => summersetDays.includes(getDow(b.date)));
              const nonSummersetBookings = monthBookings.filter(b => !summersetDays.includes(getDow(b.date)));

              const summersetRevenue = summersetBookings.reduce((sum, b) => sum + parsePrice(b.total_price), 0);
              const nonSummersetRevenue = nonSummersetBookings.reduce((sum, b) => sum + parsePrice(b.total_price), 0);
              const totalBookingRevenue = summersetRevenue + nonSummersetRevenue;

              const orderRevenue = monthOrders.reduce((sum, o) => {
                return sum + (o.shop_order_items || []).reduce((s, i) => s + parsePrice(i.price) * (i.quantity || 1), 0);
              }, 0);
              const productsSold = monthOrders.reduce((sum, o) => sum + (o.shop_order_items || []).reduce((s, i) => s + (i.quantity || 1), 0), 0);

              const pct = parseFloat(summersetPercent) || 0;
              const summersetCut = summersetRevenue * (pct / 100);
              const netRevenue = totalBookingRevenue - summersetCut + orderRevenue;

              // Weekly breakdown
              const weeklyMap = {};
              monthBookings.forEach(b => {
                const week = getWeekStart(b.date);
                if (!weeklyMap[week]) weeklyMap[week] = { summerset: 0, other: 0, count: 0 };
                const price = parsePrice(b.total_price);
                weeklyMap[week].count++;
                if (summersetDays.includes(getDow(b.date))) {
                  weeklyMap[week].summerset += price;
                } else {
                  weeklyMap[week].other += price;
                }
              });

              // Get current week's bookings count
              const now = new Date();
              const currentWeekStart = getWeekStart(now.toISOString().split('T')[0]);
              const weekBookings = monthBookings.filter(b => getWeekStart(b.date) === currentWeekStart).length;

              const cardStyle = { flex: 1, background: '#f8f9fa', borderRadius: '10px', padding: '18px', textAlign: 'center', minWidth: '120px' };
              const cardValue = { fontSize: '1.8rem', fontWeight: 700, color: '#2a4e3a', margin: '4px 0' };
              const cardLabel = { fontSize: '0.8rem', color: '#888', margin: 0 };

              return (
                <>
                  <div className="addto-section-header">
                    <h2 className="addto-section-title">📊 Stats & Revenue</h2>
                    <input
                      type="month"
                      value={statsMonth}
                      onChange={e => setStatsMonth(e.target.value)}
                      style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '6px 12px', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>

                  {statsLoading ? (
                    <div className="no-bookings"><p>Loading...</p></div>
                  ) : (
                    <>
                      {/* Overview cards */}
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                        <div style={cardStyle}>
                          <p style={cardLabel}>This Week</p>
                          <p style={cardValue}>{weekBookings}</p>
                          <p style={cardLabel}>bookings</p>
                        </div>
                        <div style={cardStyle}>
                          <p style={cardLabel}>This Month</p>
                          <p style={cardValue}>{monthBookings.length}</p>
                          <p style={cardLabel}>bookings</p>
                        </div>
                        <div style={cardStyle}>
                          <p style={cardLabel}>Booking Revenue</p>
                          <p style={cardValue}>${totalBookingRevenue.toFixed(0)}</p>
                          <p style={cardLabel}>this month</p>
                        </div>
                        <div style={cardStyle}>
                          <p style={cardLabel}>Products Sold</p>
                          <p style={cardValue}>{productsSold}</p>
                          <p style={cardLabel}>${orderRevenue.toFixed(0)} revenue</p>
                        </div>
                      </div>

                      {/* Summerset section */}
                      <div style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '20px', marginBottom: '16px' }}>
                        <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#2a4e3a' }}>Summerset (Tue / Wed / Thu)</h3>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
                          <div>
                            <span style={{ fontSize: '0.85rem', color: '#666' }}>Bookings: </span>
                            <strong>{summersetBookings.length}</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', color: '#666' }}>Revenue: </span>
                            <strong style={{ color: '#6B9E7A' }}>${summersetRevenue.toFixed(2)}</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#666' }}>Summerset %: </span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="%"
                              value={summersetPercent}
                              onChange={e => setSummersetPercent(e.target.value)}
                              style={{ width: '60px', border: '1px solid #ddd', borderRadius: '6px', padding: '6px 8px', fontSize: '0.9rem', outline: 'none', textAlign: 'center' }}
                            />
                          </div>
                          {pct > 0 && (
                            <>
                              <div>
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>Summerset cut: </span>
                                <strong style={{ color: '#c0392b' }}>-${summersetCut.toFixed(2)}</strong>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>Take-home: </span>
                                <strong style={{ color: '#2a4e3a' }}>${(summersetRevenue - summersetCut).toFixed(2)}</strong>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Non-Summerset section */}
                      <div style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '20px', marginBottom: '16px' }}>
                        <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#2a4e3a' }}>Other Days (Mon / Fri / Sat / Sun)</h3>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <div>
                            <span style={{ fontSize: '0.85rem', color: '#666' }}>Bookings: </span>
                            <strong>{nonSummersetBookings.length}</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', color: '#666' }}>Revenue: </span>
                            <strong style={{ color: '#6B9E7A' }}>${nonSummersetRevenue.toFixed(2)}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Weekly breakdown table */}
                      {Object.keys(weeklyMap).length > 0 && (
                        <div style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '20px', marginBottom: '16px' }}>
                          <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#2a4e3a' }}>Weekly Breakdown</h3>
                          <div className="products-table-wrap">
                            <table className="products-table">
                              <thead>
                                <tr>
                                  <th>Week Starting</th>
                                  <th style={{ textAlign: 'center' }}>Bookings</th>
                                  <th style={{ textAlign: 'right' }}>Summerset</th>
                                  <th style={{ textAlign: 'right' }}>Other</th>
                                  <th style={{ textAlign: 'right' }}>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(weeklyMap).sort(([a], [b]) => a.localeCompare(b)).map(([week, data]) => (
                                  <tr key={week}>
                                    <td>{new Date(week + 'T00:00:00').toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}</td>
                                    <td style={{ textAlign: 'center' }}>{data.count}</td>
                                    <td style={{ textAlign: 'right', color: '#888' }}>${data.summerset.toFixed(0)}</td>
                                    <td style={{ textAlign: 'right', color: '#888' }}>${data.other.toFixed(0)}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#2a4e3a' }}>${(data.summerset + data.other).toFixed(0)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Monthly totals */}
                      <div style={{ background: '#f0f4f1', borderRadius: '10px', padding: '20px' }}>
                        <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#2a4e3a' }}>Monthly Summary</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Booking revenue</span>
                            <strong>${totalBookingRevenue.toFixed(2)}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Shop order revenue</span>
                            <strong>${orderRevenue.toFixed(2)}</strong>
                          </div>
                          {pct > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c0392b' }}>
                              <span>Summerset deduction ({pct}%)</span>
                              <strong>-${summersetCut.toFixed(2)}</strong>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #2a4e3a', paddingTop: '10px', marginTop: '4px', fontSize: '1.1rem' }}>
                            <strong style={{ color: '#2a4e3a' }}>Net Revenue</strong>
                            <strong style={{ color: '#2a4e3a' }}>${netRevenue.toFixed(2)}</strong>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              );
            })()}

          </div>
        </div>
      </div>

      {/* ==================== APPROVAL MODAL ==================== */}
      {approvalModal.isOpen && (
        <div className="modal-overlay" onClick={closeApprovalModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Set Appointment Time</h2>
              <button className="modal-close" onClick={closeApprovalModal}>×</button>
            </div>

            <div className="modal-body">
              <p className="modal-client-name">
                <strong>{approvalModal.booking?.name}</strong>
              </p>
              <p className="modal-info">
                {formatDate(approvalModal.booking?.date)}
              </p>
              <p className="modal-info available-window">
                Client is available: <strong>{formatTimeRange(
                  approvalModal.booking?.time_range_start,
                  approvalModal.booking?.time_range_end
                )}</strong>
              </p>

              {/* Client Type Selector */}
              <div className="client-type-selector">
                <label className="selector-label">Client type (for email template):</label>
                <div className="client-type-options">
                  <button
                    type="button"
                    className={`client-type-btn ${approvalModal.clientType === 'returning' ? 'active returning' : ''}`}
                    onClick={() => setApprovalModal(prev => ({ ...prev, clientType: 'returning' }))}
                  >
                    🔁 Returning Client
                  </button>
                  <button
                    type="button"
                    className={`client-type-btn ${approvalModal.clientType === 'new' ? 'active new' : ''}`}
                    onClick={() => setApprovalModal(prev => ({ ...prev, clientType: 'new' }))}
                  >
                    ⭐ New Client
                  </button>
                </div>
              </div>

              {/* Calendar in Modal */}
              <div className="modal-calendar-section">
                <div className="modal-calendar-header">
                  <span className="modal-calendar-label">📅 Check Your Schedule</span>
                  <div className="modal-calendar-toggle">
                    <button
                      type="button"
                      className={`modal-toggle-btn ${viewMode === 'WEEK' ? 'active' : ''}`}
                      onClick={() => setViewMode('WEEK')}
                    >
                      Week
                    </button>
                    <button
                      type="button"
                      className={`modal-toggle-btn ${viewMode === 'AGENDA' ? 'active' : ''}`}
                      onClick={() => setViewMode('AGENDA')}
                    >
                      List
                    </button>
                  </div>
                </div>
                <div className="modal-calendar-embed">
                  <iframe
                    key={viewMode}
                    src={calendarEmbedUrl}
                    className="modal-calendar-iframe"
                    title="Your Schedule"
                  />
                </div>
              </div>

              <div className="modal-time-picker">
                <label htmlFor="appointment-time">Choose appointment time (15-min intervals):</label>
                <select
                  id="appointment-time"
                  value={approvalModal.selectedTime}
                  onChange={(e) => setApprovalModal(prev => ({
                    ...prev,
                    selectedTime: e.target.value
                  }))}
                  className="time-select"
                >
                  <option value="">-- Select time --</option>
                  {timeOptions.map(time => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-modal-approve" onClick={handleApproveWithTime}>
                ✓ Confirm Booking
              </button>
              <button className="btn-modal-cancel" onClick={closeApprovalModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== RESCHEDULE MODAL ==================== */}
      {rescheduleModal.isOpen && (
        <div className="modal-overlay" onClick={closeRescheduleModal}>
          <div className="modal-content reschedule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Suggest a Different Time</h2>
              <button className="modal-close" onClick={closeRescheduleModal}>×</button>
            </div>

            <div className="modal-body">
              <p className="modal-client-name">
                <strong>{rescheduleModal.booking?.name}</strong>
              </p>
              <p className="modal-info">
                Requested: {formatDate(rescheduleModal.booking?.date)}, {formatTimeRange(
                  rescheduleModal.booking?.time_range_start,
                  rescheduleModal.booking?.time_range_end
                )}
              </p>

              <div className="reschedule-form">
                <label htmlFor="reschedule-message">
                  Message to client:
                </label>
                <textarea
                  id="reschedule-message"
                  value={rescheduleModal.message}
                  onChange={(e) => setRescheduleModal(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Edit the message above..."
                  rows="7"
                  className="reschedule-textarea"
                />
                <p className="reschedule-hint">
                  This message will be emailed to {rescheduleModal.booking?.name} along with their appointment details.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-modal-reschedule" onClick={handleReschedule}>
                🔄 Send Reschedule Request
              </button>
              <button className="btn-modal-cancel" onClick={closeRescheduleModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ORDER RESPONSE MODAL ==================== */}
      {orderModal.isOpen && (
        <div className="modal-overlay" onClick={closeOrderModal}>
          <div className="modal-content reschedule-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Respond to Order</h2>
              <button className="modal-close" onClick={closeOrderModal}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-client-name"><strong>{orderModal.order?.customer_name}</strong></p>
              <p className="modal-info">{orderModal.order?.email} — {orderModal.order?.fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}</p>
              <div className="reschedule-form">
                <label htmlFor="order-response-msg">Message to customer:</label>
                <textarea
                  id="order-response-msg"
                  value={orderModal.message}
                  onChange={e => setOrderModal(prev => ({ ...prev, message: e.target.value }))}
                  rows="8"
                  className="reschedule-textarea"
                />
                <p className="reschedule-hint">This message will be emailed to {orderModal.order?.customer_name}.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-approve" onClick={handleOrderResponse}>📧 Send Response</button>
              <button className="btn-modal-cancel" onClick={closeOrderModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PRODUCT MODAL ==================== */}
      {productModal.isOpen && (
        <div className="modal-overlay" onClick={closeProductModal}>
          <div className="modal-content reschedule-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{productModal.editing ? 'Edit Product' : 'Add Product'}</h2>
              <button className="modal-close" onClick={closeProductModal}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Product Name *', key: 'name', placeholder: 'e.g. Daily Microfoliant' },
                { label: 'Description', key: 'description', placeholder: 'Short product description', multi: true },
                { label: 'Display Order', key: 'display_order', type: 'number' },
              ].map(({ label, key, placeholder, multi, type }) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>{label}</label>
                  {multi ? (
                    <textarea
                      rows="3"
                      className="reschedule-textarea"
                      style={{ fontSize: '0.9rem' }}
                      value={productModal.form[key]}
                      placeholder={placeholder}
                      onChange={e => setProductModal(prev => ({ ...prev, form: { ...prev.form, [key]: e.target.value } }))}
                    />
                  ) : (
                    <input
                      type={type || 'text'}
                      style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '9px 12px', fontSize: '0.9rem', outline: 'none' }}
                      value={productModal.form[key]}
                      placeholder={placeholder}
                      onChange={e => setProductModal(prev => ({ ...prev, form: { ...prev.form, [key]: type === 'number' ? Number(e.target.value) : e.target.value } }))}
                    />
                  )}
                </div>
              ))}

              {/* Product image upload */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Product Image</label>
                {productModal.form.image_url && (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={productModal.form.image_url} alt="Product" style={{ height: '80px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #ddd' }} />
                    <button onClick={() => setProductModal(prev => ({ ...prev, form: { ...prev.form, image_url: '' } }))} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', lineHeight: '20px', textAlign: 'center', padding: 0 }}>×</button>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 12px', border: '1px dashed #6B9E7A', borderRadius: '6px', cursor: productImageUploading ? 'not-allowed' : 'pointer', fontSize: '0.85rem', color: '#6B9E7A', background: '#f0f7f2', opacity: productImageUploading ? 0.7 : 1 }}>
                    {productImageUploading ? 'Uploading…' : '↑ Upload from computer'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} disabled={productImageUploading} onChange={e => { if (e.target.files[0]) uploadProductImage(e.target.files[0]); e.target.value = ''; }} />
                  </label>
                  <button type="button" style={{ padding: '9px 14px', border: '1px solid #6B9E7A', borderRadius: '6px', background: '#fff', color: '#6B9E7A', cursor: 'pointer', fontSize: '0.85rem' }}
                    onClick={() => { const next = !showProductGallery; setShowProductGallery(next); if (next) loadBannerImages(); }}
                  >
                    {showProductGallery ? 'Hide gallery' : 'Browse uploads'}
                  </button>
                </div>
                {showProductGallery && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '160px', overflowY: 'auto', padding: '8px', background: '#f9f9f9', borderRadius: '6px', border: '1px solid #eee' }}>
                    {bannerImages.length === 0 ? (
                      <span style={{ color: '#aaa', fontSize: '0.8rem' }}>No images uploaded yet.</span>
                    ) : bannerImages.map(img => (
                      <img key={img.name} src={img.url} alt={img.name} title={img.name}
                        onClick={() => { setProductModal(prev => ({ ...prev, form: { ...prev.form, image_url: img.url } })); setShowProductGallery(false); }}
                        style={{ height: '64px', width: '64px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: productModal.form.image_url === img.url ? '2px solid #6B9E7A' : '2px solid transparent' }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Category dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Category *</label>
                {productModal.form.category === '__new__' || (productModal.form.category && !existingCategories.includes(productModal.form.category) && productModal.editing) ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      style={{ flex: 1, border: '1px solid #ddd', borderRadius: '6px', padding: '9px 12px', fontSize: '0.9rem', outline: 'none' }}
                      value={productModal.form.category === '__new__' ? '' : productModal.form.category}
                      placeholder="Enter new category name"
                      autoFocus
                      onChange={e => setProductModal(prev => ({ ...prev, form: { ...prev.form, category: e.target.value } }))}
                    />
                    {existingCategories.length > 0 && (
                      <button
                        type="button"
                        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', background: '#f5f5f5', cursor: 'pointer', fontSize: '0.85rem' }}
                        onClick={() => setProductModal(prev => ({ ...prev, form: { ...prev.form, category: existingCategories[0] } }))}
                      >Cancel</button>
                    )}
                  </div>
                ) : (
                  <select
                    style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '9px 12px', fontSize: '0.9rem', outline: 'none', background: '#fff' }}
                    value={productModal.form.category}
                    onChange={e => setProductModal(prev => ({ ...prev, form: { ...prev.form, category: e.target.value } }))}
                  >
                    {existingCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__new__">+ New category...</option>
                  </select>
                )}
              </div>

              {/* Price field with $ prefix */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Price *</label>
                <input
                  type="text"
                  style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '9px 12px', fontSize: '0.9rem', outline: 'none' }}
                  value={productModal.form.price}
                  placeholder="$45"
                  onChange={e => {
                    let val = e.target.value;
                    if (!val.startsWith('$')) val = '$' + val.replace('$', '');
                    setProductModal(prev => ({ ...prev, form: { ...prev.form, price: val } }));
                  }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={productModal.form.is_active}
                  onChange={e => setProductModal(prev => ({ ...prev, form: { ...prev.form, is_active: e.target.checked } }))}
                />
                Visible on shop page
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-approve" onClick={handleSaveProduct}>
                {productModal.editing ? '✓ Save Changes' : '+ Add Product'}
              </button>
              <button className="btn-modal-cancel" onClick={closeProductModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PROMO MODAL ==================== */}
      {promoModal.isOpen && (
        <div className="modal-overlay" onClick={closePromoModal}>
          <div className="modal-content reschedule-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{promoModal.editing ? 'Edit Promotion' : 'Add Promotion'}</h2>
              <button className="modal-close" onClick={closePromoModal}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Type selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Promo type *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[{ val: 'banner', label: '📢 Banner', desc: 'Thin strip at the top of every page' }, { val: 'section', label: '🖼 Section', desc: 'Photo + text card on Home & Shop pages' }].map(({ val, label, desc }) => (
                    <label
                      key={val}
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', padding: '10px 12px', border: `2px solid ${promoModal.form.type === val ? '#6B9E7A' : '#ddd'}`, borderRadius: '8px', cursor: 'pointer', background: promoModal.form.type === val ? '#f0f7f2' : '#fff', transition: 'all 0.15s' }}
                    >
                      <input type="radio" name="promo-type" value={val} checked={promoModal.form.type === val} onChange={() => setPromoModal(prev => ({ ...prev, form: { ...prev.form, type: val } }))} style={{ display: 'none' }} />
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</span>
                      <span style={{ fontSize: '0.75rem', color: '#888' }}>{desc}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Title *</label>
                <input
                  type="text"
                  style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '9px 12px', fontSize: '0.9rem', outline: 'none' }}
                  placeholder="e.g. 🌿 Spring Special!"
                  value={promoModal.form.title}
                  onChange={e => setPromoModal(prev => ({ ...prev, form: { ...prev.form, title: e.target.value } }))}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Message *</label>
                <textarea
                  rows="3"
                  className="reschedule-textarea"
                  style={{ fontSize: '0.9rem' }}
                  placeholder="e.g. 20% off all facials this month — book now!"
                  value={promoModal.form.message}
                  onChange={e => setPromoModal(prev => ({ ...prev, form: { ...prev.form, message: e.target.value } }))}
                />
              </div>
              {promoModal.form.type === 'section' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Photo (optional)</label>

                  {/* Preview of currently selected image */}
                  {promoModal.form.image_url && (
                    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#f5f5f5', lineHeight: 0 }}>
                      <img
                        src={promoModal.form.image_url}
                        alt="Banner preview"
                        style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', display: 'block' }}
                      />
                      <button
                        onClick={() => setPromoModal(prev => ({ ...prev, form: { ...prev.form, image_url: '' } }))}
                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', fontSize: '16px', lineHeight: '26px', textAlign: 'center', padding: 0 }}
                      >×</button>
                    </div>
                  )}

                  {/* Upload + browse row */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 12px', border: '1px dashed #6B9E7A', borderRadius: '6px', cursor: bannerUploading ? 'not-allowed' : 'pointer', fontSize: '0.85rem', color: '#6B9E7A', background: '#f0f7f2', opacity: bannerUploading ? 0.7 : 1 }}>
                      {bannerUploading ? 'Uploading…' : '↑ Upload from computer'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={bannerUploading}
                        onChange={e => { if (e.target.files[0]) uploadBannerImage(e.target.files[0]); e.target.value = ''; }}
                      />
                    </label>
                    <button
                      onClick={() => { const next = !showBannerGallery; setShowBannerGallery(next); if (next) loadBannerImages(); }}
                      style={{ padding: '9px 12px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', fontSize: '0.85rem', cursor: 'pointer', color: '#555', whiteSpace: 'nowrap' }}
                    >
                      {showBannerGallery ? 'Hide gallery' : 'Browse uploads'}
                    </button>
                  </div>

                  {/* Previously uploaded images gallery */}
                  {showBannerGallery && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', maxHeight: '210px', overflowY: 'auto', padding: '6px', border: '1px solid #eee', borderRadius: '8px', background: '#fafafa' }}>
                      {bannerImages.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#aaa', fontSize: '0.8rem', padding: '24px 0' }}>No images uploaded yet</div>
                      ) : bannerImages.map(img => (
                        <button
                          key={img.name}
                          onClick={() => { setPromoModal(prev => ({ ...prev, form: { ...prev.form, image_url: img.url } })); setShowBannerGallery(false); }}
                          style={{ padding: 0, border: `2px solid ${promoModal.form.image_url === img.url ? '#6B9E7A' : 'transparent'}`, borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', background: 'none', aspectRatio: '16/9', display: 'block' }}
                          title={img.name}
                        >
                          <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Background colour</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    value={promoModal.form.bg_color}
                    onChange={e => setPromoModal(prev => ({ ...prev, form: { ...prev.form, bg_color: e.target.value } }))}
                    style={{ width: '44px', height: '36px', border: '1px solid #ddd', borderRadius: '6px', padding: '2px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>{promoModal.form.bg_color}</span>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={promoModal.form.is_active}
                  onChange={e => setPromoModal(prev => ({ ...prev, form: { ...prev.form, is_active: e.target.checked } }))}
                />
                Make live immediately
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-approve" onClick={handleSavePromo}>
                {promoModal.editing ? '✓ Save Changes' : '+ Add Promotion'}
              </button>
              <button className="btn-modal-cancel" onClick={closePromoModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== REBOOK MODAL ==================== */}
      {rebookModal.isOpen && (
        <div className="modal-overlay" onClick={closeRebookModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2>🔁 Create Rebook Booking</h2>
              <button className="modal-close" onClick={closeRebookModal}>×</button>
            </div>

            <div className="modal-body">
              {/* Client info strip */}
              {rebookModal.sourceBooking && (
                <div style={{ background: '#f0f4f1', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.9rem', color: '#444' }}>
                  <strong>{rebookModal.sourceBooking.name || selectedRebookClient?.name}</strong>
                  {(rebookModal.sourceBooking.email || selectedRebookClient?.email) && (
                    <> · <a href={`mailto:${rebookModal.sourceBooking.email || selectedRebookClient?.email}`}>{rebookModal.sourceBooking.email || selectedRebookClient?.email}</a></>
                  )}
                  {(rebookModal.sourceBooking.phone || selectedRebookClient?.phone) && (
                    <> · <a href={`tel:${rebookModal.sourceBooking.phone || selectedRebookClient?.phone}`}>{rebookModal.sourceBooking.phone || selectedRebookClient?.phone}</a></>
                  )}
                </div>
              )}

              {/* Treatment selection */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: '8px' }}>Treatments</label>
                {Object.keys(rebookTreatments.grouped).length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#888' }}>Loading treatments...</p>
                ) : (
                  Object.entries(rebookTreatments.grouped).map(([category, treatments]) => (
                    <div key={category} style={{ marginBottom: '8px' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{category}</p>
                      {treatments.map(t => {
                        const isSelected = rebookModal.form.selectedTreatments.some(s => s.id === t.id);
                        return (
                          <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setRebookModal(prev => ({
                                  ...prev,
                                  form: {
                                    ...prev.form,
                                    selectedTreatments: isSelected
                                      ? prev.form.selectedTreatments.filter(s => s.id !== t.id)
                                      : [...prev.form.selectedTreatments, t]
                                  }
                                }));
                              }}
                            />
                            <span>{t.name}</span>
                            <span style={{ marginLeft: 'auto', color: '#888', fontSize: '0.85rem' }}>
                              {t.duration_minutes ? `${t.duration_minutes} min` : ''}{t.price ? ` · ${t.price}` : ''}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Running totals bar */}
              {(() => {
                const selected = rebookModal.form.selectedTreatments;
                const totalDur = selected.reduce((sum, t) => sum + (t.duration_minutes || 0), 0);
                const totalPr = selected.reduce((sum, t) => {
                  const n = parseFloat((t.price || '').toString().replace(/[^0-9.]/g, ''));
                  return sum + (isNaN(n) ? 0 : n);
                }, 0);
                if (selected.length === 0) return null;
                return (
                  <div style={{ background: '#f0f4f1', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', display: 'flex', gap: '16px', fontSize: '0.9rem', color: '#2a4e3a', fontWeight: 600 }}>
                    <span>⏱ {totalDur} min</span>
                    <span>💰 {totalPr > 0 ? `$${totalPr.toFixed(0)}` : 'POA'}</span>
                  </div>
                );
              })()}

              {/* Date picker */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: '4px' }}>Date *</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={rebookModal.form.date}
                  onChange={e => {
                    const val = e.target.value;
                    const dur = rebookModal.form.selectedTreatments.reduce((sum, t) => sum + (t.duration_minutes || 0), 0);
                    const autoTime = getNextAvailableTime(val, dur || 60);
                    setRebookModal(prev => ({ ...prev, form: { ...prev.form, date: val, time: autoTime } }));
                  }}
                  style={{ width: '100%', border: '1px solid #ddd', borderRadius: '6px', padding: '8px 12px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Conflict warning */}
              {rebookModal.form.date && rebookModal.form.time && (() => {
                const dur = rebookModal.form.selectedTreatments.reduce((sum, t) => sum + (t.duration_minutes || 0), 0);
                const conflicts = getConflictsForSlot(rebookModal.form.date, rebookModal.form.time, dur || 60);
                if (conflicts.length === 0) return null;
                return (
                  <div style={{ background: '#fff9e6', border: '1px solid #f0c040', borderRadius: '6px', padding: '10px 14px', marginBottom: '12px', fontSize: '0.85rem', color: '#856404' }}>
                    ⚠️ Conflict: {conflicts.map(c => c.name).join(', ')} {conflicts.length === 1 ? 'is' : 'are'} already booked at this time
                  </div>
                );
              })()}

              {/* Time dropdown */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: '4px' }}>Time *</label>
                <select
                  value={rebookModal.form.time}
                  onChange={e => setRebookModal(prev => ({ ...prev, form: { ...prev.form, time: e.target.value } }))}
                  style={{ width: '100%', border: '1px solid #ddd', borderRadius: '6px', padding: '8px 12px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                >
                  <option value="">-- Select a time --</option>
                  {generateTimeOptions('08:00', '19:00').map(t => (
                    <option key={t} value={t}>{formatTime(t)}</option>
                  ))}
                </select>
              </div>

              {/* Client type */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: '4px' }}>Client Type</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['returning', 'new'].map(ct => (
                    <button
                      key={ct}
                      onClick={() => setRebookModal(prev => ({ ...prev, form: { ...prev.form, clientType: ct } }))}
                      style={{ flex: 1, padding: '8px', border: `1px solid ${rebookModal.form.clientType === ct ? '#6B9E7A' : '#ddd'}`, borderRadius: '6px', background: rebookModal.form.clientType === ct ? '#f0f4f1' : '#fff', color: rebookModal.form.clientType === ct ? '#2a4e3a' : '#666', fontWeight: rebookModal.form.clientType === ct ? 600 : 400, cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      {ct === 'returning' ? '🔁 Returning' : '⭐ New'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: '4px' }}>Notes</label>
                <textarea
                  value={rebookModal.form.notes}
                  onChange={e => setRebookModal(prev => ({ ...prev, form: { ...prev.form, notes: e.target.value } }))}
                  rows="3"
                  className="reschedule-textarea"
                  placeholder="Any notes for this appointment..."
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-modal-approve"
                onClick={handleRebookSubmit}
                disabled={rebookSubmitting}
              >
                {rebookSubmitting ? 'Creating...' : '✓ Create & Confirm Booking'}
              </button>
              <button className="btn-modal-cancel" onClick={closeRebookModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DECLINE MODAL ==================== */}
      {declineModal.isOpen && (
        <div className="modal-overlay" onClick={closeDeclineModal}>
          <div className="modal-content reschedule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Decline Booking Request</h2>
              <button className="modal-close" onClick={closeDeclineModal}>×</button>
            </div>

            <div className="modal-body">
              <p className="modal-client-name">
                <strong>{declineModal.booking?.name}</strong>
              </p>
              <p className="modal-info">
                Requested: {formatDate(declineModal.booking?.date)}, {formatTimeRange(
                  declineModal.booking?.time_range_start,
                  declineModal.booking?.time_range_end
                )}
              </p>

              <div className="reschedule-form">
                <label htmlFor="decline-message">
                  Optional message to client:
                </label>
                <textarea
                  id="decline-message"
                  value={declineModal.message}
                  onChange={(e) => setDeclineModal(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Add a personal message (optional)..."
                  rows="4"
                  className="reschedule-textarea"
                />
                <p className="reschedule-hint">
                  If you send an email, {declineModal.booking?.name} will receive a notification with your message and their appointment details.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-modal-decline" onClick={handleDeclineWithMessage}>
                ✕ Decline & Send Email
              </button>
              <button className="btn-modal-decline" style={{ background: '#6b7280' }} onClick={handleDeclineWithoutEmail}>
                ✕ Decline Without Email
              </button>
              <button className="btn-modal-cancel" onClick={closeDeclineModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;