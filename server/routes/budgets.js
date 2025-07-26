const express = require("express");
const db = require("../db");
const authenticateToken = require("../middleware/authenticateToken");
const router = express.Router();

router.use(authenticateToken);

router.get("/:month", async (req, res) => {
  const { month } = req.params;
  const { userId } = req.user;

  // These rates are used to convert all amounts to a common base (USD) for calculation
  const RATES = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    INR: 86.46,
    JPY: 157.65,
    AUD: 1.5,
    CAD: 1.37,
    CHF: 0.9,
    CNY: 7.25,
  };

  try {
    // Step 1: Get all of the user's categories
    const categoriesResult = await db.query(
      "SELECT id, name FROM categories WHERE user_id = $1 ORDER BY name",
      [userId]
    );
    if (categoriesResult.rows.length === 0) {
      return res.json([]); // No categories, so no budgets to show
    }

    // Step 2: Get all budgets for the chosen month
    const budgetsResult = await db.query(
      "SELECT category_id, amount, currency FROM budgets WHERE user_id = $1 AND month = $2",
      [userId, month]
    );
    // Create a simple map for easy lookup
    const budgetsMap = new Map(
      budgetsResult.rows.map((b) => [
        b.category_id,
        { amount: parseFloat(b.amount), currency: b.currency },
      ])
    );

    // Step 3: Get all spending transactions for the chosen month
    const spendingResult = await db.query(
      `SELECT t.category_id, t.amount, t.currency 
       FROM transactions t
       JOIN accounts a ON t.account_id = a.id
       WHERE a.user_id = $1 AND t.amount < 0 AND t.transaction_date >= $2 AND t.transaction_date < ($2::date + '1 month'::interval)`,
      [userId, month]
    );
    // Create a map of total spending (in USD) per category
    const spendingMap = new Map();
    for (const tx of spendingResult.rows) {
      const rate = RATES[tx.currency] || 1;
      const spentInUSD = Math.abs(parseFloat(tx.amount)) / rate;
      const currentSpent = spendingMap.get(tx.category_id) || 0;
      spendingMap.set(tx.category_id, currentSpent + spentInUSD);
    }

    // Step 4: Combine all data together
    const finalBudgetData = categoriesResult.rows.map((category) => {
      const budget = budgetsMap.get(category.id) || {
        amount: 0,
        currency: "USD",
      };
      const budgetRate = RATES[budget.currency] || 1;
      const budgetInUSD = budget.amount / budgetRate;
      const spentInUSD = spendingMap.get(category.id) || 0;

      return {
        categoryId: category.id,
        categoryName: category.name,
        // For the Edit Page
        budgetAmountOriginal: budget.amount,
        budgetCurrency: budget.currency,
        // For the Dashboard Widget (all in USD)
        budgetAmountUSD: budgetInUSD,
        spentAmountUSD: spentInUSD,
      };
    });

    res.json(finalBudgetData);
  } catch (error) {
    console.error("Error fetching budget data:", error);
    res.status(500).json({ message: "Failed to fetch budget data" });
  }
});

// The /bulk-update route remains the same and is correct.
router.post("/bulk-update", async (req, res) => {
  const { budgets, month } = req.body;
  const { userId } = req.user;

  if (!Array.isArray(budgets) || !month) {
    return res.status(400).json({ message: "Invalid data format." });
  }

  const userResult = await db.query(
    "SELECT currency FROM users WHERE id = $1",
    [userId]
  );
  const userCurrency = userResult.rows[0].currency;

  const client = await db.query("BEGIN");
  try {
    const query = `
      INSERT INTO budgets (user_id, category_id, amount, month, currency) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (user_id, category_id, month) 
      DO UPDATE SET amount = EXCLUDED.amount, currency = EXCLUDED.currency;
    `;

    for (const budget of budgets) {
      await db.query(query, [
        userId,
        budget.categoryId,
        parseFloat(budget.amount) || 0,
        month,
        userCurrency,
      ]);
    }

    await db.query("COMMIT");
    res.status(200).json({ message: "Budgets saved successfully." });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error during budget bulk update:", error);
    res.status(500).json({ message: "Failed to save budgets." });
  }
});

module.exports = router;
