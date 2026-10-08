import React, { useState } from "react";
import { Plus, Trash2, FileCode, CheckCircle2 } from "lucide-react";
import { saveTestDefinition } from "../services/api";

const EMPTY_TEST = {
  testId: "",
  name: "",
  targetUrl: "http://localhost:8080/index.html",
  description: "",
  steps: [
    { step: 1, action: "OPEN", locatorType: "url", locator: "http://localhost:8080/index.html", value: "" }
  ]
};

export default function TestDefinitions({ tests, onTestSaved }) {
  const [newTest, setNewTest] = useState(EMPTY_TEST);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleStepChange = (index, field, value) => {
    const steps = [...newTest.steps];
    steps[index][field] = value;
    setNewTest({ ...newTest, steps });
  };

  const addStep = () => {
    setNewTest({
      ...newTest,
      steps: [
        ...newTest.steps,
        { step: newTest.steps.length + 1, action: "CLICK", locatorType: "id", locator: "", value: "" }
      ]
    });
  };

  const removeStep = (index) => {
    if (newTest.steps.length === 1) return;
    const steps = newTest.steps.filter((_, i) => i !== index).map((s, idx) => ({ ...s, step: idx + 1 }));
    setNewTest({ ...newTest, steps });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      await saveTestDefinition(newTest);
      setMsg(`Test definition "${newTest.testId}" saved!`);
      setNewTest(EMPTY_TEST);
      if (onTestSaved) onTestSaved();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-cols-2">
      {/* Existing Test Definitions List */}
      <div className="card">
        <h3 className="card-title"><FileCode size={20} /> Registered Test Definitions ({tests.length})</h3>
        <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Test ID</th>
                <th>Name</th>
                <th>Steps</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.testId}>
                  <td><strong>{t.testId}</strong></td>
                  <td>{t.name}</td>
                  <td>{t.steps ? t.steps.length : 0} steps</td>
                  <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{t.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Definition Builder Form */}
      <div className="card">
        <h3 className="card-title"><Plus size={20} /> Create / Edit Test Definition</h3>
        {msg && <div style={{ padding: '0.6rem', marginBottom: '1rem', background: '#1e293b', border: '1px solid #3b82f6', borderRadius: '0.375rem', color: '#60a5fa' }}>{msg}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Test ID</label>
              <input value={newTest.testId} onChange={(e) => setNewTest({ ...newTest, testId: e.target.value })} placeholder="TC-WEB-009" required />
            </div>
            <div className="form-group">
              <label>Test Name</label>
              <input value={newTest.name} onChange={(e) => setNewTest({ ...newTest, name: e.target.value })} placeholder="Cart Checkout Test" required />
            </div>
          </div>

          <div className="form-group">
            <label>Target URL</label>
            <input value={newTest.targetUrl} onChange={(e) => setNewTest({ ...newTest, targetUrl: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input value={newTest.description} onChange={(e) => setNewTest({ ...newTest, description: e.target.value })} placeholder="Brief summary" required />
          </div>

          <div style={{ marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Test Action Steps</span>
            <button type="button" className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }} onClick={addStep}>
              + Add Step
            </button>
          </div>

          {newTest.steps.map((step, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '80px 100px 1fr 1fr 40px', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
              <select value={step.action} onChange={(e) => handleStepChange(idx, 'action', e.target.value)}>
                <option value="OPEN">OPEN</option>
                <option value="TYPE">TYPE</option>
                <option value="CLICK">CLICK</option>
                <option value="VERIFY">VERIFY</option>
              </select>

              <select value={step.locatorType} onChange={(e) => handleStepChange(idx, 'locatorType', e.target.value)}>
                <option value="id">id</option>
                <option value="css">css</option>
                <option value="xpath">xpath</option>
                <option value="name">name</option>
                <option value="className">className</option>
              </select>

              <input value={step.locator || ''} onChange={(e) => handleStepChange(idx, 'locator', e.target.value)} placeholder="Locator (e.g. username)" />
              <input value={step.value || ''} onChange={(e) => handleStepChange(idx, 'value', e.target.value)} placeholder="Value / Expected text" />
              
              <button type="button" style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }} onClick={() => removeStep(idx)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} disabled={loading}>
            {loading ? "Saving Definition..." : "Save Test Definition"}
          </button>
        </form>
      </div>
    </div>
  );
}
