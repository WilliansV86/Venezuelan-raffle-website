import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Page components
import HomePage from './pages/HomePage';
import RaffleDetailPage from './pages/RaffleDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import VerifyTicketsPage from './pages/VerifyTicketsPage';
import WinnersPage from './pages/WinnersPage';
import PastRaffleDetailPage from './pages/PastRaffleDetailPage';
import TestPurchasePage from './pages/TestPurchasePage';
import FormDebugPage from './pages/FormDebugPage';
// Admin Page Components
import AdminRafflesListPage from './pages/admin/AdminRafflesListPage';
import CreateRafflePage from './pages/admin/CreateRafflePage';
import DirectEditRafflePage from './pages/admin/DirectEditRafflePage';
import AdminPage from './pages/AdminPage';
import ParticipationPage from './pages/ParticipationPage';
import TermsPage from './pages/TermsPage';
import RaffleStatusManager from './components/admin/RaffleStatusManager';
import LoginPage from './pages/LoginPage';
import RequireAdmin from './components/auth/RequireAdmin';



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
          <Route path="/verify-tickets" element={<VerifyTicketsPage />} />
          <Route path="/ganadores" element={<WinnersPage />} />
          <Route path="/ganadores/:id" element={<PastRaffleDetailPage />} />
          <Route path="/test-purchase" element={<TestPurchasePage />} />
          <Route path="/form-debug" element={<FormDebugPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Admin Routes */}
          <Route path="/admin/raffles" element={<AdminRafflesListPage />} />
          <Route path="/admin/raffles/new" element={<CreateRafflePage />} />
          <Route path="/admin/raffles/edit/:id" element={<DirectEditRafflePage />} />
          <Route path="/admin/raffles/status" element={<RaffleStatusManager />} />
                    <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={
  <RequireAdmin>
    <AdminPage />
  </RequireAdmin>
} />

          <Route path="/raffle/:raffleId/participate" element={<ParticipationPage />} />
          

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      <WhatsAppButton phoneNumber="+58 424 137 8533" />
      
    </div>
  );
}

export default App;
