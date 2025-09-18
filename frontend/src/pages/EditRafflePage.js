import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiConfig from '../config/apiConfig';


const EditRafflePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [raffle, setRaffle] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ticketPrice: '',
    // Add other fields as necessary
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchRaffle = async () => {
      try {
        const adminKey = localStorage.getItem('admin_key');
        if (!adminKey) {
          navigate('/admin');
          return;
        }

        const API_URL = process.env.NODE_ENV === 'production' ? '/api' : apiConfig.API_URL.replace("/api", "") + "/api";
        const { data } = await axios.get(`${API_URL}/raffles/${id}`, {
          headers: { 'x-admin-key': adminKey }
        });

        if (data.success) {
          setRaffle(data.data);
          setFormData({
            title: data.data.title,
            description: data.data.description,
            ticketPrice: data.data.ticketPrice,
            // Populate other fields
          });
        } else {
          setError('Failed to load raffle data.');
        }
      } catch (err) {
        setError('An error occurred while fetching the raffle.');
      } finally {
        setLoading(false);
      }
    };

    fetchRaffle();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess('');
      const adminKey = localStorage.getItem('admin_key');
      const API_URL = process.env.NODE_ENV === 'production' ? '/api' : apiConfig.API_URL.replace("/api", "") + "/api";
      
      const response = await axios.put(`${API_URL}/raffles/${id}`, formData, {
        headers: { 'x-admin-key': adminKey }
      });

      if (response.data.success) {
        setSuccess('Raffle updated successfully!');
        setTimeout(() => navigate('/admin'), 2000);
      } else {
        setError('Failed to update raffle.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="bg-red-500 text-white p-4 text-center">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6">Edit Raffle</h1>
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4">
          <div>
            <label htmlFor="title" className="block mb-2 font-medium">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="description" className="block mb-2 font-medium">Description</label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600"
            ></textarea>
          </div>
          <div>
            <label htmlFor="ticketPrice" className="block mb-2 font-medium">Ticket Price ($)</label>
            <input
              type="number"
              name="ticketPrice"
              id="ticketPrice"
              value={formData.ticketPrice}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600"
            />
          </div>
          
          {success && <div className="bg-green-600 text-white p-3 rounded">{success}</div>}

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => navigate('/admin')} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Cancel</button>
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRafflePage;
