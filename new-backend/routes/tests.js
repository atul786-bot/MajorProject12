import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const TEST_DEFS_PATH = path.resolve(__dirname, "../../test-definitions/test-definitions.json");

function loadTestDefinitions() {
  if (!fs.existsSync(TEST_DEFS_PATH)) {
    return [];
  }
  const content = fs.readFileSync(TEST_DEFS_PATH, "utf-8");
  try {
    return JSON.parse(content);
  } catch (err) {
    return [];
  }
}

function saveTestDefinitions(defs) {
  const dir = path.dirname(TEST_DEFS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(TEST_DEFS_PATH, JSON.stringify(defs, null, 2), "utf-8");
}

// GET /api/tests - Get all test definitions
router.get("/", (req, res) => {
  try {
    const tests = loadTestDefinitions();
    res.json({
      message: "Test definitions retrieved successfully",
      tests
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to retrieve test definitions",
      error: err.message
    });
  }
});

// POST /api/tests - Add or update a test definition
router.post("/", (req, res) => {
  try {
    const newTest = req.body;
    if (!newTest || !newTest.testId || !newTest.name || !newTest.targetUrl || !Array.isArray(newTest.steps)) {
      return res.status(400).json({
        message: "Invalid test definition format. Required fields: testId, name, targetUrl, steps[]"
      });
    }

    const tests = loadTestDefinitions();
    const existingIndex = tests.findIndex((t) => t.testId === newTest.testId);

    if (existingIndex >= 0) {
      tests[existingIndex] = newTest;
    } else {
      tests.push(newTest);
    }

    saveTestDefinitions(tests);

    res.json({
      message: "Test definition saved successfully",
      test: newTest
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to save test definition",
      error: err.message
    });
  }
});

export default router;
