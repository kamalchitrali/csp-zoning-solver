export const algorithmNames = {
  backtracking: 'Backtracking',
  backtracking_with_propagation: 'Forward checking',
};

export default function AlgorithmSelector({ mode, onChange }) {
  return (
    <fieldset className="editor-section algorithm">
      <legend>Search algorithm</legend>
      <div className="algorithm-options">
        {[
          ['backtracking', 'Backtracking', 'Try each value in order'],
          ['backtracking_with_propagation', 'Forward checking', 'Backtracking with domain pruning'],
          ['both', 'Compare both', 'Use the same graph and search order'],
        ].map(([id, name, hint]) => (
          <label className="algorithm-option" key={id}>
            <input type="radio" name="algorithm" value={id} checked={mode === id} onChange={() => onChange(id)} />
            <span><strong>{name}</strong><small>{hint}</small></span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
