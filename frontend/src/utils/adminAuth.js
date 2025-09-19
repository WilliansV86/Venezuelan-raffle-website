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
  return localStorage.getItem(ADMIN_KEY_STORAGE);
};

export const isAdminLoggedIn = () => {
  return !!getAdminKey();
};
