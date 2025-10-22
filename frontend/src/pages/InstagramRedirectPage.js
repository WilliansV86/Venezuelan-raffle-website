import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

/**
 * This page is specifically designed to handle traffic from Instagram's in-app browser
 * It immediately attempts to redirect to an external browser
 */
const InstagramRedirectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { path } = useParams();
  
  // Get the target path from the URL or use current path
  const targetPath = path || location.pathname.replace('/instagram/', '');
  const fullTargetUrl = `${window.location.origin}${targetPath}${location.search}`;
  
  useEffect(() => {
    // Detect Instagram browser
    const isInstagramBrowser = 
      navigator.userAgent.includes('Instagram') || 
      (window.navigator.userAgent.indexOf('FBAN') > -1) || 
      (window.navigator.userAgent.indexOf('FBAV') > -1);
    
    if (isInstagramBrowser) {
      // For Instagram, try multiple methods to open external browser
      
      // Method 1: Try using intent URL (Android)
      const intentUrl = `intent://${window.location.host}${targetPath}${location.search}#Intent;scheme=https;package=com.android.chrome;end`;
      
      // Method 2: Try standard link
      const regularUrl = fullTargetUrl;
      
      // Attempt to redirect using a timer to ensure the UI renders first
      setTimeout(() => {
        window.location.href = intentUrl;
        
        // Fallback - if we're still here after a short delay, try the regular URL
        setTimeout(() => {
          window.location = regularUrl;
        }, 100);
      }, 100);
    } else {
      // For non-Instagram browsers, just navigate to the target page
      navigate(targetPath + location.search, { replace: true });
    }
  }, [navigate, targetPath, location.search]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6 text-center border border-cyan-700">
        <h1 className="text-2xl font-bold mb-4">Abriendo navegador externo...</h1>
        <p className="mb-6">Para una mejor experiencia, estamos redirigiendo a tu navegador predeterminado.</p>
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-cyan-600 animate-ping mb-2"></div>
          <p className="text-sm text-gray-400">Redirigiendo...</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-400 mb-3">Si no eres redirigido automáticamente:</p>
          <a 
            href={fullTargetUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 rounded-lg font-medium text-white transition-all hover:scale-105"
          >
            Abrir en Navegador
          </a>
        </div>
      </div>
    </div>
  );
};

export default InstagramRedirectPage;
