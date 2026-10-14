import React from "react";
import { TrendingUp } from "lucide-react";

export default function RiskRanking({ riskRanking }) {
  return (
    <div className="card">
      <h3 className="card-title"><TrendingUp size={16} /> AI Risk Ranking</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '10px' }}>
        Failure probabilities from the Logistic Regression model based on past failure history, duration, and healing frequency.
      </p>

      {(!riskRanking || riskRanking.length === 0) ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '8px 0' }}>
          No AI predictions available. Run the AI pipeline to compute risk rankings.
        </div>
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
              const barColor = r.risk_level === "HIGH"
                ? 'var(--color-failed)'
                : (r.risk_level === "MEDIUM" ? 'var(--color-warning)' : 'var(--color-passed)');

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, background: 'var(--bg-page)', borderRadius: '3px', height: '5px', overflow: 'hidden', maxWidth: '100px' }}>
                        <div style={{
                          width: `${prob}%`,
                          height: '100%',
                          background: barColor,
                          borderRadius: '3px'
                        }} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{prob}%</span>
                    </div>
                  </td>
                  <td>
                    {r.prediction === 1 ? (
                      <span style={{ color: 'var(--color-failed)', fontWeight: 600, fontSize: '12px' }}>Likely Fail</span>
                    ) : (
                      <span style={{ color: 'var(--color-passed)', fontWeight: 600, fontSize: '12px' }}>Likely Pass</span>
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
