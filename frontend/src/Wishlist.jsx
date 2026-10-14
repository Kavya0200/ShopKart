import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { fetchWishlist, removeFromWishlistApi } from './api';

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    fetchWishlist()
      .then((items) => {
        if (isCurrent) setProducts(items);
      })
      .catch(() => {
        if (isCurrent) setError('Your wishlist could not be loaded. Please try again.');
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const removeFromWishlist = async (productId) => {
    setError('');
    try {
      await removeFromWishlistApi(productId);
      setProducts((items) => items.filter((product) => product._id !== productId));
    } catch {
      setError('This product could not be removed. Please try again.');
    }
  };

  return (
    <main className="catalog-page wishlist-page">
      <header className="catalog-heading">
        <div>
          <span className="eyebrow">Saved for later</span>
          <h1>Your wishlist.</h1>
        </div>
        <p>Things you would like to keep close.</p>
      </header>

      {error && <p className="catalog-message catalog-error" role="alert">{error}</p>}
      {loading ? (
        <p className="catalog-message" role="status">Loading wishlist...</p>
      ) : products.length === 0 ? (
        <p className="catalog-message">Your wishlist is empty.</p>
      ) : (
        <section className="product-grid" aria-label="Wishlist products">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} onRemoveFromWishlist={removeFromWishlist} />
          ))}
        </section>
      )}
    </main>
  );
}