// src/components/MonthlyOverviewChart.jsx

import React, {useEffect, useState} from "react";
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";
import {useCurrency} from "../hooks/useCurrency";
import apiClient from "../api/axios"; // <-- Import apiClient

const MonthlyOverviewChart = () => {
    const {format} = useCurrency();
    const [view, setView] = useState("month"); // <-- State for the dropdown
    const [chartData, setChartData] = useState([]); // <-- State for the chart data
    const [isLoading, setIsLoading] = useState(true);

    // --- NEW: Fetch data inside this component ---
    useEffect(() => {
        const fetchChartData = async () => {
            setIsLoading(true);
            try {
                // Pass the 'view' state as a query parameter
                const response = await apiClient.get(
                    `/charts/monthly-summary?view=${view}`
                );
                setChartData(response.data);
            } catch (error) {
                console.error("Failed to fetch chart data", error);
                setChartData([]); // Set empty data on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchChartData();
    }, [view]); // <-- Re-run this effect when 'view' changes

    // --- NEW: Handle empty/loading state ---
    const isDataEmpty = !chartData || chartData.length === 0 || chartData.every(
        (item) => (item.income || 0) === 0 && (item.expenses || 0) === 0
    );

    if (isLoading) {
        return (
            <div
                className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 h-[380px] flex items-center justify-center">
                <p className="text-gray-500">Loading chart data...</p>
            </div>
        );
    }

    // Hide the component if there's no data
    if (isDataEmpty) {
        return null;
    }

    const renderChart = () => {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={chartData} // <-- Use state data
                    margin={{top: 5, right: 20, left: -10, bottom: 5}}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                    <XAxis
                        dataKey="month" // This key is now universal ('group' renamed to 'month')
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        stroke="#6b7280"
                    />
                    <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        stroke="#6b7280"
                        tickFormatter={(value) => format(value, 0)}
                    />
                    <Tooltip
                        formatter={(value) => format(value)}
                        contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                    />
                    <Legend wrapperStyle={{fontSize: "14px", color: "#374151"}}/>
                    <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]}/>
                    <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]}/>
                </BarChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div
            className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                    Monthly Overview
                </h3>
                {/* --- UPDATED: Dropdown is now functional --- */}
                <div>
                    <select
                        name="sort"
                        id="sort"
                        className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={view} // <-- Set value from state
                        onChange={(e) => setView(e.target.value)} // <-- Update state on change
                    >
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                    </select>
                </div>
            </div>

            {renderChart()}
        </div>
    );
};

export default MonthlyOverviewChart;