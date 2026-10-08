import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDirectory = path.join(__dirname, "data", "db");
fs.mkdirSync(dbDirectory, { recursive: true });

const dbPath = path.join(dbDirectory, "execution-history.db");
const db = new Database(dbPath);

db.exec(`
    CREATE TABLE IF NOT EXISTS execution_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        testId TEXT NOT NULL,
        status TEXT NOT NULL,
        duration REAL,
        healed INTEGER DEFAULT 0,
        healingScore REAL,
        message TEXT,
        failureProbability REAL,
        riskLevel TEXT,
        prediction INTEGER,
        priority INTEGER,
        executedAt TEXT NOT NULL,
        timestamp TEXT
    )
`);

export default db;
