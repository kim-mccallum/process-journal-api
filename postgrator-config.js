require("dotenv").config();
const { DB_URL } = require("./src/config");

module.exports = {
  migrationsDirectory: "migrations",
  driver: "pg",
  connectionString: DB_URL,
};
