import { useEffect, useState } from "react";
import "./App.css";

import Overview from "./components/Overview";
import TestResults from "./components/TestResults";
import RiskRanking from "./components/RiskRanking";
import Execution from "./components/Execution";
import HealingResults from "./components/HealingResults";
import ExecutionHistory from "./components/ExecutionHistory";
import RiskChart from "./charts/RiskChart";

import {
  getOverview,
  getTests,
  getRiskRanking,
  getExecutionResults,
  getExecutionHistory,
  createTestDefinition,
  executeSelectedTest,
  runAdaptiveExecution,
} from "./services/api";

const EMPTY_DEFINITION = {
  testId: "",
  name: "",
  targetUrl: "",
  description: "",
  steps: [
    {
      action: "OPEN",
      locatorType: null,
      locator: null,
      value: "",
    },
  ],
};

function App() {
  const [overview, setOverview] = useState(null);
  const [tests, setTests] = useState([]);
  const [riskRanking, setRiskRanking] = useState([]);
  const [executionResults, setExecutionResults] = useState([]);
  const [executionHistory, setExecutionHistory] = useState([]);

  const [definition, setDefinition] = useState(EMPTY_DEFINITION);
  const [selectedTestId, setSelectedTestId] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [executingSelected, setExecutingSelected] = useState(false);
  const [executingAdaptive, setExecutingAdaptive] = useState(false);

  const [error, setError] = useState("");
  const [definitionMessage, setDefinitionMessage] = useState("");
  const [executionMessage, setExecutionMessage] = useState("");

  async function loadDashboard() {
    const [
      overviewData,
      testsData,
      riskRankingData,
      executionData,
      historyData,
    ] = await Promise.all([
      getOverview(),
      getTests(),
      getRiskRanking(),
      getExecutionResults(),
      getExecutionHistory(),
    ]);

    setOverview(overviewData);
    setTests(testsData);
    setRiskRanking(riskRankingData);
    setExecutionResults(executionData.results || []);
    setExecutionHistory(historyData);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialDashboard() {
      try {
        setLoading(true);
        setError("");

        const [
          overviewData,
          testsData,
          riskRankingData,
          executionData,
          historyData,
        ] = await Promise.all([
          getOverview(),
          getTests(),
          getRiskRanking(),
          getExecutionResults(),
          getExecutionHistory(),
        ]);

        if (cancelled) {
          return;
        }

        setOverview(overviewData);
        setTests(testsData);
        setRiskRanking(riskRankingData);
        setExecutionResults(executionData.results || []);
        setExecutionHistory(historyData);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateDefinition(field, value) {
    setDefinition((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateStep(index, field, value) {
    setDefinition((current) => {
      const steps = current.steps.map((step, stepIndex) =>
        stepIndex === index
          ? { ...step, [field]: value }
          : step
      );

      return {
        ...current,
        steps,
      };
    });
  }

  function addStep() {
    setDefinition((current) => ({
      ...current,
      steps: [
        ...current.steps,
        {
          action: "CLICK",
          locatorType: "id",
          locator: "",
          value: "",
        },
      ],
    }));
  }

  function removeStep(index) {
    setDefinition((current) => {
      if (current.steps.length === 1) {
        return current;
      }

      return {
        ...current,
        steps: current.steps.filter(
          (_, stepIndex) => stepIndex !== index
        ),
      };
    });
  }

  async function handleCreateDefinition(event) {
    event.preventDefault();

    setCreating(true);
    setDefinitionMessage("");
    setError("");

    try {
      const created = await createTestDefinition(definition);

      setDefinitionMessage(
        `Test definition ${created.testId} created successfully.`
      );

      setSelectedTestId(created.testId);

      await loadDashboard();

      setDefinition(EMPTY_DEFINITION);
    } catch (err) {
      if (err.status === 400) {
        setError(`Definition validation error (400): ${err.message}`);
      } else if (err.status === 409) {
        setError(`Duplicate test definition (409): ${err.message}`);
      } else {
        setError(err.message || "Failed to create test definition");
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleSelectedExecution() {
    if (!selectedTestId) {
      setExecutionMessage("Select a test before executing it.");
      return;
    }

    setExecutingSelected(true);
    setExecutionMessage("");
    setError("");

    try {
      const response = await executeSelectedTest(selectedTestId);

      if (response.result) {
        setExecutionResults([response.result]);
      }

      setExecutionMessage(
        `Selected execution completed for ${selectedTestId}.`
      );

      await loadDashboard();
    } catch (err) {
      if (err.status === 400) {
        setError(`Selected execution request error (400): ${err.message}`);
      } else {
        setError(err.message || "Selected test execution failed");
      }
    } finally {
      setExecutingSelected(false);
    }
  }

  async function handleAdaptiveExecution() {
    setExecutingAdaptive(true);
    setExecutionMessage("");
    setError("");

    try {
      const data = await runAdaptiveExecution();

      const results = data.results || [];

      setExecutionResults(results);

      setExecutionMessage(
        `Adaptive execution completed: ${results.length} result(s) returned.`
      );

      await loadDashboard();
    } catch (err) {
      setError(err.message || "Adaptive execution failed");
    } finally {
      setExecutingAdaptive(false);
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="header-copy">
            <div className="header-eyebrow">
              Intelligent QA Platform
            </div>

            <h1 className="header-title">
              AI-Driven Adaptive Test Automation
            </h1>

            <p className="header-subtitle">
              AI-powered test prioritization, execution, risk analysis and
              healing insights.
            </p>
          </div>

          <div className="system-status">
            <span className="status-dot" />
            System Active
          </div>
        </header>

        {error && (
          <div className="dashboard-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {definitionMessage && (
          <div className="dashboard-success">
            {definitionMessage}
          </div>
        )}

        {executionMessage && (
          <div className="dashboard-info">
            {executionMessage}
          </div>
        )}

        <section className="dashboard-section dashboard-card">
          <h2>Test Definition</h2>

          <form onSubmit={handleCreateDefinition}>
            <div className="form-grid">
              <label>
                Test ID
                <input
                  value={definition.testId}
                  onChange={(event) =>
                    updateDefinition("testId", event.target.value)
                  }
                  placeholder="TC-NEW-001"
                  required
                />
              </label>

              <label>
                Name
                <input
                  value={definition.name}
                  onChange={(event) =>
                    updateDefinition("name", event.target.value)
                  }
                  placeholder="Login Test"
                  required
                />
              </label>

              <label>
                Target URL
                <input
                  value={definition.targetUrl}
                  onChange={(event) =>
                    updateDefinition("targetUrl", event.target.value)
                  }
                  placeholder="http://localhost:3000"
                  required
                />
              </label>

              <label>
                Description
                <input
                  value={definition.description}
                  onChange={(event) =>
                    updateDefinition(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Test description"
                  required
                />
              </label>
            </div>

            <div className="definition-steps">
              <div className="definition-steps-header">
                <h3>Steps</h3>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={addStep}
                >
                  Add Step
                </button>
              </div>

              {definition.steps.map((step, index) => {
                const requiresLocator = step.action !== "OPEN";

                return (
                  <div
                    className="definition-step"
                    key={`step-${index}`}
                  >
                    <div className="step-number">
                      {index + 1}
                    </div>

                    <select
                      value={step.action}
                      onChange={(event) =>
                        updateStep(
                          index,
                          "action",
                          event.target.value
                        )
                      }
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="TYPE">TYPE</option>
                      <option value="CLICK">CLICK</option>
                      <option value="VERIFY">VERIFY</option>
                    </select>

                    <select
                      value={step.locatorType || ""}
                      disabled={!requiresLocator}
                      onChange={(event) =>
                        updateStep(
                          index,
                          "locatorType",
                          event.target.value || null
                        )
                      }
                    >
                      <option value="">Locator type</option>
                      <option value="id">id</option>
                      <option value="css">css</option>
                      <option value="xpath">xpath</option>
                      <option value="name">name</option>
                      <option value="className">className</option>
                    </select>

                    <input
                      value={step.locator || ""}
                      disabled={!requiresLocator}
                      onChange={(event) =>
                        updateStep(
                          index,
                          "locator",
                          event.target.value || null
                        )
                      }
                      placeholder={
                        requiresLocator
                          ? "Locator"
                          : "Not required for OPEN"
                      }
                    />

                    <input
                      value={step.value || ""}
                      onChange={(event) =>
                        updateStep(
                          index,
                          "value",
                          event.target.value
                        )
                      }
                      placeholder="Value / URL / expected text"
                    />

                    <button
                      type="button"
                      className="danger-button"
                      disabled={definition.steps.length === 1}
                      onClick={() => removeStep(index)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Test Definition"}
            </button>
          </form>
        </section>

        <section className="dashboard-section dashboard-card">
          <div className="execution-controls">
            <div>
              <h2>Test Execution Controls</h2>
              <p>
                Execute one stored test definition or run the AI-prioritized
                adaptive execution flow.
              </p>
            </div>

            <div className="execution-actions">
              <select
                value={selectedTestId}
                onChange={(event) =>
                  setSelectedTestId(event.target.value)
                }
                disabled={executingSelected || executingAdaptive}
              >
                <option value="">Select test</option>

                {tests.map((test) => (
                  <option key={test.testId} value={test.testId}>
                    {test.testId} — {test.name}
                  </option>
                ))}
              </select>

              <button
                className="primary-button"
                type="button"
                onClick={handleSelectedExecution}
                disabled={
                  !selectedTestId ||
                  executingSelected ||
                  executingAdaptive
                }
              >
                {executingSelected
                  ? "Executing..."
                  : "Execute Selected"}
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={handleAdaptiveExecution}
                disabled={executingSelected || executingAdaptive}
              >
                {executingAdaptive
                  ? "Running Adaptive..."
                  : "Run Adaptive Execution"}
              </button>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <h2 className="section-title">Overview</h2>
            <span className="section-description">
              {loading
                ? "Loading current automation status..."
                : "Current automation status"}
            </span>
          </div>

          <div className="dashboard-card">
            <Overview overview={overview} />
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="dashboard-section dashboard-card">
            <TestResults tests={tests} />
          </section>

          <section className="dashboard-section dashboard-card">
            <RiskRanking riskRanking={riskRanking} />
          </section>

          <section className="dashboard-section dashboard-card">
            <RiskChart riskRanking={riskRanking} />
          </section>

          <section className="dashboard-section dashboard-card">
            <HealingResults executionHistory={executionHistory} />
          </section>

          <section className="dashboard-section dashboard-grid-wide dashboard-card">
            <Execution executionResults={executionResults} />
          </section>

          <section className="dashboard-section dashboard-grid-wide dashboard-card">
            <ExecutionHistory executionHistory={executionHistory} />
          </section>
        </div>

        <footer className="dashboard-footer">
          AI-Driven Adaptive Test Automation • Intelligent execution monitoring
        </footer>
      </div>
    </div>
  );
}

export default App;
