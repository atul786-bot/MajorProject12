import express from "express";
import db from "../database.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const totalRow = db.prepare("SELECT COUNT(*) AS count FROM execution_history").get();
    const passedRow = db.prepare("SELECT COUNT(*) AS count FROM execution_history WHERE status = 'passed'").get();
    const failedRow = db.prepare("SELECT COUNT(*) AS count FROM execution_history WHERE status = 'failed'").get();
    const healedRow = db.prepare("SELECT COUNT(*) AS count FROM execution_history WHERE healed = 1").get();
    const avgDurationRow = db.prepare("SELECT AVG(duration) AS avg FROM execution_history WHERE duration IS NOT NULL").get();

    const total = totalRow ? totalRow.count : 0;
    const passed = passedRow ? passedRow.count : 0;
    const failed = failedRow ? failedRow.count : 0;
    const healed = healedRow ? healedRow.count : 0;
    const avgDuration = avgDurationRow && avgDurationRow.avg ? parseFloat(avgDurationRow.avg.toFixed(2)) : 0;
    const passRate = total > 0 ? parseFloat(((passed / total) * 100).toFixed(1)) : 0;

    const recent = db.prepare("SELECT * FROM execution_history ORDER BY id DESC LIMIT 10").all();

    res.json({
      summary: {
        totalExecutions: total,
        passedExecutions: passed,
        failedExecutions: failed,
        healedExecutions: healed,
        passRate,
        avgDuration
      },
      recentExecutions: recent
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to generate overview metrics",
      error: err.message
    });
  }
});

export default router;
