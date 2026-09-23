import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { asBlob } from 'html-docx-js-typescript';

mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });

const DEFAULT_MD = `# Markdown Viewer

Write on the left, see the preview here on the right.

## Features
- **Bold**, *italic*, ~~strikethrough~~, \`inline code\`
- Tables, blockquotes, task lists
- Mermaid diagrams
- **PDF export** — click Download PDF above

## Table Example

| Tool | Purpose | Daily? |
|------|---------|--------|
| Markdown Editor | Write & Preview | ✅ |
| Articles | Read & Filter | ✅ |

## Code Block

\`\`\`js
const greet = name => \`Hello, \${name}!\`;
console.log(greet('World'));
\`\`\`

## Mermaid Diagram

\`\`\`mermaid
graph LR
    A[Write Markdown] --> B[Live Preview]
    B --> C{Happy?}
    C -->|Yes| D[Download PDF]
    C -->|No| A
\`\`\`

> Tip: collapse the editor panel with the toggle button to focus on the preview.
`;

const TDD_TEMPLATE = `# Feature Enhancement: [Feature Name]

> **Version:** 1.0.0 | **Date:** ${new Date().toISOString().slice(0, 10)} | **Author:** [Your Name]

---

## 1. Overview

Provide a brief introduction and overview of the feature enhancement, explaining its purpose and goals.

**Purpose:** _What problem does this solve?_

**Goals:**
- Goal 1
- Goal 2
- Goal 3

---

## 2. Functionality

Describe in detail the new functionality or improvements introduced.

### What's New
- **Feature A:** Description of what it does
- **Feature B:** Description of what it does

### Changes to Existing Behavior

| Area | Before | After |
|------|--------|-------|
| Module X | Old behavior | New behavior |
| Module Y | Old behavior | New behavior |

---

## 3. Architecture and Design

Overview of architectural changes, design patterns, or frameworks used.

### Component Diagram

\`\`\`mermaid
graph TD
    A[Client] --> B[API Layer]
    B --> C[Service Layer]
    C --> D[Data Layer]
    D --> E[(Database)]
\`\`\`

### Design Decisions
- **Pattern used:** e.g., Repository Pattern, CQRS
- **Rationale:** Why this approach was chosen
- **Integration points:** How it connects with existing components

---

## 4. API Documentation

### New Endpoints

#### \`POST /api/v1/resource\`
**Description:** Brief description of what this endpoint does.

**Request:**
\`\`\`json
{
  "field1": "string",
  "field2": 123
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "abc123",
  "status": "success",
  "data": {}
}
\`\`\`

**Authentication:** Bearer token required

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 500 | Internal Server Error |

---

## 5. Dependencies

| Library | Version | Purpose | Install |
|---------|---------|---------|---------|
| library-name | ^1.2.3 | What it's used for | \`npm install library-name\` |

---

## 6. Configuration

### New Configuration Keys

\`\`\`env
FEATURE_FLAG_ENABLED=true
NEW_SERVICE_URL=https://api.example.com
TIMEOUT_MS=5000
\`\`\`

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| \`FEATURE_FLAG_ENABLED\` | boolean | \`false\` | Enables the feature |
| \`NEW_SERVICE_URL\` | string | — | Base URL for new service |
| \`TIMEOUT_MS\` | number | \`3000\` | Request timeout in ms |

---

## 7. Usage Examples

### Basic Usage

\`\`\`js
// Example 1: Basic invocation
const result = await featureClient.doSomething({ param: 'value' });
console.log(result); // { status: 'ok', data: { ... } }
\`\`\`

### Advanced Usage

\`\`\`js
// Example 2: With options
const result = await featureClient.doSomething({
  param: 'value',
  options: { timeout: 5000, retry: 3 },
});
\`\`\`

**Expected output:**
\`\`\`json
{
  "status": "ok",
  "data": { "id": "xyz", "result": "..." }
}
\`\`\`

---

## 8. Testing and Quality Assurance

### Testing Strategy

- [ ] Unit tests — individual functions and modules
- [ ] Integration tests — service-to-service interaction
- [ ] E2E tests — full user flow validation

### Key Test Scenarios

| Scenario | Input | Expected Output | Status |
|----------|-------|----------------|--------|
| Happy path | Valid payload | 200 OK | ✅ |
| Missing field | Payload without \`field1\` | 400 Bad Request | ✅ |
| Unauthorized | No token | 401 Unauthorized | ✅ |

### Running Tests
\`\`\`bash
npm run test
npm run test:integration
npm run test:e2e
\`\`\`

---

## 9. Known Issues and Limitations

> ⚠ Document any known constraints or edge cases.

- **Limitation 1:** Description and workaround if any
- **Limitation 2:** Description and workaround if any
- **Edge case:** Scenario where behavior may differ from expectations

---

## 10. Troubleshooting and Support

### Common Errors

| Error | Cause | Resolution |
|-------|-------|-----------|
| \`ECONNREFUSED\` | Service unreachable | Check \`NEW_SERVICE_URL\` config |
| \`401 Unauthorized\` | Expired token | Re-authenticate and retry |
| \`Timeout exceeded\` | Slow network | Increase \`TIMEOUT_MS\` |

### Getting Help
- Open an issue at: [Issue Tracker URL]
- Slack channel: \`#team-channel\`
- Contact: [team@example.com](mailto:team@example.com)

---

## 11. Deployment and Rollback

### Deployment Steps

\`\`\`bash
# 1. Pull latest
git pull origin main

# 2. Install dependencies
npm ci

# 3. Run migrations (if any)
npm run migrate

# 4. Deploy
npm run deploy:production
\`\`\`

### Rollback Procedure

\`\`\`bash
# Revert to previous version
git checkout v1.0.0
npm ci
npm run deploy:production
\`\`\`

---

## 12. Versioning and Compatibility

| Version | Compatible With | Notes |
|---------|----------------|-------|
| 1.0.0 | App >= 2.3.0 | Initial release |

**Breaking changes:** _List any breaking changes and migration steps._

---

## 13. Security Considerations

- **Data handling:** How sensitive data is stored and transmitted
- **Encryption:** TLS 1.3 for all API calls; AES-256 for stored data
- **Access control:** Role-based permissions enforced at the API layer
- **Audit:** Describe any security audits or assessments conducted
- **Secure coding practices:**
  - Validate all inputs at system boundaries
  - Never log sensitive fields (tokens, passwords, PII)
  - Keep dependencies up to date (run \`npm audit\` regularly)
`;

const PREVIEW_STYLES = `
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #1a1a2e; }
    h1, h2, h3, h4, h5, h6 { margin: 1.4em 0 0.4em; font-weight: 700; line-height: 1.25; }
    p { margin: 0 0 1em; }
    a { color: #4f46e5; }
    code { background: #f1f5f9; border-radius: 4px; padding: 2px 5px; font-size: 0.88em; font-family: 'Fira Code', 'Cascadia Code', monospace; }
    pre { background: #1e1e2e; color: #cdd6f4; border-radius: 8px; padding: 16px; overflow-x: auto; }
    pre code { background: none; color: inherit; padding: 0; font-size: 0.9em; }
    blockquote { margin: 0 0 1em; padding: 0.6em 1em; border-left: 4px solid #818cf8; background: #f5f3ff; border-radius: 0 6px 6px 0; color: #4b5563; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    tr:nth-child(even) td { background: #f8fafc; }
    img { max-width: 100%; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 2em 0; }
    ul, ol { padding-left: 1.5em; margin: 0 0 1em; }
    li { margin: 0.25em 0; }
    svg { max-width: 100%; }`;

const buildPreviewDocument = (html: string, extraStyle = '') => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Markdown Preview</title>
  <style>${PREVIEW_STYLES}
    ${extraStyle}
  </style>
</head>
<body>${html}</body>
</html>`;

// Google Docs (and most rich-text paste targets) strip <style> tags and CSS
// classes, and can't reliably render inline <svg>. To keep formatting when
// pasting, every element needs its look baked into a `style` attribute, and
// Mermaid diagrams need to become raster images.
const CLIPBOARD_STYLE_MAP: Record<string, string> = {
  h1: 'font-size:28px;font-weight:700;margin:20px 0 10px;line-height:1.25;font-family:Arial,sans-serif;color:#1a1a2e;',
  h2: 'font-size:23px;font-weight:700;margin:18px 0 8px;line-height:1.25;font-family:Arial,sans-serif;color:#1a1a2e;',
  h3: 'font-size:19px;font-weight:700;margin:16px 0 6px;line-height:1.25;font-family:Arial,sans-serif;color:#1a1a2e;',
  h4: 'font-size:16px;font-weight:700;margin:14px 0 6px;line-height:1.25;font-family:Arial,sans-serif;color:#1a1a2e;',
  h5: 'font-size:14px;font-weight:700;margin:12px 0 6px;line-height:1.25;font-family:Arial,sans-serif;color:#1a1a2e;',
  h6: 'font-size:13px;font-weight:700;margin:12px 0 6px;line-height:1.25;font-family:Arial,sans-serif;color:#4b5563;',
  p: 'margin:0 0 14px;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#1a1a2e;',
  a: 'color:#4f46e5;text-decoration:underline;',
  code: 'background:#f1f5f9;border-radius:4px;padding:2px 5px;font-family:Consolas,"Courier New",monospace;font-size:13px;color:#1a1a2e;',
  pre: 'background:#1e1e2e;color:#cdd6f4;border-radius:8px;padding:16px;font-family:Consolas,"Courier New",monospace;font-size:13px;white-space:pre-wrap;',
  blockquote: 'margin:0 0 14px;padding:10px 16px;border-left:4px solid #818cf8;background:#f5f3ff;color:#4b5563;font-family:Arial,sans-serif;font-size:14px;',
  table: 'border-collapse:collapse;width:100%;margin:14px 0;font-family:Arial,sans-serif;font-size:14px;',
  th: 'border:1px solid #cbd5e1;padding:8px 12px;text-align:left;background:#f8fafc;font-weight:600;',
  td: 'border:1px solid #cbd5e1;padding:8px 12px;text-align:left;',
  ul: 'padding-left:24px;margin:0 0 14px;font-family:Arial,sans-serif;font-size:14px;',
  ol: 'padding-left:24px;margin:0 0 14px;font-family:Arial,sans-serif;font-size:14px;',
  li: 'margin:4px 0;',
  hr: 'border:none;border-top:1px solid #e2e8f0;margin:28px 0;',
  img: 'max-width:100%;',
  strong: 'font-weight:700;',
  em: 'font-style:italic;',
  del: 'text-decoration:line-through;',
};

const svgToPngDataUrl = (svg: SVGSVGElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    const rect = svg.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || 600));
    const height = Math.max(1, Math.round(rect.height || 300));
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));
    const svgText = new XMLSerializer().serializeToString(clone);
    const svgDataUrl = `data:image/svg+xml;charset=utf-8;base64,${btoa(unescape(encodeURIComponent(svgText)))}`;

    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('no canvas context')); return; }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = svgDataUrl;
  });
};

const applyClipboardStyles = (node: Element) => {
  const tag = node.tagName.toLowerCase();
  const isPreCode = tag === 'code' && node.parentElement?.tagName.toLowerCase() === 'pre';
  const rule = isPreCode
    ? 'background:none;color:inherit;padding:0;font-family:Consolas,"Courier New",monospace;font-size:13px;'
    : CLIPBOARD_STYLE_MAP[tag];
  if (rule) {
    const existing = node.getAttribute('style') ?? '';
    node.setAttribute('style', `${rule}${existing}`);
  }
  Array.from(node.children).forEach(applyClipboardStyles);
};

const buildClipboardHtml = async (source: HTMLElement): Promise<string> => {
  const clone = source.cloneNode(true) as HTMLElement;

  const originalSvgs = Array.from(source.querySelectorAll('.mermaid-wrap svg')) as SVGSVGElement[];
  const clonedWraps = Array.from(clone.querySelectorAll('.mermaid-wrap'));
  await Promise.all(originalSvgs.map(async (svg, i) => {
    const wrap = clonedWraps[i];
    if (!wrap) return;
    try {
      const dataUrl = await svgToPngDataUrl(svg);
      const rect = svg.getBoundingClientRect();
      const img = document.createElement('img');
      img.src = dataUrl;
      img.width = Math.round(rect.width);
      img.height = Math.round(rect.height);
      img.style.maxWidth = '100%';
      wrap.replaceChildren(img);
    } catch {
      // leave the raw svg in place if rasterization fails
    }
  }));

  clone.setAttribute('style', 'font-family:Arial,sans-serif;color:#1a1a2e;');
  applyClipboardStyles(clone);
  return clone.innerHTML;
};

let mermaidCounter = 0;

const MermaidBlock = ({ code }: { code: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const id = useRef(`mmd-${++mermaidCounter}`);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    setError(null);
    ref.current.innerHTML = '';
    mermaid.render(id.current, code)
      .then(({ svg }) => { if (ref.current) ref.current.innerHTML = svg; })
      .catch(e => setError(e?.message ?? 'Render error'));
  }, [code]);

  if (error) return <div className="mermaid-error">⚠ {error}</div>;
  return <div className="mermaid-wrap" ref={ref} />;
};

const MIN_PANE_PCT = 20;
const MAX_PANE_PCT = 80;

const MarkdownViewer = () => {
  const [md, setMd] = useLocalStorage('ws:markdown', DEFAULT_MD);
  const [editorOpen, setEditorOpen] = useLocalStorage('ws:markdown:editorOpen', true);
  const [leftWidth, setLeftWidth] = useLocalStorage('ws:markdown:leftWidth', 50);
  const [previewMaximized, setPreviewMaximized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = panelsRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(MAX_PANE_PCT, Math.max(MIN_PANE_PCT, pct)));
    };
    const handleMouseUp = () => setDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, setLeftWidth]);

  // Both exports go through an in-page preview step first — no popup window,
  // no new tab, nothing that a browser/webview popup blocker can silently
  // swallow. The user sees exactly what will be printed/exported and
  // confirms before anything happens.
  const [exportMode, setExportMode] = useState<null | 'pdf' | 'docx'>(null);
  const [exportHtml, setExportHtml] = useState('');
  const [exportingDocx, setExportingDocx] = useState(false);

  const openPdfPreview = useCallback(() => {
    const el = previewRef.current;
    if (!el) return;
    setExportHtml(el.innerHTML);
    setExportMode('pdf');
  }, []);

  const openDocxPreview = useCallback(() => {
    const el = previewRef.current;
    if (!el) return;
    setExportHtml(el.innerHTML);
    setExportMode('docx');
  }, []);

  const closeExportPreview = useCallback(() => {
    if (exportingDocx) return;
    setExportMode(null);
  }, [exportingDocx]);

  const confirmPrint = useCallback(() => {
    // The print stylesheet (see .md-export-print-area in App.css) hides
    // everything on the page except this preview panel, so window.print()
    // renders only the export content — no separate document to open.
    window.print();
    setExportMode(null);
  }, []);

  const confirmDocx = useCallback(async () => {
    if (exportingDocx) return;
    setExportingDocx(true);
    try {
      const fullHtml = buildPreviewDocument(exportHtml);
      const blob = await asBlob(fullHtml);
      const url = URL.createObjectURL(blob as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.docx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportMode(null);
    } catch (err) {
      window.alert('Could not generate the .docx file. Please try again.');
      console.error(err);
    } finally {
      setExportingDocx(false);
    }
  }, [exportingDocx, exportHtml]);

  const handleInsertTdd = useCallback(() => {
    if (md.trim() && md !== TDD_TEMPLATE && !window.confirm('Replace the current document with the TDD template? This cannot be undone.')) {
      return;
    }
    setMd(TDD_TEMPLATE);
  }, [md, setMd]);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const el = previewRef.current;
    if (!el) return;
    const plain = el.innerText;
    try {
      const html = await buildClipboardHtml(el);
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html':  new Blob([html],  { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        }),
      ]);
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback for browsers that don't support ClipboardItem or when inlining fails
      navigator.clipboard.writeText(plain).then(() => {
        setCopied(true); setTimeout(() => setCopied(false), 1800);
      }).catch(() => {});
    }
  }, []);

  const components: React.ComponentProps<typeof ReactMarkdown>['components'] = {
    code({ className, children }) {
      const lang = /language-(\w+)/.exec(className ?? '')?.[1];
      const str = String(children).replace(/\n$/, '');
      if (lang === 'mermaid') return <MermaidBlock code={str} />;
      return <code className={className}>{children}</code>;
    },
    pre({ children }) {
      return <pre>{children}</pre>;
    },
    table({ children }) {
      return <div style={{ overflowX: 'auto' }}><table>{children}</table></div>;
    },
    thead({ children }) { return <thead>{children}</thead>; },
    a({ href, children }) {
      return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
    },
  };

  return (
    <div className="md-root">
      {/* Toolbar */}
      <div className="md-toolbar">
        <span className="md-toolbar-title">
          ✍️ Markdown Viewer
        </span>
        <div className="md-toolbar-actions">
          <button
            className="panel-toggle-btn"
            onClick={() => setEditorOpen(o => !o)}
            title={editorOpen ? 'Collapse editor' : 'Expand editor'}
          >
            {editorOpen ? '⟨ Hide Editor' : '⟩ Show Editor'}
          </button>
          <button className="ws-btn ws-btn-ghost ws-btn-sm" onClick={handleCopy}>
            {copied ? '✓ Copied!' : 'Copy Preview'}
          </button>
          <button
            className="ws-btn ws-btn-ghost ws-btn-sm"
            onClick={openDocxPreview}
            title="Preview, then download as a Word (.docx) file"
          >
            ↓ Download DOCX
          </button>
          <button className="ws-btn ws-btn-primary ws-btn-sm" onClick={openPdfPreview}>
            ↓ Download PDF
          </button>
        </div>
      </div>

      {/* Panels */}
      <div
        className={`md-panels${previewMaximized ? ' preview-maximized' : ''}${dragging ? ' dragging' : ''}`}
        ref={panelsRef}
      >
        {/* Left — Editor */}
        <div
          className={`md-left ${editorOpen ? 'expanded' : 'collapsed'}`}
          style={editorOpen && !previewMaximized ? { width: `${leftWidth}%` } : undefined}
        >
          <div className="md-panel-header">
            <span className="md-panel-label">Markdown</span>
            <span className="md-panel-stat">{md.length} chars · {md.split('\n').length} lines</span>
            <button
              className="ws-btn ws-btn-ghost ws-btn-sm md-template-btn"
              onClick={handleInsertTdd}
              title="Replace current document with the Technical Documentation template"
            >
              + TDD Template
            </button>
          </div>
          <textarea
            className="md-editor"
            value={md}
            onChange={e => setMd(e.target.value)}
            placeholder="Paste or type Markdown here…"
            spellCheck={false}
          />
        </div>

        {/* Drag handle */}
        {editorOpen && !previewMaximized && (
          <div
            className="md-divider"
            onMouseDown={handleDividerMouseDown}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize editor and preview panels"
          />
        )}

        {/* Right — Preview */}
        <div className="md-right">
          <div className="md-panel-header">
            <span className="md-panel-label">Preview</span>
            <span className="md-panel-stat">
              {md.trim() ? `~${Math.ceil(md.split(/\s+/).length / 200)} min read` : ''}
            </span>
            <button
              className="ws-btn ws-btn-ghost ws-btn-sm panel-maximize-btn"
              onClick={() => setPreviewMaximized(v => !v)}
              title={previewMaximized ? 'Restore split view' : 'Maximize preview'}
            >
              {previewMaximized ? '⊠ Restore' : '⛶ Maximize'}
            </button>
          </div>
          <div className="md-preview" ref={previewRef} id="md-print-area">
            {md.trim() ? (
              <div className="md-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                  {md}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="md-empty">
                <span style={{ fontSize: 32 }}>📄</span>
                <span>Nothing to preview yet</span>
                <span style={{ fontSize: 12 }}>Start typing on the left</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export preview — shown before anything actually downloads/prints */}
      {exportMode && (
        <div className="md-export-overlay" role="dialog" aria-modal="true">
          <div className="md-export-modal">
            <div className="md-export-modal-header">
              <span>{exportMode === 'pdf' ? 'Print / Save as PDF' : 'Download as Word (.docx)'} — Preview</span>
              <button className="ws-btn ws-btn-ghost ws-btn-sm" onClick={closeExportPreview} disabled={exportingDocx}>
                ✕
              </button>
            </div>
            <div className="md-export-modal-body">
              <div
                className="md-content md-export-print-area"
                dangerouslySetInnerHTML={{ __html: exportHtml }}
              />
            </div>
            <div className="md-export-modal-footer">
              <button className="ws-btn ws-btn-ghost ws-btn-sm" onClick={closeExportPreview} disabled={exportingDocx}>
                Cancel
              </button>
              {exportMode === 'pdf' ? (
                <button className="ws-btn ws-btn-primary ws-btn-sm" onClick={confirmPrint}>
                  🖨 Print / Save as PDF
                </button>
              ) : (
                <button className="ws-btn ws-btn-primary ws-btn-sm" onClick={confirmDocx} disabled={exportingDocx}>
                  {exportingDocx ? '… Generating' : '↓ Confirm Download'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownViewer;
