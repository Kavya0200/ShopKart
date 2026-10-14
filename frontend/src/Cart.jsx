import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, removeFromCartApi, updateCartQtyApi } from './api';
import { notifyToast } from './toastBus';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyProductId, setBusyProductId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isCurrent = true;

    fetchCart()
      .then((cartItems) => {
        if (isCurrent) setItems(cartItems);
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

  const updateQuantity = async (productId, quantity) => {
    setBusyProductId(productId);
    setError('');
    try {
      setItems(await updateCartQtyApi(productId, quantity));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this quantity.');
    } finally {
      setBusyProductId('');
    }
  };

  const removeItem = async (productId) => {
    setBusyProductId(productId);
    setError('');
    try {
      setItems(await removeFromCartApi(productId));
      notifyToast('Item removed from your cart', 'success');
    } catch {
      setError('Could not remove this product. Please try again.');
    } finally {
      setBusyProductId('');
    }
  };

  const checkout = () => navigate('/checkout');

  const availableItems = items.filter((item) => item.product);
  const grandTotal = availableItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <main className="catalog-page cart-page">
      <header className="catalog-heading">
        <div>
          <span className="eyebrow">Ready when you are</span>
          <h1>Your cart.</h1>
        </div>
        <p>{availableItems.reduce((count, item) => count + item.quantity, 0)} items</p>
      </header>

      {error && <p className="catalog-message catalog-error" role="alert">{error}</p>}
      {loading ? (
        <p className="catalog-message" role="status">Loading cart...</p>
      ) : availableItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-state-art cart-empty-art" aria-hidden="true"><span>🛍️</span><i>✦</i></div>
          <p className="eyebrow">A little room for something lovely</p>
          <h2>Your cart is waiting.</h2>
          <p>Find a new favorite and it’ll be right here.</p>
          <Link className="empty-state-cta" to="/products">Explore the collection <span aria-hidden="true">→</span></Link>
        </div>
      ) : (
        <>
          <section className="cart-items" aria-label="Cart items">
            {availableItems.map(({ product, quantity }) => (
              <article className="cart-row" key={product._id}>
                <Link className="cart-image-link" to={`/products/${product._id}`}>
                  <img src={product.image} alt={product.name} />
                </Link>
                <div className="cart-item-info">
                  <span className="eyebrow">{product.category}</span>
                  <Link to={`/products/${product._id}`} className="cart-item-name">{product.name}</Link>
                  <span className="cart-unit-price">${Number(product.price).toFixed(2)} each</span>
                </div>
                <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
                  <button type="button" aria-label={`Decrease ${product.name} quantity`} disabled={busyProductId === product._id} onClick={() => updateQuantity(product._id, quantity - 1)}>
                    -
                  </button>
                  <output>{quantity}</output>
                  <button type="button" aria-label={`Increase ${product.name} quantity`} disabled={busyProductId === product._id || quantity >= product.stock} onClick={() => updateQuantity(product._id, quantity + 1)}>
                    +
                  </button>
                </div>
                <strong className="cart-line-total">${(product.price * quantity).toFixed(2)}</strong>
                <button className="cart-remove-button" type="button" disabled={busyProductId === product._id} onClick={() => removeItem(product._id)}>
                  Remove
                </button>
              </article>
            ))}
          </section>

          <section className="cart-summary" aria-label="Order total">
            <span>Grand total</span>
            <strong>${grandTotal.toFixed(2)}</strong>
            <button className="checkout-button" type="button" onClick={checkout}>
              Proceed to Checkout
            </button>
          </section>
        </>
      )}
    </main>
  );
}