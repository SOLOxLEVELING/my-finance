// src/context/SidebarContext.jsx

import React, {createContext, useContext, useState} from "react";

// 1. Create the context
const SidebarContext = createContext();

// 2. Create the provider component
export const SidebarProvider = ({children}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed((prev) => !prev);
    };

    return (
        <SidebarContext.Provider value={{isCollapsed, toggleSidebar}}>
            {children}
        </SidebarContext.Provider>
    );
};

// 3. Create a custom hook to use the context easily
export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};