import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchOrderByIdApi } from './api';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    fetchOrderByIdApi(id)
      .then((result) => {
        if (isCurrent) setOrder(result);
      })
      .catch(() => {
        if (isCurrent) setError('This order could not be found.');
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [id]);

  if (loading) return <main className="catalog-message" role="status">Loading order...</main>;
  if (error) return <main className="catalog-message catalog-error" role="alert">{error}</main>;

  return (
    <main className="catalog-page order-success-page">
      <span className="eyebrow">Payment confirmed</span>
      <h1>Thank you for your order.</h1>
      <p className="order-confirmation-number">Order {order._id}</p>
      <section className="order-success-section">
        <h2>Items</h2>
        {order.items.map((item) => (
          <div className="order-success-item" key={item._id || item.product}>
            <span>{item.name} × {item.quantity}</span>
            <strong>INR {(item.price * item.quantity).toFixed(2)}</strong>
          </div>
        ))}
        <div className="checkout-review-total"><span>Total paid</span><strong>INR {order.totalAmount.toFixed(2)}</strong></div>
      </section>
      <section className="order-success-section">
        <h2>Shipping to</h2>
        <p>{order.shippingAddress.fullName}</p>
        <p>{order.shippingAddress.addressLine1}</p>
        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
        <p>{order.shippingAddress.phone}</p>
      </section>
      <Link className="checkout-button order-history-button" to="/orders">View My Orders</Link>
    </main>
  );
}