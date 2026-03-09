import { supabase } from '../config/supabase';

const supabaseService = {
  // ==================== BOOKINGS ====================

  async getBookings({ status, search } = {}) {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        booking_treatments (
          id,
          treatment_name,
          duration_minutes,
          price
        )
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },

  async getTodaysBookings() {
    // Get today's date in NZ timezone
    const today = new Date().toLocaleDateString('en-NZ', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-'); // Convert DD/MM/YYYY to YYYY-MM-DD

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        booking_treatments (
          id,
          treatment_name,
          duration_minutes,
          price
        )
      `)
      .eq('date', today)
      .eq('status', 'approved')
      .not('time', 'is', null)
      .order('time', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  },

  async createBooking({ name, email, phone, date, time_range_start, time_range_end, notes, treatments, marketing_consent }) {
    let totalDuration = 0;
    let totalPrice = 0;
    const treatmentNames = [];

    treatments.forEach(t => {
      if (t.duration_minutes) totalDuration += t.duration_minutes;
      const priceNum = parseFloat(t.price.replace(/[^0-9.]/g, ''));
      if (!isNaN(priceNum)) totalPrice += priceNum;
      treatmentNames.push(t.name);
    });

    const totalPriceStr = totalPrice > 0 ? `$${totalPrice}` : 'POA';
    const bookingId = crypto.randomUUID();

    const { error: bookingError } = await supabase
      .from('bookings')
      .insert({
        id: bookingId,
        name,
        email,
        phone,
        date,
        time_range_start,
        time_range_end,
        time: null,
        notes,
        appointment_type: 'new',
        reminder_preference: 'email',
        total_duration: totalDuration || null,
        total_price: totalPriceStr,
        status: 'pending',
        marketing_consent: marketing_consent || false
      });

    if (bookingError) throw new Error(bookingError.message);

    const bookingTreatments = treatments.map(t => ({
      booking_id: bookingId,
      treatment_id: t.id,
      treatment_name: t.name,
      duration_minutes: t.duration_minutes,
      price: t.price
    }));

    const { error: treatmentsError } = await supabase
      .from('booking_treatments')
      .insert(bookingTreatments);

    if (treatmentsError) throw new Error(treatmentsError.message);

    return { id: bookingId };
  },

  async updateBookingStatus(id, status, { finalTime, clientType, rescheduleMessage, calendarEventId } = {}) {
    const updates = { status };

    if (status === 'approved' && finalTime) {
      updates.time = finalTime;
    }
    if (clientType) {
      updates.client_type = clientType;
    }
    if (status === 'rescheduled' && rescheduleMessage) {
      updates.reschedule_message = rescheduleMessage;
    }
    if (calendarEventId) {
      updates.calendar_event_id = calendarEventId;
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // ==================== TREATMENTS ====================

  async getTreatments() {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw new Error(error.message);

    const grouped = {};
    data.forEach(t => {
      if (!grouped[t.category]) {
        grouped[t.category] = [];
      }
      grouped[t.category].push(t);
    });

    return { all: data, grouped };
  },

  // ==================== REBOOKING ====================

  async getRebookingData(bookingId) {
    const { data, error } = await supabase.rpc('get_rebooking', {
      booking_uuid: bookingId
    });

    if (error) throw new Error(error.message);
    return data;
  },

  async submitRebooking(bookingId, { date, time_range_start, time_range_end, notes }) {
    const { data, error } = await supabase.rpc('submit_rebooking', {
      booking_uuid: bookingId,
      new_date: date,
      new_time_range_start: time_range_start,
      new_time_range_end: time_range_end,
      new_notes: notes || null
    });

    if (error) throw new Error(error.message);
    return data;
  },

  // ==================== NOTIFICATIONS ====================

  async sendNotification(action, bookingData) {
    try {
      const url = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/booking-notification`;
      console.log('Calling Edge Function:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ action, booking: bookingData }),
      });

      const data = await response.json();
      console.log('Edge Function response:', response.status, data);

      if (!response.ok) {
        console.error('Edge Function error:', data);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Failed to send notification:', err);
      return null;
    }
  },

  // ==================== SHOP PRODUCTS ====================

  async getShopProducts() {
    const { data, error } = await supabase
      .from('shop_products')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  },

  async getAllShopProducts() {
    const { data, error } = await supabase
      .from('shop_products')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  },

  async createShopProduct({ name, description, price, category, image_url, is_active, display_order }) {
    const { data, error } = await supabase
      .from('shop_products')
      .insert({ name, description, price, category, image_url, is_active: is_active ?? true, display_order: display_order ?? 0 })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateShopProduct(id, updates) {
    const { data, error } = await supabase
      .from('shop_products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteShopProduct(id) {
    const { error } = await supabase
      .from('shop_products')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // ==================== STOCK ====================

  async updateProductStock(id, stock) {
    // stock = null means untracked, any number means tracked
    const { data, error } = await supabase
      .from('shop_products')
      .update({ stock: stock === '' || stock === null ? null : Number(stock) })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deductStockForOrder(orderItems) {
    // orderItems: array of { product_id, quantity } from shop_order_items
    for (const item of orderItems) {
      if (!item.product_id) continue;
      const { data: product, error } = await supabase
        .from('shop_products')
        .select('stock')
        .eq('id', item.product_id)
        .single();
      if (error || product == null || product.stock === null) continue; // null = untracked, skip
      const newStock = Math.max(0, product.stock - item.quantity);
      const { error: updateErr } = await supabase
        .from('shop_products')
        .update({ stock: newStock })
        .eq('id', item.product_id);
      if (updateErr) console.error('Stock deduct failed for', item.product_id, updateErr);
    }
  },

  // ==================== SHOP ORDERS ====================

  async getShopOrders() {
    const { data, error } = await supabase
      .from('shop_orders')
      .select(`*, shop_order_items(*)`)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },

  async createShopOrder({ customer_name, email, fulfillment, address, notes, items, marketing_consent }) {
    const orderId = crypto.randomUUID();
    const { error: orderError } = await supabase
      .from('shop_orders')
      .insert({ id: orderId, customer_name, email, fulfillment, address, notes, marketing_consent: marketing_consent || false });
    if (orderError) throw new Error(orderError.message);

    const orderItems = items.map(item => ({
      order_id: orderId,
      product_id: item.id || null,
      product_name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('shop_order_items')
      .insert(orderItems);
    if (itemsError) throw new Error(itemsError.message);

    return { id: orderId };
  },

  async updateShopOrderStatus(id, status, responseMessage) {
    const updates = { status };
    if (responseMessage) updates.response_message = responseMessage;
    const { data, error } = await supabase
      .from('shop_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteShopOrder(id) {
    await supabase.from('shop_order_items').delete().eq('order_id', id);
    const { error } = await supabase.from('shop_orders').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // ==================== GIFT VOUCHERS ====================

  async createGiftVoucher({ purchaser_name, purchaser_email, purchaser_phone, recipient_name, amount, delivery_method, pickup_date, notes }) {
    const { error } = await supabase.from('gift_vouchers').insert({
      purchaser_name, purchaser_email, purchaser_phone,
      recipient_name: recipient_name || null,
      amount: parseFloat(amount),
      delivery_method,
      pickup_date: pickup_date || null,
      notes: notes || null,
    });
    if (error) throw error;
  },

  async getGiftVouchers() {
    const { data, error } = await supabase
      .from('gift_vouchers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async updateGiftVoucherStatus(id, status) {
    const { error } = await supabase
      .from('gift_vouchers')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  // ==================== PROMOTIONS ====================

  // type = 'banner' | 'section'
  async getActivePromotion(type = 'banner') {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .eq('type', type)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  async getAllPromotions() {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },

  async createPromotion({ title, message, is_active, bg_color, type, image_url }) {
    const { data, error } = await supabase
      .from('promotions')
      .insert({ title, message, is_active: is_active ?? false, bg_color: bg_color || '#2a4e3a', type: type || 'banner', image_url: image_url || null })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updatePromotion(id, updates) {
    const { data, error } = await supabase
      .from('promotions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deletePromotion(id) {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // ==================== ADMIN REBOOK ====================

  async searchClientHistory(searchTerm) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`*, booking_treatments(id, treatment_name, duration_minutes, price)`)
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('date', { ascending: false });
    if (error) throw new Error(error.message);
    const clientMap = {};
    (data || []).forEach(booking => {
      const key = (booking.email || booking.name || 'unknown').toLowerCase();
      if (!clientMap[key]) clientMap[key] = { name: booking.name, email: booking.email, phone: booking.phone, bookings: [] };
      clientMap[key].bookings.push(booking);
    });
    return Object.values(clientMap);
  },

  async createAdminBooking({ name, email, phone, date, time, notes, treatments, clientType, totalDuration, totalPrice, sourceBookingId }) {
    const bookingId = crypto.randomUUID();
    const { error: bookingError } = await supabase.from('bookings').insert({
      id: bookingId, name, email, phone, date, time,
      time_range_start: null, time_range_end: null,
      notes: notes || null, appointment_type: clientType || 'returning',
      reminder_preference: 'email', total_duration: totalDuration || null,
      total_price: totalPrice || 'POA', status: 'approved',
      client_type: clientType || 'returning', marketing_consent: false,
      source_booking_id: sourceBookingId || null,
      booking_source: 'admin_rebook'
    });
    if (bookingError) throw new Error(bookingError.message);
    const rows = treatments.map(t => ({
      booking_id: bookingId, treatment_id: t.id || null,
      treatment_name: t.treatment_name || t.name,
      duration_minutes: t.duration_minutes, price: t.price
    }));
    const { error: treatmentsError } = await supabase.from('booking_treatments').insert(rows);
    if (treatmentsError) throw new Error(treatmentsError.message);
    return { id: bookingId };
  },

  // ==================== REALTIME ====================

  subscribeToBookings(callback) {
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => callback(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // ==================== EMAIL BLAST ====================

  async getUniqueCustomerEmails(audience = 'all') {
    const emails = new Map(); // email -> name

    if (audience === 'all' || audience === 'bookings') {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('name, email')
        .not('email', 'is', null);
      (bookings || []).forEach(b => { if (b.email) emails.set(b.email.toLowerCase(), b.name); });
    }

    if (audience === 'all' || audience === 'orders') {
      const { data: orders } = await supabase
        .from('shop_orders')
        .select('customer_name, email')
        .not('email', 'is', null);
      (orders || []).forEach(o => { if (o.email) emails.set(o.email.toLowerCase(), o.customer_name); });
    }

    return Array.from(emails.entries()).map(([email, name]) => ({ email, name }));
  },

  async sendEmailBlast(subject, html, recipients) {
    try {
      const url = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/email-blast`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ subject, html, recipients }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send');
      return data;
    } catch (err) {
      console.error('Email blast failed:', err);
      throw err;
    }
  },

  // ==================== ANALYTICS ====================

  async getBookingsForPeriod(startDate, endDate) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        booking_treatments (
          id,
          treatment_name,
          duration_minutes,
          price
        )
      `)
      .eq('status', 'approved')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  },

  async getFulfilledOrdersForPeriod(startDate, endDate) {
    const { data, error } = await supabase
      .from('shop_orders')
      .select(`
        *,
        shop_order_items (
          id,
          product_name,
          price,
          quantity
        )
      `)
      .eq('status', 'fulfilled')
      .gte('created_at', startDate)
      .lte('created_at', endDate + 'T23:59:59');
    if (error) throw new Error(error.message);
    return data;
  },

  subscribeToOrders(callback) {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shop_orders' },
        (payload) => callback(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

export default supabaseService;