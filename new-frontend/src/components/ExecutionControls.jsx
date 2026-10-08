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
      setExecResults(Array.isArray(res.results) ? res.results : [res.result || res]);
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
      setStatusMsg(`Adaptive execution finished! ${res.results?.length || 0} test(s) executed.`);
      setExecResults(res.results || []);
      if (onExecutionComplete) onExecutionComplete();
    } catch (err) {
      setStatusMsg(`Adaptive execution failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title"><Cpu size={20} className="text-blue-400" /> Automated Test Execution Controller</h3>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Run an individual test definition or execute the adaptive test suite ordered by AI failure risk predictions.
      </p>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <select
          value={selectedTestId}
          onChange={(e) => setSelectedTestId(e.target.value)}
          style={{ maxWidth: '300px' }}
          disabled={loading}
        >
          <option value="">-- Select Test Definition --</option>
          {tests.map((t) => (
            <option key={t.testId} value={t.testId}>{t.testId} — {t.name}</option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={handleRunSelected} disabled={!selectedTestId || loading}>
          <Play size={16} /> {loading ? "Running..." : "Execute Selected Test"}
        </button>

        <button className="btn btn-secondary" onClick={handleRunAdaptive} disabled={loading}>
          <Cpu size={16} /> {loading ? "Running Adaptive Suite..." : "Run AI-Adaptive Test Suite"}
        </button>
      </div>

      {statusMsg && (
        <div style={{ padding: '0.75rem', background: '#0f172a', border: '1px solid #3b82f6', borderRadius: '0.5rem', color: '#60a5fa', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {statusMsg}
        </div>
      )}

      {execResults && execResults.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#f8fafc' }}>Execution Output Results:</h4>
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
                  <td><strong>{r.testId}</strong></td>
                  <td>
                    <span className={`badge-status badge-${r.status}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>{r.duration}s</td>
                  <td>
                    {r.healed ? (
                      <span className="badge-status badge-healed">HEALED ({r.healingScore || 1.0})</span>
                    ) : (
                      "No"
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{r.message || r.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
