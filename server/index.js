const express = require("express");
const cors = require("cors");
const transactionRoutes = require("./routes/transactions");

const app = express();
const PORT = process.env.PORT || 3001; // Backend will run on port 3001

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies

// API Routes
app.use("/api", transactionRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
