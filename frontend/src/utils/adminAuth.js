// Basic admin key handling (for demonstration purposes)

const ADMIN_KEY_STORAGE = 'adminSecretKey';

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
