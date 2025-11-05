// src/pages/LoginPage.jsx

import React, {useState} from "react";
import {useAuth} from "../context/AuthContext";
import {Link, useNavigate} from "react-router-dom";
import apiClient from "../api/axios";

// --- New Logo Component (local to this page) ---
const Logo = () => (
    <div className="flex justify-center items-center mb-6">
        {/* Simple "T7" logo */}
        <div className="bg-gray-900 text-white w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-2xl">T</span>
            <span className="font-bold text-2xl text-indigo-600">7</span>
        </div>
        <span className="text-3xl font-bold text-gray-900 ml-3">myFinance</span>
    </div>
);

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
        try {
            const response = await apiClient.post("/auth/login", {email, password});
            login(response.data);
            navigate("/");
        } catch (err) {
            setError("Failed to log in. Please check your credentials.");
        }
    };

    return (
        // --- Updated Background ---
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-4">
                <Logo/>

                {/* --- Updated Card Styles --- */}
                <div className="p-8 space-y-6 bg-white rounded-lg shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-bold text-center text-gray-900">
                        Login to Your Account
                    </h2>
                    {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email Address
                            </label>
                            {/* --- Updated Input Styles --- */}
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:bg-white focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            {/* --- Updated Input Styles --- */}
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:bg-white focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Log In
                        </button>
                        <p className="text-center text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="font-medium text-indigo-600 hover:underline"
                            >
                                Register here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;