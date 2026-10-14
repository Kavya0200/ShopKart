import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrdersApi } from './api';

const formatCurrency = (amount) => `INR ${Number(amount || 0).toFixed(2)}`;

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    fetchOrdersApi()
      .then((results) => {
        if (isCurrent) setOrders(results);
      })
      .catch(() => {
        if (isCurrent) setError('Your orders could not be loaded. Please try again.');
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <main className="catalog-page orders-page">
      <header className="catalog-heading">
        <div>
          <span className="eyebrow">Your ShopKart history</span>
          <h1>My Orders.</h1>
        </div>
        <p>Payments and deliveries, all in one place.</p>
      </header>

      {loading ? (
        <p className="catalog-message" role="status">Loading orders...</p>
      ) : error ? (
        <p className="catalog-message catalog-error" role="alert">{error}</p>
      ) : orders.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-state-art orders-empty-art" aria-hidden="true"><span>📦</span><i>✦</i></div>
          <p className="eyebrow">Your next favorite is out there</p>
          <h2>No orders just yet.</h2>
          <p>Once you find something you love, your order history will live here.</p>
          <Link className="empty-state-cta" to="/products">Discover ShopKart <span aria-hidden="true">→</span></Link>
        </div>
      ) : (
        <section className="orders-list" aria-label="Order history">
          {orders.map((order) => (
            <article className="order-history-item" key={order._id}>
              <div className="order-history-heading">
                <div>
                  <span className="eyebrow">{formatDate(order.createdAt)}</span>
                  <h2>Order {order._id}</h2>
                  <p>{order.items.length} product{order.items.length === 1 ? '' : 's'}</p>
                </div>
                <span className={`order-status-badge order-status-${String(order.status || 'unknown').toLowerCase()}`}>
                  {String(order.status || 'Unknown').replaceAll('_', ' ')}
                </span>
              </div>
              <ul className="order-snapshot-list" aria-label={`Items in order ${order._id}`}>
                {order.items.map((item) => (
                  <li className="order-snapshot-item" key={item._id || `${item.product}-${item.name}`}>
                    {item.image && <img src={item.image} alt="" loading="lazy" />}
                    <div className="order-snapshot-copy">
                      <strong>{item.name}</strong>
                      <span>{formatCurrency(item.price)} × {item.quantity}</span>
                    </div>
                    <strong className="order-snapshot-total">{formatCurrency(item.price * item.quantity)}</strong>
                  </li>
                ))}
              </ul>
              <strong className="order-history-total">{formatCurrency(order.totalAmount)}</strong>
              <Link className="back-link" to={`/order-success/${order._id}`}>View details</Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}