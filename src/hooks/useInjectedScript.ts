export const SITE_SCRIPT_STORAGE_KEY = 'ws-site-script';
const SITE_SCRIPT_ELEMENT_ID = 'ws-injected-site-script';

/** Pulls JS out of one or more pasted <script> tags, or returns the raw text as-is. */
export function extractJsFromPaste(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const matches = [...trimmed.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  return matches.length > 0 ? matches.map(m => m[1]).join('\n') : trimmed;
}

export function removeSiteScript() {
  document.getElementById(SITE_SCRIPT_ELEMENT_ID)?.remove();
}

/** Injects code as a live <script> in <head> so it executes immediately, same as a real page load. */
export function injectSiteScript(code: string) {
  removeSiteScript();
  if (!code.trim()) return;
  const el = document.createElement('script');
  el.id = SITE_SCRIPT_ELEMENT_ID;
  el.text = code;
  document.head.appendChild(el);
}

/** Re-applies whatever script is saved in localStorage — call once on app startup. */
export function loadSiteScriptFromStorage() {
  const stored = localStorage.getItem(SITE_SCRIPT_STORAGE_KEY);
  if (!stored) return;
  try {
    const raw = JSON.parse(stored) as string;
    injectSiteScript(extractJsFromPaste(raw));
  } catch {
    // corrupted entry — ignore
  }
}
