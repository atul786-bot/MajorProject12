import React from "react";
import { TrendingUp, AlertTriangle } from "lucide-react";

export default function RiskRanking({ riskRanking }) {
  return (
    <div className="card">
      <h3 className="card-title"><TrendingUp size={20} className="text-amber-400" /> AI Risk Ranking & Test Prioritization</h3>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
        Test failure probabilities calculated by Logistic Regression model using past failure history, duration, and healing frequency.
      </p>

      {(!riskRanking || riskRanking.length === 0) ? (
        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No AI predictions available yet. Run the AI pipeline to compute risk rankings.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Priority</th>
              <th>Test ID</th>
              <th>Risk Level</th>
              <th>Failure Probability</th>
              <th>Prediction</th>
            </tr>
          </thead>
          <tbody>
            {riskRanking.map((r) => {
              const prob = (r.failure_probability * 100).toFixed(1);
              const riskClass = r.risk_level === "HIGH" ? "badge-high" : (r.risk_level === "MEDIUM" ? "badge-medium" : "badge-low");

              return (
                <tr key={r.test_id}>
                  <td><strong>#{r.priority}</strong></td>
                  <td>{r.test_id}</td>
                  <td>
                    <span className={`badge-risk ${riskClass}`}>
                      {r.risk_level}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, background: '#0f172a', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${prob}%`,
                          height: '100%',
                          background: r.risk_level === 'HIGH' ? '#f43f5e' : (r.risk_level === 'MEDIUM' ? '#f59e0b' : '#10b981')
                        }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{prob}%</span>
                    </div>
                  </td>
                  <td>
                    {r.prediction === 1 ? (
                      <span style={{ color: '#f43f5e', fontWeight: 600 }}>Likely Fail</span>
                    ) : (
                      <span style={{ color: '#34d399', fontWeight: 600 }}>Likely Pass</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
