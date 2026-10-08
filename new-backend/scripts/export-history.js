import db from "../database.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exportDir = path.resolve(__dirname, "../../new-ai/data/raw");
fs.mkdirSync(exportDir, { recursive: true });

const csvPath = path.join(exportDir, "execution_history.csv");
const jsonPath = path.join(exportDir, "execution_history.json");

export function exportExecutionHistory() {
  const rows = db.prepare("SELECT * FROM execution_history ORDER BY id ASC").all();

  // Export JSON
  fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2), "utf-8");

  // Export CSV
  const headers = [
    "id",
    "testId",
    "status",
    "duration",
    "healed",
    "healingScore",
    "message",
    "failureProbability",
    "riskLevel",
    "prediction",
    "priority",
    "executedAt",
    "timestamp"
  ];

  const csvLines = [headers.join(",")];
  for (const r of rows) {
    const line = headers.map((h) => {
      const val = r[h];
      if (val === null || val === undefined) return "";
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(",");
    csvLines.push(line);
  }

  fs.writeFileSync(csvPath, csvLines.join("\n"), "utf-8");
  console.log(`Exported ${rows.length} execution history records to ${csvPath}`);
}

if (process.argv[1] && process.argv[1].endsWith("export-history.js")) {
  exportExecutionHistory();
}
