import { useState } from 'react';
import { algorithmNames } from './AlgorithmSelector.jsx';

const pageSize = 25;
const labels = { assign: 'Assign', conflict: 'Conflict', backtrack: 'Backtrack' };

export default function TraceViewer({ results, selected, onSelect, stepIndex, onStep }) {
  const [page, setPage] = useState(0);
  const steps = results[selected]?.steps || [];
  const start = page * pageSize;
  const end = Math.min(start + pageSize, steps.length);
  const algorithms = Object.keys(results);

  return (
    <section className="panel" aria-labelledby="trace-heading">
      <div className="panel-header">
        <div>
          <h2 id="trace-heading">Search trace</h2>
          <p className="hint">Select an event to inspect the graph at that step.</p>
        </div>
        {algorithms.length > 1 && (
          <select aria-label="Trace algorithm" value={selected} onChange={(event) => onSelect(event.target.value)}>
            {algorithms.map((algorithm) => <option key={algorithm} value={algorithm}>{algorithmNames[algorithm]}</option>)}
          </select>
        )}
      </div>
      {steps.length === 0 ? <div className="empty">Search events will appear here after a run.</div> : (
        <>
          <ol className="trace-list" start={start + 1}>
            {steps.slice(start, end).map((step, offset) => {
              const index = start + offset;
              return (
                <li key={index}>
                  <button type="button" aria-pressed={index === stepIndex} onClick={() => onStep(index)}>
                    <span className="step-number">{index + 1}</span>
                    <span className={`action ${step.action}`}>{labels[step.action]}</span>
                    <span className="step-content"><strong>{step.assign}</strong> <span>→</span> {step.value}
                      {step.conflict_with && <small>Conflict with {step.conflict_with}</small>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="pagination">
            <span>{start + 1}–{end} of {steps.length} events</span>
            {steps.length > pageSize && (
              <div>
                <button className="text-button" type="button" disabled={page === 0}
                  onClick={() => setPage(page - 1)}>Previous</button>
                <button className="text-button" type="button" disabled={end === steps.length}
                  onClick={() => setPage(page + 1)}>Next</button>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
