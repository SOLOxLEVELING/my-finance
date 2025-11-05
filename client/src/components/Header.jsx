// src/components/Header.jsx

import React, {useEffect, useRef, useState} from "react";
import {useAuth} from "../context/AuthContext";
import {Bell, ChevronDown, LogOut} from "lucide-react";

// --- User Profile Dropdown Component ---
const ProfileDropdown = () => {
    const {logout, user} = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const username = user?.username || user?.email?.split('@')[0] || "Administrator";
    const initials = (username[0] || "A").toUpperCase();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 text-left"
            >
                <div
                    className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                    {initials}
                </div>
                <div>
                    <div className="font-semibold text-sm text-gray-800 capitalize">
                        {username}
                    </div>
                    <div className="text-xs text-gray-500">Administrator</div>
                </div>
                <ChevronDown size={16} className="text-gray-500"/>
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        <LogOut size={16} className="mr-2"/>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Main Header Component ---
const Header = () => {
    return (
        // --- UPDATED: Changed justify-between to justify-end ---
        <header className="hidden lg:flex items-center justify-end h-20 bg-white border-b border-gray-200 px-8">

            {/* --- Search Bar (REMOVED) --- */}

            {/* --- Right Side: Icons & Profile --- */}
            <div className="flex items-center space-x-6">
                <button className="text-gray-500 hover:text-gray-800">
                    <Bell size={22}/>
                </button>

                <div className="w-px h-8 bg-gray-200"></div>

                <ProfileDropdown/>
            </div>
        </header>
    );
};

export default Header;