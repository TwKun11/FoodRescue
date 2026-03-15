export function normalizeApiBaseUrl(value) {
  const raw = (value || "").trim();

  if (!raw) {
    return "/api";
  }

  if (raw.startsWith("/") || raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  return `http://${raw}`;
}
