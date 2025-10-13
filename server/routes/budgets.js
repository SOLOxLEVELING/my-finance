const express = require("express");
const db = require("../db");
const authenticateToken = require("../middleware/authenticateToken");
const axios = require("axios");

const router = express.Router();
router.use(authenticateToken);

const { getLiveRates } = require("../utils/currency");

// ✅ GET budgets
router.get("/:month", async (req, res) => {
  const { month } = req.params;
  const { userId } = req.user;

  try {
    const categories = await db.query(
      "SELECT id, name FROM categories WHERE user_id=$1 ORDER BY name",
      [userId]
    );

    const budgets = await db.query(
      "SELECT category_id, amount, currency, amount_usd FROM budgets WHERE user_id=$1 AND month::date=$2::date",
      [userId, month]
    );

    const map = new Map(
      budgets.rows.map((b) => [parseInt(b.category_id, 10), b])
    );

    // ... inside the GET /:month route ...
    const spending = await db.query(
      `SELECT t.category_id, t.amount_usd
       FROM transactions t
       JOIN accounts a ON t.account_id=a.id
       WHERE a.user_id=$1
       AND t.transaction_date >= $2
       AND t.transaction_date < ($2::date + '1 month'::interval)
       AND t.amount < 0`, // --- FIX: Add this line to count only expenses ---
      [userId, month]
    );
    // ...

    console.log("Spending rows:", spending.rows);

    const spentMap = new Map();
    spending.rows.forEach((tx) => {
      const spent = Math.abs(parseFloat(tx.amount_usd));
      spentMap.set(tx.category_id, (spentMap.get(tx.category_id) || 0) + spent);
    });

    const result = categories.rows.map((cat) => {
      const b = map.get(cat.id) || {
        amount: 0,
        currency: "USD",
        amount_usd: 0,
      };

      // BUG: This console.log is in the wrong place.
      // It logs the `result` array on the first iteration when it's still empty or incomplete.
      // console.log("Final budgets result:", result); // <--- THIS IS THE BUG

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        budgetAmountOriginal: parseFloat(b.amount),
        budgetCurrency: b.currency,
        budgetAmountUSD: parseFloat(b.amount_usd),
        spentAmountUSD: spentMap.get(cat.id) || 0,
      };
    });

    // FIX: Move the console.log here to correctly log the final array
    // after it has been fully constructed.
    console.log("Final budgets result:", result);

    res.json(result);
  } catch (err) {
    console.error("GET budgets error:", err.message);
    res.status(500).json({ message: "Failed to fetch budgets" });
  }
});

// ✅ BULK UPDATE budgets
router.post("/bulk-update", async (req, res) => {
    const { budgets, month } = req.body;
    const { userId } = req.user;
  
    if (!Array.isArray(budgets) || !month) {
      return res.status(400).json({ message: "Invalid data format" });
    }
  
    try {
      const user = await db.query("SELECT currency FROM users WHERE id=$1", [
        userId,
      ]);
      const userCurrency = user.rows[0]?.currency || "USD";
  
      const rates = await getLiveRates();
      const rate = rates[userCurrency];
  
      await db.query("BEGIN");
  
      const query = `
        INSERT INTO budgets (user_id, category_id, amount, currency, amount_usd, month)
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (user_id,category_id,month)
        DO UPDATE SET amount=$3, currency=$4, amount_usd=$5;
      `;
  
      for (const b of budgets) {
        const amount = parseFloat(b.amount) || 0;
        if (isNaN(amount)) continue;
  
        // --- FIX: The problematic line has been removed ---
  
        const amountInUSD = rate ? amount / rate : amount;
  
        await db.query(query, [
          userId,
          b.categoryId,
          amount,
          userCurrency,
          amountInUSD,
          month,
        ]);
      }
  
      await db.query("COMMIT");
      res.json({ message: "Budgets saved" });
    } catch (err) {
      await db.query("ROLLBACK");
      console.error("Bulk-update budgets error:", err.message);
      res.status(500).json({ message: "Failed to save budgets" });
    }
  });

module.exports = router;
