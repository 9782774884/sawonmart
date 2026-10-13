# SawonMart — Flipkart-style storefront

A Flipkart-inspired shopping homepage plus a product description page, built with
**React 18 + Vite**, plain CSS and hand-generated SVG artwork. No UI framework,
no CSS framework — every file lives in the folder it belongs to.

Hinglish UI, fully responsive, and accessible: **Lighthouse 100 / 100 / 100**
(accessibility, best practices, SEO) on both routes.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

| Script                | What it does                                          |
| --------------------- | ----------------------------------------------------- |
| `npm run dev`         | Dev server with hot module replacement                |
| `npm run build`       | Verify assets, then production build into `dist/`     |
| `npm run preview`     | Serve the built `dist/` locally                       |
| `npm run assets`      | Regenerate all placeholder SVGs in `public/assets/`   |
| `npm run check:assets`| Fail if any referenced image is missing               |
| `npm run deploy`      | Build + deploy to Firebase Hosting                    |

---

## Deployment

Hosted on **Firebase Hosting**, project `sawonstore-b`.

- **Production domain:** https://sawonstore-b.web.app
- **Intended custom domain:** `www.sawonstore.in` — **not registered yet**, see below

```bash
npm run deploy          # build, verify assets, generate sitemap, then upload
```

Requires the Firebase CLI and an authenticated session:

```bash
npm install -g firebase-tools
firebase login
```

The target project is pinned in `.firebaserc`, so plain `firebase deploy` works
too. To deploy somewhere else: `firebase use --add`, or pass
`--project <id>`.

### Custom domain

The intended production domain is `www.sawonstore.in`, but it is **not yet
registered** — both `sawonstore.in` and `www.sawonstore.in` return **NXDOMAIN**
from every public resolver, while `nic.in` and other `.in` domains resolve
normally. Firebase therefore refuses it: proving ownership requires adding a
`TXT` record, and you cannot add a `TXT` record to a domain that does not exist.

Register the domain first, then finish the setup. **`docs/domain-setup.md` has
the exact DNS records and the console steps** — including the one that is easy to
miss: the domain must also be added to **Authentication → Settings → Authorized
domains**, or *Continue with Google* fails on the new host with an error
identical to "provider not enabled", so check that list first.

DNS records cannot be changed from this repository; they are edited at your
registrar.

### How canonical URLs decide

Canonical tags must never point at a host that cannot be fetched — telling a
search engine to index a dead URL is worse than naming the working one. So the
origin is resolved by `canonicalOrigin()` in `src/utils/constants.js`:

| Situation | Canonical used |
| --------- | -------------- |
| Page served from a **recognised** host (`www.sawonstore.in`, `sawonstore.in`, `sawonstore-b.web.app`) | **that host** |
| Anything else — localhost, a typo domain, a preview URL, `null` | `SITE.origin` (the Firebase fallback) |

The allow-list matters. Using a bare `window.location.origin` would let any host
that happens to serve the bundle declare itself canonical — a lookalike domain or
a stale preview would split the site's ranking across duplicates.

`public/sitemap.xml` is the exception: a static file must name exactly one host,
so it uses `SITE.origin`, overridable per build:

```bash
SITE_ORIGIN=https://www.sawonstore.in npm run build
```

**When the domain goes live**, set `SITE_ORIGIN`, swap `origin` and
`plannedOrigin` in `src/utils/constants.js`, and update the `Sitemap:` line in
`public/robots.txt`. The build **fails** if the sitemap generator and
`index.html` disagree, so these cannot silently drift apart.

### SEO and the sitemap

- `public/sitemap.xml` is **generated at build time** by
  `scripts/generate-sitemap.mjs`, from the same `PRODUCTS` array the storefront
  renders, so it cannot drift from the catalogue. It contains 1 homepage URL
  plus one per product.
- The build **fails** if the sitemap generator and `index.html` disagree about
  the origin, so a domain change cannot silently leave the sitemap pointing at
  the old host.
- Canonical tags are set **per route** in `useDocumentMeta()`. A single canonical
  pinned to the homepage would tell crawlers every product page is a duplicate
  of `/`, which is how a catalogue ends up with only the homepage indexed.
- The 404 route emits `noindex, follow` and removes the canonical entirely.
  Because this is an SPA, a bad URL returns **HTTP 200** with the 404 page
  rendered client-side — without an explicit `noindex`, mistyped links get
  indexed as real content. `noindex` and a canonical are contradictory signals,
  so the 404 drops the canonical rather than pointing it at the homepage.

**Hosting configuration** (`firebase.json`):

- `public: "dist"` with `**` → `/index.html`, so deep links such as
  `/product/sm-ph-01` resolve client-side instead of 404-ing.
- `Cache-Control: no-cache, no-store` on the HTML shell **and** every SPA
  route. Firebase otherwise defaults HTML to `max-age=3600`, which is unsafe:
  after a deploy the content-hashed bundle a cached shell references is gone,
  so returning visitors get a white screen.
- `immutable, max-age=31536000` on hashed `*.js` / `*.css`.
- One week on `/assets/images/**` — those filenames are *not* content-hashed.
- A baseline `Content-Security-Policy`, `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy` on all
  responses. (`'unsafe-inline'` is needed for React inline styles and the
  JSON-LD block.)
- No CSP change is needed for a custom domain: the new host is same-origin, so
  `'self'` already covers it.

---

## Folder structure

Everything is grouped by responsibility. No file is a catch-all.

```
sawonmart-1/
├── index.html                     # HTML shell: meta, OG tags, skip link, noscript
├── package.json
├── vite.config.js                 # Vite + React + @ alias + vendor chunk split
├── jsconfig.json                  # Path aliases for editors
├── firebase.json                  # Firebase Hosting: SPA rewrite, cache + security headers
├── .firebaserc                    # Pins the default project (sawonstore-b)
│
├── public/                        # Copied verbatim into dist/
│   ├── robots.txt
│   └── assets/
│       └── images/
│           ├── banners/           #   5 hero banners + 3 promo tiles
│           ├── brands/            #   12 brand wordmarks
│           ├── categories/        #   9 category glyphs
│           ├── products/          #   37 product illustrations
│           └── brand/             #   logo, favicon, avatars
│
├── tools/                        → moved to .opencode/skills (see below)
│
├── .opencode/
│   └── skills/sawonmart-assets/          # Asset pipeline as an OpenCode skill
│       ├── SKILL.md                       #   how to add/verify imagery
│       ├── scripts/
│       │   ├── generate-assets.mjs        #   writes the SVG placeholders
│       │   ├── fetch-stock-images.mjs     #   optional stock-photo fetcher
│       │   └── verify-assets.mjs          #   fails the build on a missing image
│       └── references/
│           └── IMAGE-SOURCES.md           #   licensing rules + what went wrong
│
└── src/
    ├── main.jsx                   # Entry: providers + router mount
    ├── App.jsx                    # Route table only
    │
    ├── pages/                     # One file per route
    │   ├── HomePage.jsx           #   "/"
    │   ├── ProductPage.jsx        #   "/product/:id"
    │   └── NotFoundPage.jsx       #   "*"
    │
    ├── components/
    │   ├── layout/                # Persistent page chrome
    │   │   ├── Layout.jsx         #   header + nav + footer + drawer + toasts
    │   │   ├── TopStrip.jsx       #   announcement bar
    │   │   ├── Header.jsx         #   logo, search, login, kebab, cart
    │   │   ├── NavBar.jsx         #   category nav + mega-menus
    │   │   ├── CartDrawer.jsx     #   slide-in cart
    │   │   └── Footer.jsx
    │   │
    │   ├── home/                  # Homepage sections
    │   │   ├── HeroBanner.jsx     #   auto-rotating carousel
    │   │   ├── CategoryStrip.jsx
    │   │   ├── DealsSection.jsx   #   live countdown
    │   │   ├── WeekendSection.jsx
    │   │   ├── PromoTiles.jsx
    │   │   ├── ElectronicsSection.jsx
    │   │   ├── BrandStrip.jsx
    │   │   ├── BestsellerSection.jsx
    │   │   ├── ReviewSection.jsx
    │   │   └── ProductCard.jsx    #   shared by homepage + product page
    │   │
    │   ├── product/               # Product-page pieces
    │   │   ├── Breadcrumbs.jsx
    │   │   ├── ProductGallery.jsx #   variants + zoom lightbox
    │   │   ├── BuyBox.jsx         #   price, offers, pincode, add-to-cart
    │   │   ├── SpecsTable.jsx
    │   │   └── ProductReviews.jsx
    │   │
    │   ├── search/
    │   │   └── SearchBar.jsx      # ARIA 1.2 combobox with suggestions
    │   │
    │   ├── auth/
    │   │   ├── SignInModal.jsx    # Google sign-in dialog
    │   │   └── AccountMenu.jsx    # avatar dropdown when signed in
    │   │
    │   └── ui/                    # Generic, reusable primitives
    │       ├── Icon.jsx           #   inline SVG icon set
    │       ├── Button.jsx         #   renders <a>, router <Link> or <button>
    │       ├── Badge.jsx
    │       ├── Rating.jsx
    │       ├── Carousel.jsx
    │       ├── Modal.jsx          #   focus trap + scroll lock
    │       ├── Toast.jsx
    │       ├── SectionHeader.jsx
    │       ├── Reveal.jsx         #   IntersectionObserver entrance
    │       ├── BackToTop.jsx
    │       ├── WhatsAppButton.jsx #   floating contact button
    │       ├── ScrollToTopOnNavigate.jsx
    │       └── ErrorBoundary.jsx
    │
    ├── context/
    │   ├── StoreContext.jsx       # cart + wishlist + toast queue
    │   └── AuthContext.jsx        # Firebase Auth (Google) user state
    │
    ├── admin/                     # Admin control panel
    │   ├── AdminLayout.jsx        #   sidebar (14 modules) + topbar
    │   ├── RequireAdminAuth.jsx   #   demo gate — NOT real authentication
    │   ├── components/
    │   │   ├── AdminUI.jsx        #   small shared primitives
    │   │   ├── DataTable.jsx      #   sortable / searchable / paginated table
    │   │   └── charts.jsx         #   Recharts wrappers
    │   ├── data/
    │   │   ├── store.js           #   state + mutations + selectors
    │   │   ├── seed.js            #   deterministic demo data
    │   │   ├── permissions.js     #   role/permission matrix
    │   │   └── backend.md         #   migrating off localStorage
    │   └── pages/                 #   one file per screen
    │
    ├── lib/                     # Third-party wiring, nothing else
    │   ├── firebase.js            #   app + auth singletons
    │   └── firebaseConfig.js      #   public web config
    │
    ├── hooks/                     # One concern per file
    │   ├── useLocalStorage.js
    │   ├── useMediaQuery.js
    │   ├── useCountdown.js
    │   ├── useOnClickOutside.js
    │   ├── useLockBodyScroll.js
    │   ├── useDebounce.js
    │   ├── useDocumentMeta.js
    │   └── useScroll.js
    │
    ├── data/                      # All content, no JSX
    │   ├── products.js            #   37 products + selectors
    │   ├── company.js             #   legal name, GSTIN, office addresses
    │   ├── site.js                #   banners, nav, footer, reviews
    │   └── specs.js               #   spec tables, offers, descriptions
    │
    ├── styles/                    # Mirrors the component tree
    │   ├── index.css              #   single @import manifest
    │   ├── base/                  #   reset, design tokens, typography
    │   ├── layout/                #   container, header, nav, footer, drawer
    │   ├── ui/                    #   button, badge, rating, modal, toast…
    │   ├── sections/              #   homepage sections
    │   ├── pages/product.css      #   product description page
    │   └── utilities.css          #   imported last so it can override
    │
    └── utils/
        ├── format.js              # currency, discount %, duration
        └── constants.js
```

**Rule of thumb:** `components/` holds JSX, `styles/` holds CSS, `data/` holds
content, `hooks/` holds stateful logic, `utils/` holds pure functions. Each
folder is imported through exactly one parent, so there is no ambiguity about
where a new file belongs.

---

## Web standards applied

**Document & metadata**
- `<!doctype html>`, `lang="hi-Latn"` (correct BCP-47 tag for Hinglish in Latin
  script), charset and viewport declared up front.
- Full Open Graph set, `theme-color`, canonical URL, `apple-touch-icon`.
- A **skip link** as the first focusable element, plus a `<noscript>` fallback.

**Semantic structure**
- Landmark order is `banner → banner → navigation → main → contentinfo`.
- Sections use `<section>` with `aria-labelledby`; products are `<article>`;
  testimonials are `<figure>`/`<blockquote>`; breadcrumb is a labelled `<nav>`
  wrapping an `<ol>`.
- Specs use real `<table>` with `<caption>` and `<th scope="row">`.

**ARIA, used only where HTML falls short**
- Search is an ARIA 1.2 combobox: `aria-expanded`, `aria-controls`,
  `aria-activedescendant`, arrow-key navigation.
- Carousel uses `aria-roledescription="carousel"` / `"slide"`, dots expose
  `aria-current`, and inactive slides get `inert` so they leave the tab order.
- Modal traps Tab, closes on Escape, restores focus to the trigger, locks body
  scroll behind a ref-counted lock.
- Icons are `aria-hidden` and `focusable="false"`; the label does the talking.
- Countdown digits are `aria-hidden` with a single `role="timer"` sentence, so a
  screen reader is not interrupted every second.

**Colour & motion**
- `--c-blue-500`, `--c-yellow-700` and `--c-grey-500` are tuned so every text
  pairing clears WCAG AA 4.5:1 — including on tinted surfaces.
- Touch targets are at least 24×24 CSS px (the carousel dots keep a 9px visual
  but a 26×24 hit area via `::before`).
- All animation is disabled under `prefers-reduced-motion: reduce`.
- Focus is visible everywhere via `:focus-visible`, never removed.

**Performance & resilience**
- Route-level code splitting is available; React is split into its own vendor
  chunk for long-term caching.
- Below-the-fold images are `loading="lazy"`; the product image is `eager` with
  `fetchpriority="high"` because it is the LCP element.
- Images declare `width`/`height` and are wrapped in `aspect-ratio` boxes to
  avoid layout shift.
- `localStorage` access is wrapped in try/catch, so private mode and quota
  errors degrade to in-memory state instead of crashing.
- An `ErrorBoundary` keeps a rendering bug in one section from blanking the page.

**SEO**
- Each route sets its own `<title>` and meta description via
  `useDocumentMeta`, and the previous value is restored on unmount.
- The product page emits `schema.org/Product` JSON-LD with price, rating and
  availability.
- Real URLs via `BrowserRouter` (`/product/sm-ph-01`), with the SPA rewrite
  configured in `firebase.json`.

---

## Data & assets

All artwork is generated locally, so the project runs fully offline and there
are no broken images.

```bash
npm run assets        # rewrites every file under public/assets/images/
npm run check:assets  # verifies every referenced image exists
```

`generate-assets.mjs` holds a small shape library and writes 75 SVGs: product
illustrations, category glyphs, brand wordmarks, gradient banners and the logo.
Swap in real photography by replacing those files — the paths are referenced as
`/assets/images/<group>/<name>.svg`.

`verify-assets.mjs` runs automatically before every build (`prebuild`). Images
are referenced as plain strings in data files and JSX, so a typo in a `image:`
value would otherwise ship a silently broken `<img>`; the verifier turns that
into a hard build failure.

Catalogue lives in `src/data/products.js` (37 products). Adding an entry
automatically gives it a card on the homepage, search suggestions, and a
complete `/product/:id` page with generated specs and offers.

### Asset pipeline lives in an OpenCode skill

The generator, the fetcher and the verifier moved into
`.opencode/skills/sawonmart-assets/`, following OpenCode's convention of a
`SKILL.md` with `scripts/` and `references/` beside it. The skill ID is derived
from the directory name (`sawonmart-assets`), and because it has a
`description` OpenCode advertises it automatically — an agent working in this
repo can load it with the `skill` tool instead of rediscovering the pipeline.

Both scripts locate the project root by walking up to `package.json`, so they
keep working wherever the skill directory is moved.

### Why the product images are still generated SVGs

`npm run assets:photos` exists and works, but **do not run it without a Pexels
key.** It was built and tested against Openverse's strictest licence filter
(`cc0,pdm` — public domain, attribution not required), downloaded 42 files
successfully, and then a visual check of every single image showed roughly half
were the wrong subject:

| Asked for | Openverse returned |
| --- | --- |
| blender | a photograph of a church |
| eyeliner | a cat on a windowsill |
| kurta | a war memorial |
| handbag | a pendant necklace |
| computer mouse | a "Under Construction" logo |
| teddy bear | a building window |

Openverse aggregates Flickr user photos and museum archive scans, not stock
photography. Titles and tags also lie — the pendant photo was titled "handbag"
and passed every automated filter, so only looking at the pixels caught it.

Pexels and Unsplash were the alternatives: Pexels returns **403** to scraping
and needs an API key, and Unsplash's `source` endpoint is deprecated.

To get real photos, set a free key and re-run:

```bash
cp .env.example .env.local      # PEXELS_API_KEY=...
npm run assets:photos
```

The Pexels License allows free commercial use with no attribution required. Two
things are deliberately blocked: **brand logos** (a photo licence grants
copyright rights, never trademark rights — and the first Openverse run returned
a photo of *Beats by Dr. Dre* speakers), and any download over ~60 MB (one
museum TIFF was **41 MB** before `sharp` normalisation was added).

Full details and the complete list of mismatches:
`.opencode/skills/sawonmart-assets/references/IMAGE-SOURCES.md`.

---

## Login (Google + Firebase Auth)

Authentication is Firebase Auth with the **Google** provider only — the earlier
mock phone/OTP form was removed.

Clicking **Continue with Google** uses `signInWithPopup` on desktop and
automatically switches to `signInWithRedirect` on mobile (≤900px), because
popups are unreliable in mobile browsers. If a desktop popup is blocked by the
browser or an extension, it falls back to the redirect too. A redirect flow is
completed by `getRedirectResult()` before the auth listener attaches.

```
src/lib/firebaseConfig.js   web config (public client config, safe to commit)
src/lib/firebase.js         initialises the app + auth singletons
src/context/AuthContext.jsx user state, signIn, logOut, error messages
src/components/auth/
  ├── SignInModal.jsx       the "Continue with Google" dialog
  └── AccountMenu.jsx       avatar dropdown once signed in
```

### One-time setup you must confirm

**Authorized domains.** Sign-in fails with `auth/unauthorized-domain` unless
the domain is listed. Check
**Firebase Console → Authentication → Settings → Authorized domains**, and add:

| Domain | Needed for |
| --- | --- |
| `sawonstore-b.web.app` | production |
| `localhost` | `npm run dev` |
| `sawonstore-b.firebaseapp.com` | usually added automatically |

### The CSP had to be widened

The deployed `Content-Security-Policy` originally blocked Google Auth. Three
separate origins are needed, and only a real sign-in attempt reveals them:

- `script-src` → `https://apis.google.com` — the redirect flow injects
  `apis.google.com/js/api.js`. **This was the failure**: sign-in died with a
  generic error until this was allowed.
- `connect-src` → `identitytoolkit.googleapis.com`, `securetoken.googleapis.com`,
  `accounts.google.com`
- `frame-src` → `*.firebaseapp.com` for the SDK's `__/auth/iframe`
- `img-src` → `lh3.googleusercontent.com` for Google avatars

If you tighten the CSP later, re-test an actual Google login — Lighthouse and
the console both stay quiet while sign-in is broken.

---

## Company details

The storefront brand is **SawonMart**; the registered legal entity is
**Sawon Store**. Both are shown in the footer, and every company fact lives in
one file so the GSTIN is never typed twice:

```js
// src/data/company.js
export const COMPANY = {
  legalName: 'Sawon Store',
  gstin: '10FSRPS8895F1ZW',
  gstinUrl: 'https://services.gst.gov.in/services/searchtp',
  registeredOffice: {
    label: 'Registered Office',
    address: ['Kisan Bhawan Road', 'Jaynagar', 'District - Madhubani', 'Bihar 847226'],
  },
  branchOffice: {
    label: 'Branch Office',
    address: ['Near Zero Mile Metro Station', 'Patna 800030'],
  },
};
```

The GSTIN's leading `10` is the GST state code for Bihar, which is consistent
with the Madhubani registered office. It links to the official GST portal so
buyers can verify the registration themselves.

---

## Routes

| Path                  | Page                                          |
| --------------------- | --------------------------------------------- |
| `/`                   | Storefront homepage                           |
| `/product/:id`        | Product description page                      |
| `/admin`              | Dashboard — 20 counters, 6 charts             |
| `/admin/products`     | Product list, filters, bulk actions           |
| `/admin/products/new` | Add / edit — all 40 catalogue fields          |
| `/admin/pricing`      | Margins, discount rules, coupons, GST         |
| `/admin/orders`       | Order list and fulfilment pipeline            |
| `/admin/inventory`    | Stock levels, warehouses, restocking          |
| `/admin/customers`    | Segments, lifetime value, block/unblock       |
| `/admin/staff`        | Staff accounts and permission matrix          |
| `/admin/reports`      | P&L, GST summary, payment mix                 |
| `/admin/settings`     | Company details and demo-data reset           |
| `/admin/shipping`     | Zones and PIN-code serviceability (Phase 2)   |
| `/admin/payments`     | Reconciliation queue (Phase 2)                |
| `/admin/marketing`    | Channel mix (Phase 2)                         |
| `/admin/security`     | Audit trail and access review (Phase 2)       |
| `/admin/distributors` | **Deliberately not built** — see below        |

Admin screens set `noindex, nofollow` and are code-split, so no shopper ever
downloads Recharts.

### How much is actually built

**Phase 1 works end to end.** Product add → order → payment → stock deduction →
invoice → delivery all function, and the figures stay consistent: revenue is
recognised on delivery, GST is never counted as profit, and order profit is
revenue minus cost of goods.

**Phase 2 routes are partly real.** Shipping shows zones and derives PIN-code
serviceability from actual order history; Payments shows a real reconciliation
queue. Marketing, Security and Distributors are honest placeholders that list
their scope and what is missing — not empty tables dressed up as finished work.

**The Distributor / BV / commission module is not built, on purpose.** Items
166–185 involve level income, recruitment bonuses and TDS. Under the Prize
Chits and Money Circulation Schemes (Banning) Act, a scheme is unlawful if
compensation for recruitment exceeds compensation for sales, and the Direct
Selling Rules require prescribed disclosures and a cooling-off period. Building a
live payout engine before that review risks creating something you have to
rebuild — and introducing TDS later makes every historical payout wrong.

---

## Demo backend, stated plainly

Admin data lives in `localStorage`. It survives refresh and supports
create / edit / archive, but it is **single-browser, not backed up, and freely
editable**. The permission matrix decides what is drawn; it does not protect any
data.

`src/admin/data/backend.md` has the Firestore migration path, the security rules
that make the permission matrix enforceable, and the pre-launch checklist.

`src/admin/data/seed.js` generates 1,450 orders across 12 months from a
fixed-seed PRNG, so the figures are identical on every machine. Illustrative
data, not accounting data.

---

## Contact

A floating WhatsApp button sits bottom-left on every page and links to
`https://wa.me/918503988085` with a pre-filled message.

The number lives in exactly one place — `WHATSAPP` in `src/utils/constants.js` —
and `whatsappLink()` builds the deep link from it, so the digits are never
duplicated across components:

```js
export const WHATSAPP = {
  number: '8503988085',
  countryCode: '91',
  display: '+91 85039 88085',
  message: 'Hi SawonMart! Mujhe ek product ke baare mein madad chahiye.',
};
```

`wa.me` needs the full international number with no `+`, spaces or dashes, which
is why the link is generated rather than pasted into the markup. The same link
also appears in the footer's registered-office contact list.

---

## Notes and limitations

This is a front-end demonstration. There is no backend, so:
- Login and signup accept any input and show a toast instead of calling an API.
- "Buy Now" and checkout stop at the cart drawer.
- Search filters the local catalogue; it does not hit a search service.
- Offer copy, prices and reviews are illustrative sample data.