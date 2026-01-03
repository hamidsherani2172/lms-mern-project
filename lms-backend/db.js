const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "lms_db",
  password: "1234",   // replace with YOUR postgres password
  port: 5432
});

module.exports = pool;
