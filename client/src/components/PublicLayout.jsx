// src/components/PublicLayout.jsx

import React from "react";
import {Link, Outlet} from "react-router-dom";

// --- Logo Component ---
const Logo = () => (
    <Link to="/" className="flex items-center">
        <div className="bg-gray-900 text-white w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-xl">T</span>
            <span className="font-bold text-xl text-indigo-600">7</span>
        </div>
        <span className="text-xl font-bold text-gray-900 ml-2">myFinance</span>
    </Link>
);

// --- Header Component ---
const PublicHeader = () => {
    return (
        <header className="bg-white border-b border-gray-200">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Logo/>

                {/* Nav Links */}
                <div className="flex items-center space-x-4">
                    <Link
                        to="/login"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>
        </header>
    );
};

// --- Footer Component ---
const PublicFooter = () => {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="container mx-auto px-6 py-8 text-center">
                <Logo/>
                <p className="mt-4 text-sm text-gray-500">
                    © 2025 myFinance. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

// --- Main Layout Component ---
const PublicLayout = () => {
    return (
        <div className="bg-white">
            <PublicHeader/>
            <main>
                {/* This will render LandingPage, LoginPage, or RegisterPage */}
                <Outlet/>
            </main>
            <PublicFooter/>
        </div>
    );
};

export default PublicLayout;