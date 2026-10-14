import React from "react";
import { ShieldCheck } from "lucide-react";

export default function HealingResults({ history }) {
  const healedRecords = (history || []).filter((h) => h.healed === 1 || h.healed === true);

  return (
    <div className="card">
      <h3 className="card-title"><ShieldCheck size={16} /> Healing Results</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '10px' }}>
        Automatic element locator recovery and self-healing scores captured via Healenium proxy.
      </p>

      {healedRecords.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '8px 0' }}>
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
                <td><strong style={{ color: 'var(--color-healed)' }}>{h.healingScore || "1.00"}</strong></td>
                <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{h.message}</td>
                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(h.executedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
