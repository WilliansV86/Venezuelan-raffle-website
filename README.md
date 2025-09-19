# Sitio Web de Sorteos para Venezuela 🇻🇪

Este proyecto es una Aplicación de Página Única (SPA) completa, lista para producción y con un diseño atractivo para sorteos en línea, adaptada para usuarios venezolanos. Todos los servicios (frontend, backend, base de datos, alojamiento de imágenes) están diseñados para funcionar en plataformas de nivel gratuito.

## Características Principales

*   Ver información del sorteo, premios y tiempo restante ⏳
*   Formulario de compra de boletos: nombre, WhatsApp (+58), correo electrónico, número de boletos
*   Selección opcional del número de boleto (ej. 1–500) 🎟️
*   Subir comprobante de pago (Transferencia/Pago Móvil/Zelle/etc.)
*   Mostrar pantalla de confirmación después del envío
*   El administrador puede verificar/rechazar pagos manualmente
*   Botón de contacto de WhatsApp para ayuda o envío de comprobantes

## Stack Tecnológico

*   **Frontend**: React (con Hooks), Tailwind CSS
*   **Backend**: Node.js, Express, MongoDB (Mongoose)
*   **Alojamiento de Imágenes**: Cloudinary (o similar)
*   **Base de Datos**: MongoDB Atlas (M0 Gratuito)

## Configuración Local

### Prerrequisitos

*   Node.js (v18.x o superior recomendado)
*   npm o yarn
*   Una cuenta gratuita de MongoDB Atlas
*   Una cuenta gratuita de Cloudinary

### Backend

1.  **Clonar el repositorio (si aplica) o descargar los archivos.**
2.  **Navegar al directorio `backend`**:
    ```bash
    cd backend
    ```
3.  **Instalar dependencias**:
    ```bash
    npm install
    # o
    # yarn install
    ```
4.  **Crear un archivo `.env` en el directorio `backend`**:
    Copia el contenido de `.env.example` (si existe) o usa la siguiente plantilla y completa tus credenciales:
    ```env
    # MongoDB
    MONGO_URI=

    # Cloudinary
    CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=

    # Server
    PORT=5000
    NODE_ENV=development

    # Admin (Opcional)
    ADMIN_SECRET_KEY=
    ```
    *   `MONGO_URI`: Tu cadena de conexión de MongoDB Atlas.
    *   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Tus credenciales de Cloudinary.
    *   `PORT`: Puerto en el que se ejecutará el servidor backend (por defecto 5000).
    *   `ADMIN_SECRET_KEY`: Una clave secreta para proteger rutas de administrador (opcional, puedes implementarlo más tarde).

5.  **Iniciar el servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    El servidor backend debería estar corriendo en `http://localhost:5000`.

### Frontend (Instrucciones se añadirán más adelante)

...

## Variables de Entorno Requeridas

(Listadas en la sección de configuración del `.env`)

## Instrucciones de Despliegue en Nivel Gratuito

### Backend (Ej. Railway, Render)

1.  Asegúrate de que tu código esté en un repositorio Git (GitHub, GitLab, Bitbucket).
2.  Regístrate en [Railway](https://railway.app/) o [Render](https://render.com/).
3.  Crea un nuevo servicio/aplicación web y conéctalo a tu repositorio Git.
4.  Configura las variables de entorno en el panel de control de la plataforma de hosting (MONGO_URI, CLOUDINARY_*, PORT, NODE_ENV=production).
5.  Asegúrate de que el comando de inicio sea `npm start` (o `yarn start`).
6.  Despliega la aplicación.

### Base de Datos (MongoDB Atlas)

1.  Crea un clúster gratuito (M0) en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Configura el acceso a la red para permitir conexiones desde cualquier IP (`0.0.0.0/0`) o desde la IP de tu servicio de hosting backend.
3.  Crea un usuario de base de datos y guarda las credenciales.
4.  Obtén la cadena de conexión y úsala para la variable `MONGO_URI`.

### Alojamiento de Imágenes (Cloudinary)

1.  Crea una cuenta gratuita en [Cloudinary](https://cloudinary.com/).
2.  Obtén tus `Cloud Name`, `API Key`, y `API Secret` de tu dashboard y configúralos en las variables de entorno.

### Frontend (Ej. Netlify, Vercel, GitHub Pages)

(Instrucciones se añadirán cuando el frontend esté desarrollado)

...

## Contribuir

(Se añadirán directrices si es necesario)

## Licencia

(Se definirá más adelante, por defecto ISC como en package.json)
