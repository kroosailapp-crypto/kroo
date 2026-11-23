// Remember where a visitor was headed (e.g. a shared boat profile) so we can
// send them there after they sign up / confirm their email / log in.
const KEY = "kroo_next";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

function safePath(p) {
  return typeof p === "string" && p.startsWith("/") && !p.startsWith("//") ? p : null;
}

export function rememberNext(path) {
  const p = safePath(path);
  if (!p) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ path: p, at: Date.now() }));
  } catch {}
}

export function consumeNext() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    localStorage.removeItem(KEY);
    const { path, at } = JSON.parse(raw);
    if (Date.now() - at > MAX_AGE_MS) return null;
    return safePath(path);
  } catch {
    return null;
  }
}
