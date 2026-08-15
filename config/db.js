// const mysql = require("mysql2/promise");
// require("dotenv").config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10
// });

// module.exports = pool;
const mysql = require("mysql2/promise");
require("dotenv").config();

let sslConfig;

if (process.env.DB_SSL === "true") {
  if (!process.env.DB_SSL_CA) {
    throw new Error("DB_SSL_CA is required when DB_SSL=true.");
  }

  sslConfig = {
    ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n"),
    rejectUnauthorized: true
  };
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 5
});

module.exports = pool;