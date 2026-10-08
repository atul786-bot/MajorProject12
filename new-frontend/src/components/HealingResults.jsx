import React from "react";
import { ShieldCheck, Wrench } from "lucide-react";

export default function HealingResults({ history }) {
  const healedRecords = (history || []).filter((h) => h.healed === 1 || h.healed === true);

  return (
    <div className="card">
      <h3 className="card-title"><ShieldCheck size={20} className="text-purple-400" /> Healenium Self-Healing Results</h3>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
        Automatic element locator recovery and self-healing score data captured via Healenium proxy.
      </p>

      {healedRecords.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: '0.9rem', padding: '1rem 0' }}>
          No self-healed executions recorded yet. Execute <strong>TC-WEB-007</strong> to trigger Healenium self-healing.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Test ID</th>
              <th>Status</th>
              <th>Healing Score</th>
              <th>Message</th>
              <th>Executed At</th>
            </tr>
          </thead>
          <tbody>
            {healedRecords.map((h) => (
              <tr key={h.id}>
                <td>#{h.id}</td>
                <td><strong>{h.testId}</strong></td>
                <td><span className="badge-status badge-healed">HEALED</span></td>
                <td><strong style={{ color: '#c084fc' }}>{h.healingScore || "1.00"}</strong></td>
                <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{h.message}</td>
                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(h.executedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
