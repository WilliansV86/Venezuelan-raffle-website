// This is a modification of App.js with added routes for progress management
// Copy the relevant parts to your App.js for local testing

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import AdminRafflesListPage from './pages/admin/AdminRafflesListPage';
import ManageRaffleProgressPage from './pages/admin/ManageRaffleProgressPage';
import EditRafflePage from './pages/admin/EditRafflePage';
import CreateRafflePage from './pages/admin/CreateRafflePage';

// ... other imports and components

function App() {
  return (
    <Router>
      <Routes>
        {/* Add this new route for managing progress */}
        <Route path="/admin/raffles/progress/:id" element={
          <AdminLayout>
            <ManageRaffleProgressPage />
          </AdminLayout>
        } />
        
        {/* Existing routes */}
        <Route path="/admin/raffles" element={
          <AdminLayout>
            <AdminRafflesListPage />
          </AdminLayout>
        } />
        <Route path="/admin/raffles/edit/:id" element={
          <AdminLayout>
            <EditRafflePage />
          </AdminLayout>
        } />
        <Route path="/admin/raffles/new" element={
          <AdminLayout>
            <CreateRafflePage />
          </AdminLayout>
        } />
        
        {/* ... other routes */}
      </Routes>
    </Router>
  );
}

export default App;
