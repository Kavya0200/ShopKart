import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPaymentOrderApi, fetchCart, verifyPaymentApi } from './api';

const emptyAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: ''
};

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const [address, setAddress] = useState(emptyAddress);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentAttempt, setPaymentAttempt] = useState(null);
  const [verificationDetails, setVerificationDetails] = useState(null);
  const [paymentFailure, setPaymentFailure] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isCurrent = true;

    fetchCart()
      .then((cartItems) => {
        if (isCurrent) setItems(cartItems.filter((item) => item.product));
      })
      .catch((requestError) => {
        if (isCurrent) {
          if (requestError.response?.status === 401) navigate('/login');
          else setError('Your cart could not be loaded. Please try again.');
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [navigate]);

  const handleChange = (event) => {
    setAddress((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const verifyAndCompletePayment = async (details) => {
    setSubmitting(true);
    setPaymentFailure(null);
    try {
      const order = await verifyPaymentApi(details);
      setItems([]);
      setPaymentAttempt(null);
      setVerificationDetails(null);
      navigate(`/order-success/${order._id}`, { replace: true });
    } catch {
      setVerificationDetails(details);
      setPaymentFailure({
        type: 'verification',
        message: 'We could not confirm the payment yet. Retry confirmation before attempting another payment.'
      });
      setSubmitting(false);
    }
  };

  const openPaymentModal = (attempt) => {
    let paymentHandlerStarted = false;
    let paymentFailed = false;
    const { paymentOrder, shippingAddress } = attempt;
    const payment = new window.Razorpay({
      key: paymentOrder.key,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name: 'ShopKart',
      description: 'ShopKart order payment',
      order_id: paymentOrder.razorpayOrderId,
      prefill: {
        name: shippingAddress.fullName,
        contact: shippingAddress.phone
      },
      notes: { shopKartOrderId: paymentOrder.shopKartOrderId },
      theme: { color: '#526b44' },
      handler: async (response) => {
        paymentHandlerStarted = true;
        const details = { ...response, shopKartOrderId: paymentOrder.shopKartOrderId };
        setVerificationDetails(details);
        await verifyAndCompletePayment(details);
      },
      modal: {
        ondismiss: () => {
          setSubmitting(false);
          if (!paymentHandlerStarted && !paymentFailed) {
            setPaymentFailure({
              type: 'payment',
              message: 'The payment window was closed. Your order is still available to retry.'
            });
          }
        }
      }
    });

    payment.on('payment.failed', (response) => {
      paymentFailed = true;
      setPaymentFailure({
        type: 'payment',
        message: response.error?.description || 'The payment could not be completed. Please retry.'
      });
      setSubmitting(false);
    });
    payment.open();
  };

  const handleRetry = async () => {
    setPaymentFailure(null);
    setSubmitting(true);
    try {
      if (verificationDetails) {
        await verifyAndCompletePayment(verificationDetails);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Razorpay checkout could not be loaded. Check your internet connection.');
      openPaymentModal(paymentAttempt);
    } catch (retryError) {
      setPaymentFailure({ type: 'payment', message: retryError.message || 'Could not retry the payment.' });
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (Object.values(address).some((value) => !value.trim())) {
      setError('Complete every shipping address field.');
      return;
    }
    if (!/^\d{10}$/.test(address.phone)) {
      setError('Enter a 10-digit phone number.');
      return;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      setError('Enter a 6-digit pincode.');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty. Add a product before checkout.');
      return;
    }

    if (paymentAttempt) {
      await handleRetry();
      return;
    }

    setSubmitting(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Razorpay checkout could not be loaded. Check your internet connection.');

      const paymentOrder = await createPaymentOrderApi(address);
      const attempt = { paymentOrder, shippingAddress: { ...address } };
      setPaymentAttempt(attempt);
      openPaymentModal(attempt);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not start payment.');
      setSubmitting(false);
    }
  };

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) return <main className="catalog-message" role="status">Loading checkout...</main>;

  return (
    <main className="catalog-page checkout-page">
      <Link className="back-link" to="/cart">&lt;- Back to cart</Link>
      <header className="catalog-heading">
        <div>
          <span className="eyebrow">Secure test-mode payment</span>
          <h1>Checkout.</h1>
        </div>
        <p>Review your order and delivery details.</p>
      </header>

      {error && <p className="checkout-error" role="alert">{error}</p>}
      {paymentFailure && (
        <section className="checkout-payment-alert" role="alert">
          <div>
            <strong>{paymentFailure.type === 'verification' ? 'Payment confirmation pending' : 'Payment Cancelled / Failed'}</strong>
            <p>{paymentFailure.message}</p>
          </div>
          <button className="checkout-retry-button" type="button" onClick={handleRetry} disabled={submitting}>
            {paymentFailure.type === 'verification' ? 'Retry Verification' : 'Retry Payment 🔄'}
          </button>
        </section>
      )}
      {items.length === 0 ? (
        <div className="empty-cart">
          <p className="catalog-message">Your cart is empty.</p>
          <Link className="back-link" to="/products">Browse products</Link>
        </div>
      ) : (
        <div className="checkout-layout">
          <form className="shipping-form" onSubmit={handleSubmit}>
            <h2>Shipping address</h2>
            <label>Full name<input name="fullName" autoComplete="name" value={address.fullName} onChange={handleChange} required /></label>
            <label>Phone<input name="phone" type="tel" inputMode="numeric" autoComplete="tel" value={address.phone} onChange={handleChange} maxLength={10} required /></label>
            <label>Address<input name="addressLine1" autoComplete="street-address" value={address.addressLine1} onChange={handleChange} required /></label>
            <div className="shipping-locality">
              <label>City<input name="city" autoComplete="address-level2" value={address.city} onChange={handleChange} required /></label>
              <label>State<input name="state" autoComplete="address-level1" value={address.state} onChange={handleChange} required /></label>
              <label>Pincode<input name="pincode" inputMode="numeric" autoComplete="postal-code" value={address.pincode} onChange={handleChange} maxLength={6} required /></label>
            </div>
            <button className="checkout-button" type="submit" disabled={submitting || items.length === 0 || Boolean(paymentFailure)}>
              {submitting ? 'Opening payment...' : 'Pay with Razorpay'}
            </button>
          </form>

          <aside className="checkout-review">
            <h2>Order review</h2>
            <ul>
              {items.map(({ product, quantity }) => (
                <li key={product._id}>
                  <span>{product.name} × {quantity}</span>
                  <strong>INR {(product.price * quantity).toFixed(2)}</strong>
                </li>
              ))}
            </ul>
            <div className="checkout-review-total"><span>Total</span><strong>INR {total.toFixed(2)}</strong></div>
          </aside>
        </div>
      )}
    </main>
  );
}