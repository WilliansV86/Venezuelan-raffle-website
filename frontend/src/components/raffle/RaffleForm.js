import React, { useState, useEffect, useRef } from 'react';

const RaffleForm = ({ initialData = {}, onSubmit, onCancel = () => {}, isEdit = false, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    ticketPrice: 0,
    startDate: '',
    endDate: '',
    drawDate: '',
    maxTickets: 10000,
    prize: { name: '', description: '' },
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || '',
        ticketPrice: initialData.ticketPrice || 0,
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        drawDate: initialData.drawDate || '',
        maxTickets: initialData.maxTickets || 10000,
        prize: initialData.prize || { name: '', description: '' },
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('prize.')) {
      const prizeField = name.split('.')[1];
      setFormData(prev => ({ ...prev, prize: { ...prev.prize, [prizeField]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create a preview URL for the selected image
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    // Update the form data with a temporary URL
    // The actual upload will happen when the form is submitted
    setFormData(prev => ({ ...prev, imageUrl: 'Imagen seleccionada' }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a FormData object to send to the server if there's an image file
    if (imageFile) {
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'prize') {
          submitData.append('prizeName', formData.prize.name);
          submitData.append('prizeDescription', formData.prize.description);
        } else if (key !== 'imageUrl') { // Skip imageUrl as we'll use the file
          submitData.append(key, formData[key]);
        }
      });
      
      // Add the image file
      submitData.append('image', imageFile);
      
      onSubmit(submitData, true); // true indicates this is FormData with a file
    } else {
      // No image file, proceed with regular JSON submission
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 text-white">
      {error && <div className="p-4 bg-red-900/50 border border-red-700 text-white rounded-md">{error}</div>}

      {/* General Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-yellow-300">Título del Sorteo *</label>
          <input 
            type="text" 
            name="title" 
            id="title" 
            value={formData.title} 
            onChange={handleChange} 
            required 
            className="mt-1 block w-full px-4 py-3 bg-blue-900/50 border border-blue-500 rounded-md shadow-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="ticketPrice" className="block text-sm font-medium text-yellow-300">Precio del Boleto ($) *</label>
          <input 
            type="number" 
            name="ticketPrice" 
            id="ticketPrice" 
            value={formData.ticketPrice} 
            onChange={handleChange} 
            required 
            min="0" 
            step="0.01" 
            className="mt-1 block w-full px-4 py-3 bg-blue-900/50 border border-blue-500 rounded-md shadow-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-yellow-300">Descripción</label>
        <textarea 
          name="description" 
          id="description" 
          value={formData.description} 
          onChange={handleChange} 
          rows="4" 
          className="mt-1 block w-full px-4 py-3 bg-blue-900/50 border border-blue-500 rounded-md shadow-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-yellow-300 mb-2">Imagen del Sorteo</label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-yellow-300 mb-1">Subir Imagen:</label>
            <input 
              type="file" 
              id="imageFile" 
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full px-4 py-2 bg-blue-900/50 border border-blue-500 rounded-md shadow-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">Formatos: JPG, PNG, GIF (Max: 5MB)</p>
          </div>
          
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-yellow-300 mb-1">O usar URL de Imagen:</label>
            <input 
              type="url" 
              name="imageUrl" 
              id="imageUrl" 
              value={imageFile ? '' : formData.imageUrl} 
              onChange={handleChange} 
              disabled={imageFile !== null}
              placeholder="https://ejemplo.com/imagen.jpg" 
              className="mt-1 block w-full px-4 py-2 bg-blue-900/50 border border-blue-500 rounded-md shadow-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
        </div>
        
        {/* Image Preview */}
        {(imagePreview || formData.imageUrl) && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-yellow-300 mb-2">Vista previa:</label>
            <div className="border border-blue-500 rounded-md p-2 bg-blue-900/20 flex justify-center">
              <img 
                src={imagePreview || formData.imageUrl} 
                alt="Vista previa de la imagen" 
                className="max-h-48 object-contain" 
                onError={(e) => {
                  if (!imagePreview) {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-yellow-300">Fecha de Inicio *</label>
          <input 
            type="datetime-local" 
            name="startDate" 
            id="startDate" 
            value={formData.startDate} 
            onChange={handleChange} 
            required 
            className="mt-1 block w-full px-4 py-3 bg-blue-900/50 border border-blue-500 rounded-md shadow-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-yellow-300">Fecha de Finalización *</label>
          <input 
            type="datetime-local" 
            name="endDate" 
            id="endDate" 
            value={formData.endDate} 
            onChange={handleChange} 
            required 
            className="mt-1 block w-full px-4 py-3 bg-blue-900/50 border border-blue-500 rounded-md shadow-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="drawDate" className="block text-sm font-medium text-yellow-300">Fecha del Sorteo *</label>
          <input 
            type="datetime-local" 
            name="drawDate" 
            id="drawDate" 
            value={formData.drawDate} 
            onChange={handleChange} 
            required 
            className="mt-1 block w-full px-4 py-3 bg-blue-900/50 border border-blue-500 rounded-md shadow-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Prize Info */}
      <div className="border-t border-red-500 pt-6 mt-8">
        <h3 className="text-xl font-bold text-red-400 mb-4 font-luckiest-guy">Detalles del Premio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="prizeName" className="block text-sm font-medium text-yellow-300">Nombre del Premio *</label>
            <input 
              type="text" 
              name="prize.name" 
              id="prizeName" 
              value={formData.prize.name} 
              onChange={handleChange} 
              required 
              className="mt-1 block w-full px-4 py-3 bg-blue-900/50 border border-blue-500 rounded-md shadow-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="maxTickets" className="block text-sm font-medium text-yellow-300">Máximo de Boletos *</label>
            <input 
              type="number" 
              name="maxTickets" 
              id="maxTickets" 
              value={formData.maxTickets} 
              onChange={handleChange} 
              required 
              min="1" 
              className="mt-1 block w-full px-4 py-3 bg-blue-900/50 border border-blue-500 rounded-md shadow-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-6">
          <label htmlFor="prizeDescription" className="block text-sm font-medium text-yellow-300">Descripción del Premio</label>
          <textarea 
            name="prize.description" 
            id="prizeDescription" 
            value={formData.prize.description} 
            onChange={handleChange} 
            rows="3" 
            className="mt-1 block w-full px-4 py-3 bg-blue-900/50 border border-blue-500 rounded-md shadow-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          ></textarea>
        </div>
      </div>

      <div className="flex space-x-4 pt-6 mt-8 border-t border-yellow-500">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 py-3 px-6 border border-red-500 rounded-md shadow-md text-base font-medium text-white bg-transparent hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={loading} 
          className="flex-1 py-3 px-6 border border-transparent rounded-md shadow-md text-base font-medium text-white bg-yellow-600 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 transition-all duration-200"
        >
          {loading ? 'Guardando...' : (isEdit ? 'Actualizar Sorteo' : 'Crear Sorteo')}
        </button>
      </div>
    </form>
  );
};

export default RaffleForm;
