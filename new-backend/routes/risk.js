import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const AI_PREDICTIONS_PATH = path.resolve(__dirname, "../../new-ai/data/adaptive/prioritized_tests.json");

router.get("/", (req, res) => {
  try {
    if (fs.existsSync(AI_PREDICTIONS_PATH)) {
      const data = JSON.parse(fs.readFileSync(AI_PREDICTIONS_PATH, "utf-8"));
      return res.json({
        message: "Risk ranking retrieved from AI model output",
        riskRanking: data.tests || []
      });
    }

    // Fallback heuristic if AI model has not run yet
    const tests = db.prepare(`
      SELECT 
        testId AS test_id,
        COUNT(*) AS total_runs,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failures,
        AVG(duration) AS avg_duration
      FROM execution_history
      GROUP BY testId
    `).all();

    const riskRanking = tests.map((t, idx) => {
      const failureRate = t.total_runs > 0 ? t.failures / t.total_runs : 0;
      let riskLevel = "LOW";
      if (failureRate > 0.5) riskLevel = "HIGH";
      else if (failureRate > 0.2) riskLevel = "MEDIUM";

      return {
        test_id: t.test_id,
        failure_probability: parseFloat(failureRate.toFixed(2)),
        risk_level: riskLevel,
        prediction: failureRate > 0.3 ? 1 : 0,
        priority: idx + 1
      };
    });

    res.json({
      message: "Risk ranking calculated from execution history heuristic",
      riskRanking
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to retrieve risk ranking",
      error: err.message
    });
  }
});

export default router;
