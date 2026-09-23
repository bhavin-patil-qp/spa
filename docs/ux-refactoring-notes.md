# UX Notes: Markdown Viewer & Rich Editor

A self-study wiki on the UX fixes applied to [MarkdownViewer.tsx](../src/pages/MarkdownViewer.tsx) and
[RichEditor.tsx](../src/pages/RichEditor.tsx), each tied to a concept from *Refactoring UI*
(Adam Wathan & Steve Schoger). Each entry: **the problem → the concept → the fix → why it matters**.

---

## 1. Destructive actions need a safety net

**Problem:** Clicking "+ TDD Template" or "+ Weekly Update" instantly overwrote whatever the user
had written, with no confirmation and no reliable undo. In `MarkdownViewer`, the editor is a
React-controlled `<textarea>` — replacing its value via `setMd()` doesn't go through the browser's
native input events, so the browser's own Ctrl+Z undo stack doesn't know the old text ever existed.
The document was just gone.

**Concept — *"Prevent errors before they happen"* / feedback & control:** Refactoring UI's stance
on interface feedback extends to a broader UI principle: an action that can't be cheaply reversed
should ask before it happens, not apologize after. A button labeled `+ Template` doesn't *read* as
destructive, so the interface — not the user — has to catch the mistake.

**Fix:**
```tsx
// before
const handleInsertTdd = useCallback(() => {
  setMd(TDD_TEMPLATE);
}, [setMd]);

// after
const handleInsertTdd = useCallback(() => {
  if (md.trim() && md !== TDD_TEMPLATE &&
      !window.confirm('Replace the current document with the TDD template? This cannot be undone.')) {
    return;
  }
  setMd(TDD_TEMPLATE);
}, [md, setMd]);
```
Same pattern applied to both template buttons in `RichEditor` via a shared `confirmReplace()` helper.
The guard only fires when there's real content to lose (skipped on an empty/default doc), so it
doesn't nag on first use.

---

## 2. Don't let inline styles fight your design system

**Problem:** The "+ TDD Template" button in `MarkdownViewer` was pushed to the right edge of its
header with a one-off `style={{ marginLeft: 'auto', fontSize: '0.75rem' }}` — a layout rule that
exists nowhere else and isn't reusable.

**Concept — *systemize, don't one-off it*:** Refactoring UI's core message is that consistent
interfaces come from a small number of reusable rules (spacing scale, color scale, type scale),
not from ad-hoc values invented per-component. An inline style is exactly the kind of one-off value
the book warns will quietly multiply and drift out of sync.

**Fix:** moved the rule into a named class in `App.css`:
```css
.md-template-btn {
  margin-left: auto;
  font-size: 0.75rem;
}
```
Now it's discoverable, greppable, and reusable if another panel header needs the same "push button
to the far edge" behavior.

---

## 3. Text that's meant to be read shouldn't be invisible

**Problem:** Two different "muted" text colors were in play and one was broken:
- `.md-panel-stat` (char/line count, reading time) used `#9ca3af` on white — roughly a 2.5:1
  contrast ratio. Below WCAG AA's 4.5:1 minimum for normal text.
- `.re-panel-hint` ("Format with the toolbar or keyboard shortcuts") used `#d1d5db` on white —
  about 1.4:1. That's not "subtle," that's functionally invisible to most users.

**Concept — *hierarchy is about contrast, not just size*:** Refactoring UI is explicit that visual
hierarchy comes primarily from contrast/color weight, with size a secondary lever — and that
de-emphasizing text still means it has to clear a legibility floor. A "tertiary" label and an
"unreadable" label are not the same design decision, even though both start from "make it lighter."

**Fix:** realigned both to the app's existing muted-text scale instead of inventing new one-off
grays:
```css
/* stat text carries real information (line count, read time) → give it real contrast */
.md-panel-stat { color: #6b7280; }   /* was #9ca3af, ~2.5:1 → now ~4.6:1 */

/* hint text is supplementary guidance → lighter than stat text, but still legible */
.re-panel-hint { color: #9ca3af; }   /* was #d1d5db, ~1.4:1 → now ~2.5:1 as intended */
```
`#6b7280` and `#9ca3af` are both colors already used elsewhere in the app (`.tool-card p`,
`.article-excerpt`, `.md-panel-label`) — reusing the existing scale instead of adding new shades is
itself a Refactoring UI habit: fewer grays, used consistently, read as one coherent system.

---

## 4. Prioritize under constraint — declutter before you cram

**Problem:** `RichEditor`'s editor-panel header packs four things into a fixed 36px-tall row: a
panel label, a hint sentence, and two template buttons. On a narrower viewport there's nowhere for
that to go — no wrap room, no scroll — so it visually crushes together.

**Concept — *when space is tight, cut, don't shrink*:** Refactoring UI's guidance on responsive
layouts: rather than shrinking every element proportionally until everything is a blurry facsimile
of the desktop layout, decide what's least essential and remove it entirely at that breakpoint.
Here, the hint text is the least essential element — it's explanatory, not actionable — while the
template buttons are actions the user might actually click.

**Fix:**
```css
@media (max-width: 900px) {
  .re-panel-hint { display: none; }
}
```
The label and both action buttons stay; the redundant explanation drops out once space is scarce.

---

## 5. Icon-only controls need a name, even if they don't show one

**Problem:** `RichEditor`'s formatting toolbar uses glyphs like `❝`, `№`, `{ }`, `≡` for
blockquote/ordered-list/code-block/bullet-list. They had a `title` tooltip (mouse-hover only) but
no `aria-label`, so a screen reader announced the raw character — meaningless out loud — instead of
"Blockquote" or "Bullet list."

**Concept — *icons are not self-explanatory; pair them with a label somewhere*:** Refactoring UI
recommends pairing icons with text labels when the icon alone is ambiguous. The compact,
icon-only toolbar was a deliberate density trade-off worth keeping here (it's a familiar
rich-text-editor pattern), but the accessible label the sighted `title` tooltip provides still needs
to exist for assistive tech.

**Fix:**
```tsx
<button
  className={...}
  title={title}
  aria-label={title}       // screen readers now get "Blockquote", not "❝"
  aria-pressed={active}    // announces toggle state (bold/italic/etc.)
  type="button"
>
```
Also added `role="toolbar" aria-label="Text formatting"` to the button group and `aria-hidden="true"`
to the purely decorative `<Divider />` element, and an explicit `aria-label` on the paragraph-style
`<select>`.

---

## Quick reference: which concept, which file

| Concept | Where applied |
|---|---|
| Confirm destructive actions | `MarkdownViewer.tsx` → `handleInsertTdd`; `RichEditor.tsx` → `confirmReplace`, `handleInsertTdd`, `handleInsertWeeklyUpdate` |
| No inline one-off styles | `MarkdownViewer.tsx` template button → `.md-template-btn` in `App.css` |
| Contrast floor for readable text | `App.css` → `.md-panel-stat`, `.re-panel-hint` |
| Cut, don't shrink, under space pressure | `App.css` → `.re-panel-hint` media query |
| Icons need an accessible name | `RichEditor.tsx` → `TBtn`, `Divider`, paragraph `<select>` |

## Further reading
- *Refactoring UI* — Adam Wathan & Steve Schoger, ch. "Hierarchy is Everything", "Working with Color",
  "Designing Text", "Empty, Loading, and Error States".
- [WCAG 2.1 contrast minimum (1.4.3)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
  for the numbers behind fix #3.
