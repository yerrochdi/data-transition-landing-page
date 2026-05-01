import type { MetadataRoute } from "next";

const SITE_URL = "https://nextmove.sh";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard",
          "/journey",
          "/agents",
          "/opportunities",
          "/resources",
          "/analytics",
          "/feed",
          "/settings",
          "/onboarding",
          "/upgrade",
          "/auth/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
