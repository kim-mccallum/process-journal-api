require("dotenv").config();
const { DATABASE_URL } = require("./src/config");

module.exports = {
  migrationsDirectory: "migrations",
  driver: "pg",
  connectionString: DATABASE_URL,
};
