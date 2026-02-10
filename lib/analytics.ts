import { track } from "@vercel/analytics";

/**
 * Track CTA click events
 * @param location - Where the CTA was clicked (hero, header, pricing, etc.)
 */
export function trackCtaClick(location: string) {
  track("cta_click", { location });
}

/**
 * Track form submission
 * @param formType - Type of form submitted
 */
export function trackFormSubmit(formType: string) {
  track("form_submit", { form: formType });
}

/**
 * Track booking modal opened
 */
export function trackBookingOpen(source: string) {
  track("booking_open", { source });
}
