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
      <nav className="navbar">
        <div className="nav-brand">
          <Cpu size={24} />
          <span>Adaptive Test Automation</span>
        </div>

        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Activity size={16} /> Overview
          </button>
          <button
            className={`nav-tab ${activeTab === "execute" ? "active" : ""}`}
            onClick={() => setActiveTab("execute")}
          >
            <Cpu size={16} /> Execution
          </button>
          <button
            className={`nav-tab ${activeTab === "definitions" ? "active" : ""}`}
            onClick={() => setActiveTab("definitions")}
          >
            <FileCode size={16} /> Test Definitions
          </button>
          <button
            className={`nav-tab ${activeTab === "risk" ? "active" : ""}`}
            onClick={() => setActiveTab("risk")}
          >
            <TrendingUp size={16} /> AI Risk Ranking
          </button>
          <button
            className={`nav-tab ${activeTab === "healing" ? "active" : ""}`}
            onClick={() => setActiveTab("healing")}
          >
            <ShieldCheck size={16} /> Healing Results
          </button>
          <button
            className={`nav-tab ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <Database size={16} /> History Log
          </button>
        </div>

        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={loadData}>
          <RefreshCw size={14} /> Refresh
        </button>
      </nav>

      <main className="main-content">
        {error && (
          <div style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '0.5rem', color: '#f43f5e' }}>
            <strong>Connection Warning:</strong> {error}
          </div>
        )}

        {activeTab === "overview" && (
          <>
            <div className="page-header">
              <h1 className="page-title">Automation System Overview</h1>
              <p className="page-subtitle">Real-time metrics, pass rates, and dynamic test execution status.</p>
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
              <h1 className="page-title">Test Execution Center</h1>
              <p className="page-subtitle">Trigger dynamic test runs using Selenium WebDriver and Healenium proxy.</p>
            </div>
            <ExecutionControls tests={tests} onExecutionComplete={loadData} />
            <ExecutionHistory history={history} />
          </>
        )}

        {activeTab === "definitions" && (
          <>
            <div className="page-header">
              <h1 className="page-title">Test Definitions Builder</h1>
              <p className="page-subtitle">Manage dynamic step-based test definitions (OPEN, TYPE, CLICK, VERIFY).</p>
            </div>
            <TestDefinitions tests={tests} onTestSaved={loadData} />
          </>
        )}

        {activeTab === "risk" && (
          <>
            <div className="page-header">
              <h1 className="page-title">AI Failure Prediction & Risk Ranking</h1>
              <p className="page-subtitle">LogisticRegression failure probability ranking and risk levels.</p>
            </div>
            <RiskRanking riskRanking={riskRanking} />
          </>
        )}

        {activeTab === "healing" && (
          <>
            <div className="page-header">
              <h1 className="page-title">Healenium Self-Healing Analytics</h1>
              <p className="page-subtitle">Element locator recovery metrics and healed score history.</p>
            </div>
            <HealingResults history={history} />
          </>
        )}

        {activeTab === "history" && (
          <>
            <div className="page-header">
              <h1 className="page-title">Execution History Database</h1>
              <p className="page-subtitle">Searchable log of all executed test runs stored in SQLite.</p>
            </div>
            <ExecutionHistory history={history} />
          </>
        )}
      </main>

      <footer className="footer">
        AI-Driven Adaptive Test Automation System &bull; Closed-Loop Intelligent Testing Platform
      </footer>
    </div>
  );
}
