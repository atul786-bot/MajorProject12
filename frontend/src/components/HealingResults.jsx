function HealingResults({ executionHistory }) {
  const healedTests = (executionHistory || []).filter(
    (record) => record.healed === 1 || record.healed === true
  );

  if (healedTests.length === 0) {
    return <p>No healing results available.</p>;
  }

  return (
    <div>
      <h2>Healing Results</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Test ID</th>
            <th>Status</th>
            <th>Healing Score</th>
            <th>Duration</th>
            <th>Executed At</th>
          </tr>
        </thead>

        <tbody>
          {healedTests.map((record, index) => (
            <tr key={`${record.testId}-${index}`}>
              <td>{record.testId}</td>
              <td>{record.status}</td>
              <td>{record.healingScore ?? "—"}</td>
              <td>{record.duration != null ? `${record.duration}s` : "—"}</td>
              <td>{record.executedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HealingResults;