// src/pages/LandingPage.jsx

// --- 1. UPDATED: Import useState, AnimatePresence, Menu, and X ---
import React, {useState} from "react";
import {Link} from "react-router-dom";
import {AnimatePresence, motion} from "framer-motion";
import {ArrowRight, BarChart3, Goal, Lock, Menu, TrendingUp, X,} from "lucide-react";

// --- Reusable Button Components (shadcn/ui style) ---
// ... (No changes to Button or ButtonDark) ...
const Button = ({children, to, variant = "primary"}) => {
    const baseStyle =
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:shadow-lg hover:-translate-y-0.5";
    const styles = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700",
        secondary: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50",
    };
    return (
        <Link to={to} className={`${baseStyle} ${styles[variant]}`}>
            {children}
        </Link>
    );
};
const ButtonDark = ({children, to, variant = "primary"}) => {
    const baseStyle =
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 hover:shadow-lg hover:-translate-y-0.5";
    const styles = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700",
        secondary: "bg-white text-gray-900 hover:bg-gray-200",
    };
    return (
        <Link to={to} className={`${baseStyle} ${styles[variant]}`}>
            {children}
        </Link>
    );
};

// --- 4. Added Framer Motion Variants ---
// ... (No change to fadeInUp) ...
const fadeInUp = {
    hidden: {opacity: 0, y: 20},
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeInOut",
        },
    },
};

// --- NEW: Mobile Menu Component ---
const LandingMobileMenu = ({onClose}) => {
    return (
        <motion.div
            className="fixed inset-0 z-40 bg-gray-900 text-white p-6 md:hidden"
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -20}}
            transition={{duration: 0.3, ease: "easeInOut"}}
        >
            {/* Header with Close Button (it's inside the nav, so we just need links) */}
            <div className="flex flex-col items-center justify-center h-full">
                <nav className="flex flex-col space-y-8 text-center">
                    <a
                        href="#features"
                        onClick={onClose} // Close menu on click
                        className="text-3xl font-medium text-gray-300 hover:text-indigo-400"
                    >
                        Features
                    </a>
                    <a
                        href="#pricing"
                        onClick={onClose} // Close menu on click
                        className="text-3xl font-medium text-gray-300 hover:text-indigo-400"
                    >
                        Pricing
                    </a>

                    {/* Divider */}
                    <hr className="border-gray-700 w-1/2 mx-auto"/>

                    <Link
                        to="/app/login"
                        onClick={onClose} // Close menu on click
                        className="text-3xl font-medium text-gray-300 hover:text-indigo-400"
                    >
                        Login
                    </Link>

                    {/* Main CTA Button */}
                    <Link
                        to="/app/register"
                        onClick={onClose} // Close menu on click
                        className="inline-flex items-center justify-center rounded-md px-8 py-3 text-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                    >
                        Sign Up
                    </Link>
                </nav>
            </div>
        </motion.div>
    );
};


// --- Main Landing Page Component ---
const LandingPage = () => {
    // --- NEW: State for mobile menu ---
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="bg-white text-gray-900">
            {/* --- NEW: Navigation Bar --- */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    {/* ... (Logo is unchanged) ... */}
                    <Link
                        to="/"
                        className="flex items-center gap-x-2 text-2xl font-bold text-gray-900"
                    >
                        <span className="font-bold text-2xl text-indigo-600">T</span>
                        <span className="font-bold text-2xl text-indigo-600">7</span>
                        <span>myFinance</span>
                    </Link>

                    {/* ... (Desktop Navigation Links are unchanged) ... */}
                    <div className="hidden md:flex items-center space-x-6">
                        <a
                            href="#features"
                            className="text-gray-600 hover:text-indigo-600 transition-colors"
                        >
                            Features
                        </a>
                        <a
                            href="#pricing"
                            className="text-gray-600 hover:text-indigo-600 transition-colors"
                        >
                            Pricing
                        </a>
                        <Button to="/app/login" variant="secondary">
                            Login
                        </Button>
                        <Button to="/app/register" variant="primary">
                            Sign Up
                        </Button>
                    </div>

                    {/* --- UPDATED: Mobile Menu Button (Hamburger) --- */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} // Toggles state
                            className="text-gray-900 hover:text-indigo-600 focus:outline-none z-50" // z-50 to be above menu
                        >
                            {isMobileMenuOpen ? (
                                <X size={28}/> // Show X icon if menu is open
                            ) : (
                                <Menu size={28}/> // Show Menu icon if menu is closed
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- NEW: Render Mobile Menu --- */}
            <AnimatePresence>
                {isMobileMenuOpen && <LandingMobileMenu onClose={() => setIsMobileMenuOpen(false)}/>}
            </AnimatePresence>

            {/* 1. Hero Section */}
            <motion.section
                className="pt-40 pb-24 sm:pb-32 bg-gray-50"
                // --- 4. Added Animation ---
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
            >
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-gray-900">
                        Track Your Money,
                        <br/>
                        Take Control of Your Future.
                    </h1>
                    <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
                        A smart, simple finance dashboard to track income, expenses,
                        budgets, and savings — all in one place.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Button to="/app/register" variant="primary">
                            Get Started <ArrowRight className="w-4 h-4 ml-2"/>
                        </Button>
                        <Button to="/app/login" variant="secondary">
                            Login
                        </Button>
                    </div>

                    {/* --- 1. Updated Hero Image Spacing & Gradient --- */}
                    <motion.div
                        className="mt-24 max-w-4xl mx-auto p-4 md:p-6 rounded-lg shadow-xl border border-gray-200 bg-gradient-to-b from-white to-gray-100"
                        variants={fadeInUp} // Staggered animation
                    >
                        <img
                            src="/img/feature.png"
                            alt="Financial Dashboard Illustration"
                            className="w-full rounded-lg" // Removed shadow/border from img
                        />
                    </motion.div>
                </div>
            </motion.section>

            {/* 2. Key Features Section */}
            <motion.section
                id="features"
                className="py-24 bg-white"
                // --- 4. Added Scroll Animation ---
                initial="hidden"
                whileInView="visible"
                viewport={{once: true, amount: 0.2}}
                variants={fadeInUp}
            >
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            Everything you need, nothing you don't.
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Focus on what matters with a clear, uncluttered view of your
                            finances.
                        </p>
                    </div>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature Cards ... (no changes here, but they will be inside the animated section) */}
                        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                            <div
                                className="w-12 h-12 p-3 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6"/>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                Track Income & Expenses
                            </h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Automatically categorize your transactions and see where your
                                money is going.
                            </p>
                        </div>
                        {/* ... other feature cards ... */}
                        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                            <div
                                className="w-12 h-12 p-3 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-6 h-6"/>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                Visual Insights
                            </h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Real-time charts and graphs for your spending, savings, and
                                monthly progress.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                            <div
                                className="w-12 h-12 p-3 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                                <Goal className="w-6 h-6"/>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                Budgeting Made Simple
                            </h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Set monthly budgets for different categories and easily track
                                your progress.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                            <div
                                className="w-12 h-12 p-3 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                                <Lock className="w-6 h-6"/>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                Secure & Private
                            </h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Your data is yours. We provide a secure dashboard for your
                                eyes only.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* 3. Product Screenshot Section */}
            <motion.section
                className="py-24 sm:py-32 bg-gray-100"
                // --- 4. Added Scroll Animation ---
                initial="hidden"
                whileInView="visible"
                viewport={{once: true, amount: 0.2}}
                variants={fadeInUp}
            >
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            See Your Finances in a New Light
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Our dashboard is designed to be powerful, beautiful, and easy
                            to use.
                        </p>
                    </div>

                    {/* Dashboard Mockup */}
                    <div className="mt-16">
                        <div
                            className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-w-5xl mx-auto transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                            {/* Browser Bar */}
                            <div className="h-10 bg-gray-100 flex items-center px-4 space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            {/* Image Placeholder */}
                            <div className="p-4 bg-gray-50 flex items-center justify-center">
                                <img
                                    src="/img/main.png"
                                    alt="myFinance Dashboard Screenshot"
                                    className="w-full h-auto rounded-lg shadow-md"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* 4. Pricing Section (Portfolio Version) */}
            <motion.section
                id="pricing"
                className="py-24 bg-white"
                // --- 4. Added Scroll Animation ---
                initial="hidden"
                whileInView="visible"
                viewport={{once: true, amount: 0.2}}
                variants={fadeInUp}
            >
                <div className="container mx-auto px-6 max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Free. Forever.
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        This is a portfolio project designed to showcase a modern,
                        full-stack web application. You can use it for free, forever.
                    </p>
                    <div className="mt-10">
                        <div
                            className="bg-gray-50 rounded-lg shadow-lg border border-gray-200 p-8 max-w-sm mx-auto">
              <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-600">
                Portfolio Plan
              </span>
                            <div className="mt-4 flex items-baseline gap-x-2">
                <span className="text-5xl font-bold tracking-tight text-gray-900">
                  $0
                </span>
                                <span className="text-xl font-semibold text-gray-600">
                  / forever
                </span>
                            </div>
                            <p className="mt-4 text-sm text-gray-600">
                                All features included for personal and portfolio use.
                            </p>
                            <Button to="/app/register" variant="primary">
                                Get Started for Free
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* 5. Final CTA Section */}
            <motion.section
                className="bg-gray-900 py-24"
                // --- 4. Added Scroll Animation ---
                initial="hidden"
                whileInView="visible"
                viewport={{once: true, amount: 0.2}}
                variants={fadeInUp}
            >
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                        Start Tracking Your Finances Today
                    </h2>
                    <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
                        Take the first step towards financial clarity. Get your free
                        dashboard and take control.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <ButtonDark to="/app/register" variant="primary">
                            Get Started <ArrowRight className="w-4 h-4 ml-2"/>
                        </ButtonDark>
                        <ButtonDark to="/app/login" variant="secondary">
                            Login
                        </ButtonDark>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default LandingPage;