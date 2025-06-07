import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">
              Sorteos<span className="text-accent">VE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-800 hover:text-primary transition-colors">
              Inicio
            </Link>
            <Link to="/sorteos-activos" className="text-gray-800 hover:text-primary transition-colors">
              Sorteos Activos
            </Link>
            <Link to="/ganadores" className="text-gray-800 hover:text-primary transition-colors">
              Ganadores
            </Link>
            <Link to="/como-funciona" className="text-gray-800 hover:text-primary transition-colors">
              Cómo Funciona
            </Link>
            <Link to="/contacto" className="text-gray-800 hover:text-primary transition-colors">
              Contacto
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 py-3 border-t">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-gray-800 hover:text-primary px-2 py-1 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/sorteos-activos"
                className="text-gray-800 hover:text-primary px-2 py-1 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sorteos Activos
              </Link>
              <Link
                to="/ganadores"
                className="text-gray-800 hover:text-primary px-2 py-1 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Ganadores
              </Link>
              <Link
                to="/como-funciona"
                className="text-gray-800 hover:text-primary px-2 py-1 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Cómo Funciona
              </Link>
              <Link
                to="/contacto"
                className="text-gray-800 hover:text-primary px-2 py-1 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Venezuelan flag stripe */}
      <div className="flex">
        <div className="w-1/3 h-1 bg-vnz-yellow"></div>
        <div className="w-1/3 h-1 bg-vnz-blue"></div>
        <div className="w-1/3 h-1 bg-vnz-red"></div>
      </div>
    </nav>
  );
};

export default Navbar;
