const express = require("express");
const db = require("../database");
const testDefinitions = require("../data/test-definitions");

const router = express.Router();

router.get("/", (req, res) => {
    const totalTests = testDefinitions.length;

    const latestByTest = db
        .prepare(
            `SELECT testId, status, healed, riskLevel
             FROM execution_history
             WHERE id IN (
                 SELECT MAX(id)
                 FROM execution_history
                 GROUP BY testId
             )`
        )
        .all();

    let passed = 0;
    let failed = 0;
    let healed = 0;
    let highRisk = 0;

    for (const row of latestByTest) {
        const status = (row.status || "").toLowerCase();

        if (status === "passed") {
            passed += 1;
        } else if (status === "failed") {
            failed += 1;
        }

        if (row.healed === 1) {
            healed += 1;
        }

        if (
            (row.riskLevel || "").toUpperCase() === "HIGH"
        ) {
            highRisk += 1;
        }
    }

    res.json({
        totalTests,
        passed,
        failed,
        healed,
        highRisk
    });
});

module.exports = router;