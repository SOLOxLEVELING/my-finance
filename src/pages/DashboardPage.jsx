import React, { useState, useEffect } from "react";
import axios from "axios";
import SummaryWidget from "../components/SummaryWidget";

const DashboardPage = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Hardcoded value for Step 2 ---
  // In a real app, this would come from user context after login.
  const accountId = 1;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await axios.get(
          `http://localhost:3001/api/summary/${accountId}`
        );
        setSummaryData(response.data);
      } catch (err) {
        setError("Failed to load financial summary. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [accountId]); // Re-fetch if accountId changes

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Dashboard
      </h1>

      {/* This is the main grid for all dashboard widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {isLoading && (
          <div className="col-span-1 lg:col-span-3 text-center py-10">
            <p>Loading your dashboard...</p>
          </div>
        )}

        {error && (
          <div className="col-span-1 lg:col-span-3 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {!isLoading && !error && summaryData && (
          // Place widgets inside this grid
          <SummaryWidget summaryData={summaryData} />
          // Future widgets like charts will go here as more `col-span` items
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
