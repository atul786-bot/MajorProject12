function TestResults({ tests }) {
  if (tests.length === 0) {
    return <p>No test definitions available.</p>;
  }

  return (
    <div>
      <h2>Test Definitions</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Test ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Target URL</th>
            <th>Steps</th>
          </tr>
        </thead>

        <tbody>
          {tests.map((test) => (
            <tr key={test.testId}>
              <td>{test.testId}</td>
              <td>{test.name}</td>
              <td>{test.description}</td>
              <td>{test.targetUrl}</td>
              <td>{test.steps?.length ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TestResults;