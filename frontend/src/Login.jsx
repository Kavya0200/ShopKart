import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from './api';
import { notifyToast } from './toastBus';

export default function Login({ setIsAuthenticated }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/customers/login', formData);
      setIsAuthenticated(true);
      notifyToast('Welcome back! You’re all signed in ✨', 'success');
      navigate('/products', { replace: true });
    } catch {
      setError('Invalid Credentials');
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <span className="eyebrow">Your little corner of ShopKart</span>
        <h1>Welcome back.</h1>
        <p className="login-intro">The pieces you love are right where you left them.</p>
        {error && <div className="login-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <label>Email address<input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></label>
          <label>Password<input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></label>
          <button className="checkout-button" type="submit">Log in <span aria-hidden="true">→</span></button>
        </form>
        <p className="login-register">New to ShopKart? <Link to="/register">Create an account</Link></p>
      </section>
    </main>
  );
}