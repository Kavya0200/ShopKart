import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true
});

const notifyCartUpdated = () => {
  window.dispatchEvent(new Event('shopkart:cart-updated'));
};

export const fetchProducts = async (filters = {}) => {
  const { data } = await API.get('/products', { params: filters });
  return data.products;
};

export const fetchProductById = async (id) => {
  const { data } = await API.get(`/products/${id}`);
  return data.product;
};

export const fetchWishlist = async () => {
  const { data } = await API.get('/wishlist');
  return data.wishlist;
};

export const addToWishlistApi = async (productId) => {
  const { data } = await API.post('/wishlist', { productId });
  return data;
};

export const removeFromWishlistApi = async (productId) => {
  const { data } = await API.delete(`/wishlist/${productId}`);
  return data;
};

export const fetchCart = async () => {
  const { data } = await API.get('/cart');
  return data.cart;
};

export const addToCartApi = async (productId, quantity = 1) => {
  const { data } = await API.post('/cart', { productId, quantity });
  notifyCartUpdated();
  return data.cart;
};

export const updateCartQtyApi = async (productId, quantity) => {
  const { data } = await API.patch(`/cart/${productId}`, { quantity });
  notifyCartUpdated();
  return data.cart;
};

export const removeFromCartApi = async (productId) => {
  const { data } = await API.delete(`/cart/${productId}`);
  notifyCartUpdated();
  return data.cart;
};

export const createPaymentOrderApi = async (shippingAddress) => {
  const { data } = await API.post('/orders/create-payment-order', { shippingAddress });
  return data;
};

export const verifyPaymentApi = async (paymentDetails) => {
  const { data } = await API.post('/orders/verify-payment', paymentDetails);
  notifyCartUpdated();
  return data.order;
};

export const fetchOrdersApi = async () => {
  const { data } = await API.get('/orders');
  return data.orders;
};

export const fetchOrderByIdApi = async (id) => {
  const { data } = await API.get(`/orders/${id}`);
  return data.order;
};

export const createPaymentOrder = createPaymentOrderApi;
export const verifyPayment = verifyPaymentApi;
export const getOrders = fetchOrdersApi;
export const getOrderById = fetchOrderByIdApi;

export default API;