const express = require("express");

const db = require("../database");

const {
    runSelectedTests,
    runSelectedTest
} = require("../controller/adaptive-controller");

const router = express.Router();

/*
 * Read-only endpoint.
 * Returns the most recent adaptive execution results from the
 * SQLite history without triggering a new execution.
 */
router.get("/", (req, res) => {
    try {
        const rows = db
            .prepare(
                `SELECT * FROM execution_history
                 ORDER BY id DESC
                 LIMIT 20`
            )
            .all();

        res.json({
            message: "Latest execution results",
            results: rows
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to load execution results",
            error: error.message
        });
    }
});

/*
 * Adaptive execution path.
 * Triggers the M2-prioritized adaptive execution flow.
 */
router.post("/adaptive", async (req, res) => {
    try {
        const results = await runSelectedTests();

        res.json({
            message: "Adaptive test execution completed",
            results
        });
    } catch (error) {
        res.status(500).json({
            message: "Adaptive test execution failed",
            error: error.message
        });
    }
});

/*
 * Selected Test Definition execution path.
 * Receives a concrete testId and executes the stored
 * Test Definition through the integrated M1 executor.
 */
router.post("/", async (req, res) => {
    try {
        const { testId } = req.body || {};

        if (
            typeof testId !== "string" ||
            testId.trim() === ""
        ) {
            return res.status(400).json({
                message: "testId is required"
            });
        }

        const result = await runSelectedTest(testId);

        return res.json({
            message: "Selected test execution completed",
            result
        });
    } catch (error) {
        return res.status(500).json({
            message: "Selected test execution failed",
            error: error.message
        });
    }
});

module.exports = router;