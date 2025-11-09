// src/components/MainLayout.jsx

import React, {useEffect, useState} from "react";
import {Outlet, useLocation} from "react-router-dom";
import {motion} from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header"; // Our new header
import Clarity from "@microsoft/clarity";
import MobileHeader from "./MobileHeader";
import MobileMenu from "./MobileMenu";

// --- UPDATED ---
// All paths prefixed with /app
const getPageTitle = (pathname) => {
    switch (pathname) {
        case "/app": // was /
            return "Dashboard";
        case "/app/transactions": // was /transactions
            return "Transactions";
        case "/app/categories": // was /categories
            return "Manage Categories";
        case "/app/budgets": // was /budgets
            return "Set Monthly Budgets";
        case "/app/settings": // was /settings
            return "Settings";
        case "/app/import": // was /import
            return "Import Data";
        default:
            return "Dashboard"; // Fallback
    }
};

const MainLayout = () => {
    const location = useLocation();
    const title = getPageTitle(location.pathname);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (import.meta.env.MODE === "production") {
            Clarity.init(import.meta.env.VITE_CLARITY_ID);
        }
    }, []);

    return (
        // Updated background color from Step 6
        <div className="flex h-screen bg-gray-100">
            {/* --- Desktop Sidebar (Hidden on mobile) --- */}
            <div className="hidden lg:flex">
                <Sidebar/>
            </div>

            {/* --- Mobile Menu (Handles its own visibility) --- */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* --- Main Content Area (Scrollable) --- */}
            <motion.div
                layout
                className="flex-1 flex flex-col overflow-hidden"
            >
                {/* --- Mobile Header (Hidden on desktop) --- */}
                <MobileHeader onMenuClick={() => setIsMobileMenuOpen(true)}/>

                {/* --- NEW Desktop Header --- */}
                {/* Placed here, outside the 'main' scrolling area */}
                {/* This component has 'hidden lg:flex' built-in */}
                <Header/>

                {/* --- Main Scrollable Content --- */}
                {/* We also apply the bg color here to ensure it's correct */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

                        {/* --- Mobile Page Title (Hidden on desktop) --- */}
                        <h1 className="lg:hidden text-3xl font-bold tracking-tight text-gray-900 mb-6">
                            {title}
                        </h1>

                        {/* The old desktop header wrapper is GONE.
              In the next step, we will add the "Dashboard" title *inside* the DashboardPage.jsx
            */}

                        {/* Page content */}
                        <Outlet/>
                    </div>
                </main>
            </motion.div>
        </div>
    );
};

export default MainLayout;