const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart
} = require('../controllers/cart.controller');

const router = express.Router();

router.use(protect);
router.get('/', getCart);
router.post('/', addToCart);
router.patch('/:productId', updateQuantity);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;