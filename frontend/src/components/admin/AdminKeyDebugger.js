import React, { useEffect, useState } from 'react';
import { getAdminKey } from '../../utils/adminAuth';
import { useAuth } from '../../context/AuthContext';

const AdminKeyDebugger = () => {
  const { auth } = useAuth();
  const [adminKey, setAdminKey] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [rawAdminInfo, setRawAdminInfo] = useState('');
  
  useEffect(() => {
    // Get the admin key from utils
    const key = getAdminKey();
    setAdminKey(key || 'No admin key found');
    
    // Get token from auth context
    setAdminToken(auth?.adminInfo?.token || 'No token found');
    
    // Get the raw adminInfo from localStorage
    const rawInfo = localStorage.getItem('adminInfo');
    setRawAdminInfo(rawInfo || 'No adminInfo in localStorage');
  }, [auth]);
  
  return (
    <div className="bg-white p-4 border rounded-lg mb-6">
      <h3 className="text-lg font-bold mb-4">Admin Authentication Debug Info</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Admin Key from getAdminKey():</h4>
        <div className="bg-gray-100 p-2 rounded overflow-auto">
          {adminKey}
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold">Admin Token from AuthContext:</h4>
        <div className="bg-gray-100 p-2 rounded overflow-auto">
          {adminToken}
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold">Raw adminInfo from localStorage:</h4>
        <div className="bg-gray-100 p-2 rounded overflow-auto">
          {rawAdminInfo}
        </div>
      </div>
    </div>
  );
};

export default AdminKeyDebugger;
