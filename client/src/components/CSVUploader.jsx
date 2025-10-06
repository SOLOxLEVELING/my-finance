import React, { useState } from "react";
import axios from "axios";

const CSVUploader = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setIsError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file first.");
      setIsError(true);
      return;
    }

    const token = localStorage.getItem("token"); // 👈 get the token

    if (!token) {
      setMessage("Not authenticated. Please login again.");
      setIsError(true);
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", file);

    setIsUploading(true);
    setMessage("Uploading...");
    setIsError(false);

    try {
      const response = await apiClient.post(
      "/transactions/upload", // Use the endpoint path only
      formData,
       {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // 👈 set the token here
          },
        }
      );
      setMessage(response.data.message);
      setIsError(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <div>
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Import Transactions
        </h2>
        <p className="mt-2 text-sm text-center text-gray-600">
          Upload a CSV file with your transaction history.
        </p>
        <p className="mt-1 text-xs text-center text-gray-500">
          Columns should include:{" "}
          <code className="bg-gray-200 p-1 rounded">transaction_date</code>,{" "}
          <code className="bg-gray-200 p-1 rounded">description</code>,{" "}
          <code className="bg-gray-200 p-1 rounded">amount</code>.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700"
          >
            CSV File
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button
          type="submit"
          disabled={isUploading || !file}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : "Upload File"}
        </button>
      </form>
      {message && (
        <div
          className={`mt-4 text-center text-sm ${
            isError ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default CSVUploader;
