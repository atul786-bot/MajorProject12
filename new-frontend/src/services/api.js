const API_BASE = "http://localhost:3000/api";

export async function fetchOverview() {
  const res = await fetch(`${API_BASE}/overview`);
  if (!res.ok) throw new Error("Failed to fetch overview");
  return await res.json();
}

export async function fetchTests() {
  const res = await fetch(`${API_BASE}/tests`);
  if (!res.ok) throw new Error("Failed to fetch tests");
  const data = await res.json();
  return data.tests || [];
}

export async function saveTestDefinition(testDef) {
  const res = await fetch(`${API_BASE}/tests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testDef)
  });
  if (!res.ok) throw new Error("Failed to save test definition");
  return await res.json();
}

export async function fetchRiskRanking() {
  const res = await fetch(`${API_BASE}/risk-ranking`);
  if (!res.ok) throw new Error("Failed to fetch risk ranking");
  const data = await res.json();
  return data.riskRanking || [];
}

export async function fetchHistory(limit = 100) {
  const res = await fetch(`${API_BASE}/history?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch execution history");
  const data = await res.json();
  return data.history || [];
}

export async function executeSelectedTest(testId) {
  const res = await fetch(`${API_BASE}/execution`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ testId })
  });
  if (!res.ok) throw new Error("Selected test execution failed");
  return await res.json();
}

export async function runAdaptiveExecution() {
  const res = await fetch(`${API_BASE}/execution/adaptive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error("Adaptive execution failed");
  return await res.json();
}
