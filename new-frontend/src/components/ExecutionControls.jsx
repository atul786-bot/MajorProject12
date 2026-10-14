import React, { useState } from "react";
import { Play, Cpu, AlertCircle, CheckCircle2 } from "lucide-react";
import { executeSelectedTest, runAdaptiveExecution } from "../services/api";

export default function ExecutionControls({ tests, onExecutionComplete }) {
  const [selectedTestId, setSelectedTestId] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [execResults, setExecResults] = useState(null);

  const handleRunSelected = async () => {
    if (!selectedTestId) return;
    setLoading(true);
    setStatusMsg(`Running single test: ${selectedTestId}...`);
    setExecResults(null);

    try {
      const res = await executeSelectedTest(selectedTestId);
      setStatusMsg(`Execution finished for ${selectedTestId}!`);
      
      let items = [];
      if (Array.isArray(res.results)) {
        items = res.results;
      } else if (res.results && typeof res.results === "object" && res.results.testId) {
        items = [res.results];
      } else if (Array.isArray(res.result)) {
        items = res.result;
      } else if (res.result && typeof res.result === "object" && res.result.testId) {
        items = [res.result];
      } else if (Array.isArray(res)) {
        items = res;
      } else if (res && typeof res === "object" && res.testId) {
        items = [res];
      }
      setExecResults(items);
      if (onExecutionComplete) onExecutionComplete();
    } catch (err) {
      setStatusMsg(`Execution failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAdaptive = async () => {
    setLoading(true);
    setStatusMsg("Executing AI-Prioritized Adaptive Test Suite...");
    setExecResults(null);

    try {
      const res = await runAdaptiveExecution();
      const items = Array.isArray(res.results) ? res.results : (Array.isArray(res) ? res : []);
      setStatusMsg(`Adaptive execution finished! ${items.length} test(s) executed.`);
      setExecResults(items);
      if (onExecutionComplete) onExecutionComplete();
    } catch (err) {
      setStatusMsg(`Adaptive execution failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title"><Cpu size={16} /> Test Execution Controller</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '14px' }}>
        Run an individual test or execute the adaptive suite ordered by AI failure risk predictions.
      </p>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
        <select
          value={selectedTestId}
          onChange={(e) => setSelectedTestId(e.target.value)}
          style={{ maxWidth: '280px' }}
          disabled={loading}
        >
          <option value="">-- Select Test --</option>
          {tests.map((t) => (
            <option key={t.testId} value={t.testId}>{t.testId} — {t.name}</option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={handleRunSelected} disabled={!selectedTestId || loading}>
          <Play size={14} /> {loading ? "Running..." : "Execute Selected Test"}
        </button>

        <button className="btn btn-secondary" onClick={handleRunAdaptive} disabled={loading}>
          <Cpu size={14} /> {loading ? "Running..." : "Run AI-Adaptive Test Suite"}
        </button>
      </div>

      {statusMsg && (
        <div className="alert alert-info">
          {statusMsg}
        </div>
      )}

      {execResults && execResults.length > 0 && (
        <div>
          <h4 style={{ fontSize: '13px', marginBottom: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>Execution Results</h4>
          <table>
            <thead>
              <tr>
                <th>Test ID</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Healed</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {execResults.map((r, idx) => (
                <tr key={idx}>
                  <td><strong>{r.testId || "-"}</strong></td>
                  <td>
                    {r.status ? (
                      <span className={`badge-status badge-${r.status}`}>
                        {r.status}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{r.duration !== undefined && r.duration !== null ? `${r.duration}s` : "-"}</td>
                  <td>
                    {r.healed ? (
                      <span className="badge-status badge-healed">
                        HEALED {r.healingScore ? `(${Number(r.healingScore).toFixed(4)})` : "(1.0000)"}
                      </span>
                    ) : (
                      "No"
                    )}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{r.message || r.error || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
