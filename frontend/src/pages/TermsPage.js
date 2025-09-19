import React from 'react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-green-400 mb-6">Términos y Condiciones</h1>
        <div className="space-y-4 text-gray-300">
          <p>Este es un texto de marcador de posición para los términos y condiciones. Aquí se detallarán las reglas del sorteo, las políticas de pago, la elegibilidad de los participantes y otras informaciones legales importantes.</p>
          <h2 className="text-2xl font-semibold text-green-300 pt-4">1. Elegibilidad</h2>
          <p>Para participar, debe ser mayor de 18 años. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <h2 className="text-2xl font-semibold text-green-300 pt-4">2. Cómo Participar</h2>
          <p>La participación se realiza a través de la compra de uno o más tickets en nuestro sitio web. Cada ticket representa una entrada al sorteo. Proin eget tortor risus.</p>
          <h2 className="text-2xl font-semibold text-green-300 pt-4">3. Pagos</h2>
          <p>Los pagos deben ser confirmados para que la participación sea válida. Nos pondremos en contacto con usted para verificar el pago después de que envíe su formulario de participación. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus.</p>
          <h2 className="text-2xl font-semibold text-green-300 pt-4">4. Anuncio de Ganadores</h2>
          <p>Los ganadores serán anunciados en nuestras redes sociales y contactados directamente a través del correo electrónico proporcionado. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
