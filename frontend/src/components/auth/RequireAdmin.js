import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAdmin({ children }) {
  const location = useLocation();
  let adminInfoRaw = localStorage.getItem('adminInfo');
  let adminInfo = null;
  try {
    adminInfo = JSON.parse(adminInfoRaw);
  } catch (e) {
    console.warn('RequireAdmin: Failed to parse adminInfo from localStorage', e, adminInfoRaw);
    adminInfo = null;
  }
  if (!adminInfo || !adminInfo.token) {
    console.warn('RequireAdmin: No valid adminInfo found, redirecting to /admin/login', adminInfoRaw);
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
}
