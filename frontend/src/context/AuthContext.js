import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state

  // 3. Check for user info in localStorage on initial load
  useEffect(() => {
    try {
      const storedAdminInfo = localStorage.getItem('adminInfo');
      if (storedAdminInfo) {
        setAdminInfo(JSON.parse(storedAdminInfo));
      }
    } catch (error) {
      console.error('Failed to parse admin info from localStorage', error);
      localStorage.removeItem('adminInfo'); // Clear corrupted data
    } finally {
      setLoading(false); // Finished loading
    }
  }, []);

  // 4. Login function: updates state and saves to localStorage
  const login = (data) => {
    try {
      localStorage.setItem('adminInfo', JSON.stringify(data));
      setAdminInfo(data);
    } catch (error) {
      console.error('Failed to save admin info to localStorage', error);
    }
  };

  // 5. Logout function: clears state and removes from localStorage
  const logout = () => {
    try {
      localStorage.removeItem('adminInfo');
      setAdminInfo(null);
    } catch (error) {
      console.error('Failed to remove admin info from localStorage', error);
    }
  };

  // 6. The value provided to consuming components
  const value = {
    adminInfo,
    isAuthenticated: !!adminInfo,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 7. Custom hook to easily use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
