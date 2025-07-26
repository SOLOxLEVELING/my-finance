require("dotenv").config(); // <-- Added this as the first line

const express = require("express");
const cors = require("cors");
const transactionRoutes = require("./routes/transactions");
const categoryRoutes = require("./routes/categories");
const chartRoutes = require("./routes/charts"); // <-- Import chart routes
const budgetRoutes = require("./routes/budgets"); // <-- Import budget routes
const authRoutes = require("./routes/auth"); // <-- Import auth routes
const ratesRoutes = require("./routes/rates"); // <-- Import new route

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Public routes (no authentication needed)
app.use("/api/auth", authRoutes); // <-- Register auth routes

// API Routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/charts", chartRoutes); // <-- Register chart routes
app.use("/api/budgets", budgetRoutes); // <-- Register budget routes
app.use("/api/rates", ratesRoutes); // <-- Added this line

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
