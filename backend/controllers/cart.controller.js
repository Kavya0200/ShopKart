const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const getCustomer = (customerId) => Customer.findById(customerId);

exports.getCart = async (req, res) => {
  try {
    const customer = await getCustomer(req.user._id).populate('cart.product');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    return res.status(200).json({ success: true, cart: customer.cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.body || {};
    const quantity = Number(req.body?.quantity ?? 1);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'A valid product ID is required' });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive whole number' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const customer = await getCustomer(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const cartItem = customer.cart.find((item) => item.product.toString() === productId);
    const updatedQuantity = (cartItem?.quantity || 0) + quantity;
    if (updatedQuantity > product.stock) {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
    }

    if (cartItem) {
      cartItem.quantity = updatedQuantity;
    } else {
      customer.cart.push({ product: productId, quantity });
    }

    await customer.save();
    await customer.populate('cart.product');
    return res.status(200).json({ success: true, cart: customer.cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const quantity = Number(req.body?.quantity);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'A valid product ID is required' });
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a whole number of zero or more' });
    }

    const customer = await getCustomer(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const itemIndex = customer.cart.findIndex((item) => item.product.toString() === productId);
    if (itemIndex < 0) {
      return res.status(404).json({ success: false, message: 'Product is not in the cart' });
    }

    if (quantity === 0) {
      customer.cart.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      if (quantity > product.stock) {
        return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
      }
      customer.cart[itemIndex].quantity = quantity;
    }

    await customer.save();
    await customer.populate('cart.product');
    return res.status(200).json({ success: true, cart: customer.cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'A valid product ID is required' });
    }

    const customer = await getCustomer(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.cart = customer.cart.filter((item) => item.product.toString() !== productId);
    await customer.save();
    await customer.populate('cart.product');
    return res.status(200).json({ success: true, cart: customer.cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const customer = await getCustomer(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.cart = [];
    await customer.save();
    return res.status(200).json({ success: true, cart: [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
