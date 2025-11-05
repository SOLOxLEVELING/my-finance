// src/components/MobileHeader.jsx

import React from "react";
import {Link} from "react-router-dom";
import {Menu, Wallet} from "lucide-react";

const MobileHeader = ({onMenuClick}) => {
    return (
        <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-indigo-900 text-white shadow-md">
            {/* Logo */}
            <Link to="/" className="flex items-center">
                <Wallet size={28} className="text-indigo-300 mr-2"/>
                <span className="text-xl font-bold text-white">myFinance</span>
            </Link>

            {/* Hamburger Menu Button */}
            <button
                onClick={onMenuClick}
                className="p-2 rounded-md text-indigo-200 hover:bg-indigo-700"
            >
                <Menu size={24}/>
            </button>
        </header>
    );
};

export default MobileHeader;