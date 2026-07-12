const configuredMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";

export const GA_MEASUREMENT_ID = configuredMeasurementId;
export const GA_ENABLED = Boolean(GA_MEASUREMENT_ID) && process.env.NODE_ENV === "production";

// Log pageviews
export const pageview = (url) => {
  if (!GA_ENABLED || typeof window === "undefined" || !window.gtag) return;

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Log specific custom events with parameters
export const event = (action, params = {}) => {
  if (GA_ENABLED && typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, params);
    return;
  }

  // Optional developer logging in development mode without sending to GA4.
  if (process.env.NODE_ENV === "development") {
    console.log(`[GA4 disabled] ${action}:`, params);
  }
};