import { useState, useMemo } from 'react';
import { diffLines, diffWords, Change } from 'diff';
import { useLocalStorage } from '../hooks/useLocalStorage';

type DiffMode = 'split' | 'unified';

const WordDiff = ({ line, type }: { line: string; type: 'added' | 'removed' }) => {
  // We can only do word diff if we have the opposite side — keep it simple for now
  return <span>{line}</span>;
};

const DiffViewer = () => {
  const [left, setLeft]   = useLocalStorage('ws:diff:left', '');
  const [right, setRight] = useLocalStorage('ws:diff:right', '');
  const [mode, setMode]   = useState<DiffMode>('split');
  const [ignoreWs, setIgnoreWs] = useState(false);

  const diff = useMemo(() => {
    if (!left && !right) return [];
    return diffLines(left, right, { ignoreWhitespace: ignoreWs });
  }, [left, right, ignoreWs]);

  const stats = useMemo(() => {
    let added = 0, removed = 0;
    diff.forEach(c => {
      const lines = (c.value.match(/\n/g) || []).length || (c.value ? 1 : 0);
      if (c.added)   added   += lines;
      if (c.removed) removed += lines;
    });
    return { added, removed, changed: Math.min(added, removed) };
  }, [diff]);

  const isEmpty = !left && !right;

  /* ── Split view helpers ── */
  const splitLeft: { text: string; type: 'added' | 'removed' | 'equal' }[] = [];
  const splitRight: { text: string; type: 'added' | 'removed' | 'equal' }[] = [];
  if (mode === 'split') {
    diff.forEach(c => {
      if (!c.added && !c.removed) {
        c.value.split('\n').filter((_, i, a) => i < a.length - 1 || c.value.endsWith('\n') || c.value).forEach(line => {
          splitLeft.push({ text: line, type: 'equal' });
          splitRight.push({ text: line, type: 'equal' });
        });
      } else if (c.removed) {
        c.value.split('\n').filter((l, i, a) => !(i === a.length - 1 && l === '')).forEach(line => {
          splitLeft.push({ text: line, type: 'removed' });
          splitRight.push({ text: '', type: 'added' });
        });
      } else {
        c.value.split('\n').filter((l, i, a) => !(i === a.length - 1 && l === '')).forEach(line => {
          splitLeft.push({ text: '', type: 'removed' });
          splitRight.push({ text: line, type: 'added' });
        });
      }
    });
  }

  return (
    <div className="diff-root">
      {/* Toolbar */}
      <div className="diff-toolbar">
        <div className="diff-toolbar-left">
          <span className="diff-title">Diff Viewer</span>
          {!isEmpty && (
            <div className="diff-stats">
              {stats.added > 0   && <span className="diff-stat added">+{stats.added} added</span>}
              {stats.removed > 0 && <span className="diff-stat removed">−{stats.removed} removed</span>}
            </div>
          )}
        </div>
        <div className="diff-toolbar-right">
          <label className="diff-toggle-label">
            <input type="checkbox" checked={ignoreWs} onChange={e => setIgnoreWs(e.target.checked)} />
            Ignore whitespace
          </label>
          <div className="diff-mode-switch">
            <button className={`diff-mode-btn${mode === 'split' ? ' active' : ''}`} onClick={() => setMode('split')}>Split</button>
            <button className={`diff-mode-btn${mode === 'unified' ? ' active' : ''}`} onClick={() => setMode('unified')}>Unified</button>
          </div>
          <button className="ws-btn ws-btn-ghost ws-btn-sm" onClick={() => { setLeft(''); setRight(''); }}>Clear</button>
        </div>
      </div>

      {/* Input panes */}
      <div className="diff-inputs">
        <div className="diff-input-pane">
          <div className="diff-input-header">
            <span>Original</span>
            <span className="diff-line-count">{left ? left.split('\n').length : 0} lines</span>
          </div>
          <textarea
            className="diff-textarea"
            value={left}
            onChange={e => setLeft(e.target.value)}
            placeholder="Paste original text or code here…"
            spellCheck={false}
          />
        </div>
        <div className="diff-input-pane">
          <div className="diff-input-header">
            <span>Modified</span>
            <span className="diff-line-count">{right ? right.split('\n').length : 0} lines</span>
          </div>
          <textarea
            className="diff-textarea"
            value={right}
            onChange={e => setRight(e.target.value)}
            placeholder="Paste modified text or code here…"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Output */}
      {!isEmpty && (
        <div className="diff-output">
          <div className="diff-output-header">
            <span className="diff-output-label">
              {mode === 'split' ? 'Side-by-side diff' : 'Unified diff'}
            </span>
          </div>

          {mode === 'unified' ? (
            <div className="diff-unified">
              {diff.map((chunk, i) => (
                chunk.value.split('\n')
                  .filter((l, li, a) => !(li === a.length - 1 && l === ''))
                  .map((line, li) => (
                    <div key={`${i}-${li}`} className={`diff-line ${chunk.added ? 'added' : chunk.removed ? 'removed' : 'equal'}`}>
                      <span className="diff-line-sign">{chunk.added ? '+' : chunk.removed ? '−' : ' '}</span>
                      <span className="diff-line-text">{line || ' '}</span>
                    </div>
                  ))
              ))}
            </div>
          ) : (
            <div className="diff-split">
              <div className="diff-split-col">
                {splitLeft.map((row, i) => (
                  <div key={i} className={`diff-line ${row.type}`}>
                    <span className="diff-line-num">{i + 1}</span>
                    <span className="diff-line-text">{row.text || ' '}</span>
                  </div>
                ))}
              </div>
              <div className="diff-split-divider" />
              <div className="diff-split-col">
                {splitRight.map((row, i) => (
                  <div key={i} className={`diff-line ${row.type}`}>
                    <span className="diff-line-num">{i + 1}</span>
                    <span className="diff-line-text">{row.text || ' '}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isEmpty && (
        <div className="diff-empty">
          <span style={{ fontSize: 32 }}>⇄</span>
          <span>Paste text in both panels above to see the diff</span>
        </div>
      )}
    </div>
  );
};

export default DiffViewer;
