import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addToCartApi, fetchProductById } from './api';
import { notifyToast } from './toastBus';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartMessage, setCartMessage] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isCurrent = true;

    fetchProductById(id)
      .then((item) => {
        if (isCurrent) setProduct(item);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(requestError.response?.data?.message || 'This product could not be found.');
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [id]);

  const addToCart = async () => {
    setAddingToCart(true);
    setCartMessage('');
    try {
      await addToCartApi(product._id);
      setCartMessage('');
      notifyToast(`${product.name} added to your cart 🛍️`, 'success');
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        navigate('/login');
        return;
      }
      const message = requestError.response?.data?.message || 'Could not add this product.';
      setCartMessage(message);
      notifyToast(message, 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <main className="catalog-message" role="status">Loading product...</main>;
  if (error) {
    return (
      <main className="product-detail-page">
        <p className="catalog-message catalog-error" role="alert">{error}</p>
        <Link className="back-link" to="/products">&lt;- Back to products</Link>
      </main>
    );
  }

  return (
    <main className="product-detail-page">
      <Link className="back-link" to="/products">&lt;- All products</Link>
      <article className="product-detail">
        <img src={product.image} alt={product.name} />
        <div className="product-detail-copy">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-detail-price">${Number(product.price).toFixed(2)}</p>
          <p className="product-detail-description">{product.description}</p>
          <p className="product-stock">{product.stock > 0 ? `${product.stock} available` : 'Currently sold out'}</p>
          <button className="cart-action-button detail-cart-button" type="button" onClick={addToCart} disabled={addingToCart || product.stock < 1}>
            {product.stock < 1 ? 'Out of stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
          {cartMessage && <p className="cart-card-message" role="status">{cartMessage}</p>}
        </div>
      </article>
    </main>
  );
}