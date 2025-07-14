import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Import the centralized api instance

const LoginPage = () => {
  
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();


  // Redirect if already authenticated
  useEffect(() => {
    try {
      const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
      if (adminInfo && adminInfo.token) {
        navigate('/admin', { replace: true });
      }
    } catch (e) {}
  }, [navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Add console logs to help debug
    console.log('Attempting login...');
    console.log('API base URL:', api.defaults.baseURL);

    try {
      // Use the centralized api instance with explicit URL to ensure connection
      console.log('Sending request to:', api.defaults.baseURL + '/admin/login');
      const { data } = await api.post('/admin/login', { adminKey: password });
      
      console.log('Login response received:', { success: !!data, hasToken: !!data?.token });
      
      // The backend returns the user object with token directly
      if (data && data.token) {
        console.log('Login successful, saving admin info');
        localStorage.setItem('adminInfo', JSON.stringify(data));
        login(data);
        navigate('/admin', { replace: true });
      } else {
        console.log('Login failed - no token in response');
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'An error occurred during login.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-white">Admin Login</h1>
                        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
