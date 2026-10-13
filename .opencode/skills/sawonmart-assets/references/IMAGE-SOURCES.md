# Image sources and licensing

Every image in `public/assets/images/` falls into exactly one of the three
groups below. **The project currently ships group 2 and group 3 only** — see the
warning at the end of section 1.

---

## 1. `products/` — stock photos (third-party) · NOT CURRENTLY IN USE

`scripts/fetch-stock-images.mjs` can populate this group, but its output is not
fit for a product listing today. The reasoning is recorded here so nobody
re-runs it and assumes the results are usable.

### What was tried, and what actually happened

`npm run assets:photos` was run against **Openverse** (`api.openverse.org`)
with the strictest licence filter available, `cc0,pdm` (public domain,
attribution not required). 42 files downloaded successfully. Every one was then
**visually inspected** on a contact sheet:

| Expected subject | What Openverse actually returned |
| --- | --- |
| blender | a photograph of a church |
| eyeliner | a cat on a windowsill |
| kurta | a war memorial / statue |
| handbag | a pendant necklace |
| computer mouse | a "Under Construction" logo graphic |
| printer | an engraving |
| t-shirt | a woman inside a shop |
| sneakers | a person lying on gravel |
| digital camera | people standing in a river |
| teddy bear | a building window |

**Roughly half the product results were the wrong subject.** Banners were no
better: a museum display case of 1990s phones, a food-processor bowl on gravel,
and a clip-art cartoon of a girl with shopping bags.

### Why it fails

Openverse aggregates **Flickr user photography and museum/archival scans**, not
stock-photo libraries. Its CC0 results for `smartphone` include *"Soda Hall
abacus with laptop and smartphone"* and *"Park Visitor Uses Smartphone to Take a
Picture of Bighorn Sheep"*. The licence metadata is accurate; it simply is not
the kind of image a storefront needs.

Metadata filtering cannot rescue this either — titles and tags actively lie. A
photograph of a pendant was titled "handbag" with jewellery tags, so it passed
every automated check. **Only looking at the pixels revealed it.** Any future
fetcher must keep a human verification step.

The obvious alternatives were ruled out too: Pexels requires an API key for
search and returns **HTTP 403** to scraping, and Unsplash's
`source.unsplash.com` endpoint is deprecated.

### Shipping wrong photos is worse than shipping a placeholder

A stock photo of a generic laptop on a listing titled *"Dell Inspire 15 Core
i5"* tells the buyer something untrue about what they will receive. A clean,
obviously-illustrative SVG placeholder makes no such claim. So the shipping
default remains the generated SVG set.

### How to actually get good product photos

Set a free key and re-run — this path is wired and ready:

```bash
# 1. Get a free key: https://www.pexels.com/api/
cp .env.example .env.local     # then set PEXELS_API_KEY=...
npm run assets:photos
```

The **Pexels License** permits free commercial use with no attribution
required, and that library is genuine product photography. Attribution is still
written to `public/assets/images/CREDITS.md` as good practice.

Then, and only after **visually checking each result**, point the product's
`image:` in `src/data/products.js` at the new `.jpg`.

Even better: use photographs of the products you actually sell.

---

## 2. `brands/` — generated wordmarks (never downloaded)

Samsung, Nike, Sony, Adidas, LEGO, Pepsi, Amazon and Dell are **registered
trademarks**.

A photo licence grants *copyright* permission only. It confers **no trademark
rights**, and CC0 explicitly does not cover trademarks or logos. Shipping real
brand marks on a storefront is a trademark risk that no licence check catches —
and it happened during testing: the first Openverse run returned a photo of
**Beats by Dr. Dre** speakers for a "bluetooth speaker" query.

`scripts/fetch-stock-images.mjs` therefore carries a `BRAND_BLOCKLIST` and
rejects any result whose metadata names a real brand.

The wordmarks in `brands/` are drawn as plain text in a generated SVG
(`brand: '<name>'` in `scripts/generate-assets.mjs`). To use real brand assets,
obtain permission from each trademark holder or link to their media kit.

---

## 3. `products/`, `banners/`, `categories/`, `brand/` — generated SVG

Category glyphs, the logo mark, the favicon, avatars, all 37 product
illustrations and the 5 hero banners are drawn from the shape library in
`scripts/generate-assets.mjs`. No third-party rights, no licence obligations,
always topically correct, 2–5 kB each, and they scale cleanly.

This is the shipping default.

---

## Adding a new photo

1. Set `PEXELS_API_KEY` (see `.env.example`).
2. Add a row to `MANIFEST` in `scripts/fetch-stock-images.mjs`:

   ```js
   ['products/phone-3.jpg', ['smartphone', 'mobile phone'], 900, 900],
   //  [output path             [query variants]                w    h]
   ```

3. `npm run assets:photos`
4. **Open the file and confirm it shows the right object.**
5. Point the product's `image:` in `src/data/products.js` at it.
6. `npm run check:assets`

The fetcher normalises every download with `sharp` — bounded to the target size,
flattened onto white, re-encoded as a progressive JPEG at quality 82. Without
that step one museum TIFF added **41 MB** to the repository.