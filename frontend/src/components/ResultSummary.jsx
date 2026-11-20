import { algorithmNames } from './AlgorithmSelector.jsx';
import { zoneColor } from './GraphView.jsx';

export default function ResultSummary({ results, selected, zoneTypes, graph }) {
  const runs = Object.entries(results);
  const current = results[selected];
  const assignmentsByZone = zoneTypes.reduce((counts, zone) => {
    counts[zone] = current?.solution ? Object.values(current.solution).filter((value) => value === zone).length : 0;
    return counts;
  }, {});
  return (
    <section className="panel" aria-labelledby="results-heading">
      <div className="panel-header">
        <div>
          <h2 id="results-heading">Results</h2>
          <p className="hint">Backtracks count assignments undone during search.</p>
        </div>
      </div>
      {runs.length === 0 ? (
        <div className="empty">Run the solver to see assignments and backtrack counts.</div>
      ) : (
        <>
          <div className="run-grid">
            {runs.map(([algorithm, result]) => (
              <div key={algorithm} className="run-card">
                <h3>{algorithmNames[algorithm]}</h3>
                <div className="metric"><strong>{result.backtrack_count}</strong> backtracks</div>
                <p className={result.success ? 'success' : 'unsolved'}>
                  {result.success ? 'Solution found' : 'No solution'}
                </p>
              </div>
            ))}
          </div>
          {current?.success ? (
            <>
              <div className="assignment-overview">
                <div>
                  <span>Coverage</span>
                  <strong>{graph?.districts.length ? Math.round((Object.keys(current.solution).length / graph.districts.length) * 100) : 0}%</strong>
                </div>
                <div className="zone-bars" aria-label="Zone usage">
                  {zoneTypes.map((zone, index) => (
                    <div className="zone-bar" key={zone} title={`${zone}: ${assignmentsByZone[zone]} districts`}>
                      <span><i style={{ backgroundColor: zoneColor(index) }} />{zone}</span>
                      <b><em style={{ width: `${graph?.districts.length ? (assignmentsByZone[zone] / graph.districts.length) * 100 : 0}%`, backgroundColor: zoneColor(index) }} /></b>
                    </div>
                  ))}
                </div>
              </div>
              <dl className="assignments" aria-label={`${algorithmNames[selected]} final assignments`}>
                {Object.entries(current.solution).map(([district, zone]) => (
                  <div key={district}>
                    <dt>{district}</dt>
                    <dd><i style={{ backgroundColor: zoneColor(zoneTypes.indexOf(zone)) }} />{zone}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <p className="no-solution">This graph cannot be colored with the supplied zone types.</p>
          )}
        </>
      )}
    </section>
  );
}
