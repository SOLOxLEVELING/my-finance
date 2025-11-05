// src/pages/DataImportPage.jsx

import React from "react";
import CSVUploader from "../components/CSVUploader";

const DataImportPage = () => {
    return (
        // This wrapper centers the uploader
        <div className="flex flex-col items-center">
            <CSVUploader/>
        </div>
    );
};

export default DataImportPage;