const { Pool } = require("pg");

// Replace with your PostgreSQL connection details
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "myFinance",
  password: "2000",
  port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};