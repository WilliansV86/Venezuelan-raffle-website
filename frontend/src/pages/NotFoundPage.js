import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-vnz-red">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-6">Página no encontrada</h2>
        <p className="text-lg text-gray-600 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link 
          to="/" 
          className="btn btn-primary inline-block"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
