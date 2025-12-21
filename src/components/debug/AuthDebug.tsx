'use client';
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export const AuthDebug: React.FC = () => {
  const [authStatus, setAuthStatus] = useState({
    cookieToken: '',
    localStorageToken: '',
    currentPath: '',
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    const updateStatus = () => {
      setAuthStatus({
        cookieToken: Cookies.get('accessToken') || 'none',
        localStorageToken: (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : 'none') || 'none',
        currentPath: typeof window !== 'undefined' ? window.location.pathname : 'server',
        timestamp: new Date().toISOString()
      });
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Only show in development and on login page
  if (process.env.NODE_ENV !== 'development' || !authStatus.currentPath.includes('/login')) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 bg-black/80 text-white p-2 text-xs z-50 max-w-md">
      <div className="font-bold">Auth Debug (Login Page)</div>
      <div>Path: {authStatus.currentPath}</div>
      <div>Cookie Token: {authStatus.cookieToken.substring(0, 20)}...</div>
      <div>LocalStorage Token: {authStatus.localStorageToken.substring(0, 20)}...</div>
      <div>Updated: {authStatus.timestamp.split('T')[1].split('.')[0]}</div>
    </div>
  );
};

export default AuthDebug;