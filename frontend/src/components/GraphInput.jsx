export const preset = {
  districts: 'D1, D2, D3, D4, D5, D6',
  zoneTypes: 'Residential, Commercial, Industrial',
  edges: 'D1, D3\nD1, D5\nD2, D4\nD2, D6\nD3, D4\nD3, D6\nD4, D6\nD5, D6',
};

function names(text, label) {
  const values = text.split(/[,\n]/).map((name) => name.trim()).filter(Boolean);
  if (values.length === 0) throw new Error(`Enter at least one ${label}.`);
  if (new Set(values).size !== values.length) throw new Error(`Each ${label} must have a unique name.`);
  return values;
}

export function parseGraph(draft) {
  const districts = names(draft.districts, 'district');
  const zoneTypes = names(draft.zoneTypes, 'zone type');
  const knownDistricts = new Set(districts);
  const uniqueEdges = new Map();

  for (const [index, line] of draft.edges.split('\n').entries()) {
    if (!line.trim()) continue;
    const pair = line.split(',').map((value) => value.trim());
    if (pair.length !== 2 || pair.some((name) => !knownDistricts.has(name))) {
      throw new Error(`Edge line ${index + 1} must contain two known districts separated by a comma.`);
    }
    const key = JSON.stringify([...pair].sort());
    if (!uniqueEdges.has(key)) uniqueEdges.set(key, pair);
  }

  return {
    districts,
    zone_types: zoneTypes,
    edges: [...uniqueEdges.values()],
    variable_order: districts,
    value_order: zoneTypes,
  };
}

export default function GraphInput({ draft, onChange, onLoadPreset }) {
  return (
    <section className="editor-section" aria-labelledby="input-heading">
      <div className="section-heading">
        <h2 id="input-heading">Graph setup</h2>
        <button type="button" className="text-button" onClick={onLoadPreset}>Load preset</button>
      </div>
      <p className="hint setup-hint" id="order-hint">List districts and zones in the order the solver should try them.</p>
      <label htmlFor="districts">Districts</label>
      <textarea id="districts" rows={2} aria-describedby="order-hint"
        value={draft.districts} onChange={(event) => onChange('districts', event.target.value)} />
      <label htmlFor="zones">Zone types</label>
      <textarea id="zones" rows={2} aria-describedby="order-hint"
        value={draft.zoneTypes} onChange={(event) => onChange('zoneTypes', event.target.value)} />
      <label htmlFor="edges">Adjacency edges</label>
      <textarea id="edges" rows={6} aria-describedby="edge-hint" placeholder="D1, D2"
        value={draft.edges} onChange={(event) => onChange('edges', event.target.value)} />
      <p className="hint" id="edge-hint">One comma-separated pair per line.</p>
    </section>
  );
}
