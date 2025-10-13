const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const authenticateToken = require("../middleware/authenticateToken"); // <-- imported
const router = express.Router();

// A secret key for signing the JWT. In a real production app, store this in an environment variable!
// Get the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Start a transaction
    await db.query("BEGIN");

    // Insert the new user
    const newUserQuery =
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id";
    const userResult = await db.query(newUserQuery, [
      username,
      email,
      password_hash,
    ]);
    const userId = userResult.rows[0].id;

    // Create a default "Checking" account for the new user
    const newAccountQuery =
      "INSERT INTO accounts (user_id, account_name, account_type, current_balance) VALUES ($1, $2, $3, $4) RETURNING id";
    await db.query(newAccountQuery, [userId, "Checking", "Checking", 0]);

    // Commit the transaction
    await db.query("COMMIT");

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Registration error:", error);
    res.status(500).json({
      message:
        "Registration failed. The email or username may already be taken.",
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  // ... inside the POST /api/auth/login route

  try {
    // Find the user by email
    // --- In your /login route ---
    // Modify the userQuery to select the currency
    const userQuery = `
            SELECT u.id as "userId", u.password_hash, a.id as "accountId", u.currency
            FROM users u
            LEFT JOIN accounts a ON u.id = a.user_id
            WHERE u.email = $1
            LIMIT 1;
            `; // --- FIX: Changed JOIN to LEFT JOIN
    const userResult = await db.query(userQuery, [email]);
    // ...

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = userResult.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Create JWT payload
    const payload = {
      user: {
        userId: user.userId,
        accountId: user.accountId,
      },
    };

    // Sign the token
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: "3h" }, // Token expires in 3 hours
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          userId: user.userId,
          accountId: user.accountId,
          currency: user.currency,
        });
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// DELETE /api/auth/me (Deletes the logged-in user and all their data)
router.delete("/me", authenticateToken, async (req, res) => {
  const { userId } = req.user;

  try {
    // The ON DELETE CASCADE in your database schema will handle deleting all
    // associated accounts, transactions, categories, and budgets.
    const deleteUserResult = await db.query("DELETE FROM users WHERE id = $1", [
      userId,
    ]);

    if (deleteUserResult.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message:
        "Your account and all associated data have been successfully deleted.",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({ message: "Server error during account deletion." });
  }
});

// --- Added this new route before module.exports ---
// PUT /api/auth/me/currency (Updates the user's currency preference)
router.put("/me/currency", authenticateToken, async (req, res) => {
  const { userId } = req.user;
  const { currency } = req.body;

  if (!currency || currency.length !== 3) {
    return res
      .status(400)
      .json({ message: "A valid 3-letter currency code is required." });
  }

  try {
    await db.query("UPDATE users SET currency = $1 WHERE id = $2", [
      currency,
      userId,
    ]);
    res.status(200).json({ message: "Currency updated successfully." });
  } catch (error) {
    console.error("Currency update error:", error);
    res.status(500).json({ message: "Failed to update currency." });
  }
});

module.exports = router;
