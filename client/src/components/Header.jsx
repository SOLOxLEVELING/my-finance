// src/components/Header.jsx

import React from "react";
import {Link} from "react-router-dom";
import {Upload} from "lucide-react";

const Header = ({title}) => {
    return (
        <header className="flex items-center justify-between py-4 mb-6">
            {/* Page Title */}
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {title}
            </h1>

            {/* Action Button */}
            <Link
                to="/import"
                className="
          flex items-center justify-center px-4 py-2
          text-sm font-medium text-white
          bg-indigo-600 rounded-md
          hover:bg-indigo-700
          transition-colors"
            >
                <Upload size={16} className="mr-2"/>
                Import CSV
            </Link>
        </header>
    );
};

export default Header;