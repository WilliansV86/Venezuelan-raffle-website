import React from 'react';
import './Header.css'; // We'll create this CSS file next for styling

const Header = () => {
  return (
    <header className="app-header">
      <img src={process.env.PUBLIC_URL + '/images/logo.jpg'} alt="Tu Suerte esta aqui VE Logo" className="header-logo" />
      <h1 className="header-title">Tu Suerte esta aqui VE</h1>
      {/* We can add navigation links here later if needed */}
    </header>
  );
};

export default Header;
