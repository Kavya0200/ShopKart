const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById
} = require('../controllers/product.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/', createProduct);
router.get('/', protect, getProducts);
router.get('/:id', protect, getProductById);

module.exports = router;