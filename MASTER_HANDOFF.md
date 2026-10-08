# MASTER HANDOFF

> Emergency continuation document.  
> A new AI agent should be able to read this file and continue the project.

---

## Project Objective

Build an **AI-Driven Adaptive Test Automation** system demonstrating:

```
Test Definition → Execute (Selenium/Healenium) → Store History (SQLite) → AI Analysis → Prioritize → Adaptive Execution → Repeat
```

This is a **NEW INDEPENDENT PROJECT** being built inside the same workspace directory as an old GitHub repository. The old repository files are **READ-ONLY reference material** and must NOT be modified.

---

## Workspace Layout

```
c:\Users\atulk\OneDrive\Desktop\dummy member1\
│
├── PROJECT_STATE.md          ← Current project status (read first)
├── PROJECT_CHANGELOG.md      ← Append-only history
├── MASTER_HANDOFF.md         ← THIS FILE
│
├── controlled-website/       ← Phase 1 (NOT YET CREATED)
├── test-definitions/         ← Phase 2 (NOT YET CREATED)
├── executor/                 ← Phase 3 (NOT YET CREATED)
├── new-backend/              ← Phase 4+ (NOT YET CREATED)
├── new-ai/                   ← Phase 7 (NOT YET CREATED)
├── new-frontend/             ← Phase 9 (NOT YET CREATED)
│
│  ── OLD REPO (READ-ONLY — DO NOT MODIFY) ──
├── ai/                       ← Old AI pipeline (Python)
├── automation/               ← Old executor + Selenium + Healenium
├── backend/                  ← Old Express.js backend
├── frontend/                 ← Old React dashboard
├── docs/
├── .env
├── .gitignore
└── README.md
```

---

## Old Repository Reference (READ-ONLY)

**Current Branch:** `feature/member1-automation`  
**Current Remote:** `origin` → `Avinash-kumar12/AI-Driven-Adaptive-Test-Automation` (GitHub — UNTOUCHED)  
**Future Publishing Target Repo:** `https://github.com/atul786-bot/MajorProject12` (Will set remote & push ONLY upon explicit authorization)  
**DO NOT:** push, commit, merge, reset, or modify any existing files.

### Key Learnings from Old Repo

| Concept | Old Location | What to Reuse |
|---------|-------------|---------------|
| Test Definition Format | `backend/data/test-definitions.js` | `{ testId, name, targetUrl, description, steps[] }` — clean design, reuse as-is |
| Step Format | Same file | `{ action: OPEN/TYPE/CLICK/VERIFY, locatorType, locator, value }` |
| Dynamic Executor | `automation/executor/ai-test-executor.mjs` | `executeDynamicTest()` pattern — Selenium WebDriver, step iteration, result contract |
| Result Contract | Same file | `{ testId, status, duration, healed, healingScore, timestamp }` |
| Database Schema | `backend/database.js` | SQLite `execution_history` table with 12 columns |
| AI Features | `ai/src/feature_builder.py` | `execution_count, failure_count, avg_duration, recent_failures, healed_count, last_status` |
| AI Model | `ai/src/model.py` | LogisticRegression (scikit-learn) |
| AI Pipeline | `ai/src/run_ai_pipeline.py` | `history → features → predict → prioritize → save` |
| Prediction Output | `ai/src/prediction_output.py` | JSON: `{ tests: [{ test_id, failure_probability, risk_level, prediction, priority }] }` |
| Backend APIs | `backend/routes/` | Express routes: tests, overview, execution, history, risk-ranking |
| Adaptive Controller | `backend/controller/adaptive-controller.js` | AI predictions → resolve definition → execute → SQLite |
| Healenium Config | `automation/config/framework-config.mjs` | Proxy URL `http://localhost:8085`, browser from env |
| Healing Score | `automation/utils/healing-score-resolver.mjs` | Queries PostgreSQL `healenium.selector` + `healenium.healing_result` |
| Frontend | `frontend/src/App.jsx` | React dashboard with definition form, execution controls, overview, results, history |

### What NOT to Reuse

- `backend/controller/mock-executor.js` — fake results
- `backend/data/test-results.js` — hardcoded static data
- `backend/data/ai/predictions.js` — hardcoded static predictions
- `ai/data/raw/m3_execution_history_export.csv` — all mock data (`Mock execution completed`)
- `automation/executor/ai-jasmine-runner.mjs` — legacy Jasmine runner
- `automation/spec/` — empty/legacy
- `tests/` — deleted spec files

---

## Target Architecture

```
┌──────────────────────────────────────────────┐
│           Controlled Test Website             │
│     (index.html / style.css / script.js)     │
│      Served via http-server on port 8080      │
└────────────────────┬─────────────────────────┘
                     │
┌────────────────────▼─────────────────────────┐
│              Test Definitions                 │
│  TC-WEB-001..008 (JSON format)               │
└────────────────────┬─────────────────────────┘
                     │
┌────────────────────▼─────────────────────────┐
│            Test Executor (Node.js)            │
│  executeDynamicTest(definition)               │
│  → Selenium WebDriver                        │
│  → Healenium Proxy (port 8085)               │
│  Returns: { testId, status, duration,        │
│             healed, healingScore, timestamp } │
└────────────────────┬─────────────────────────┘
                     │
┌────────────────────▼─────────────────────────┐
│          Backend API (Express.js)             │
│  POST /api/execution     (selected test)     │
│  POST /api/execution/adaptive                │
│  GET  /api/tests                             │
│  POST /api/tests                             │
│  GET  /api/overview                          │
│  GET  /api/history                           │
│  GET  /api/risk-ranking                      │
└────────────────────┬─────────────────────────┘
                     │
┌────────────────────▼─────────────────────────┐
│         SQLite Database                       │
│  execution_history table                     │
│  testId, status, duration, healed,           │
│  healingScore, message, failureProbability,  │
│  riskLevel, prediction, priority,            │
│  executedAt, timestamp                       │
└────────────────────┬─────────────────────────┘
                     │
┌────────────────────▼─────────────────────────┐
│         AI Pipeline (Python)                  │
│  LogisticRegression (scikit-learn)            │
│  Features: execution_count, failure_count,   │
│  avg_duration, recent_failures,              │
│  healed_count, last_status                   │
│  Output: prioritized_tests.json              │
└────────────────────┬─────────────────────────┘
                     │
┌────────────────────▼─────────────────────────┐
│       React Dashboard (Vite)                  │
│  Test Definitions, Execution Controls,       │
│  Overview, Results, History, Risk Chart       │
└──────────────────────────────────────────────┘
```

---

## Test Cases (Planned)

| ID | Name | Purpose |
|----|------|---------|
| TC-WEB-001 | Page Load | Verify controlled website loads |
| TC-WEB-002 | Login | Type credentials + click login |
| TC-WEB-003 | Product Selection | Select product from dropdown |
| TC-WEB-004 | Add Product | Click add-to-cart |
| TC-WEB-005 | Search | Type search term + click search |
| TC-WEB-006 | Checkout | Fill checkout form + submit |
| TC-WEB-007 | Healing Scenario | Demonstrate real Healenium healing |
| TC-WEB-008 | Intentional Failure | Verify failure handling |

---

## Controlled Website IDs

```
#username, #password, #login-button
#product-select, #add-cart-button
#search-input, #search-button
#checkout-name, #checkout-email, #checkout-button
#status-message
```

---

## Healenium Setup Requirements

- **Healenium Proxy:** `http://localhost:8085`
- **PostgreSQL:** host=localhost, port=5432, user=healenium_user, db=healenium
- Healing is detected by comparing the locator used by the test vs. the actual element attribute found
- Healing score is retrieved from PostgreSQL `healenium.healing_result` table
- TC-WEB-007: change `id="add-cart-button"` → `id="add-cart-button-new"` and verify Healenium heals

---

## How to Run (Future)

```bash
# 1. Serve controlled website
npx http-server controlled-website -p 8080

# 2. Start backend
cd new-backend && npm install && node server.js

# 3. Start frontend
cd new-frontend && npm install && npm run dev

# 4. Run AI pipeline
cd new-ai && pip install -r requirements.txt && python src/run_ai_pipeline.py

# 5. Healenium must be running (Docker or standalone)
# Healenium proxy on port 8085
# PostgreSQL on port 5432
```

---

## Current Phase

**Phase 11 — ALL PHASES COMPLETED (COMPLETE)**

## Next Task

**Project execution complete! All 11 phases implemented and verified.**

---

## Important Warnings

1. **DO NOT modify any files in the old repository** (ai/, automation/, backend/, frontend/, docs/, .env, etc.)
2. **DO NOT push to the old GitHub remote** (`Avinash-kumar12/AI-Driven-Adaptive-Test-Automation`)
3. **DO NOT use mock/fake execution results** — all test results must come from real Selenium execution
4. **DO NOT fabricate healing data** — healing must come from actual Healenium
5. **The old M3 CSV data is all mock** — do not use it as "real" execution history
6. **New project files use distinct directory names** (`controlled-website/`, `new-backend/`, `new-ai/`, `new-frontend/`, `executor/`, `test-definitions/`) to avoid conflicts with old repo directories

---

## Phase Roadmap

| Phase | Name | Status |
|-------|------|--------|
| 0 | Old Repository Study + New Project Setup | ✅ DONE |
| 1 | New Controlled Website | ✅ DONE |
| 2 | New Automation Test Definitions | ✅ DONE |
| 3 | Selenium Execution | ✅ DONE |
| 4 | Selected Execution | ✅ DONE |
| 5 | Healenium | ✅ DONE |
| 6 | Execution History | ✅ DONE |
| 7 | AI Analysis | ✅ DONE |
| 8 | Adaptive Execution | ✅ DONE |
| 9 | Dashboard | ✅ DONE |
| 10 | End-to-End Demonstration | ✅ DONE |
| 11 | Final Validation | ✅ DONE |
