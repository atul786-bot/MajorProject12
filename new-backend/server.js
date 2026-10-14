import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import overviewRouter from "./routes/overview.js";
import testsRouter from "./routes/tests.js";
import riskRouter from "./routes/risk.js";
import executionRouter from "./routes/execution.js";
import historyRouter from "./routes/history.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/overview", overviewRouter);
app.use("/api/tests", testsRouter);
app.use("/api/risk-ranking", riskRouter);
app.use("/api/execution", executionRouter);
app.use("/api/history", historyRouter);

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "AI-Driven Adaptive Test Automation API Server",
    version: "1.0.0"
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
