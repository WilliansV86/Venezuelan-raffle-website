import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ adminInfo: null });

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('adminInfo');
    if (storedUserInfo) {
      setAuth({ adminInfo: JSON.parse(storedUserInfo) });
    }
  }, []);

  const login = (adminInfo) => {
    localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
    setAuth({ adminInfo });
  };

  const logout = () => {
    localStorage.removeItem('adminInfo');
    setAuth({ adminInfo: null });
  };

  const value = { auth, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
