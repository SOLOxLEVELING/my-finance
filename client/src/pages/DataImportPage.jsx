// src/pages/DataImportPage.jsx

import React from "react";
import CSVUploader from "../components/CSVUploader";

const DataImportPage = () => {
    return (
        // We keep this wrapper to center the max-width uploader on the page
        <div className="flex flex-col items-center">
            <CSVUploader/>
        </div>
    );
};

export default DataImportPage;