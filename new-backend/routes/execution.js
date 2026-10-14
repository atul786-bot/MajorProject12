import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import db from "../database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const TEST_DEFS_PATH = path.resolve(__dirname, "../../test-definitions/test-definitions.json");
const EXECUTOR_PATH = path.resolve(__dirname, "../../executor/executor.mjs");
const AI_PREDICTIONS_PATH = path.resolve(__dirname, "../../new-ai/data/adaptive/prioritized_tests.json");

function loadTestDefinitions() {
  if (!fs.existsSync(TEST_DEFS_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(TEST_DEFS_PATH, "utf-8"));
  } catch (err) {
    return [];
  }
}

function loadAIPredictions() {
  if (!fs.existsSync(AI_PREDICTIONS_PATH)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(AI_PREDICTIONS_PATH, "utf-8"));
    return Array.isArray(data.tests) ? data.tests : [];
  } catch (err) {
    return [];
  }
}

async function getExecutor() {
  return await import(pathToFileURL(EXECUTOR_PATH).href);
}

function recordExecutionResult(result, meta = {}) {
  const stmt = db.prepare(`
    INSERT INTO execution_history (
      testId, status, duration, healed, healingScore, message,
      failureProbability, riskLevel, prediction, priority, executedAt, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    result.testId,
    result.status,
    result.duration,
    result.healed ? 1 : 0,
    result.healingScore ?? null,
    result.message || result.error || null,
    meta.failureProbability ?? null,
    meta.riskLevel ?? null,
    meta.prediction ?? null,
    meta.priority ?? null,
    new Date().toISOString(),
    result.timestamp || new Date().toISOString()
  );
}

// GET /api/execution - Get latest 20 execution records
router.get("/", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM execution_history ORDER BY id DESC LIMIT 20").all();
    res.json({
      message: "Latest execution results retrieved",
      results: rows
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to load execution results",
      error: err.message
    });
  }
});

// POST /api/execution - Execute selected test(s)
router.post("/", async (req, res) => {
  try {
    const { testId, testIds } = req.body || {};
    const idsToExecute = testIds && Array.isArray(testIds) ? testIds : (testId ? [testId] : []);

    if (idsToExecute.length === 0) {
      return res.status(400).json({ message: "Either testId or testIds array is required" });
    }

    const testDefs = loadTestDefinitions();
    const { executeDynamicTest } = await getExecutor();
    const results = [];

    for (const id of idsToExecute) {
      const def = testDefs.find((t) => t.testId === id);
      if (!def) {
        const errorResult = {
          testId: id,
          status: "failed",
          duration: 0,
          healed: false,
          healingScore: null,
          message: `Test definition not found: ${id}`,
          timestamp: new Date().toISOString()
        };
        recordExecutionResult(errorResult);
        results.push(errorResult);
        continue;
      }

      const execResult = await executeDynamicTest(def);
      recordExecutionResult(execResult);
      results.push(execResult);
    }

    res.json({
      message: "Selected test execution completed",
      results: results.length === 1 ? results[0] : results,
      result: results.length > 0 ? results[0] : null
    });
  } catch (err) {
    res.status(500).json({
      message: "Selected test execution failed",
      error: err.message
    });
  }
});

// POST /api/execution/adaptive - Execute tests prioritized by AI
router.post("/adaptive", async (req, res) => {
  try {
    const predictions = loadAIPredictions().sort((a, b) => (a.priority || 99) - (b.priority || 99));
    const testDefs = loadTestDefinitions();
    const { executeDynamicTest } = await getExecutor();
    const results = [];

    if (predictions.length === 0) {
      // If AI predictions don't exist yet, run all test definitions sequentially
      for (const def of testDefs) {
        const execResult = await executeDynamicTest(def);
        recordExecutionResult(execResult);
        results.push(execResult);
      }
    } else {
      for (const pred of predictions) {
        const testId = pred.test_id;
        const def = testDefs.find((t) => t.testId === testId);

        if (!def) {
          const unresolved = {
            testId,
            status: "unresolved",
            duration: 0,
            healed: false,
            healingScore: null,
            message: `Test definition not found for AI predicted test: ${testId}`,
            timestamp: new Date().toISOString()
          };
          recordExecutionResult(unresolved, {
            failureProbability: pred.failure_probability,
            riskLevel: pred.risk_level,
            prediction: pred.prediction,
            priority: pred.priority
          });
          results.push(unresolved);
          continue;
        }

        const execResult = await executeDynamicTest(def);
        recordExecutionResult(execResult, {
          failureProbability: pred.failure_probability,
          riskLevel: pred.risk_level,
          prediction: pred.prediction,
          priority: pred.priority
        });
        results.push({
          ...execResult,
          failureProbability: pred.failure_probability,
          riskLevel: pred.risk_level,
          prediction: pred.prediction,
          priority: pred.priority
        });
      }
    }

    res.json({
      message: "Adaptive test execution completed",
      results
    });
  } catch (err) {
    res.status(500).json({
      message: "Adaptive test execution failed",
      error: err.message
    });
  }
});

export default router;
