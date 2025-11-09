// src/components/StatCard.jsx

import React from "react";
import {Link, useNavigate} from "react-router-dom"; // <-- Import useNavigate
import {useCurrency} from "../hooks/useCurrency";
import {ArrowUpRight, Plus} from "lucide-react"; // <-- Import Plus

// Color mapping (unchanged)
const colorStyles = {
    green: {
        bg: "bg-green-600",
        text: "text-green-800",
        lightBg: "bg-green-100",
        iconColor: "text-green-600",
    },
    red: {
        bg: "bg-red-600",
        text: "text-red-800",
        lightBg: "bg-red-100",
        iconColor: "text-red-600",
    },
    blue: {
        bg: "bg-blue-600",
        text: "text-blue-800",
        lightBg: "bg-blue-100",
        iconColor: "text-blue-600",
    },
    default: {
        bg: "bg-indigo-600",
        text: "text-indigo-800",
        lightBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
    },
};

const StatCard = ({
                      title,
                      value,
                      icon: Icon,
                      colorTheme = "default",
                      linkTo = "/", // This is correct, it's passed from DashboardPage
                      showQuickAdd = false, // <-- New prop
                  }) => {
    const {format} = useCurrency();
    const colors = colorStyles[colorTheme] || colorStyles.default;
    const navigate = useNavigate(); // <-- Initialize navigate

    // --- New Quick Add Handler ---
    const handleQuickAdd = (e) => {
        e.stopPropagation(); // Stop link navigation if clicking button

        // --- UPDATED ---
        // Navigate to /app/transactions
        navigate("/app/transactions", {state: {openModal: true}});
    };

    return (
        <div
            className={`relative flex flex-col justify-between p-5 rounded-2xl shadow-lg ${colors.bg} text-white overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-200`}
        >
            {/* Top Section (unchanged) */}
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${colors.lightBg} ${colors.iconColor}`}>
                    <Icon size={22}/>
                </div>
                <span className="font-semibold text-lg">{title}</span>
            </div>

            {/* Main Value (unchanged) */}
            <div className="my-4">
                <h2 className="text-4xl font-bold">
                    {format(Math.abs(value))}
                </h2>
            </div>

            {/* --- UPDATED Bottom Section --- */}
            <div className="flex justify-between items-center z-10">
                {/* "More ->" Link */}
                <Link
                    to={linkTo} // This correctly receives /app/transactions from DashboardPage.jsx
                    className="flex items-center text-sm font-medium opacity-90 hover:opacity-100"
                >
                    More
                    <ArrowUpRight size={16} className="ml-1"/>
                </Link>

                {/* --- Quick Add Button (Conditional) --- */}
                {showQuickAdd && (
                    <button
                        onClick={handleQuickAdd}
                        className={`flex items-center py-1 px-3 rounded-md text-sm font-medium ${colors.lightBg} ${colors.text}`}
                    >
                        <Plus size={16} className="mr-1"/>
                        Add
                    </button>
                )}
            </div>
        </div>
    );
};

export default StatCard;