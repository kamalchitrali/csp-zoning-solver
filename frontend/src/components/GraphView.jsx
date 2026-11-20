import { useState } from 'react';
import { BusIcon, CollapseIcon, ExpandIcon, LocateIcon, MapIcon, RouteIcon, ZoomInIcon, ZoomOutIcon } from './Icon.jsx';

const palette = ['#a8e287', '#f6be6b', '#b7bcff', '#9bdfec', '#f2a8ce', '#ef9d89'];

export function zoneColor(index) {
  return palette[index] || `hsl(${(index * 137.508) % 360} 69% 73%)`;
}

function buildPositions(districts, width, height, viewMode) {
  if (viewMode === 'network') {
    return new Map(districts.map((name, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / districts.length;
      const x = width / 2 + (districts.length === 1 ? 0 : Math.cos(angle) * (width / 2 - 112));
      const y = height / 2 + (districts.length === 1 ? 0 : Math.sin(angle) * (height / 2 - 51));
      return [name, { x, y }];
    }));
  }

  const columns = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(districts.length))));
  const rows = Math.ceil(districts.length / columns);
  const horizontalStep = columns === 1 ? 0 : (width - 190) / (columns - 1);
  const verticalStep = rows === 1 ? 0 : (height - 150) / (rows - 1);
  return new Map(districts.map((name, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    return [name, { x: 95 + column * horizontalStep, y: 75 + row * verticalStep }];
  }));
}

function connectionPath(a, b, index = 0) {
  const offset = index % 2 === 0 ? 20 : -20;
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
  const controlX = midX + (-dy / length) * offset;
  const controlY = midY + (dx / length) * offset;
  return `M ${a.x} ${a.y} Q ${controlX} ${controlY} ${b.x} ${b.y}`;
}

export default function GraphView({ graph, assignment, activeStep, stepIndex, onShowFinal, showTransit, onToggleTransit }) {
  const [viewMode, setViewMode] = useState('map');
  const [zoom, setZoom] = useState(1);
  const [liveBuses, setLiveBuses] = useState(true);
  const [busSpeed, setBusSpeed] = useState('normal');
  const [expanded, setExpanded] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [districtQuery, setDistrictQuery] = useState('');
  const [showRouteLabels, setShowRouteLabels] = useState(true);
  const districts = graph?.districts || [];
  const largeLayout = districts.length > 12;
  const width = Math.max(640, largeLayout ? districts.length * 31 : 0);
  const height = Math.max(345, largeLayout ? districts.length * 27 : 0);
  const positions = buildPositions(districts, width, height, viewMode);
  const colors = new Map(graph?.zone_types.map((zone, index) => [zone, zoneColor(index)]));
  const zoomTransform = `translate(${(width * (1 - zoom)) / 2} ${(height * (1 - zoom)) / 2}) scale(${zoom})`;
  const speedMultiplier = { slow: .72, normal: 1, fast: 1.45 }[busSpeed];
  const normalizedQuery = districtQuery.trim().toLowerCase();
  const matchedDistricts = new Set(districts.filter((district) => district.toLowerCase().includes(normalizedQuery)));
  const routeOptions = graph?.edges.map(([left, right], index) => ({
    id: JSON.stringify([left, right]),
    label: `${left} ↔ ${right}`,
    number: `R${String(index + 1).padStart(2, '0')}`,
  })) || [];
  const routeFilter = routeOptions.some((route) => route.id === selectedRoute) ? selectedRoute : 'all';
  const activeRoute = routeOptions.find((route) => route.id === routeFilter);

  function zoomBy(amount) {
    setZoom((value) => Math.min(1.7, Math.max(.8, Number((value + amount).toFixed(2)))));
  }

  function changeView(nextView) {
    setViewMode(nextView);
    setZoom(1);
  }

  function isRouteVisible(left, right) {
    return routeFilter === 'all' || routeFilter === JSON.stringify([left, right]);
  }

  return (
    <section className={`panel graph${expanded ? ' graph-expanded' : ''}`} aria-labelledby="graph-heading">
      <div className="panel-header graph-header">
        <div>
          <div className="graph-title-line"><span className="graph-section-icon"><RouteIcon size={18} /></span><h2 id="graph-heading">Network map</h2></div>
          <p className="hint">Explore district connections, bus corridors, and zone assignments.</p>
        </div>
        <div className="graph-tools">
          {graph && <span className="graph-count">{districts.length} districts <span>·</span> {graph.edges.length} links</span>}
          {graph && <label className="toggle-control"><input type="checkbox" checked={showTransit} onChange={onToggleTransit} /> <span>Bus overlay</span></label>}
        </div>
      </div>
      <div className="map-toolbar" aria-label="Map view controls">
        <div className="view-switcher" role="tablist" aria-label="Visualization view">
          <button type="button" role="tab" aria-selected={viewMode === 'network'} className={viewMode === 'network' ? 'active' : ''} onClick={() => changeView('network')}><RouteIcon size={16} /> Network</button>
          <button type="button" role="tab" aria-selected={viewMode === 'map'} className={viewMode === 'map' ? 'active' : ''} onClick={() => changeView('map')}><MapIcon size={16} /> Map</button>
        </div>
        <div className="zoom-controls">
          <button type="button" onClick={() => zoomBy(-.1)} disabled={zoom <= .8} aria-label="Zoom out"><ZoomOutIcon /></button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => zoomBy(.1)} disabled={zoom >= 1.7} aria-label="Zoom in"><ZoomInIcon /></button>
          <button type="button" onClick={() => setZoom(1)} aria-label="Reset map view"><LocateIcon /></button>
        </div>
        {graph && <div className="live-controls">
          <button type="button" className={`live-toggle${liveBuses ? ' active' : ''}`} onClick={() => setLiveBuses((value) => !value)} aria-pressed={liveBuses}>
            <span className="live-dot" /> <BusIcon size={15} /> {liveBuses ? 'Live buses' : 'Buses paused'}
          </button>
          <label className="speed-control" htmlFor="bus-speed">Speed
            <select id="bus-speed" value={busSpeed} onChange={(event) => setBusSpeed(event.target.value)}>
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </label>
        </div>}
        <button className="map-expand-button" type="button" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? 'Collapse route map' : 'Expand route map'}>
          {expanded ? <CollapseIcon size={17} /> : <ExpandIcon size={17} />}<span>{expanded ? 'Collapse' : 'Expand map'}</span>
        </button>
      </div>
      {graph && <div className="map-filter-bar">
        <label className="map-filter-control" htmlFor="route-filter">Route
          <select id="route-filter" value={routeFilter} onChange={(event) => setSelectedRoute(event.target.value)}>
            <option value="all">All routes</option>
            {routeOptions.map((route) => <option key={route.id} value={route.id}>{route.number} · {route.label}</option>)}
          </select>
        </label>
        <label className="map-search-control" htmlFor="district-search">Find district
          <input id="district-search" type="search" value={districtQuery} onChange={(event) => setDistrictQuery(event.target.value)} placeholder="e.g. D3" />
        </label>
        <label className="toggle-control map-label-toggle"><input type="checkbox" checked={showRouteLabels} onChange={(event) => setShowRouteLabels(event.target.checked)} /> <span>Route labels</span></label>
        {normalizedQuery && <span className="filter-result">{matchedDistricts.size} match{matchedDistricts.size === 1 ? '' : 'es'}</span>}
      </div>}
      <div className={`canvas ${viewMode === 'map' ? 'map-canvas' : 'network-canvas'}`}>
        {graph ? (
          <svg viewBox={`0 0 ${width} ${height}`} style={{ minWidth: largeLayout ? width : undefined }}
            role="img" aria-label={`${viewMode === 'map' ? 'Map' : 'Network graph'} of districts and their adjacency edges`}>
            <title>{activeStep ? `${viewMode === 'map' ? 'Map' : 'Graph'} at step ${stepIndex + 1}` : `${viewMode === 'map' ? 'Transit map' : 'District zoning graph'}`}</title>
            {viewMode === 'map' && (
              <g className="map-details" aria-hidden="true">
                <path d="M28 124 C155 75 208 151 330 112 S535 82 612 132" />
                <path d="M40 263 C175 207 252 294 365 245 S523 216 612 264" />
                <path d="M194 24 C236 105 202 169 254 225 S294 306 268 335" />
                <path d="M446 22 C405 88 469 148 420 211 S403 292 448 334" />
                <text x="43" y="42">NORTH LOOP</text>
                <text x="492" y="320">SOUTH LOOP</text>
              </g>
            )}
            <g transform={zoomTransform}>
              {graph.edges.map(([left, right], index) => {
                const a = positions.get(left);
                const b = positions.get(right);
                const conflicting = activeStep?.action === 'conflict' && (
                  (activeStep.assign === left && activeStep.conflict_with === right) ||
                  (activeStep.assign === right && activeStep.conflict_with === left)
                );
                const routeVisible = isRouteVisible(left, right);
                const style = `${conflicting ? 'edge edge-conflict' : 'edge'}${routeVisible ? ' route-visible' : ' route-muted'}${routeFilter !== 'all' && routeVisible ? ' route-selected' : ''}`;
                const key = JSON.stringify([left, right]);
                return left === right
                  ? <circle className={style} key={key} cx={a.x + 23} cy={a.y - 23} r="18" />
                  : viewMode === 'map'
                    ? <path className={`${style} map-route`} key={key} d={connectionPath(a, b, index)} />
                    : <line className={style} key={key} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
              })}
              {showRouteLabels && viewMode === 'map' && graph.edges.map(([left, right], index) => {
                if (left === right) return null;
                const a = positions.get(left);
                const b = positions.get(right);
                const routeVisible = isRouteVisible(left, right);
                const x = (a.x + b.x) / 2;
                const y = (a.y + b.y) / 2;
                return (
                  <g className={`route-label${routeVisible ? '' : ' route-label-muted'}`} key={`route-label-${JSON.stringify([left, right])}`} transform={`translate(${x} ${y})`}>
                    <rect x="-17" y="-10" width="34" height="18" rx="9" />
                    <text textAnchor="middle" dominantBaseline="central">R{String(index + 1).padStart(2, '0')}</text>
                  </g>
                );
              })}
              {showTransit && graph.edges.map(([left, right]) => {
                if (left === right) return null;
                if (!isRouteVisible(left, right)) return null;
                const a = positions.get(left);
                const b = positions.get(right);
                const conflicting = activeStep?.action === 'conflict' && (
                  (activeStep.assign === left && activeStep.conflict_with === right) ||
                  (activeStep.assign === right && activeStep.conflict_with === left)
                );
                const x = (a.x + b.x) / 2;
                const y = (a.y + b.y) / 2;
                return (
                  <g className={`transit-marker${conflicting ? ' transit-marker-conflict' : ''}`} key={`bus-${JSON.stringify([left, right])}`} transform={`translate(${x} ${y})`}>
                    <title>Bus connection between {left} and {right}</title>
                    <rect x="-12" y="-8" width="24" height="16" rx="4" />
                    <path d="M-8 -2h16M-6 -5h4M2 -5h4M-8 4h16" />
                    <circle cx="-6" cy="7" r="2" />
                    <circle cx="6" cy="7" r="2" />
                  </g>
                );
              })}
              {liveBuses && graph.edges.slice(0, Math.min(graph.edges.length, 4)).map(([left, right], index) => {
                if (left === right) return null;
                if (!isRouteVisible(left, right)) return null;
                const a = positions.get(left);
                const b = positions.get(right);
                const route = viewMode === 'map' ? connectionPath(a, b, index) : `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
                const distance = Math.max(80, Math.hypot(b.x - a.x, b.y - a.y));
                const duration = Math.max(6, Math.min(17, distance / 24)) / speedMultiplier;
                return (
                  <g className="moving-bus" key={`moving-bus-${JSON.stringify([left, right])}`}>
                    <title>Simulated bus moving between {left} and {right}</title>
                    <animateMotion dur={`${duration.toFixed(2)}s`} begin={`-${(index * 2.7).toFixed(2)}s`} repeatCount="indefinite" path={route} rotate="auto" />
                    <rect x="-13" y="-8" width="26" height="16" rx="4" />
                    <path d="M-9 -2h18M-7 -5h4M3 -5h4M-9 4h18" />
                    <circle cx="-7" cy="7" r="2" />
                    <circle cx="7" cy="7" r="2" />
                  </g>
                );
              })}
              {districts.map((name) => {
                const { x, y } = positions.get(name);
                const zone = assignment.get(name);
                const label = Array.from(name);
                const selected = name === activeStep?.assign;
                const districtMatches = !normalizedQuery || matchedDistricts.has(name);
                return (
                  <g key={name} className={`district-node${normalizedQuery && districtMatches ? ' district-search-match' : ''}${normalizedQuery && !districtMatches ? ' district-dim' : ''}`} transform={`translate(${x} ${y})`} onClick={() => setDistrictQuery(name)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setDistrictQuery(name); }} role="button" tabIndex={0}>
                    <title>{zone ? `${name} · ${zone}. Click to focus.` : `${name} · Unassigned. Click to focus.`}</title>
                    {selected && <circle className="node-highlight" r={viewMode === 'map' ? 34 : 31} />}
                    {viewMode === 'map' ? (
                      <>
                        <path className="map-node" d="M0 31C-4 24-28 11-28-7a28 28 0 1 1 56 0c0 18-24 31-28 38Z" fill={colors.get(zone) || '#fefef8'} />
                        <circle className="map-node-core" r="18" fill={colors.get(zone) || '#fefef8'} />
                      </>
                    ) : <circle className="node" r="25" fill={colors.get(zone) || '#fefef8'} />}
                    <text className="node-label" textAnchor="middle" dominantBaseline="central">
                      {label.length > 5 ? `${label.slice(0, 4).join('')}…` : name}
                    </text>
                    {viewMode === 'map' && <text className="map-node-caption" textAnchor="middle" y="46">{zone || 'Unassigned'}</text>}
                  </g>
                );
              })}
            </g>
          </svg>
        ) : <p>Complete the graph setup to preview your districts.</p>}
      </div>
      <div className="graph-footer">
        <ul className="zone-legend" aria-label="Zone colors">
          {graph?.zone_types.map((zone) => (
            <li key={zone}><i style={{ backgroundColor: colors.get(zone) }} />{zone}</li>
          ))}
        </ul>
        {graph && <div className="map-insights" aria-label="Map insights">
          <span><strong>{routeFilter === 'all' ? routeOptions.length : 1}</strong> route{routeFilter === 'all' && routeOptions.length !== 1 ? 's' : ''}</span>
          <span><strong>{normalizedQuery ? matchedDistricts.size : districts.length}</strong> in focus</span>
          {activeRoute && <span className="active-route-note"><i />{activeRoute.number} selected</span>}
        </div>}
        <div className="graph-footer-actions">
          {viewMode === 'map' && <span className="map-note"><MapIcon size={14} /> Route-aware map view</span>}
          {activeStep && <button className="text-button" type="button" onClick={onShowFinal}>Show final graph</button>}
        </div>
      </div>
    </section>
  );
}
