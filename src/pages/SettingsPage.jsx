// src/pages/SettingsPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/axios";
import { useCurrency } from "../hooks/useCurrency";

const SettingsPage = () => {
  const { logout, updateUserCurrency } = useAuth(); // <-- updateUserCurrency
  const { currency, loading: ratesLoading } = useCurrency(); // <-- get current currency
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleCurrencyChange = async (e) => {
    const newCurrency = e.target.value;
    try {
      await apiClient.put("/auth/me/currency", { currency: newCurrency });
      updateUserCurrency(newCurrency); // Update app state instantly
    } catch (err) {
      setError("Failed to change currency. Please try again later.");
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {
    setError("");
    // Show a confirmation dialog to prevent accidental deletion
    if (
      window.confirm(
        "Are you absolutely sure you want to delete your account? This action is irreversible and all your data will be lost forever."
      )
    ) {
      try {
        await apiClient.delete("/auth/me");

        // On successful deletion, log the user out and redirect them
        logout();
        navigate("/register", {
          replace: true,
          state: { message: "Your account has been permanently deleted." },
        });
      } catch (err) {
        setError("Failed to delete account. Please try again later.");
        console.error(err);
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Settings
      </h1>

      {/* NEW CURRENCY SECTION */}
      <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800">Currency</h2>
        <p className="mt-2 text-sm text-gray-600">
          Choose your preferred currency for display across the application.
        </p>
        <div className="mt-4">
          <select
            value={currency}
            onChange={handleCurrencyChange}
            disabled={ratesLoading}
            className="mt-1 block max-w-xs px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
          >
            <option value="USD">USD - United States Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="JPY">JPY - Japanese Yen</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="CHF">CHF - Swiss Franc</option>
            <option value="CNY">CNY - Chinese Yuan</option>
            <option value="INR">INR - Indian Rupee</option>
          </select>
        </div>
      </div>

      {/* DANGER ZONE SECTION... */}

      <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800">Danger Zone</h2>
        <p className="mt-2 text-sm text-gray-600">
          Deleting your account is a permanent action. All your financial data,
          including transactions, budgets, and categories, will be removed
          immediately. This cannot be undone.
        </p>
        <div className="mt-4">
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete My Account
          </button>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
