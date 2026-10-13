/**
 * Site-wide constants. Anything a component needs to know about the brand,
 * routes or feature flags belongs here instead of being hard-coded.
 */

/**
 * Canonical production origin.
 *
 * Everything that needs an absolute URL — canonical tags, Open Graph, the
 * sitemap, JSON-LD — derives from here rather than repeating the hostname.
 *
 * `sawonstore.in` is NOT yet registered (it returns NXDOMAIN), so it is kept
 * as `plannedOrigin` and the default below is the Firebase fallback, which is
 * the only host that actually resolves today. Pointing canonical tags at a
 * domain that does not exist tells search engines to index a URL that cannot
 * be fetched, which is worse than pointing at the working fallback.
 *
 * Swap these two values once the custom domain is live — nothing else to edit.
 */
const origin = 'https://sawonstore-b.web.app';
const plannedOrigin = 'https://www.sawonstore.in';

/**
 * Every host allowed to serve canonical URLs.
 *
 * A plain `window.location.origin` would let whatever host happens to serve the
 * bundle claim to be the real site: a mistyped domain, a stale preview URL, or
 * a copy of this deployment somewhere else would all be declared canonical and
 * split the site's ranking across duplicates. Restricting it to hosts we
 * control means auto-detection cannot be abused.
 */
const knownOrigins = [plannedOrigin, 'https://sawonstore.in', origin];

export const SITE = {
  name: 'SawonMart',
  tagline: 'Online Shopping for Everything',
  foundedYear: 2007,
  currentYear: 2026,

  /** Default origin. Also the sitemap's host, and the first-paint canonical. */
  origin,
  plannedOrigin,
  knownOrigins,

  email: 'help@sawonstore.in',
  phone: '1800-208-9898',
};

/**
 * Resolves the origin to use for absolute URLs at runtime.
 *
 * Prefers the host actually serving the page, so the fallback domain and the
 * custom domain each self-canonicalise correctly — but only if that host is one
 * we recognise. Anything else falls back to SITE.origin.
 *
 * Used by useDocumentMeta() at runtime. The sitemap is a static file and has to
 * name exactly one host, so it uses SITE.origin instead (overridable at build
 * time with SITE_ORIGIN).
 */
export function canonicalOrigin() {
  if (typeof window === 'undefined') return SITE.origin;
  const here = window.location.origin;
  return SITE.knownOrigins.includes(here) ? here : SITE.origin;
}

/** Builds an absolute URL from a site-relative path. */
export const absoluteUrl = (path = '/', base = canonicalOrigin()) =>
  `${base}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * WhatsApp contact.
 *
 * `number` is stored without a "+" and with no separators. wa.me requires the
 * full international number with no punctuation, so the link is built from
 * `number` rather than hard-coded — that way the number only ever lives here.
 */
export const WHATSAPP = {
  number: '8503988085',
  countryCode: '91',
  /** Human-readable form for on-screen text. */
  display: '+91 85039 88085',
  /** Default pre-filled message. Encoded automatically. */
  message: "Hi SawonMart! Mujhe ek product ke baare mein madad chahiye.",
};

/** Builds a wa.me deep link that opens a chat with the pre-filled message. */
export const whatsappLink = (message = WHATSAPP.message) =>
  `https://wa.me/${WHATSAPP.countryCode}${WHATSAPP.number}?text=${encodeURIComponent(message)}`;

/** Deals are relative to page load so the countdown always looks "live". */
export const DEAL_WINDOW_MS = {
  dealsOfTheDay: 6 * 60 * 60 * 1000, //  6 hours
  endOfSeason: 30 * 60 * 60 * 1000, // 30 hours
};

export const BREAKPOINTS = {
  sm: 640,
  md: 900,
  lg: 1200,
};

/** localStorage keys — namespaced so we never collide with anything else. */
export const STORAGE_KEYS = {
  cart: 'sawonmart:cart',
  wishlist: 'sawonmart:wishlist',
  recent: 'sawonmart:recent-search',
};