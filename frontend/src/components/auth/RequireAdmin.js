import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RequireAdmin = () => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // While the authentication state is loading, show a loading indicator.
    // This prevents the redirect from happening before the check is complete.
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Loading authentication...</p>
            </div>
        );
    }

    // If loading is finished and the user is authenticated, show the protected content.
    // Otherwise, redirect them to the login page.
    return (
        isAuthenticated
            ? <Outlet />
            : <Navigate to="/admin/login" state={{ from: location }} replace />
    );
}

export default RequireAdmin;
