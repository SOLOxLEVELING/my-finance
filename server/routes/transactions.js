const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const stream = require("stream");
const db = require("../db");
const authenticateToken = require("../middleware/authenticateToken");
const router = express.Router();
const axios = require("axios");

router.use(authenticateToken);

// --- Helper function to get exchange rates ---
const { getLiveRates } = require("../utils/currency");

// --- FIX: This route now correctly calculates and saves amount_usd ---
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
    const userCurrency = userResult.rows[0].currency || "USD";

    // --- Start of new logic ---
    const rates = await getLiveRates();
    const rate = rates[userCurrency];
    if (!rate) {
      return res
        .status(400)
        .json({ message: `Currency ${userCurrency} not supported.` });
    }
    const amountInUSD = parseFloat(amount) / rate;
    // --- End of new logic ---

    const query = `INSERT INTO transactions(account_id, description, amount, transaction_date, category_id, currency, amount_usd) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;
    const { rows } = await db.query(query, [
      accountId,
      description,
      parseFloat(amount),
      transaction_date,
      category_id || null,
      userCurrency,
      amountInUSD, // Save the converted amount
    ]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Transaction creation error:", error);
    res.status(500).json({ message: "Failed to create transaction" });
  }
});

// --- FIX: This route now correctly recalculates amount_usd on update ---
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const ownershipCheck = await db.query(
      "SELECT t.id, t.currency FROM transactions t JOIN accounts a ON t.account_id = a.id WHERE t.id = $1 AND a.user_id = $2",
      [id, userId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Transaction not found or permission denied." });
    }

    const { categoryId, amount, description, transaction_date } = req.body;
    let setClauses = [];
    let queryParams = [];
    let paramIndex = 1;

    // --- Start of new logic ---
    if (amount !== undefined) {
      const transactionCurrency = ownershipCheck.rows[0].currency;
      const rates = await getLiveRates();
      const rate = rates[transactionCurrency];
      if (!rate) {
        return res
          .status(400)
          .json({ message: `Currency ${transactionCurrency} not supported.` });
      }
      const amountInUSD = parseFloat(amount) / rate;

      queryParams.push(parseFloat(amount));
      setClauses.push(`amount = $${paramIndex++}`);
      queryParams.push(amountInUSD);
      setClauses.push(`amount_usd = $${paramIndex++}`);
    }
    // --- End of new logic ---

    if (categoryId !== undefined) {
      queryParams.push(categoryId === "" ? null : categoryId);
      setClauses.push(`category_id = $${paramIndex++}`);
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

// --- Other routes (DELETE, GET /summary, GET /account, POST /upload) remain the same ---

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
    const formattedRows = rows.map((row) => ({
      ...row,
      amount: parseFloat(row.amount),
    }));
    res.json(formattedRows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// POST /upload
router.post(
  "/upload",
  multer({ storage: multer.memoryStorage() }).single("csvFile"),
  async (req, res) => {
    const { accountId, userId } = req.user;
    if (!req.file)
      return res.status(400).send({ message: "No file uploaded." });

    const results = [];
    const readableStream = stream.Readable.from(req.file.buffer);

    const categoryKeywords = {
      Salary: ["salary", "paycheck"],
      Groceries: ["supermarket", "grocery", "walmart", "whole foods"],
      Dining: ["restaurant", "cafe", "coffee", "starbucks", "food"],
      Shopping: ["amazon", "purchase", "mall", "flipkart"],
      Fuel: ["petrol", "gas", "fuel", "shell"],
      Entertainment: ["netflix", "spotify", "cinema", "movie"],
      Bills: ["electricity", "water", "internet", "mobile"],
    };

    function guessCategory(description) {
      const text = description.toLowerCase();
      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some((word) => text.includes(word))) return cat;
      }
      return "Uncategorized";
    }

    readableStream
      .pipe(csv())
      .on("data", (row) => {
        if (row.transaction_date && row.description && row.amount)
          results.push(row);
      })
      .on("end", async () => {
        if (results.length === 0) {
          return res
            .status(400)
            .send({ message: "CSV file is empty or invalid." });
        }
        try {
          await db.query("BEGIN");
          const userResult = await db.query(
            "SELECT currency FROM users WHERE id = $1",
            [userId]
          );
          const userCurrency = userResult.rows[0].currency;
          const rates = await getLiveRates();
          for (const row of results) {
            const { transaction_date, description, amount } = row;
            let categoryName =
              row.category && row.category.trim() !== ""
                ? row.category.trim()
                : guessCategory(description);
            const existing = await db.query(
              "SELECT id FROM categories WHERE user_id=$1 AND name=$2",
              [userId, categoryName]
            );
            let categoryId;
            if (existing.rows.length > 0) {
              categoryId = existing.rows[0].id;
            } else {
              const inserted = await db.query(
                "INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING id",
                [userId, categoryName]
              );
              categoryId = inserted.rows[0].id;
            }
            const amountInUSD = parseFloat(amount) / (rates[userCurrency] || 1);
            await db.query(
              `INSERT INTO transactions (account_id, transaction_date, description, amount, currency, amount_usd, category_id)
   VALUES ($1,$2,$3,$4,$5,$6,$7)`,
              [
                accountId,
                transaction_date,
                description,
                parseFloat(amount),
                userCurrency,
                amountInUSD,
                categoryId,
              ]
            );
          }
          await db.query("COMMIT");
          res.status(201).send({
            message: `${results.length} transactions uploaded successfully!`,
          });
        } catch (err) {
          await db.query("ROLLBACK");
          console.error("CSV Upload Error:", err);
          res.status(500).send({ message: "Failed to import data." });
        }
      });
  }
);

module.exports = router;
