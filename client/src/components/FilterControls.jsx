import React from "react";

const FilterControls = ({ filters, onFilterChange }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mb-6">
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        {/* Clear Button - Spans the last grid cell */}
        <div className="flex items-end">
          <button
            onClick={() => onFilterChange("clear", "")}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
