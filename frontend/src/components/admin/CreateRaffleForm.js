import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import axios from 'axios'; // Import axios for Cloudinary upload

const CreateRaffleForm = ({ adminToken, onRaffleCreated }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [priceBs, setPriceBs] = useState('');
  const [maxTickets, setMaxTickets] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('');
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    let finalImageUrl = '';

    if (imageFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', 'raffle-uploads'); // Your unsigned preset

      try {
        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/dnxelz82j/image/upload',
          formData
        );
        finalImageUrl = response.data.secure_url;
        setUploading(false);
      } catch (uploadError) {
        setError('Error al subir la imagen a Cloudinary.');
        setUploading(false);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const newRaffle = {
        name,
        price: Number(price),
        priceBs: Number(priceBs),
        maxTickets: Number(maxTickets),
        imageUrl: finalImageUrl,
        status: 'draft',
      };

      await api.post('/admin/raffles', newRaffle, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      // Reset form
      setName('');
      setPrice('');
      setPriceBs('');
      setMaxTickets('');
      setImageFile(null);
      setImagePreview('');
      document.getElementById('imageUpload').value = null; // Clear file input
      if (onRaffleCreated) {
        onRaffleCreated();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la rifa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg h-full">
      <h3 className="text-xl font-bold text-white mb-4">Crear Nueva Rifa</h3>
      {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields for name, price, etc. remain the same */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nombre de la Rifa</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-300">Precio (USD)</label>
          <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="priceBs" className="block text-sm font-medium text-gray-300">Precio (Bs)</label>
          <input type="number" id="priceBs" value={priceBs} onChange={(e) => setPriceBs(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="maxTickets" className="block text-sm font-medium text-gray-300">Máximo de Tickets</label>
          <input type="number" id="maxTickets" value={maxTickets} onChange={(e) => setMaxTickets(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        
        {/* File Input & Preview */}
        <div>
          <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-300">Imagen de la Rifa</label>
          <input
            type="file"
            id="imageUpload"
            onChange={handleFileChange}
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30"
          />
        </div>
        {imagePreview && (
          <div className="mt-4">
            <img src={imagePreview} alt="Vista previa" className="rounded-md max-h-48 w-auto" />
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {uploading ? 'Subiendo imagen...' : (isSubmitting ? 'Creando...' : 'Crear Rifa')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRaffleForm;
