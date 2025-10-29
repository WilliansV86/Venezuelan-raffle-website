import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Import images from the new location
import logoImage from '../../assets/images/logo.jpg';
import venezuelanFlag from '../../assets/images/flag-ve.svg';
import loteriaTachiraLogo from '../../assets/images/logo-loteria-final.png';
import superGanaLogo from '../../assets/images/Logo-supergana-final.png';



const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoZoomed, setIsLogoZoomed] = useState(false);

  return (
    <>
      <nav className="bg-black/30 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3"> {/* Increased space-x for image */}
              <img 
                src={logoImage} 
                alt="TU SUERTE ESTA AQUI VE Logo" 
                className="h-16 w-16 rounded-full object-cover cursor-pointer"
                onClick={() => setIsLogoZoomed(true)}
              />
              <span className="ml-2 text-xl text-vnz-blue flex items-center"><span className="font-heading text-2xl font-semibold text-gray-100">TU SUERTE ESTA AQUI VE</span><img src={venezuelanFlag} alt="VE" className="h-4 w-auto ml-2" /></span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-xl font-bold tracking-wider text-gray-300 hover:text-cyan-400 transition-colors duration-300">
                Inicio
              </Link>
              <Link to="/verify-tickets" className="text-xl font-bold tracking-wider text-gray-300 hover:text-cyan-400 transition-colors duration-300">
                Verificar Tickets
              </Link>
              <Link to="/ganadores" className="text-xl font-bold tracking-wider text-gray-300 hover:text-cyan-400 transition-colors duration-300">
                Ganadores
              </Link>
              {/* Sponsor Logo */}
              <div className="flex items-center pl-6 border-l border-gray-700/50 h-16">
                <div className="flex items-center h-full space-x-4">
                  <img 
                    src={superGanaLogo}
                    alt="Super Gana" 
                    className="h-12 w-auto object-contain"
                  />
                  <img 
                    src={loteriaTachiraLogo}
                    alt="Lotería del Táchira" 
                    className="h-12 w-auto object-contain"
                  />
                </div>
              </div>
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
                  className="text-xl font-bold tracking-wider text-gray-300 hover:text-cyan-400 px-2 py-1 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio
                </Link>
                <Link
                  to="/verify-tickets"
                  className="text-xl font-bold tracking-wider text-gray-300 hover:text-cyan-400 px-2 py-1 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Verificar Tickets
                </Link>
                <Link
                  to="/ganadores"
                  className="text-xl font-bold tracking-wider text-gray-300 hover:text-cyan-400 px-2 py-1 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ganadores
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
      {isLogoZoomed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setIsLogoZoomed(false)}
        >
          <div 
            className="relative"
            onClick={(e) => e.stopPropagation()} // Prevent clicks on the image container from closing the modal
          >
            <img
              src={logoImage}
              alt="Tu Suerte"
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setIsLogoZoomed(false)}
              className="absolute -top-3 -right-3 bg-gray-900/80 rounded-full h-8 w-8 flex items-center justify-center text-white text-xl font-bold hover:bg-gray-700/80 transition-colors"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
