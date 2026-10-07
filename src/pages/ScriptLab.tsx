import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  SITE_SCRIPT_STORAGE_KEY,
  extractJsFromPaste,
  injectSiteScript,
  removeSiteScript,
} from '../hooks/useInjectedScript';

const TIMESTAMP_KEY = SITE_SCRIPT_STORAGE_KEY + '-ts';

const ScriptLab = () => {
  const [savedScript, setSavedScript] = useLocalStorage<string>(SITE_SCRIPT_STORAGE_KEY, '');
  const [savedAt, setSavedAt] = useLocalStorage<string>(TIMESTAMP_KEY, '');
  const [draft, setDraft] = useState(savedScript);

  const isActive = !!savedScript.trim();
  const isDirty = draft !== savedScript;

  const handleSave = () => {
    injectSiteScript(extractJsFromPaste(draft));
    setSavedScript(draft);
    setSavedAt(new Date().toLocaleString());
  };

  const handleClear = () => {
    removeSiteScript();
    setSavedScript('');
    setSavedAt('');
    setDraft('');
  };

  return (
    <div className="sl-root">
      <div className="sl-header">
        <h2 className="sl-title">Script Lab</h2>
        <span className={`sl-badge${isActive ? ' sl-badge-active' : ''}`}>
          {isActive ? '● Active' : '○ Inactive'}
        </span>
      </div>

      <p className="sl-hint">
        Paste a <code>&lt;script&gt;</code> snippet (or raw JS) — e.g. your intercept/tracking
        tag — and hit Save. It runs immediately and reloads on every page of this site, persisted
        in <code>localStorage</code>, until you hit Clear.
      </p>

      <textarea
        className="sl-textarea"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder={'<script>\n  console.log("hello from intercept");\n</script>'}
        spellCheck={false}
      />

      <div className="sl-actions">
        <button className="ws-btn ws-btn-primary" onClick={handleSave} disabled={!isDirty && isActive}>
          Save &amp; Run
        </button>
        <button className="ws-btn ws-btn-ghost" onClick={handleClear} disabled={!isActive && !draft}>
          Clear
        </button>
        {savedAt && <span className="sl-savedat">Last saved: {savedAt}</span>}
      </div>
    </div>
  );
};

export default ScriptLab;
