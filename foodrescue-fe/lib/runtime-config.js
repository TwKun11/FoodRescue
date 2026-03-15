import { normalizeApiBaseUrl } from "@/lib/normalize-runtime-config";

const FALLBACK_RUNTIME_CONFIG = {
  apiBaseUrl: normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "/api"),
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
};

function readInjectedRuntimeConfig() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.__FOODRESCUE_RUNTIME_CONFIG__ || null;
}

export function getRuntimeConfig() {
  return {
    ...FALLBACK_RUNTIME_CONFIG,
    ...(readInjectedRuntimeConfig() || {}),
  };
}

export function getApiBaseUrl() {
  const value = normalizeApiBaseUrl(getRuntimeConfig().apiBaseUrl || "/api");
  return value;
}

export function getGoogleClientId() {
  return getRuntimeConfig().googleClientId || "";
}
