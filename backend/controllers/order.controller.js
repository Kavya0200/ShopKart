const crypto = require('crypto');
const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Order = require('../models/order.model');
const getRazorpayClient = require('../config/razorpay');

const shippingFields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];

exports.createPaymentOrder = async (req, res) => {
  const address = req.body?.shippingAddress || {};
  if (shippingFields.some((field) => !String(address[field] || '').trim())) {
    return res.status(400).json({ success: false, message: 'Complete all shipping address fields' });
  }
  if (!/^\d{10}$/.test(String(address.phone)) || !/^\d{6}$/.test(String(address.pincode))) {
    return res.status(400).json({ success: false, message: 'Enter a 10-digit phone number and 6-digit pincode' });
  }

  let order;
  try {
    const customer = await Customer.findById(req.user._id).populate('cart.product');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    if (customer.cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    const items = [];
    for (const cartItem of customer.cart) {
      const product = cartItem.product;
      if (!product) {
        return res.status(400).json({ success: false, message: 'A cart product is no longer available' });
      }
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({ success: false, message: `${product.name} does not have enough stock` });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image
      });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(503).json({ success: false, message: 'Razorpay test keys are not configured' });
    }

    order = await Order.create({
      user: customer._id,
      items,
      shippingAddress: Object.fromEntries(
        shippingFields.map((field) => [field, String(address[field]).trim()])
      ),
      totalAmount,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT'
    });

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: order._id.toString()
      });
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return res.status(201).json({
        success: true,
        key: process.env.RAZORPAY_KEY_ID,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        shopKartOrderId: order._id
      });
    } catch (error) {
      order.paymentStatus = 'FAILED';
      await order.save();
      return res.status(502).json({ success: false, message: 'Could not create Razorpay payment order' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      shopKartOrderId
    } = req.body || {};

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: 'Payment verification details are incomplete' });
    }

    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ success: false, message: 'Payment order does not match' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(503).json({ success: false, message: 'Razorpay test keys are not configured' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    const expected = Buffer.from(expectedSignature, 'hex');
    const received = Buffer.from(razorpaySignature, 'hex');
    if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    if (order.paymentStatus === 'PAID') {
      if (order.razorpayPaymentId !== razorpayPaymentId) {
        return res.status(409).json({ success: false, message: 'Order was already paid with a different payment' });
      }
      await Customer.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });
      return res.status(200).json({ success: true, order });
    }

    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();
    await Customer.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return res.status(500).json({ success: false, message: 'Payment could not be verified. Please retry verification.' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};