import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';

export default function Home({ setIsAuthenticated }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/customers/me')
      .then((res) => {
        setUser(res.data);
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
        navigate('/login');
      });
  }, [navigate, setIsAuthenticated]);

  if (!user) return <div style={{ backgroundColor: '#f6f5f1', minHeight: 'calc(100vh - 80px)', padding: '4rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ backgroundColor: '#f6f5f1', minHeight: 'calc(100vh - 80px)', padding: '4rem 2rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', margin: '0 0 1.5rem 0', color: '#111827' }}>Welcome, {user.fullName}!</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
          <div>
            <strong style={{ color: '#6b7280', fontSize: '0.85rem' }}>FULL NAME</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.1rem', color: '#111827' }}>{user.fullName}</p>
          </div>
          <div>
            <strong style={{ color: '#6b7280', fontSize: '0.85rem' }}>EMAIL ADDRESS</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.1rem', color: '#111827' }}>{user.email}</p>
          </div>
          <div>
            <strong style={{ color: '#6b7280', fontSize: '0.85rem' }}>PHONE NUMBER</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.1rem', color: '#111827' }}>{user.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}