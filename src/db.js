const Database = require("better-sqlite3");

function createDb(path = "salary.db") {
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      job_title TEXT NOT NULL,
      country TEXT NOT NULL,
      salary REAL NOT NULL
    )
  `);
  return db;
}

module.exports = { createDb };
