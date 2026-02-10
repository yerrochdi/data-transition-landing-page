/**
 * Centralized booking URL configuration
 * All CTAs should use getBookingUrl() to ensure consistency and UTM tracking
 */

const CALENDLY_BASE_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/yerrochdi/15min";

/**
 * Get the booking URL with optional UTM parameters passthrough
 * @param utmParams - Optional UTM parameters to append
 * @returns Full booking URL with UTM parameters
 */
export function getBookingUrl(utmParams?: Record<string, string>): string {
  const url = new URL(CALENDLY_BASE_URL);

  if (utmParams) {
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
  }

  return url.toString();
}

/**
 * Extract UTM parameters from current URL (client-side only)
 * @returns Object containing UTM parameters
 */
export function getUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  const utmParams: Record<string, string> = {};

  utmKeys.forEach((key) => {
    const value = params.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });

  return utmParams;
}

/**
 * Get booking URL with UTM passthrough from current page
 * Use this in client components to preserve tracking
 */
export function getBookingUrlWithUtm(): string {
  return getBookingUrl(getUtmParams());
}

/**
 * Base Calendly URL for reference
 */
export const BOOKING_URL = CALENDLY_BASE_URL;
