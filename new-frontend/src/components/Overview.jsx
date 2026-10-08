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
          <Activity size={20} className="text-blue-400" />
        </div>
        <div className="metric-value">{summary.totalExecutions}</div>
        <div className="metric-sub">Recorded in SQLite database</div>
      </div>

      <div className="metric-card">
        <div className="metric-header">
          <span>Pass Rate</span>
          <Percent size={20} className="text-emerald-400" />
        </div>
        <div className="metric-value" style={{ color: "#34d399" }}>{summary.passRate}%</div>
        <div className="metric-sub">{summary.passedExecutions} passed / {summary.failedExecutions} failed</div>
      </div>

      <div className="metric-card">
        <div className="metric-header">
          <span>Healed Executions</span>
          <ShieldCheck size={20} className="text-purple-400" />
        </div>
        <div className="metric-value" style={{ color: "#c084fc" }}>{summary.healedExecutions}</div>
        <div className="metric-sub">Self-healed via Healenium</div>
      </div>

      <div className="metric-card">
        <div className="metric-header">
          <span>Avg Duration</span>
          <Clock size={20} className="text-cyan-400" />
        </div>
        <div className="metric-value">{summary.avgDuration}s</div>
        <div className="metric-sub">Average test run time</div>
      </div>
    </div>
  );
}
