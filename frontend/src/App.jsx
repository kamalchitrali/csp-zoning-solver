import { useState } from 'react';
import { solveGraph } from './api/client.js';
import AlgorithmSelector from './components/AlgorithmSelector.jsx';
import GraphInput, { parseGraph, preset } from './components/GraphInput.jsx';
import GraphView from './components/GraphView.jsx';
import ResultSummary from './components/ResultSummary.jsx';
import TraceViewer from './components/TraceViewer.jsx';
import { ActivityIcon, BusIcon, DownloadIcon, GridIcon, RouteIcon, SparkIcon } from './components/Icon.jsx';

function StatCard({ icon, label, value, note, tone = '' }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </div>
  );
}

export default function App() {
  const [draft, setDraft] = useState(preset);
  const [mode, setMode] = useState('both');
  const [results, setResults] = useState({});
  const [selected, setSelected] = useState('');
  const [stepIndex, setStepIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTransit, setShowTransit] = useState(true);
  let graph = null;
  let graphError = '';

  try {
    graph = parseGraph(draft);
  } catch (problem) {
    graphError = problem.message;
  }

  const result = results[selected];
  const assignedCount = result?.solution ? Object.keys(result.solution).length : 0;
  const coverage = graph?.districts.length ? Math.round((assignedCount / graph.districts.length) * 100) : 0;
  const status = result ? (result.success ? 'Solved' : 'Review') : 'Ready';
  const activeStep = stepIndex === null ? null : result?.steps[stepIndex];
  const assignment = new Map(Object.entries(activeStep ? {} : result?.solution || {}));
  if (activeStep) {
    for (let index = 0; index <= stepIndex; index += 1) {
      const { action, assign, value } = result.steps[index];
      if (action === 'assign') assignment.set(assign, value);
      if (action === 'backtrack') assignment.delete(assign);
    }
  }

  function updateDraft(nextDraft) {
    setDraft(nextDraft);
    setResults({});
    setSelected('');
    setStepIndex(null);
    setError('');
  }

  function resetWorkspace() {
    updateDraft(preset);
    setMode('both');
    setShowTransit(true);
  }

  function exportReport() {
    if (!graph) {
      setError(graphError);
      return;
    }
    const report = {
      generated_at: new Date().toISOString(),
      graph,
      selected_algorithm: selected || null,
      results,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'csp-zoning-report.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function run(event) {
    event.preventDefault();
    if (loading) return;
    if (!graph) {
      setError(graphError);
      return;
    }

    setError('');
    setResults({});
    setSelected('');
    setStepIndex(null);
    setLoading(true);
    try {
      const algorithms = mode === 'both' ? ['backtracking', 'backtracking_with_propagation'] : [mode];
      const allResults = await Promise.all(algorithms.map(async (algorithm) => [
        algorithm, await solveGraph(graph, algorithm),
      ]));
      setResults(Object.fromEntries(allResults));
      setSelected(algorithms[0]);
    } catch (problem) {
      setError(problem.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <span className="brand-mark"><BusIcon size={22} /></span>
          <span>CSP Zoning Solver</span>
          <span className="header-status"><i /> Network planning workspace</span>
        </div>
      </header>
      <main className="workspace">
        <header className="intro">
          <div className="intro-copy">
            <p className="eyebrow"><BusIcon size={16} /> Transit zoning control room</p>
            <h1>Plan the network before the buses roll.</h1>
            <p>Assign zones to adjacent districts, compare search strategies, and keep a clear view of route readiness.</p>
          </div>
          <div className="intro-actions">
            <button className="secondary-button" type="button" onClick={resetWorkspace}><SparkIcon size={16} /> Reset workspace</button>
            <button className="secondary-button" type="button" onClick={exportReport} disabled={!graph}><DownloadIcon size={16} /> Export report</button>
          </div>
        </header>
        <section className="stats-grid" aria-label="Network overview">
          <StatCard icon={<GridIcon />} label="Districts" value={graph?.districts.length ?? '—'} note="planning zones" />
          <StatCard icon={<RouteIcon />} label="Transit links" value={graph?.edges.length ?? '—'} note="adjacency edges" tone="blue" />
          <StatCard icon={<BusIcon />} label="Zone options" value={graph?.zone_types.length ?? '—'} note="available colors" tone="orange" />
          <StatCard icon={<ActivityIcon />} label="Network status" value={status} note={result ? `${coverage}% assigned` : 'awaiting a run'} tone={result?.success ? 'success' : ''} />
        </section>
        <div className="workspace-grid">
          <aside className="panel editor" aria-label="Solver controls">
            <form onSubmit={run}>
              <fieldset className="form-fields" disabled={loading}>
                <GraphInput draft={draft} onChange={(field, value) => updateDraft({ ...draft, [field]: value })}
                  onLoadPreset={() => updateDraft(preset)} />
                <AlgorithmSelector mode={mode} onChange={setMode} />
                <button className="run-button" type="submit">
                  <span>{loading ? 'Running…' : 'Run solver'}</span><ActivityIcon size={18} />
                </button>
              </fieldset>
              {error && <p className="error" role="alert">{error}</p>}
            </form>
          </aside>
          <div className="output" aria-busy={loading}>
            <GraphView graph={graph} assignment={assignment} activeStep={activeStep}
              stepIndex={stepIndex} onShowFinal={() => setStepIndex(null)} showTransit={showTransit}
              onToggleTransit={() => setShowTransit((value) => !value)} />
            <ResultSummary results={results} selected={selected} zoneTypes={graph?.zone_types || []} graph={graph} />
            <section className="readiness-card" aria-label="Transit readiness">
              <div className="readiness-icon"><BusIcon size={23} /></div>
              <div className="readiness-copy">
                <div className="section-heading">
                  <div><p className="eyebrow">Network readiness</p><h2>{result?.success ? 'Ready for route review' : 'Build a route-ready plan'}</h2></div>
                  <span className={`readiness-pill ${result?.success ? 'ready' : ''}`}><i />{result?.success ? 'On track' : 'Not started'}</span>
                </div>
                <p className="hint">{result?.success ? `${assignedCount} districts have a compatible zone assignment. Use the trace below to review the search.` : 'Run the solver to turn the current district map into an assignment your transit team can review.'}</p>
              </div>
            </section>
            <TraceViewer key={selected} results={results} selected={selected} stepIndex={stepIndex}
              onStep={(index) => setStepIndex(stepIndex === index ? null : index)}
              onSelect={(algorithm) => { setSelected(algorithm); setStepIndex(null); }} />
          </div>
        </div>
      </main>
    </>
  );
}
