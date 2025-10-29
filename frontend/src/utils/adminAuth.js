// Basic admin key handling (for demonstration purposes)

// Use 'adminInfo' consistently across the application for admin authentication
const ADMIN_KEY_STORAGE = 'adminInfo';

export const setAdminKey = (key) => {
  if (key) {
    localStorage.setItem(ADMIN_KEY_STORAGE, key);
  } else {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
  }
};

export const getAdminKey = () => {
  try {
    // First check if it's the new format (stored as JSON adminInfo object)
    const adminInfoStr = localStorage.getItem(ADMIN_KEY_STORAGE);
    if (!adminInfoStr) return null;
    
    // Try to parse as JSON (for the new format)
    try {
      const adminInfo = JSON.parse(adminInfoStr);
      
      // If it's an object with token, use the token as the admin key
      if (adminInfo && typeof adminInfo === 'object' && adminInfo.token) {
        console.log('Using token from adminInfo object');
        return adminInfo.token;
      }
    } catch (e) {
      // Not JSON, so it must be the old direct string format
      console.log('Using legacy admin key format');
    }
    
    // Fall back to treating it as a direct string (old format)
    return adminInfoStr;
  } catch (e) {
    console.error('Error getting admin key:', e);
    return null;
  }
};

export const isAdminLoggedIn = () => {
  return !!getAdminKey();
};
