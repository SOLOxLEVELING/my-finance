// src/components/Sidebar.jsx

import React from "react";
import {Link, useLocation} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {ArrowRightLeft, Grip, LayoutDashboard, LineChart, LogOut, Settings, Wallet,} from "lucide-react";

// Helper component for individual sidebar items
const SidebarItem = ({icon: Icon, text, to}) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`
        flex items-center py-2.5 px-4 rounded-md transition-colors duration-200
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

const Sidebar = () => {
    const {logout} = useAuth();

    return (
        <div className="flex flex-col w-64 h-screen px-4 py-6 bg-indigo-900 text-white">
            {/* Logo */}
            <div className="flex items-center px-4 mb-8">
                <Wallet size={32} className="text-indigo-300 mr-3"/>
                <span className="text-2xl font-bold text-white">myFinance</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-2">
                <SidebarItem icon={LayoutDashboard} text="Dashboard" to="/"/>
                <SidebarItem
                    icon={ArrowRightLeft}
                    text="Transactions"
                    to="/transactions"
                />
                <SidebarItem icon={Grip} text="Categories" to="/categories"/>
                <SidebarItem icon={LineChart} text="Budgets" to="/budgets"/>
                <SidebarItem icon={Settings} text="Settings" to="/settings"/>
            </nav>

            {/* Footer / Logout */}
            <div className="mt-auto">
                <button
                    onClick={logout}
                    className="flex items-center w-full py-2.5 px-4 rounded-md transition-colors duration-200 text-indigo-100 hover:bg-indigo-700 hover:text-white"
                >
                    <LogOut size={20} className="mr-3"/>
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;