const jwt = require("jsonwebtoken");
// CORRECT code for authenticateToken.js
const JWT_SECRET = process.env.JWT_SECRET; // Must be the same secret key

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("Authorization")?.split(" ")[1];

  // Check if not token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user; // Add user payload to the request object
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
