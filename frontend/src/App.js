import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Page components
import HomePage from './pages/HomePage';
import RaffleDetailsPage from './pages/RaffleDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
// Admin Page Components
import AdminRafflesListPage from './pages/admin/AdminRafflesListPage';
import CreateRafflePage from './pages/admin/CreateRafflePage';
import EditRafflePage from './pages/admin/EditRafflePage';


// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/common/WhatsAppButton';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/raffle/:id" element={<RaffleDetailsPage />} />

          {/* Admin Routes */}
          <Route path="/admin/raffles" element={<AdminRafflesListPage />} />
          <Route path="/admin/raffles/new" element={<CreateRafflePage />} />
          <Route path="/admin/raffles/edit/:id" element={<EditRafflePage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      <WhatsAppButton phoneNumber="+584123456789" />
      <Footer />
    </div>
  );
}

export default App;
