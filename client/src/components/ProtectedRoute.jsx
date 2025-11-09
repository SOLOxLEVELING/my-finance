// src/components/ProtectedRoute.jsx

import React from "react";
import {useAuth} from "../context/AuthContext";
import {Navigate, Outlet} from "react-router-dom";

const ProtectedRoute = () => {
    const {isAuthenticated} = useAuth();

    // --- UPDATED ---
    // Redirects to /app/login instead of /login
    return isAuthenticated ? <Outlet/> : <Navigate to="/app/login"/>;
};

export default ProtectedRoute;