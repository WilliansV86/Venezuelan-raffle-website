import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Page components
import HomePage from './pages/HomePage';
import RaffleDetailPage from './pages/RaffleDetailPage';
import NotFoundPage from './pages/NotFoundPage';
// Admin Page Components
import AdminRafflesListPage from './pages/admin/AdminRafflesListPage';
import CreateRafflePage from './pages/admin/CreateRafflePage';
import EditRafflePage from './pages/admin/EditRafflePage';


// Layout components
import Navbar from './components/layout/Navbar';
import WhatsAppButton from './components/common/WhatsAppButton';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/raffle/:id" element={<RaffleDetailPage />} />

          {/* Admin Routes */}
          <Route path="/admin/raffles" element={<AdminRafflesListPage />} />
          <Route path="/admin/raffles/new" element={<CreateRafflePage />} />
          <Route path="/admin/raffles/edit/:id" element={<EditRafflePage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      <WhatsAppButton phoneNumber="+584123456789" />
      
    </div>
  );
}

export default App;
