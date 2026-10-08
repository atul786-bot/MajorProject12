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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 className="card-title" style={{ margin: 0 }}><Database size={20} className="text-cyan-400" /> Complete Execution History Log</h3>
        
        <div style={{ position: 'relative', width: '250px' }}>
          <input
            type="text"
            placeholder="Search history..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ paddingLeft: '2.2rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No execution records found in database.</div>
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
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {h.executedAt ? new Date(h.executedAt).toLocaleString() : "-"}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{h.message || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
