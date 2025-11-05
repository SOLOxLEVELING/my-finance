// src/components/MobileMenu.jsx

import React from "react";
import {Link, useLocation} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {ArrowRightLeft, Grip, LayoutDashboard, LineChart, LogOut, Settings, Upload, X,} from "lucide-react";

// Helper component for individual menu items
const MobileMenuItem = ({icon: Icon, text, to, onClick}) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            onClick={onClick} // This will close the menu on navigation
            className={`
        flex items-center py-3 px-4 rounded-md
        ${
                isActive
                    ? "bg-indigo-700 text-white"
                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
            }
      `}
        >
            <Icon size={20} className="mr-3"/>
            <span className="font-medium">{text}</span>
        </Link>
    );
};

const MobileMenu = ({isOpen, onClose}) => {
    const {logout} = useAuth();

    if (!isOpen) return null;

    return (
        // Full-screen overlay for the menu on mobile
        <div className="lg:hidden fixed inset-0 z-40 flex">
            {/* Menu Content */}
            <div className="flex flex-col w-full max-w-xs h-full p-4 bg-indigo-900 text-white">
                {/* Header with Close Button */}
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xl font-bold text-white">Menu</span>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md text-indigo-200 hover:bg-indigo-700"
                    >
                        <X size={24}/>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 space-y-2">
                    <MobileMenuItem
                        icon={LayoutDashboard}
                        text="Dashboard"
                        to="/"
                        onClick={onClose}
                    />
                    <MobileMenuItem
                        icon={ArrowRightLeft}
                        text="Transactions"
                        to="/transactions"
                        onClick={onClose}
                    />
                    <MobileMenuItem
                        icon={Grip}
                        text="Categories"
                        to="/categories"
                        onClick={onClose}
                    />
                    <MobileMenuItem
                        icon={LineChart}
                        text="Budgets"
                        to="/budgets"
                        onClick={onClose}
                    />
                    <MobileMenuItem
                        icon={Settings}
                        text="Settings"
                        to="/settings"
                        onClick={onClose}
                    />
                    {/* --- NEW IMPORT LINK --- */}
                    <MobileMenuItem
                        icon={Upload}
                        text="Import Data"
                        to="/import"
                        onClick={onClose}
                    />
                </nav>

                {/* Footer / Logout */}
                <div className="mt-auto">
                    <button
                        onClick={() => {
                            logout();
                            onClose(); // Close menu on logout
                        }}
                        className="flex items-center w-full py-3 px-4 rounded-md text-indigo-100 hover:bg-indigo-700 hover:text-white"
                    >
                        <LogOut size={20} className="mr-3"/>
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Backdrop (click to close) */}
            <div
                className="flex-1 bg-black bg-opacity-50"
                onClick={onClose}
            ></div>
        </div>
    );
};

export default MobileMenu;