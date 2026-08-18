import { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// ── JSON Tree ──────────────────────────────────────────────
const JsonNode = ({ data, depth = 0 }: { data: unknown; depth?: number }) => {
  const [collapsed, setCollapsed] = useState(depth > 2);

  if (data === null) return <span className="jv-null">null</span>;
  if (typeof data === 'boolean') return <span className="jv-bool">{String(data)}</span>;
  if (typeof data === 'number') return <span className="jv-num">{data}</span>;
  if (typeof data === 'string') return <span className="jv-str">"{data}"</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="jv-punct">[]</span>;
    return (
      <span>
        <button className="jv-toggle" onClick={() => setCollapsed(c => !c)}>
          {collapsed ? '▶' : '▼'}
        </button>
        <span className="jv-punct">[</span>
        {collapsed ? (
          <span className="jv-collapsed" onClick={() => setCollapsed(false)}>
            {data.length} items
          </span>
        ) : (
          <div className="jv-children">
            {data.map((item, i) => (
              <div key={i} className="jv-row">
                <span className="jv-key">{i}</span>
                <span className="jv-punct">: </span>
                <JsonNode data={item} depth={depth + 1} />
                {i < data.length - 1 && <span className="jv-punct">,</span>}
              </div>
            ))}
          </div>
        )}
        <span className="jv-punct">]</span>
      </span>
    );
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) return <span className="jv-punct">{'{}'}</span>;
    return (
      <span>
        <button className="jv-toggle" onClick={() => setCollapsed(c => !c)}>
          {collapsed ? '▶' : '▼'}
        </button>
        <span className="jv-punct">{'{'}</span>
        {collapsed ? (
          <span className="jv-collapsed" onClick={() => setCollapsed(false)}>
            {entries.length} keys
          </span>
        ) : (
          <div className="jv-children">
            {entries.map(([k, v], i) => (
              <div key={k} className="jv-row">
                <span className="jv-objkey">"{k}"</span>
                <span className="jv-punct">: </span>
                <JsonNode data={v} depth={depth + 1} />
                {i < entries.length - 1 && <span className="jv-punct">,</span>}
              </div>
            ))}
          </div>
        )}
        <span className="jv-punct">{'}'}</span>
      </span>
    );
  }

  return <span>{String(data)}</span>;
};

// ── JSON Table ─────────────────────────────────────────────
type SortDir = 'asc' | 'desc' | null;

const JsonTable = ({ rows }: { rows: Record<string, unknown>[] }) => {
  const allCols = useMemo(() => {
    const keys = new Set<string>();
    rows.forEach(r => Object.keys(r).forEach(k => keys.add(k)));
    return [...keys];
  }, [rows]);

  const [visibleCols, setVisibleCols] = useState<Set<string>>(() => new Set(allCols));
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [search, setSearch] = useState('');

  const toggleCol = (col: string) => {
    setVisibleCols(prev => {
      const next = new Set(prev);
      if (next.has(col)) { if (next.size > 1) next.delete(col); }
      else next.add(col);
      return next;
    });
  };

  const handleSort = (col: string) => {
    if (sortCol !== col) { setSortCol(col); setSortDir('asc'); return; }
    if (sortDir === 'asc') { setSortDir('desc'); return; }
    setSortCol(null); setSortDir(null);
  };

  const activeCols = allCols.filter(c => visibleCols.has(c));

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = q
      ? rows.filter(r => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(q)))
      : [...rows];
    if (sortCol && sortDir) {
      result.sort((a, b) => {
        const av = String(a[sortCol] ?? '');
        const bv = String(b[sortCol] ?? '');
        const num_a = Number(a[sortCol]), num_b = Number(b[sortCol]);
        const cmp = (!isNaN(num_a) && !isNaN(num_b))
          ? num_a - num_b
          : av.localeCompare(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [rows, search, sortCol, sortDir]);

  return (
    <div className="jt-root">
      {/* Controls */}
      <div className="jt-controls">
        <input
          className="jt-search"
          type="search"
          placeholder="Filter rows…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="jt-count">{filtered.length} / {rows.length} rows</span>
      </div>

      {/* Column toggles */}
      <div className="jt-col-toggles">
        <span className="jt-toggle-label">Columns:</span>
        {allCols.map(col => (
          <button
            key={col}
            className={`jt-col-btn${visibleCols.has(col) ? ' on' : ''}`}
            onClick={() => toggleCol(col)}
          >
            {col}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="jt-table-wrap">
        <table className="jt-table">
          <thead>
            <tr>
              <th className="jt-th jt-th-idx">#</th>
              {activeCols.map(col => (
                <th key={col} className="jt-th" onClick={() => handleSort(col)}>
                  <span className="jt-th-inner">
                    {col}
                    <span className="jt-sort-icon">
                      {sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i}>
                <td className="jt-td jt-td-idx">{i + 1}</td>
                {activeCols.map(col => (
                  <td key={col} className="jt-td">
                    {row[col] === null ? <span className="jv-null">null</span>
                      : row[col] === undefined ? <span className="jt-empty">—</span>
                      : typeof row[col] === 'object' ? <span className="jt-obj">{JSON.stringify(row[col])}</span>
                      : typeof row[col] === 'boolean' ? <span className="jv-bool">{String(row[col])}</span>
                      : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="jt-empty-msg">No rows match your filter.</div>
        )}
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────
const SAMPLE_JSON = `[
  { "id": 1, "name": "Alice", "role": "Engineer", "age": 28, "active": true },
  { "id": 2, "name": "Bob", "role": "Designer", "age": 34, "active": true },
  { "id": 3, "name": "Carol", "role": "Manager", "age": 41, "active": false },
  { "id": 4, "name": "Dave", "role": "Engineer", "age": 25, "active": true }
]`;

type Tab = 'viewer' | 'table';

const JsonViewer = () => {
  const [input, setInput] = useLocalStorage('ws:json', SAMPLE_JSON);
  const [tab, setTab] = useState<Tab>('viewer');

  const { parsed, error } = useMemo(() => {
    if (!input.trim()) return { parsed: null, error: null };
    try { return { parsed: JSON.parse(input), error: null }; }
    catch (e: unknown) { return { parsed: null, error: (e as Error).message }; }
  }, [input]);

  const tableRows: Record<string, unknown>[] | null = useMemo(() => {
    if (!Array.isArray(parsed)) return null;
    const objs = parsed.filter(r => r !== null && typeof r === 'object' && !Array.isArray(r));
    return objs.length === parsed.length ? objs as Record<string, unknown>[] : null;
  }, [parsed]);

  const handleCopy = useCallback(() => {
    if (!parsed) return;
    navigator.clipboard.writeText(JSON.stringify(parsed, null, 2)).catch(() => {});
  }, [parsed]);

  const handleFormat = useCallback(() => {
    if (!parsed) return;
    setInput(JSON.stringify(parsed, null, 2));
  }, [parsed]);

  return (
    <div className="jv-page">
      {/* Input panel */}
      <div className="jv-input-panel">
        <div className="jv-input-header">
          <span className="jv-input-label">JSON Input</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="ws-btn ws-btn-ghost ws-btn-sm" onClick={handleFormat} disabled={!parsed}>
              Format
            </button>
            <button className="ws-btn ws-btn-ghost ws-btn-sm" onClick={handleCopy} disabled={!parsed}>
              Copy
            </button>
            <button className="ws-btn ws-btn-ghost ws-btn-sm" onClick={() => setInput('')}>
              Clear
            </button>
          </div>
        </div>
        <textarea
          className="jv-textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='Paste JSON here… e.g. [{"id":1,"name":"Alice"}]'
          spellCheck={false}
        />
        {error && <div className="jv-error">⚠ {error}</div>}
      </div>

      {/* Output panel */}
      <div className="jv-output-panel">
        {/* Tabs */}
        <div className="jv-tabs">
          <button className={`jv-tab${tab === 'viewer' ? ' active' : ''}`} onClick={() => setTab('viewer')}>
            Tree Viewer
          </button>
          <button
            className={`jv-tab${tab === 'table' ? ' active' : ''}${!tableRows ? ' disabled' : ''}`}
            onClick={() => tableRows && setTab('table')}
            title={!tableRows ? 'Requires a JSON array of objects' : undefined}
          >
            Table View {!tableRows && parsed ? '(needs array)' : ''}
          </button>
          {parsed && (
            <span className="jv-meta">
              {Array.isArray(parsed) ? `Array [${parsed.length}]` : typeof parsed === 'object' && parsed !== null ? `Object {${Object.keys(parsed).length}}` : typeof parsed}
            </span>
          )}
        </div>

        <div className="jv-output-body">
          {!input.trim() ? (
            <div className="jv-placeholder">Paste JSON on the left to get started.</div>
          ) : error ? (
            <div className="jv-placeholder" style={{ color: '#dc2626' }}>Fix the JSON error to see the output.</div>
          ) : tab === 'viewer' ? (
            <div className="jv-tree">
              <JsonNode data={parsed} depth={0} />
            </div>
          ) : tableRows ? (
            <JsonTable rows={tableRows} />
          ) : (
            <div className="jv-placeholder">Table view needs a JSON array of objects.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonViewer;
