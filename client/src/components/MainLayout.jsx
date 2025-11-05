// src/components/MainLayout.jsx

import React, {useEffect, useState} from "react"; // <-- Import useState
import {Outlet, useLocation} from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Clarity from "@microsoft/clarity";
import MobileHeader from "./MobileHeader"; // <-- Import MobileHeader
import MobileMenu from "./MobileMenu"; // <-- Import MobileMenu

// Helper function to get a clean page title (no change here)
const getPageTitle = (pathname) => {
    switch (pathname) {
        case "/":
            return "Dashboard";
        case "/transactions":
            return "Transactions";
        case "/categories":
            return "Manage Categories";
        case "/budgets":
            return "Set Monthly Budgets";
        case "/settings":
            return "Settings";
        case "/import":
            return "Import Data";
        default:
            return "Dashboard";
    }
};

const MainLayout = () => {
    const location = useLocation();
    const title = getPageTitle(location.pathname);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // <-- State for mobile menu

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Clarity useEffect (no change)
    useEffect(() => {
        if (import.meta.env.MODE === "production") {
            Clarity.init(import.meta.env.VITE_CLARITY_ID);
        }
    }, []);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* --- Desktop Sidebar (Hidden on mobile) --- */}
            <div className="hidden lg:flex">
                <Sidebar/>
            </div>

            {/* --- Mobile Menu (Handles its own visibility) --- */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* --- Main Content Area --- */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* --- Mobile Header (Hidden on desktop) --- */}
                <MobileHeader onMenuClick={() => setIsMobileMenuOpen(true)}/>

                {/* --- Main Scrollable Content --- */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

                        {/* --- Desktop Header (Hidden on mobile) --- */}
                        <div className="hidden lg:block">
                            <Header title={title}/>
                        </div>

                        {/* --- Mobile Page Title (Hidden on desktop) --- */}
                        <h1 className="lg:hidden text-3xl font-bold tracking-tight text-gray-900 mb-6">
                            {title}
                        </h1>

                        {/* Page content */}
                        <Outlet/>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;