import React, { useState } from "react";
import { Database, Search } from "lucide-react";

export default function ExecutionHistory({ history }) {
  const [filter, setFilter] = useState("");

  const filtered = (history || []).filter((h) => {
    if (!filter) return true;
    const search = filter.toLowerCase();
    return (
      h.testId.toLowerCase().includes(search) ||
      h.status.toLowerCase().includes(search) ||
      (h.message && h.message.toLowerCase().includes(search))
    );
  });

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 className="card-title" style={{ margin: 0 }}><Database size={16} /> Execution History</h3>
        
        <div style={{ position: 'relative', width: '220px' }}>
          <input
            type="text"
            placeholder="Search history..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ paddingLeft: '30px' }}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No execution records found.</div>
      ) : (
        <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Test ID</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Healed</th>
                <th>Priority</th>
                <th>Executed At</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => (
                <tr key={h.id}>
                  <td>#{h.id}</td>
                  <td><strong>{h.testId}</strong></td>
                  <td>
                    <span className={`badge-status badge-${h.status}`}>
                      {h.status}
                    </span>
                  </td>
                  <td>{h.duration}s</td>
                  <td>
                    {h.healed ? (
                      <span className="badge-status badge-healed">Yes ({h.healingScore || 1.0})</span>
                    ) : (
                      "No"
                    )}
                  </td>
                  <td>{h.priority ? `#${h.priority}` : "-"}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {h.executedAt ? new Date(h.executedAt).toLocaleString() : "-"}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{h.message || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
