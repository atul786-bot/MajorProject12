const API_URL = "http://localhost:3000";

export async function getOverview() {
  const response = await fetch(`${API_URL}/api/overview`);

  if (!response.ok) {
    throw new Error("Failed to fetch overview");
  }

  return response.json();
}

export async function getTests() {
  const response = await fetch(`${API_URL}/api/tests`);

  if (!response.ok) {
    throw new Error("Failed to fetch tests");
  }

  return response.json();
}

export async function getRiskRanking() {
  const response = await fetch(`${API_URL}/api/risk-ranking`);

  if (!response.ok) {
    throw new Error("Failed to fetch risk ranking");
  }

  return response.json();
}

export async function getExecutionResults() {
  const response = await fetch(`${API_URL}/api/execution`);

  if (!response.ok) {
    throw new Error("Failed to fetch execution results");
  }

  return response.json();
}

export async function getExecutionHistory() {
  const response = await fetch(`${API_URL}/api/history`);

  if (!response.ok) {
    throw new Error("Failed to fetch execution history");
  }

  return response.json();
}

export async function createTestDefinition(testDefinition) {
  const response = await fetch(`${API_URL}/api/tests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(testDefinition),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.error || data.message || "Failed to create test definition"
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function executeSelectedTest(testId) {
  const response = await fetch(`${API_URL}/api/execution`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ testId }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.error || data.message || "Failed to execute selected test"
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function runAdaptiveExecution() {
  const response = await fetch(`${API_URL}/api/execution/adaptive`, {
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.error || data.message || "Adaptive execution failed"
    );
    error.status = response.status;
    throw error;
  }

  return data;
}
