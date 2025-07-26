const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const stream = require("stream");
const db = require("../db");
const authenticateToken = require("../middleware/authenticateToken");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);

router.post("/upload", upload.single("csvFile"), async (req, res) => {
  const { accountId } = req.user;
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded." });
  }

  const results = [];
  const readableStream = stream.Readable.from(req.file.buffer);

  readableStream
    .pipe(csv())
    .on("data", (data) => {
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
      const client = await db.query("BEGIN");
      try {
        for (const row of results) {
          const { transaction_date, description, amount } = row;
          const queryText = `INSERT INTO transactions(account_id, transaction_date, description, amount, category_id) VALUES($1, $2, $3, $4, NULL)`;
          await db.query(queryText, [
            accountId,
            transaction_date,
            description,
            parseFloat(amount),
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
});

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
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

router.put("/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  const { categoryId } = req.body;
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
    res.status(500).json({ message: "Failed to update transaction" });
  }
});

module.exports = router;
