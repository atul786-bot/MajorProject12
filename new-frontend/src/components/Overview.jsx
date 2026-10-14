import React from "react";
import { Activity, CheckCircle, XCircle, ShieldCheck, Clock, Percent } from "lucide-react";

export default function Overview({ overview }) {
  const summary = overview?.summary || {
    totalExecutions: 0,
    passedExecutions: 0,
    failedExecutions: 0,
    healedExecutions: 0,
    passRate: 0,
    avgDuration: 0
  };

  return (
    <div className="grid-cols-4">
      <div className="metric-card">
        <div className="metric-header">
          <span>Total Executions</span>
          <Activity size={16} />
        </div>
        <div className="metric-value">{summary.totalExecutions}</div>
        <div className="metric-sub">All recorded runs</div>
      </div>

      <div className="metric-card">
        <div className="metric-header">
          <span>Passed</span>
          <CheckCircle size={16} />
        </div>
        <div className="metric-value" style={{ color: 'var(--color-passed)' }}>{summary.passedExecutions}</div>
        <div className="metric-sub">Successful executions</div>
      </div>

      <div className="metric-card">
        <div className="metric-header">
          <span>Failed</span>
          <XCircle size={16} />
        </div>
        <div className="metric-value" style={{ color: 'var(--color-failed)' }}>{summary.failedExecutions}</div>
        <div className="metric-sub">Failed executions</div>
      </div>

      <div className="metric-card">
        <div className="metric-header">
          <span>Pass Rate</span>
          <Percent size={16} />
        </div>
        <div className="metric-value" style={{ color: 'var(--color-passed)' }}>{summary.passRate}%</div>
        <div className="metric-sub">{summary.passedExecutions} of {summary.totalExecutions} passed</div>
      </div>

      <div className="metric-card">
        <div className="metric-header">
          <span>Healed</span>
          <ShieldCheck size={16} />
        </div>
        <div className="metric-value" style={{ color: 'var(--color-healed)' }}>{summary.healedExecutions}</div>
        <div className="metric-sub">Self-healed via Healenium</div>
      </div>

      <div className="metric-card">
        <div className="metric-header">
          <span>Avg Duration</span>
          <Clock size={16} />
        </div>
        <div className="metric-value">{summary.avgDuration}s</div>
        <div className="metric-sub">Average run time</div>
      </div>
    </div>
  );
}
