const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const stream = require("stream");
const db = require("../db");
const authenticateToken = require("../middleware/authenticateToken");
const router = express.Router();

router.use(authenticateToken);

// --- All other routes (POST /, PUT /:id, DELETE /:id, GET /summary, GET /account) remain the same. ---
// --- Only the POST /upload route below has been changed. ---

// This route now saves the user's current currency with the transaction
router.post("/", async (req, res) => {
  const { accountId, userId } = req.user;
  const { description, amount, transaction_date, category_id } = req.body;
  if (!description || !amount || !transaction_date) {
    return res
      .status(400)
      .json({ message: "Description, amount, and date are required." });
  }
  try {
    const userResult = await db.query(
      "SELECT currency FROM users WHERE id = $1",
      [userId]
    );
    const userCurrency = userResult.rows[0].currency;

    const query = `INSERT INTO transactions(account_id, description, amount, transaction_date, category_id, currency) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;`;
    const { rows } = await db.query(query, [
      accountId,
      description,
      parseFloat(amount),
      transaction_date,
      category_id || null,
      userCurrency, // Save the currency
    ]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to create transaction" });
  }
});

// PUT /api/transactions/:id (The single, correct update route)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    // First, verify the user owns this transaction
    const ownershipCheck = await db.query(
      "SELECT t.id FROM transactions t JOIN accounts a ON t.account_id = a.id WHERE t.id = $1 AND a.user_id = $2",
      [id, userId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Transaction not found or permission denied." });
    }

    // Dynamically build the update query
    let setClauses = [];
    let queryParams = [];
    let paramIndex = 1;
    const { categoryId, amount, description, transaction_date } = req.body;

    if (categoryId !== undefined) {
      queryParams.push(categoryId === "" ? null : categoryId);
      setClauses.push(`category_id = $${paramIndex++}`);
    }
    if (amount !== undefined) {
      queryParams.push(parseFloat(amount));
      setClauses.push(`amount = $${paramIndex++}`);
    }
    if (description !== undefined) {
      queryParams.push(description);
      setClauses.push(`description = $${paramIndex++}`);
    }
    if (transaction_date !== undefined) {
      queryParams.push(transaction_date);
      setClauses.push(`transaction_date = $${paramIndex++}`);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ message: "No fields to update." });
    }

    queryParams.push(id);
    const updateQuery = `UPDATE transactions SET ${setClauses.join(
      ", "
    )} WHERE id = $${paramIndex} RETURNING *`;

    const { rows } = await db.query(updateQuery, queryParams);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Failed to update transaction" });
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  try {
    const deleteQuery = `DELETE FROM transactions WHERE id = $1 AND account_id IN (SELECT id FROM accounts WHERE user_id = $2)`;
    const result = await db.query(deleteQuery, [id, userId]);
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Transaction not found or permission denied." });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete transaction." });
  }
});

// GET /api/transactions/summary
router.get("/summary", async (req, res) => {
  const { accountId } = req.user;
  const q = `SELECT COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS "totalIncome", COALESCE(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END), 0) AS "totalExpenses" FROM transactions WHERE account_id = $1;`;
  try {
    const { rows } = await db.query(q, [accountId]);
    const summary = rows[0];
    const netSavings =
      parseFloat(summary.totalIncome) + parseFloat(summary.totalExpenses);
    res.json({
      totalIncome: parseFloat(summary.totalIncome),
      totalExpenses: parseFloat(summary.totalExpenses),
      netSavings,
    });
  } catch (e) {
    res.status(500).send({ message: "Failed to fetch summary data." });
  }
});

// GET /api/transactions/account
router.get("/account", async (req, res) => {
  const { accountId } = req.user;
  const { search, minAmount, maxAmount, startDate, endDate } = req.query;
  let queryParams = [accountId];
  let conditions = [];
  let baseQuery = `SELECT t.id, t.transaction_date, t.description, t.amount, t.category_id, c.name AS category_name FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.account_id = $1`;

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

    // FIX: Convert amount from a string to a number for each transaction
    const formattedRows = rows.map((row) => ({
      ...row,
      amount: parseFloat(row.amount),
    }));

    res.json(formattedRows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// --- NEW AND IMPROVED UPLOAD LOGIC ---

// A map of keywords to link descriptions to category names.
// You can expand this list with more keywords and categories.
const categoryKeywords = {
  Salary: ["paycheck"],
  Shopping: ["amazon", "purchase"],
  Dining: ["starbucks", "lyft", "coffee"],
  Groceries: ["whole foods", "market"],
  Fuel: ["shell gas", "station"],
  Entertainment: ["netflix", "spotify", "subscription"],
};

// The CSV upload now also saves the user's current currency with each transaction
router.post(
  "/upload",
  multer({ storage: multer.memoryStorage() }).single("csvFile"),
  async (req, res) => {
    const { accountId, userId } = req.user;
    if (!req.file)
      return res.status(400).send({ message: "No file uploaded." });

    // ... (file parsing logic)
    const results = [];
    const readableStream = stream.Readable.from(req.file.buffer);
    readableStream
      .pipe(csv())
      .on("data", (data) => {
        if (data.transaction_date && data.description && data.amount)
          results.push(data);
      })
      .on("end", async () => {
        // ... (error handling for empty file)
        const client = await db.query("BEGIN");
        try {
          const userResult = await db.query(
            "SELECT currency FROM users WHERE id = $1",
            [userId]
          );
          const userCurrency = userResult.rows[0].currency;

          for (const row of results) {
            const { transaction_date, description, amount } = row;
            const queryText = `INSERT INTO transactions(account_id, transaction_date, description, amount, category_id, currency) VALUES($1, $2, $3, $4, NULL, $5)`;
            await db.query(queryText, [
              accountId,
              transaction_date,
              description,
              parseFloat(amount),
              userCurrency, // Save the currency
            ]);
          }
          await db.query("COMMIT");
          res.status(201).send({
            message: `${results.length} transactions uploaded successfully!`,
          });
        } catch (error) {
          await db.query("ROLLBACK");
          res
            .status(500)
            .send({ message: "Failed to import data into the database." });
        }
      });
  }
);

module.exports = router;
