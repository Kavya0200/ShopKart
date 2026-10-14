import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from './api';

export default function Register({ setIsAuthenticated }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/customers/register', formData);
      if (response.data.success || response.status === 201) {
        await API.post('/customers/login', {
          email: formData.email,
          password: formData.password
        });
        setIsAuthenticated(true);
        navigate('/products', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '3rem auto', padding: '2rem', fontFamily: 'serif' }}>
      <p style={{ textAlign: 'center', letterSpacing: '2px', fontSize: '12px', textTransform: 'uppercase' }}>Join The List</p>
      <h1 style={{ textAlign: 'center', fontSize: '2.5rem', margin: '0.5rem 0' }}>Create your account</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem', fontSize: '14px' }}>
        Save your details and make every order feel effortless.
      </p>

      {error && (
        <div style={{ background: '#fde8e8', color: '#9b1c1c', padding: '10px 14px', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Full name</label>
          <input
            type="text"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Email address</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Password</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Phone</label>
          <input
            type="text"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '1rem',
            padding: '12px',
            backgroundColor: '#0f172a',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '14px' }}>
        Already have an account? <Link to="/login" style={{ color: '#000', fontWeight: 'bold' }}>Log in</Link>
      </p>
    </div>
  );
}