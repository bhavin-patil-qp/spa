import { useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TurndownService from 'turndown';
import { useLocalStorage } from '../hooks/useLocalStorage';

const td = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
});

// Keep blank lines between list items minimal
td.addRule('taskBreaks', {
  filter: 'br',
  replacement: () => '\n',
});

const INITIAL_HTML = `<h1>My Document</h1><p>Start writing here. Use the toolbar above to format your text — bold, italic, headings, lists, and more. The <strong>Markdown source</strong> updates live on the right.</p><h2>What you can do</h2><ul><li>Format text with <strong>bold</strong> or <em>italic</em></li><li>Create ordered and unordered lists</li><li>Add <code>inline code</code> or code blocks</li><li>Use headings to structure your document</li><li>Insert blockquotes for emphasis</li></ul><blockquote><p>This is a blockquote. Great for callouts and quotes.</p></blockquote>`;

const TDD_HTML = `
<h1>Feature Enhancement: [Feature Name]</h1>
<p><strong>Version:</strong> 1.0.0 &nbsp;|&nbsp; <strong>Date:</strong> ${new Date().toISOString().slice(0, 10)} &nbsp;|&nbsp; <strong>Author:</strong> [Your Name]</p>

<h2>1. Overview</h2>
<p>Provide a brief introduction and overview of the feature enhancement, explaining its purpose and goals.</p>
<p><strong>Purpose:</strong> What problem does this solve?</p>
<p><strong>Goals:</strong></p>
<ul><li>Goal 1</li><li>Goal 2</li><li>Goal 3</li></ul>

<h2>2. Functionality</h2>
<p>Describe in detail the new functionality or improvements introduced.</p>
<p><strong>What's New:</strong></p>
<ul><li><strong>Feature A:</strong> Description of what it does</li><li><strong>Feature B:</strong> Description of what it does</li></ul>
<p><strong>Changes to Existing Behavior:</strong> [Describe what changed and how it affects existing processes or systems.]</p>

<h2>3. Architecture and Design</h2>
<p>Overview of architectural changes, design patterns, or frameworks used.</p>
<ul><li><strong>Pattern used:</strong> e.g., Repository Pattern, CQRS</li><li><strong>Rationale:</strong> Why this approach was chosen</li><li><strong>Integration points:</strong> How it connects with existing components</li></ul>

<h2>4. API Documentation</h2>
<p><strong>Endpoint:</strong> <code>POST /api/v1/resource</code></p>
<p><strong>Description:</strong> Brief description of what this endpoint does.</p>
<p><strong>Authentication:</strong> Bearer token required</p>
<p><strong>Request body:</strong> [Describe fields and types]</p>
<p><strong>Response:</strong> [Describe response structure and status codes]</p>

<h2>5. Dependencies</h2>
<p>List external dependencies or third-party libraries required.</p>
<ul><li><strong>library-name</strong> v1.2.3 — purpose and install: <code>npm install library-name</code></li></ul>

<h2>6. Configuration</h2>
<p>Document new or changed configuration settings.</p>
<ul><li><code>FEATURE_FLAG_ENABLED</code> — boolean, default <code>false</code>. Enables the feature.</li><li><code>NEW_SERVICE_URL</code> — string. Base URL for the new service.</li><li><code>TIMEOUT_MS</code> — number, default <code>3000</code>. Request timeout in ms.</li></ul>

<h2>7. Usage Examples</h2>
<p>Provide practical examples demonstrating how to use the new feature.</p>
<p><strong>Basic usage:</strong> [Describe the simplest invocation with expected input and output]</p>
<p><strong>Advanced usage:</strong> [Describe a more complex scenario with options or edge cases]</p>

<h2>8. Testing and Quality Assurance</h2>
<p>Describe the testing approach used for the feature enhancement.</p>
<ul><li>Unit tests — individual functions and modules</li><li>Integration tests — service-to-service interaction</li><li>E2E tests — full user flow validation</li></ul>
<p><strong>Key scenarios:</strong> Happy path, missing required fields, unauthorized access, edge cases.</p>
<p><strong>Run tests:</strong> <code>npm run test</code></p>

<h2>9. Known Issues and Limitations</h2>
<blockquote><p>Document any known constraints or edge cases.</p></blockquote>
<ul><li><strong>Limitation 1:</strong> Description and workaround if any</li><li><strong>Limitation 2:</strong> Description and workaround if any</li><li><strong>Edge case:</strong> Scenario where behavior may differ from expectations</li></ul>

<h2>10. Troubleshooting and Support</h2>
<p><strong>Common errors:</strong></p>
<ul><li><code>ECONNREFUSED</code> — Service unreachable. Check <code>NEW_SERVICE_URL</code> config.</li><li><code>401 Unauthorized</code> — Expired token. Re-authenticate and retry.</li><li>Timeout exceeded — Increase <code>TIMEOUT_MS</code>.</li></ul>
<p><strong>Getting help:</strong> Open an issue at [Issue Tracker URL] or contact [team@example.com].</p>

<h2>11. Deployment and Rollback</h2>
<p><strong>Deployment steps:</strong> Pull latest → install dependencies → run migrations → deploy.</p>
<p><strong>Rollback procedure:</strong> Revert to previous tagged version and redeploy.</p>

<h2>12. Versioning and Compatibility</h2>
<ul><li>Version 1.0.0 — compatible with App &gt;= 2.3.0</li></ul>
<p><strong>Breaking changes:</strong> [List any breaking changes and migration steps.]</p>

<h2>13. Security Considerations</h2>
<ul>
  <li><strong>Data handling:</strong> How sensitive data is stored and transmitted</li>
  <li><strong>Encryption:</strong> TLS 1.3 for all API calls; AES-256 for stored data</li>
  <li><strong>Access control:</strong> Role-based permissions enforced at the API layer</li>
  <li><strong>Audit:</strong> Describe any security audits or assessments conducted</li>
  <li><strong>Secure coding practices:</strong> Validate all inputs, never log sensitive fields, keep dependencies up to date</li>
</ul>
`;

// ── Toolbar button ──────────────────────────────────────────
type TBtnProps = {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
};
const TBtn = ({ active, disabled, onClick, title, children }: TBtnProps) => (
  <button
    className={`re-tbtn${active ? ' active' : ''}${disabled ? ' disabled' : ''}`}
    onMouseDown={e => { e.preventDefault(); if (!disabled) onClick(); }}
    title={title}
    type="button"
  >
    {children}
  </button>
);

const Divider = () => <span className="re-divider" />;

const WEEKLY_UPDATE_HTML = `
<h1>Engineering Weekly Update</h1>
<p><strong>Period:</strong> [Mon DD] – [Mon DD], [YYYY] &nbsp;|&nbsp; <strong>Team:</strong> CX Intercept</p>

<h2>🐛 Radar Bugs</h2>
<h3>US</h3>
<ul>
  <li><strong>[Ticket ID]</strong> — [Short description] · Status: <em>In Progress</em></li>
</ul>
<h3>EU</h3>
<ul>
  <li><strong>[Ticket ID]</strong> — [Short description] · Status: <em>Closed – Verified</em></li>
  <li><strong>[Ticket ID]</strong> — [Short description] · Status: <em>Closed – Non Issue</em></li>
</ul>

<h2>🚨 500 Errors</h2>
<ul>
  <li>[Count] · [Error type] · [Root cause]</li>
  <li>[Count] · [Error type] · [Root cause]</li>
  <li>[Count] · [Error type] · [Root cause]</li>
</ul>

<h2>⚡ Query Performance Breakdown</h2>
<p><strong>Total Queries:</strong> [X]M</p>
<ul>
  <li>&lt; 50 ms : [X]M · [X]%</li>
  <li>50–100 ms : [X]M · [X]%</li>
  <li>100–200 ms : [X]K · [X]%</li>
  <li>200 ms+ : [X]K · [X]%</li>
</ul>

<h2>🐢 Performance Monitor – Slow Requests</h2>
<p><strong>Total Requests:</strong> [X]M</p>
<ul>
  <li>&lt; 1 second : [X]M · [X]%</li>
  <li>1 second : [X]K · [X]%</li>
  <li>2 seconds : [X]K · [X]%</li>
  <li>3 seconds : [X]K · [X]%</li>
  <li>4 seconds : [X]K · [X]%</li>
  <li>5 seconds : [X]K · [X]%</li>
</ul>

<h2>🐌 Top 3 Slowest Queries</h2>
<ol>
  <li><code>[SQL query snippet]</code> — [X]ms</li>
  <li><code>[SQL query snippet]</code> — [X]ms</li>
  <li><code>[SQL query snippet]</code> — [X]ms</li>
</ol>

<h2>📊 EQC Scores</h2>
<ul>
  <li>V1 · [Score]</li>
  <li>V1.2 · [Score]</li>
</ul>

<h2>✅ Shipped This Week</h2>
<ul>
  <li><strong>[TICKET-ID]</strong> — [Short description]</li>
  <li><strong>[TICKET-ID]</strong> — [Short description]</li>
  <li><strong>[TICKET-ID]</strong> — [Short description]</li>
</ul>

<h2>🔄 In Progress</h2>
<ul>
  <li><strong>[TICKET-ID]</strong> — [Short description]</li>
  <li><strong>[TICKET-ID]</strong> — [Short description]</li>
  <li><strong>[TICKET-ID]</strong> — [Short description]</li>
</ul>
`;

// ── Main component ──────────────────────────────────────────
const RichEditor = () => {
  const [savedHtml, setSavedHtml] = useLocalStorage('ws:editor', INITIAL_HTML);
  const [markdown, setMarkdown] = useState('');
  const [copied, setCopied] = useState(false);
  const [previewMaximized, setPreviewMaximized] = useState(false);
  const mdPaneRef = useRef<HTMLPreElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: savedHtml,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      setSavedHtml(html);
      setMarkdown(td.turndown(html));
    },
  });

  // Seed markdown on mount
  useEffect(() => {
    if (editor) setMarkdown(td.turndown(editor.getHTML()));
  }, [editor]);

  const wordCount = useMemo(() => {
    if (!editor) return 0;
    const text = editor.getText();
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [markdown]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  };

  const handleClear = () => {
    editor?.commands.clearContent();
    setMarkdown('');
  };

  const handleInsertTdd = () => {
    editor?.commands.setContent(TDD_HTML);
    setMarkdown(td.turndown(TDD_HTML));
    setSavedHtml(TDD_HTML);
  };

  const handleInsertWeeklyUpdate = () => {
    editor?.commands.setContent(WEEKLY_UPDATE_HTML);
    setMarkdown(td.turndown(WEEKLY_UPDATE_HTML));
    setSavedHtml(WEEKLY_UPDATE_HTML);
  };

  if (!editor) return null;

  return (
    <div className="re-root">
      {/* ── Toolbar ── */}
      <div className="re-toolbar">
        <div className="re-toolbar-left">
          {/* Paragraph styles */}
          <select
            className="re-select"
            value={
              editor.isActive('heading', { level: 1 }) ? 'h1'
              : editor.isActive('heading', { level: 2 }) ? 'h2'
              : editor.isActive('heading', { level: 3 }) ? 'h3'
              : 'p'
            }
            onChange={e => {
              const v = e.target.value;
              if (v === 'p') editor.chain().focus().setParagraph().run();
              else editor.chain().focus().toggleHeading({ level: Number(v[1]) as 1|2|3 }).run();
            }}
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>

          <Divider />

          {/* Inline formatting */}
          <TBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (⌘B)">
            <b>B</b>
          </TBtn>
          <TBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (⌘I)">
            <i>I</i>
          </TBtn>
          <TBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
            <s>S</s>
          </TBtn>
          <TBtn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">
            {'</>'}
          </TBtn>

          <Divider />

          {/* Lists */}
          <TBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
            ≡
          </TBtn>
          <TBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
            №
          </TBtn>
          <TBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
            ❝
          </TBtn>
          <TBtn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
            { '{ }' }
          </TBtn>

          <Divider />

          {/* History */}
          <TBtn disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} title="Undo (⌘Z)">
            ↩
          </TBtn>
          <TBtn disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} title="Redo (⌘⇧Z)">
            ↪
          </TBtn>
        </div>

        <div className="re-toolbar-right">
          <span className="re-wordcount">{wordCount} words</span>
          <button className="ws-btn ws-btn-ghost ws-btn-sm" onClick={handleClear}>Clear</button>
        </div>
      </div>

      {/* ── Panels ── */}
      <div className={`re-panels${previewMaximized ? ' preview-maximized' : ''}`}>
        {/* Left: WYSIWYG */}
        <div className="re-editor-panel">
          <div className="re-panel-header">
            <span className="re-panel-label">Editor</span>
            <span className="re-panel-hint">Format with the toolbar or keyboard shortcuts</span>
            <button className="ws-btn ws-btn-ghost ws-btn-sm" onClick={handleInsertTdd} title="Pre-fill with Technical Documentation template">
              + TDD Template
            </button>
            <button className="ws-btn ws-btn-ghost ws-btn-sm" onClick={handleInsertWeeklyUpdate} title="Pre-fill with Engineering Weekly Update template">
              + Weekly Update
            </button>
          </div>
          <div className="re-editor-wrap">
            <EditorContent editor={editor} className="re-editor" />
          </div>
        </div>

        {/* Right: Markdown output */}
        <div className="re-md-panel">
          <div className="re-panel-header">
            <span className="re-panel-label">Markdown Output</span>
            <button className="ws-btn ws-btn-ghost ws-btn-sm" onClick={handleCopy}>
              {copied ? '✓ Copied!' : 'Copy MD'}
            </button>
            <button
              className="ws-btn ws-btn-ghost ws-btn-sm panel-maximize-btn"
              onClick={() => setPreviewMaximized(v => !v)}
              title={previewMaximized ? 'Restore split view' : 'Maximize preview'}
            >
              {previewMaximized ? '⊠ Restore' : '⛶ Maximize'}
            </button>
          </div>
          <pre className="re-md-output" ref={mdPaneRef}>
            <code>{markdown || '# Start typing\n\nYour Markdown will appear here…'}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default RichEditor;
