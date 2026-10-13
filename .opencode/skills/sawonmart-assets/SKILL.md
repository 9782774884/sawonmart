---
name: SawonMart Assets
description: Generate, fetch and verify the imagery for the SawonMart storefront. Use when adding a product, changing an illustration, sourcing stock photos (Pexels), or when `npm run build` fails with a missing-image error.
license: MIT
---

## What this skill owns

Every image under `public/assets/images/` — generated SVG artwork, downloaded
stock photos, and the verification that keeps the two honest.

## Layout

```text
.opencode/skills/sawonmart-assets/
├── SKILL.md
├── scripts/
│   ├── generate-assets.mjs      # writes the SVG placeholders
│   ├── fetch-stock-images.mjs   # downloads CC0 photos from Openverse
│   └── verify-assets.mjs        # fails the build on a missing image
└── references/
    ├── IMAGE-SOURCES.md         # licensing rules per image group
    └── PRODUCT-QUERIES.md       # search terms used per product id
```

## Commands

Run from the project root:

| Command                                  | Purpose                              |
| ---------------------------------------- | ------------------------------------ |
| `npm run assets`                         | Regenerate all SVG placeholders      |
| `npm run assets:photos`                  | Download stock photos (needs `PEXELS_API_KEY` for usable results) |
| `npm run check:assets`                   | Verify every referenced image exists |
| `npm run build`                          | Runs `check:assets` first via `prebuild` |

## Adding a product

1. Add the product object to `PRODUCTS` in `src/data/products.js`.
2. Pick an image:
   - **Generated placeholder (default)** — if the shape already exists, reuse
     it. Otherwise add one line to `PRODUCTS` in `scripts/generate-assets.mjs`
     (`[path, shape, palette]`; `shape` must be a `SHAPES` key and `palette` a
     `PALETTES` key), then run `npm run assets`.
   - **Photo** — requires a `PEXELS_API_KEY`. Add a row to `MANIFEST` in
     `scripts/fetch-stock-images.mjs`, run `npm run assets:photos`, then
     **open the file and confirm it shows the right object** before pointing
     `image:` at it.
3. Run `npm run check:assets`. A wrong `image:` path is a hard build failure,
   not a runtime 404.
4. If the product uses a **new `category`**, add it to `CATEGORY_LABELS` at the
   bottom of `src/data/products.js`, or the breadcrumb shows the raw id.

## Rules that matter

- **Never download brand logos.** Samsung, Nike, Sony, Adidas, LEGO, Pepsi,
  Amazon and Dell are registered trademarks. Photo licences grant *copyright*
  rights only, never trademark rights. Brand marks in `brands/` stay generated
  as plain wordmarks.
- **Check every downloaded photo with your eyes.** Metadata lies. A photograph of
  a pendant was titled "handbag" and passed every automated relevance and
  trademark check. `references/IMAGE-SOURCES.md` records what went wrong when
  this was automated without a human in the loop.
- **Do not run `assets:photos` without a Pexels key.** Without one it falls back
  to Openverse, whose public-domain pool is Flickr snapshots and museum scans —
  visually verified to return a church for "blender" and a cat for "eyeliner".
- **Stock photos are representative, not the actual product.** A photo of a
  generic laptop on a listing titled "Dell Inspire 15" misrepresents what the
  buyer receives. Replace them with real product photography before taking
  orders.
- Attribution is written to `public/assets/images/CREDITS.md` on every fetch
  run. Do not delete that file while third-party images are present.

## Troubleshooting

`✖ N missing image reference(s)` from `check:assets` means a string in
`src/data/` or a JSX `src=` points at a file that does not exist. The report
names the referencing file. Either generate the asset or fix the path — do not
weaken the check.