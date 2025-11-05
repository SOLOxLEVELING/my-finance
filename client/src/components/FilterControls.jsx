// src/components/FilterControls.jsx

import React from "react";

const FilterControls = ({filters, onFilterChange}) => {
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        onFilterChange(name, value);
    };

    return (
        // --- Updated Card Styles ---
        <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Search by Description */}
                <div className="lg:col-span-2">
                    <label
                        htmlFor="search"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Search Description
                    </label>
                    <input
                        type="text"
                        name="search"
                        id="search"
                        value={filters.search}
                        onChange={handleInputChange}
                        // --- Updated Input Styles ---
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="e.g., Uber, Salary..."
                    />
                </div>

                {/* Start Date */}
                <div>
                    <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Start Date
                    </label>
                    <input
                        type="date"
                        name="startDate"
                        id="startDate"
                        value={filters.startDate}
                        onChange={handleInputChange}
                        // --- Updated Input Styles ---
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                {/* End Date */}
                <div>
                    <label
                        htmlFor="endDate"
                        className="block text-sm font-medium text-gray-700"
                    >
                        End Date
                    </label>
                    <input
                        type="date"
                        name="endDate"
                        id="endDate"
                        value={filters.endDate}
                        onChange={handleInputChange}
                        // --- Updated Input Styles ---
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                {/* Clear Button */}
                <div className="flex items-end">
                    {/* --- Updated Button Styles --- */}
                    <button
                        onClick={() => onFilterChange("clear", "")}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterControls;