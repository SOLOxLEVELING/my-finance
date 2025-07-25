const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const stream = require("stream");
const db = require("../db");

const router = express.Router();

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload
// This route handles the CSV file upload
router.post("/upload", upload.single("csvFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded." });
  }

  // --- Hardcoded values for Step 1 ---
  // In a real app, you'd get these from the user's session/request.
  const accountId = 1; // Assuming the transactions belong to account with ID 1

  const results = [];
  const fileBuffer = req.file.buffer;

  const readableStream = stream.Readable.from(fileBuffer);

  readableStream
    .pipe(csv())
    .on("data", (data) => {
      // Basic validation for each row
      if (data.transaction_date && data.description && data.amount) {
        results.push(data);
      }
    })
    .on("end", async () => {
      if (results.length === 0) {
        return res
          .status(400)
          .send({ message: "CSV file is empty or has invalid format." });
      }

      const client = await db.query("BEGIN"); // Start a database transaction

      try {
        for (const row of results) {
          const { transaction_date, description, amount } = row;
          const queryText = `
            INSERT INTO transactions(account_id, transaction_date, description, amount, category_id)
            VALUES($1, $2, $3, $4, NULL)
          `;
          // Note: category_id is set to NULL for now.
          await db.query(queryText, [
            accountId,
            transaction_date,
            description,
            parseFloat(amount),
          ]);
        }

        await db.query("COMMIT"); // Commit the transaction
        res.status(201).send({
          message: `${results.length} transactions uploaded successfully!`,
        });
      } catch (error) {
        await db.query("ROLLBACK"); // Rollback on error
        console.error("Database insert error:", error);
        res
          .status(500)
          .send({ message: "Failed to import data into the database." });
      }
    })
    .on("error", (error) => {
      console.error("CSV parsing error:", error);
      res.status(500).send({ message: "Error parsing CSV file." });
    });
});

// GET /api/summary/:accountId
// Calculates and returns total income, expenses, and net savings.
router.get("/summary/:accountId", async (req, res) => {
  const { accountId } = req.params;

  if (!accountId) {
    return res.status(400).send({ message: "Account ID is required." });
  }

  const summaryQuery = `
      SELECT
        -- Sum of all positive amounts (income)
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS "totalIncome",
        -- Sum of all negative amounts (expenses)
        COALESCE(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END), 0) AS "totalExpenses"
      FROM transactions
      WHERE account_id = $1;
    `;

  try {
    const { rows } = await db.query(summaryQuery, [accountId]);
    const summary = rows[0];

    // Calculate net savings
    const netSavings =
      parseFloat(summary.totalIncome) + parseFloat(summary.totalExpenses);

    res.status(200).send({
      totalIncome: parseFloat(summary.totalIncome),
      totalExpenses: parseFloat(summary.totalExpenses), // This will be a negative number
      netSavings: netSavings,
    });
  } catch (error) {
    console.error("Database summary error:", error);
    res.status(500).send({ message: "Failed to fetch summary data." });
  }
});

// GET /api/transactions/account/:accountId
// Fetches transactions for an account with optional filtering
router.get("/account/:accountId", async (req, res) => {
  const { accountId } = req.params;
  const { search, minAmount, maxAmount, startDate, endDate } = req.query;

  let queryParams = [accountId];
  let conditions = [];

  let baseQuery = `
      SELECT
          t.id, t.transaction_date, t.description, t.amount, t.category_id,
          c.name AS category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.account_id = $1
    `;

  if (search) {
    queryParams.push(`%${search}%`);
    conditions.push(`t.description ILIKE $${queryParams.length}`);
  }
  if (minAmount) {
    queryParams.push(minAmount);
    conditions.push(`t.amount >= $${queryParams.length}`);
  }
  if (maxAmount) {
    queryParams.push(maxAmount);
    conditions.push(`t.amount <= $${queryParams.length}`);
  }
  if (startDate) {
    queryParams.push(startDate);
    conditions.push(`t.transaction_date >= $${queryParams.length}`);
  }
  if (endDate) {
    queryParams.push(endDate);
    conditions.push(`t.transaction_date <= $${queryParams.length}`);
  }

  if (conditions.length > 0) {
    baseQuery += " AND " + conditions.join(" AND ");
  }

  baseQuery += " ORDER BY t.transaction_date DESC;";

  try {
    const { rows } = await db.query(baseQuery, queryParams);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching filtered transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// PUT /api/transactions/:transactionId
// Updates the category for a single transaction
router.put("/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  const { categoryId } = req.body; // Can be null to "uncategorize"

  try {
    const { rows } = await db.query(
      "UPDATE transactions SET category_id = $1 WHERE id = $2 RETURNING *",
      [categoryId, transactionId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Transaction not found." });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Failed to update transaction" });
  }
});

module.exports = router;
