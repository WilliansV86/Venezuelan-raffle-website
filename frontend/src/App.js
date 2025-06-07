import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Page components
import HomePage from './pages/HomePage';
import RaffleDetailsPage from './pages/RaffleDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

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
          <Route path="/" element={<HomePage />} />
          <Route path="/raffle/:id" element={<RaffleDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      <WhatsAppButton phoneNumber="+584123456789" />
      <Footer />
    </div>
  );
}

export default App;
