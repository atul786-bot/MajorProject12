# PROJECT STATE

> **Last Updated:** 2026-10-08  
> **Current Phase:** Phase 0 — Old Repository Study + New Project Setup  
> **Status:** DONE

---

## Project Objective

Build an **AI-Driven Adaptive Test Automation** system that demonstrates the full loop:

```
DEFINE → ANALYZE → PRIORITIZE → EXECUTE → HEAL → STORE → LEARN → RE-PRIORITIZE → ADAPTIVE EXECUTION
```

The system uses a controlled test website, Selenium, Healenium, an AI/ML pipeline, a backend API, a SQLite database, and a React dashboard.

---

## Architecture (Target)

```
Controlled Website (index.html/style.css/script.js)
        ↕
Test Definitions (JSON)
        ↕
Backend API (Express.js)
        ↕
Test Executor (Node.js/ESM) → Selenium → Healenium
        ↕
SQLite Database (execution_history)
        ↕
AI Pipeline (Python — scikit-learn)
        ↕
Prioritized Tests JSON
        ↕
Adaptive Execution → Executor → New History → AI Again
        ↕
React Dashboard (Vite)
```

---

## Directory Structure (New Project — Planned)

All new files will be created inside the workspace root alongside the old repository files. New files are clearly namespaced and will NOT modify any existing old files.

```
(root)                              ← c:\Users\atulk\OneDrive\Desktop\dummy member1
├── PROJECT_STATE.md                ← THIS FILE (new)
├── PROJECT_CHANGELOG.md            ← (new)
├── MASTER_HANDOFF.md               ← (new)
│
├── controlled-website/             ← Phase 1 (new)
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── test-definitions/               ← Phase 2 (new)
│   └── test-definitions.json
│
├── executor/                       ← Phase 3 (new)
│   ├── executor.mjs
│   ├── driver-factory.mjs
│   └── config.mjs
│
├── new-backend/                    ← Phase 4+ (new)
│   ├── server.js
│   ├── database.js
│   ├── routes/
│   └── package.json
│
├── new-ai/                         ← Phase 7 (new)
│   ├── src/
│   ├── data/
│   ├── models/
│   └── requirements.txt
│
├── new-frontend/                   ← Phase 9 (new)
│   ├── src/
│   └── package.json
│
│  ── OLD REPOSITORY FILES (READ-ONLY — NOT TO BE MODIFIED) ──
├── ai/
├── automation/
├── backend/
├── frontend/
├── docs/
├── .env
├── .gitignore
├── README.md
└── ...
```

---

## Components Status

| Component              | Status               | Notes                                    |
|------------------------|----------------------|------------------------------------------|
| Controlled Website     | VERIFIED             | Phase 1 — Served live on port 8080 (http://localhost:8080/index.html) |
| Test Definitions       | VERIFIED             | Phase 2 — TC-WEB-001 through TC-WEB-008 in test-definitions/test-definitions.json |
| Test Executor          | VERIFIED             | Phase 3 — Real Selenium Chrome WebDriver execution verified live |
| Selenium Integration   | VERIFIED             | Phase 3 — Chrome headless/windowed execution verified live |
| Healenium Integration  | VERIFIED             | Phase 5 — Real Healenium self-healing empirically verified (Stage A baseline uid: 82f1258f6cf0737091103c4676e55dc6 -> Stage B healing_id: c3d1970d03bc1d30d46547927cb3c01c, score: 0.9715, healed=true) |
| SQLite Database        | VERIFIED             | Phase 4 — 25 real execution history records stored in data/db/execution-history.db |
| Backend API            | VERIFIED             | Phase 4 — Express.js server running live on port 3000 with REST endpoints |
| AI Pipeline            | VERIFIED             | Phase 7 — LogisticRegression pipeline in new-ai/ computing real failure probabilities |
| Adaptive Execution     | VERIFIED             | Phase 8 — Closed loop verified: SQLite → AI → prioritized_tests.json → Adaptive Execution → SQLite |
| React Dashboard        | VERIFIED             | Phase 9 — React 18 + Vite dashboard running live on port 5173 |
| End-to-End Demo        | VERIFIED             | Phase 10 — Full loop verified across web, executor, backend, AI, DB, and dashboard |
| Final Validation       | VERIFIED             | Phase 11 — Validated zero mock data & zero modifications to original repo |

---

## Key Decisions from Old Repository Study

### What Will Be Reused (Concepts)

1. **Dynamic Test Definition Format** — `{ testId, name, targetUrl, description, steps[] }` with step format `{ action, locatorType, locator, value }`. Supported actions: OPEN, TYPE, CLICK, VERIFY. This is a proven, clean design.

2. **Executor Pattern** — `executeDynamicTest(testDefinition)` that creates a Selenium WebDriver, iterates through steps, and returns `{ testId, status, duration, healed, healingScore, timestamp }`. Well-structured.

3. **AI Feature Set** — `execution_count, failure_count, avg_duration, recent_failures, healed_count, last_status` → LogisticRegression → `failure_probability, risk_level, prediction, priority`. Simple and effective.

4. **Database Schema** — SQLite table `execution_history` with columns: `id, testId, status, duration, healed, healingScore, message, failureProbability, riskLevel, prediction, priority, executedAt, timestamp`.

5. **Backend API Structure** — Express.js with routes: `/api/tests`, `/api/overview`, `/api/execution`, `/api/execution/adaptive`, `/api/history`, `/api/risk-ranking`.

6. **Frontend Approach** — React + Vite dashboard with components: Overview, TestResults, RiskRanking, Execution, HealingResults, ExecutionHistory, RiskChart.

7. **Healenium Setup** — Healenium proxy at `http://localhost:8085`, PostgreSQL backend for healing data, `healing-score-resolver.mjs` querying `healenium.selector` and `healenium.healing_result` tables.

### What Will NOT Be Reused

1. **Mock Executor** (`mock-executor.js`) — produces fake results. The new project must use real Selenium execution only.
2. **Legacy TEST_REGISTRY** — empty in old project, not needed.
3. **Jasmine runner / spec infrastructure** — old spec files were deleted. Not needed.
4. **M3 execution history CSV** — contains mock execution data (`Mock execution completed`). New project needs real execution history.
5. **Old `test-results.js`** — hardcoded static test results. Not needed.
6. **Old `predictions.js`** — hardcoded static predictions. Not needed.
7. **`analysis_results-sys arch`** — unrelated analysis file.

### Problems Identified in Old Repository

1. **M3 history is mock data** — CSV rows show `"Mock execution completed"` with identical `duration: 2.5` for all entries. This is not real execution data.
2. **Disconnected components** — The old AI pipeline reads from M3 CSV; the executor uses Healenium proxy. These were built by different team members and are not fully integrated.
3. **Frontend CORS** — hardcoded to `http://localhost:5175`.
4. **Legacy test spec files deleted** — `tests/basic/` files were deleted but still tracked in git.
5. **Two prioritized_tests.json locations** — `ai/data/processed/` (executor reads from) vs `ai/data/adaptive/` (controller reads from). Inconsistency.

---

## Current Phase

**Phase 11 — ALL PHASES COMPLETED (COMPLETE)**

## Completed Phases

- [x] Phase 0 — Old Repository Study + New Project Setup
- [x] Phase 1 — New Controlled Website
- [x] Phase 2 — New Automation Test Definitions
- [x] Phase 3 — Selenium Test Executor
- [x] Phase 4 — Selected Execution API & Backend Infrastructure
- [x] Phase 5 — Healenium Integration & Self-Healing Verification
- [x] Phase 6 — Execution History Management & Exporter
- [x] Phase 7 — AI Analysis & Prioritization Pipeline
- [x] Phase 8 — Adaptive Execution Loop
- [x] Phase 9 — React Dashboard
- [x] Phase 10 — End-to-End Demonstration
- [x] Phase 11 — Final Validation

## Next Phase

**PROJECT COMPLETE — ALL PHASES FULLY IMPLEMENTED AND VERIFIED**

---

## Important Commands

```bash
# Start backend (future)
cd new-backend && node server.js

# Start frontend (future)
cd new-frontend && npm run dev

# Run AI pipeline (future)
cd new-ai && python src/run_ai_pipeline.py

# Serve controlled website (future)
npx http-server controlled-website -p 8080
```

---

## Known Issues

- None yet (new project)

## Blockers

- None yet (new project)
