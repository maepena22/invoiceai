import Database from 'better-sqlite3';
const db = new Database('invoices.db');

// 初始化表
db.prepare(`
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT,
    total_amount TEXT,
    date TEXT,
    raw_ocr TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

module.exports = db;