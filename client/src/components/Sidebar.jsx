// src/components/Sidebar.jsx

import React from "react";
import {Link, useLocation} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {useSidebar} from "../context/SidebarContext";
import {motion} from "framer-motion";
import {
    ArrowRightLeft,
    ChevronLeft,
    ChevronRight,
    Grip,
    HelpCircle,
    LayoutDashboard,
    LineChart,
    LogOut,
    Settings,
    Upload,
} from "lucide-react";

// --- New Logo Component ---
const Logo = ({isCollapsed}) => (
    <motion.div
        className="flex items-center pt-3 pb-6"
        animate={{
            paddingLeft: isCollapsed ? 0 : 12,
            justifyContent: isCollapsed ? "center" : "flex-start"
        }}
        transition={{duration: 0.3, ease: "easeInOut"}}
    >
        {/* Simple "T7" logo from the inspiration image */}
        <div className="bg-white text-gray-900 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-2xl">T</span>
            <span className="font-bold text-2xl text-indigo-600">7</span>
        </div>

        {/* Animated Text */}
        <motion.span
            animate={{
                width: isCollapsed ? 0 : "auto",
                opacity: isCollapsed ? 0 : 1,
                marginLeft: isCollapsed ? 0 : 12,
            }}
            transition={{duration: 0.2, ease: "easeInOut"}}
            className="overflow-hidden whitespace-nowrap text-xl font-bold text-white"
        >
            myFinance
        </motion.span>
    </motion.div>
);

// --- New SidebarItem Component ---
const SidebarItem = ({icon: Icon, text, to, onClick, isCollapsed}) => {
    const location = useLocation();

    // --- UPDATED ---
    // The `isActive` logic needs to be slightly more robust for the index route.
    // location.pathname === to OR (to === "/app" and location.pathname.startsWith("/app/"))
    // But for simplicity, React Router's <NavLink> handles this better.
    // For now, this will work for all pages except showing "Dashboard" as active
    // when on "/app/transactions". Let's stick with the simple check.
    const isActive = to && location.pathname === to;

    const content = (
        <>
            <Icon
                size={22}
                className="flex-shrink-0"
            />
            <motion.span
                animate={{
                    width: isCollapsed ? 0 : "auto",
                    opacity: isCollapsed ? 0 : 1,
                    marginLeft: isCollapsed ? 0 : "1rem",
                }}
                transition={{duration: 0.2, ease: "easeInOut"}}
                className="overflow-hidden whitespace-nowrap font-medium"
            >
                {text}
            </motion.span>
        </>
    );

    const classes = `
    flex items-center py-3 px-3 rounded-lg transition-colors duration-200 w-full
    ${isActive
        ? "bg-gray-700 text-white"
        : "text-gray-400 hover:bg-gray-700 hover:text-white"
    }
    ${isCollapsed ? "justify-center" : ""}
  `;

    if (to) {
        return (
            <Link to={to} className={classes}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={classes}>
            {content}
        </button>
    );
};

// --- Main Sidebar Component ---
const Sidebar = () => {
    const {logout} = useAuth();
    const {isCollapsed, toggleSidebar} = useSidebar();

    // --- UPDATED ---
    // All 'to' paths are prefixed with /app
    const navItems = [
        {icon: LayoutDashboard, text: "Dashboard", to: "/app"},
        {icon: ArrowRightLeft, text: "Transactions", to: "/app/transactions"},
        {icon: Grip, text: "Categories", to: "/app/categories"},
        {icon: LineChart, text: "Budgets", to: "/app/budgets"},
        {icon: Settings, text: "Settings", to: "/app/settings"},
        {icon: Upload, text: "Import Data", to: "/app/import"},
    ];

    return (
        <motion.div
            animate={{width: isCollapsed ? 80 : 256}} // 80px collapsed, 256px expanded
            transition={{duration: 0.3, ease: "easeInOut"}}
            className="flex flex-col h-screen py-6 bg-gray-900 text-gray-300 relative"
        >
            {/* --- Collapse Button --- */}
            <button
                onClick={toggleSidebar}
                className="absolute z-10 top-9 -right-3.5 w-7 h-7 bg-white rounded-full flex items-center justify-center border-2 border-gray-900 text-gray-900 hover:bg-gray-100 transition-all"
            >
                {isCollapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
            </button>

            {/* --- Logo --- */}
            <Logo isCollapsed={isCollapsed}/>

            {/* --- Navigation Links --- */}
            <nav className="flex-1 space-y-2 px-4">
                {navItems.map((item) => (
                    <SidebarItem key={item.text} {...item} isCollapsed={isCollapsed}/>
                ))}
            </nav>

            {/* --- Footer / Logout --- */}
            <div className="mt-auto space-y-2 px-4">
                <SidebarItem
                    icon={HelpCircle}
                    text="Help"
                    // --- UPDATED ---
                    to="/app/help" // was /help
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    icon={LogOut}
                    text="Logout"
                    onClick={logout}
                    isCollapsed={isCollapsed}
                />
            </div>
        </motion.div>
    );
};

export default Sidebar;