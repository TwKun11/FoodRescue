export function normalizeApiBaseUrl(value) {
  const raw = (value || "").trim();

  if (!raw) {
    return "";
  }

  let normalized = raw;

  if (!raw.startsWith("/") && !raw.startsWith("http://") && !raw.startsWith("https://")) {
    normalized = `http://${raw}`;
  }

  normalized = normalized.replace(/\/+$/, "");

  // All API callers already prefix paths with /api, so keep only host/origin here.
  if (normalized === "/api") {
    return "";
  }
  if (normalized.endsWith("/api")) {
    return normalized.slice(0, -4);
  }

  return normalized;
}
