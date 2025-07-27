require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  // The connectionString is the only property needed.
  // It will be read from the .env file for local development,
  // or from the environment variables provided by Docker Compose when running in a container.
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
