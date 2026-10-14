import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import API from './api';

export default function ProtectedRoute() {
  const [authenticated, setAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let isCurrent = true;

    API.get('/customers/me')
      .then(() => {
        if (isCurrent) setAuthenticated(true);
      })
      .catch(() => {
        if (isCurrent) setAuthenticated(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  if (authenticated === null) {
    return <main className="catalog-message" role="status">Checking your account...</main>;
  }

  return authenticated
    ? <Outlet />
    : <Navigate to="/login" state={{ from: location }} replace />;
}