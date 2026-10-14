import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API, { fetchCart } from './api';

export default function Navbar({ isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    API.get('/customers/me')
      .then(() => {
        if (isCurrent) setIsAuthenticated(true);
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, [setIsAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let isCurrent = true;
    const loadCartCount = () => {
      fetchCart()
        .then((items) => {
          if (isCurrent) setCartCount(items.reduce((count, item) => count + item.quantity, 0));
        })
        .catch(() => {
          if (isCurrent) setCartCount(0);
        });
    };

    loadCartCount();
    window.addEventListener('shopkart:cart-updated', loadCartCount);
    return () => {
      isCurrent = false;
      window.removeEventListener('shopkart:cart-updated', loadCartCount);
    };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await API.post('/customers/logout');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  return (
    <nav className="shop-navbar">
      <Link className="shop-brand" to="/products" aria-label="ShopKart home">
        <span className="brand-mark" aria-hidden="true">S</span>
        <span>ShopKart</span>
      </Link>
      <div className="shop-nav-actions">
        <Link to="/products">Products</Link>
        <Link to="/wishlist">Wishlist</Link>
        <Link to="/orders">My Orders</Link>
        <Link className="cart-nav-link" to="/cart" aria-label={`Cart, ${isAuthenticated ? cartCount : 0} items`}>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L21 8H6" />
            <circle cx="10" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
          <span>Cart</span>
          <span className="cart-count-badge">{isAuthenticated ? cartCount : 0}</span>
        </Link>

        {!isAuthenticated ? (
          <>
            <Link to="/login">Log in</Link>
            <Link className="nav-primary-button" to="/register">Create account</Link>
          </>
        ) : (
          <>
            <Link to="/home">Profile</Link>
            <button className="nav-primary-button" onClick={handleLogout}>Log out</button>
          </>
        )}
      </div>
    </nav>
  );
}