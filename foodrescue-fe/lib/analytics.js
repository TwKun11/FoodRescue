export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-65JFYTQJN1";

// Log pageviews
export const pageview = (url) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Log specific custom events with parameters
export const event = (action, params = {}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, params);
  } else {
    // Optional developer logging in development mode
    if (process.env.NODE_ENV === "development") {
      console.log(`[GA4 Event] ${action}:`, params);
    }
  }
};
