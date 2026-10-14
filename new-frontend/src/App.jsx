import React, { useEffect, useState } from "react";
import { Activity, Cpu, FileCode, TrendingUp, ShieldCheck, Database, RefreshCw } from "lucide-react";

import Overview from "./components/Overview";
import TestDefinitions from "./components/TestDefinitions";
import ExecutionControls from "./components/ExecutionControls";
import RiskRanking from "./components/RiskRanking";
import HealingResults from "./components/HealingResults";
import ExecutionHistory from "./components/ExecutionHistory";

import {
  fetchOverview,
  fetchTests,
  fetchRiskRanking,
  fetchHistory
} from "./services/api";

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "execute", label: "Execution", icon: Cpu },
  { key: "definitions", label: "Test Definitions", icon: FileCode },
  { key: "risk", label: "AI Risk Ranking", icon: TrendingUp },
  { key: "healing", label: "Healing Results", icon: ShieldCheck },
  { key: "history", label: "History Log", icon: Database },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [tests, setTests] = useState([]);
  const [riskRanking, setRiskRanking] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [ovData, tData, rrData, hData] = await Promise.all([
        fetchOverview(),
        fetchTests(),
        fetchRiskRanking(),
        fetchHistory(100)
      ]);
      setOverview(ovData);
      setTests(tData);
      setRiskRanking(rrData);
      setHistory(hData);
    } catch (err) {
      setError(err.message || "Failed to connect to backend server at http://localhost:3000");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="sidebar-brand">
          <Cpu size={18} />
          <span>Adaptive Test Automation</span>
        </div>

        <div className="sidebar-nav">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`sidebar-item ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-refresh-btn" onClick={loadData}>
            <RefreshCw size={14} />
            <span>Refresh Data</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-area">
        <main className="main-content">
          {error && (
            <div className="alert alert-error">
              <strong>Connection Error:</strong> {error}
            </div>
          )}

          {activeTab === "overview" && (
            <>
              <div className="page-header">
                <h1 className="page-title">Overview</h1>
                <p className="page-subtitle">System metrics, pass rates, and execution status.</p>
              </div>
              <Overview overview={overview} />
              <ExecutionControls tests={tests} onExecutionComplete={loadData} />
              <div className="grid-cols-2">
                <RiskRanking riskRanking={riskRanking} />
                <HealingResults history={history} />
              </div>
            </>
          )}

          {activeTab === "execute" && (
            <>
              <div className="page-header">
                <h1 className="page-title">Test Execution</h1>
                <p className="page-subtitle">Run individual tests or the AI-prioritized adaptive test suite.</p>
              </div>
              <ExecutionControls tests={tests} onExecutionComplete={loadData} />
              <ExecutionHistory history={history} />
            </>
          )}

          {activeTab === "definitions" && (
            <>
              <div className="page-header">
                <h1 className="page-title">Test Definitions</h1>
                <p className="page-subtitle">Manage step-based test definitions (OPEN, TYPE, CLICK, VERIFY).</p>
              </div>
              <TestDefinitions tests={tests} onTestSaved={loadData} />
            </>
          )}

          {activeTab === "risk" && (
            <>
              <div className="page-header">
                <h1 className="page-title">AI Risk Ranking</h1>
                <p className="page-subtitle">Failure probability ranking from the Logistic Regression model.</p>
              </div>
              <RiskRanking riskRanking={riskRanking} />
            </>
          )}

          {activeTab === "healing" && (
            <>
              <div className="page-header">
                <h1 className="page-title">Healing Results</h1>
                <p className="page-subtitle">Healenium self-healing metrics and locator recovery data.</p>
              </div>
              <HealingResults history={history} />
            </>
          )}

          {activeTab === "history" && (
            <>
              <div className="page-header">
                <h1 className="page-title">Execution History</h1>
                <p className="page-subtitle">Complete log of all executed test runs.</p>
              </div>
              <ExecutionHistory history={history} />
            </>
          )}
        </main>

        <footer className="footer">
          AI-Driven Adaptive Test Automation &bull; Closed-Loop Intelligent Testing Platform
        </footer>
      </div>
    </div>
  );
}
