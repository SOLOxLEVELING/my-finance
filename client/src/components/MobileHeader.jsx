// src/components/MobileHeader.jsx

import React from "react";
import {Link} from "react-router-dom";
import {Menu, User} from "lucide-react"; // <-- Import User icon

// Logo component (unchanged)
const Logo = () => (
    <div className="flex items-center">
        <div className="bg-white text-gray-900 w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-xl">T</span>
            <span className="font-bold text-xl text-indigo-600">7</span>
        </div>
        <span className="text-xl font-bold text-white ml-2">myFinance</span>
    </div>
);


const MobileHeader = ({onMenuClick}) => {
    return (
        <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-gray-900 text-white shadow-md">
            {/* Logo */}
            {/* --- UPDATED --- */}
            <Link to="/app">
                <Logo/>
            </Link>

            {/* --- Right Side Icons (NEW) --- */}
            <div className="flex items-center space-x-2">
                {/* Profile Icon Link */}
                {/* --- UPDATED --- */}
                <Link
                    to="/app/settings" // was /settings
                    className="p-2 rounded-md text-gray-300 hover:bg-gray-700"
                >
                    <User size={22}/>
                </Link>

                {/* Hamburger Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-md text-gray-300 hover:bg-gray-700"
                >
                    <Menu size={24}/>
                </button>
            </div>
        </header>
    );
};

export default MobileHeader;