/**
 * fetch-stock-images.mjs
 * -----------------------------------------------------------------------------
 * Downloads licence-free photographs from Openverse into public/assets/images/.
 *
 * Licensing: only `cc0` (CC Zero) and `pdm` (Public Domain Mark) are accepted,
 * so no attribution is legally required. Every download is still recorded in
 * CREDITS.md — see references/IMAGE-SOURCES.md.
 *
 * Why this script is fussy: Openverse's public-domain pool is small, so a naive
 * "take the first result" loop produces confidently WRONG pictures — a search
 * for "computer mouse" once returned a photo of a spider web, and "mens shirt"
 * returned a delivery truck. A wrong photo on a product listing is worse than a
 * clean placeholder, so every candidate must pass:
 *
 *   1. licence      — cc0 or pdm only
 *   2. size         — at least 500x400
 *   3. relevance    — the result title/tags must actually mention the subject
 *   4. trademark    — title/tags must not name a real brand
 *
 * Brand logos are deliberately NOT fetched here. See
 * references/IMAGE-SOURCES.md.
 *
 * Usage:
 *   node .opencode/skills/sawonmart-assets/scripts/fetch-stock-images.mjs
 *   node ... --force            re-download files that already exist
 *   node ... --only=products    limit to one group
 *   node ... --list             show the manifest, download nothing
 * -----------------------------------------------------------------------------
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

function findProjectRoot(start) {
  let dir = start;
  for (let i = 0; i < 10; i++) {
    try {
      readFileSync(join(dir, 'package.json'), 'utf8');
      return dir;
    } catch {
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  throw new Error('Could not locate the project root.');
}

const ROOT = findProjectRoot(dirname(fileURLToPath(import.meta.url)));
const IMG = resolve(ROOT, 'public', 'assets', 'images');

const API = 'https://api.openverse.org/v1/images/';
const LICENSES = 'cc0,pdm';
const UA = 'SawonMart/1.0 (asset fetcher; contact: help@sawonmart.com)';

/**
 * Trademarks that must never appear in a downloaded product photo. A photo
 * licence grants copyright rights only — never trademark rights — so shipping
 * a picture of a branded product is a risk no CC0 check can clear.
 */
const BRAND_BLOCKLIST = [
  'samsung', 'apple', 'iphone', 'ipad', 'macbook', 'nike', 'adidas', 'puma',
  'sony', 'bose', 'beats', 'dre', 'jbl', 'dell', 'hp', 'lenovo', 'asus',
  'acer', 'realme', 'xiaomi', 'oneplus', 'oppo', 'vivo', 'canon', 'nikon',
  'fujifilm', 'gopro', 'lego', 'pepsi', 'coca', 'amazon', 'google', 'microsoft',
  'lg', 'philips', 'panasonic', 'whirlpool', 'ifb', 'voltas', 'havells',
  'butterfly', 'noise', 'boat', 'wildcraft', 'amazon', 'logitech', 'epson',
  'redragon', 'redragon', 'nivea', 'gucci', 'chanel', 'rayban', 'ray-ban',
];

/** Words too vague to prove an image is the right subject. */
const WEAK_TERMS = new Set(['a', 'an', 'the', 'of', 'and', 'on', 'in', 'with', 'my', 'for']);

/**
 * Openverse's public-domain pool is mostly library and museum archive material
 * rather than product photography, so a query for "blender" happily returns a
 * photo of a church that merely carries the tag "blender". These terms mark a
 * result as a scene, place or graphic rather than a product shot.
 */
const SCENE_TERMS = [
  'street', 'river', 'church', 'cemetery', 'graveyard', 'building', 'people',
  'crowd', 'landscape', 'mountain', 'park', 'city', 'bridge', 'memorial',
  'statue', 'ruins', 'graffiti', 'manuscript', 'engraving', 'illustration',
  'drawing', 'sketch', 'logo', 'icon', 'screenshot', 'poster', 'sign',
  'monument', 'memorials', 'cat', 'dog', 'animal', 'insect', 'bird', 'flower',
  'tree', 'plant', 'sunset', 'sunrise', 'sky', 'beach', 'field', 'forest',
  'window', 'door', 'wall', 'floor', 'museum', 'gallery', 'exhibit', 'grave',
];

/** True when the metadata reads like a scene/graphic rather than a product. */
function looksLikeScene(item) {
  const title = String(item.title ?? '').toLowerCase();
  return SCENE_TERMS.find((term) => new RegExp(`\\b${term}\\b`).test(title)) ?? null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Meaningful lowercase words from a query or title. */
const words = (s) =>
  String(s ?? '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !WEAK_TERMS.has(w));

/** All searchable text for a result. */
function haystack(item) {
  const tags = (item.tags ?? []).map((t) => t.name ?? t).join(' ');
  return `${item.title ?? ''} ${item.alt_text ?? ''} ${tags}`;
}

/** A trademark named in the metadata → reject. */
function brandIn(item) {
  const text = haystack(item).toLowerCase();
  return BRAND_BLOCKLIST.find((brand) => new RegExp(`\\b${brand}\\b`).test(text)) ?? null;
}

const argv = process.argv.slice(2);
const FORCE = argv.includes('--force');
const ONLY = (argv.find((a) => a.startsWith('--only=')) ?? '').replace('--only=', '');
const LIST_ONLY = argv.includes('--list');

/** --openverse forces the (archival) fallback even when a Pexels key exists. */
const PREFER_PEXELS = !argv.includes('--openverse');
let pexelsMissing = false;

/* ------------------------------------------------------------------ manifest */

/**
 * [ output path, [query variants], width, height ]
 *
 * Queries name the *object*, never a brand. Multiple variants are listed
 * because the public-domain pool is sparse: each is tried in turn until one
 * produces a candidate that passes every check.
 */
const MANIFEST = {
  products: [
    ['products/phone-1.jpg', ['smartphone', 'mobile phone', 'cell phone'], 900, 900],
    ['products/phone-2.jpg', ['mobile phone', 'smartphone', 'phone'], 900, 900],
    ['products/laptop-1.jpg', ['laptop computer', 'notebook computer', 'laptop'], 900, 900],
    ['products/laptop-2.jpg', ['laptop notebook', 'computer desk', 'laptop'], 900, 900],
    ['products/headphone-1.jpg', ['earbuds', 'earphones', 'headphones'], 900, 900],
    ['products/headphone-2.jpg', ['headphones', 'over ear headphones', 'headset'], 900, 900],
    ['products/watch-1.jpg', ['smartwatch', 'smart watch', 'wristwatch'], 900, 900],
    ['products/watch-2.jpg', ['fitness band', 'fitness tracker', 'wristband'], 900, 900],
    ['products/tv-1.jpg', ['television', 'flat screen tv', 'monitor tv'], 900, 900],
    ['products/camera-1.jpg', ['digital camera', 'dslr camera', 'camera lens'], 900, 900],
    ['products/speaker-1.jpg', ['bluetooth speaker', 'portable speaker', 'loudspeaker'], 900, 900],
    ['products/keyboard-1.jpg', ['computer keyboard', 'keyboard', 'keycaps'], 900, 900],
    ['products/mouse-1.jpg', ['computer mouse', 'mouse', 'gaming mouse'], 900, 900],
    ['products/monitor-1.jpg', ['computer monitor', 'monitor screen', 'display monitor'], 900, 900],
    ['products/shirt-1.jpg', ['t-shirt', 'tshirt', 'cotton tshirt'], 900, 900],
    ['products/shirt-2.jpg', ['kurta', 'indian dress', 'saree clothing'], 900, 900],
    ['products/shirt-3.jpg', ['dress shirt', 'mens shirt', 'shirt clothing'], 900, 900],
    ['products/shoes-1.jpg', ['running shoes', 'sneakers shoes', 'trainers'], 900, 900],
    ['products/shoes-2.jpg', ['sneakers', 'shoes footwear', 'canvas shoes'], 900, 900],
    ['products/bag-1.jpg', ['handbag', 'purse bag', 'shoulder bag'], 900, 900],
    ['products/wallet-1.jpg', ['wallet', 'leather wallet', 'billfold'], 900, 900],
    ['products/perfume-1.jpg', ['eyeliner', 'kajal', 'eye pencil'], 900, 900],
    ['products/perfume-2.jpg', ['perfume bottle', 'fragrance bottle', 'cologne'], 900, 900],
    ['products/microwave-1.jpg', ['microwave oven', 'microwave', 'kitchen oven'], 900, 900],
    ['products/fridge-1.jpg', ['refrigerator', 'fridge', 'freezer'], 900, 900],
    ['products/ac-1.jpg', ['air conditioner', 'air conditioning', 'split ac'], 900, 900],
    ['products/kettle-1.jpg', ['electric kettle', 'kettle', 'tea kettle'], 900, 900],
    ['products/blender-1.jpg', ['blender', 'mixer grinder', 'food blender'], 900, 900],
    ['products/toy-1.jpg', ['teddy bear', 'plush toy', 'stuffed animal'], 900, 900],
    ['products/book-1.jpg', ['stack of books', 'books pile', 'bookshelf'], 900, 900],
    ['products/book-2.jpg', ['open book', 'reading book', 'book pages'], 900, 900],
    ['products/helmet-1.jpg', ['bicycle helmet', 'helmet', 'safety helmet'], 900, 900],
    ['products/printer-1.jpg', ['printer', 'office printer', 'inkjet printer'], 900, 900],
    ['products/chair-1.jpg', ['office chair', 'desk chair', 'chair furniture'], 900, 900],
    ['products/box-1.jpg', ['building blocks', 'toy bricks', 'blocks toy'], 900, 900],
    ['products/cycle-1.jpg', ['mountain bicycle', 'bicycle', 'bike'], 900, 900],
    ['products/sofa-1.jpg', ['sofa', 'couch', 'living room sofa'], 900, 900],
  ],
  banners: [
    ['banners/hero-1.jpg', ['smartphones', 'mobile phones', 'mobile devices'], 1600, 600],
    ['banners/hero-2.jpg', ['clothing rack', 'fashion clothes', 'apparel store'], 1600, 600],
    ['banners/hero-3.jpg', ['kitchen appliances', 'modern kitchen', 'kitchen interior'], 1600, 600],
    ['banners/hero-4.jpg', ['sale discount', 'shopping bags', 'retail store'], 1600, 600],
    ['banners/hero-5.jpg', ['laptop computer', 'electronics', 'technology'], 1600, 600],
  ],
};

/* ==========================================================================
   PROVIDERS
   ========================================================================== */

/**
 * Pexels — PREFERRED, requires a free API key.
 *
 * The Pexels License permits free commercial use with no attribution
 * required, and its library is actual product photography, which is what a
 * storefront needs. Get a key at https://www.pexels.com/api/ and put it in
 * .env.local as PEXELS_API_KEY=...
 *
 * Without a key this provider is skipped automatically.
 */
async function searchPexels(query, pageSize = 12) {
  const key = process.env.PEXELS_API_KEY || readEnvKey('.env.local', 'PEXELS_API_KEY');
  if (!key) return null; // signal "not configured"

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${pageSize}`;
  const res = await fetch(url, { headers: { Authorization: key, 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Pexels HTTP ${res.status}`);

  const data = await res.json();

  // Map onto the same shape Openverse returns so the checks below are shared.
  return (data.photos ?? []).map((p) => ({
    id: `pexels-${p.id}`,
    title: p.alt || p.photographer ? `${p.alt ?? ''} ${p.photographer ?? ''}`.trim() : 'photo',
    alt_text: p.alt ?? '',
    width: p.width,
    height: p.height,
    url: p.src.large2x ?? p.src.large,
    thumbnail: p.src.medium,
    creator: p.photographer ?? 'unknown',
    license: 'pexels',
    license_version: '',
    source: 'pexels',
    foreign_landing_url: p.url,
    tags: [],
  }));
}

/** Minimal .env.local reader so no dotenv dependency is needed. */
function readEnvKey(file, name) {
  const path = resolve(ROOT, file);
  if (!existsSync(path)) return null;
  const match = readFileSync(path, 'utf8').match(new RegExp(`^${name}\\s*=\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : null;
}

/**
 * Openverse — fallback, no key required.
 *
 * WARNING: its CC0/PDM pool is Flickr user photography and museum/archival
 * scans, not product photography. Verified by eye: searching "blender"
 * returns a photograph of a church, and "eyeliner" returns a cat. Use it for
 * banners and editorial imagery only, never for a product listing where the
 * photo is a claim about what the buyer receives.
 */
async function searchOpenverse(query, pageSize = 20) {
  const url =
    `${API}?q=${encodeURIComponent(query)}` +
    `&license=${LICENSES}&page_size=${pageSize}&mature=false`;

  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Openverse HTTP ${res.status}`);
  return (await res.json()).results ?? [];
}

async function search(query) {
  if (PREFER_PEXELS) {
    try {
      const results = await searchPexels(query);
      if (results) return results;
      console.log('  · no PEXELS_API_KEY — falling back to Openverse (archival imagery)');
      pexelsMissing = true;
    } catch (error) {
      console.log(`  ! Pexels failed (${error.message}) — falling back to Openverse`);
    }
  }
  return searchOpenverse(query);
}

/**
 * Does the metadata actually talk about the thing we asked for?
 *
 * Query terms must appear in the TITLE or ALT text. Tags proved far too noisy —
 * archival photos are tagged with whatever was in the frame, which is how a
 * church ends up tagged "blender".
 */
function isRelevant(item, query) {
  const text = `${item.title ?? ''} ${item.alt_text ?? ''}`.toLowerCase();
  const needed = words(query);
  if (!needed.length) return true;
  return needed.every((term) => text.includes(term));
}

const bigEnough = (item) => (item.width ?? 0) >= 500 && (item.height ?? 0) >= 400;

/**
 * Candidate URLs for one result, best first.
 *
 * The Openverse thumbnailer returns HTTP 424 fairly often, and original files
 * are sometimes 40 MB TIFFs from museum archives. Trying several sources and
 * normalising with sharp means neither case can break the run.
 */
function candidateUrls(item) {
  const urls = [];
  if (item.id) urls.push(`https://api.openverse.org/v1/images/${item.id}/thumb/`);
  if (item.thumbnail) urls.push(item.thumbnail);
  urls.push(item.url);
  return [...new Set(urls.filter(Boolean))];
}

const kb = (n) => `${Math.round(n / 1024)} kB`;

/**
 * Downloads and normalises one image: bounds it to targetW x targetH, flattens
 * transparency onto white, and re-encodes as a progressive JPEG.
 *
 * Normalising here rather than shipping the original is what keeps the page
 * fast — a single museum TIFF would otherwise add 40 MB to the bundle.
 */
async function fetchNormalised(item, targetW, targetH) {
  const errors = [];

  for (const url of candidateUrls(item)) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
      if (!res.ok) {
        errors.push(`${res.status} ${new URL(url).host}`);
        continue;
      }

      const buf = Buffer.from(await res.arrayBuffer());
      // Bail on absurd payloads before spending time decoding them.
      if (buf.length > 60 * 1024 * 1024) {
        errors.push(`${kb(buf.length)} too large`);
        continue;
      }

      const out = await sharp(buf, { limitInputPixels: 500_000_000 })
        .rotate()
        .resize({
          width: targetW,
          height: targetH,
          fit: 'inside',
          withoutEnlargement: true,
          background: '#ffffff',
        })
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: 82, progressive: true, mozjpeg: true })
        .toBuffer();

      return { buffer: out, from: new URL(url).host };
    } catch (error) {
      errors.push(error.message.slice(0, 60));
    }
  }

  throw new Error(`all sources failed (${errors.join('; ')})`);
}

/* ---------------------------------------------------------------------- main */

if (LIST_ONLY) {
  for (const [group, entries] of Object.entries(MANIFEST)) {
    console.log(`${group} (${entries.length})`);
    for (const [p, queries] of entries) console.log(`  ${p.padEnd(30)} ${queries.join(' | ')}`);
  }
  process.exit(0);
}

const groups = ONLY ? { [ONLY]: MANIFEST[ONLY] } : MANIFEST;
if (!Object.values(groups).every(Boolean)) {
  console.error(`Unknown group "${ONLY}". Try: ${Object.keys(MANIFEST).join(', ')}`);
  process.exit(1);
}

const credits = [];
let downloaded = 0;
let kept = 0;
const failures = [];

console.log(`Openverse licence filter: ${LICENSES}\n`);

for (const [group, entries] of Object.entries(groups)) {
  console.log(`── ${group} ${'─'.repeat(40 - group.length)}`);

  for (const [relPath, queries, width, height] of entries) {
    const dest = resolve(IMG, relPath);

    if (existsSync(dest) && !FORCE) {
      console.log(`  · ${relPath} exists, kept`);
      kept += 1;
      continue;
    }

    let chosen = null;
    let chosenQuery = null;
    const rejected = { brand: 0, irrelevant: 0, small: 0, scene: 0 };

    // Collect every acceptable candidate across all query variants, best
    // (earliest) query first. We then try to download them in order and stop
    // at the first that actually works — a dead CDN must not lose the image.
    const candidates = [];

    for (const query of queries) {
      let results;
      try {
        results = await search(query);
      } catch (error) {
        console.log(`  ! ${relPath} — search failed for "${query}" (${error.message})`);
        continue;
      }

      for (const item of results) {
        if (brandIn(item)) {
          rejected.brand += 1;
          continue;
        }
        if (!bigEnough(item)) {
          rejected.small += 1;
          continue;
        }
        if (looksLikeScene(item)) {
          rejected.scene += 1;
          continue;
        }
        if (!isRelevant(item, query)) {
          rejected.irrelevant += 1;
          continue;
        }
        candidates.push({ item, query });
      }

      if (candidates.length >= 3) break; // enough fallbacks for one slot
      await sleep(300);
    }

    if (!candidates.length) {
      const why = [
        rejected.brand && `${rejected.brand} trademarked`,
        rejected.scene && `${rejected.scene} scene/graphic`,
        rejected.irrelevant && `${rejected.irrelevant} off-topic`,
        rejected.small && `${rejected.small} too small`,
      ]
        .filter(Boolean)
        .join(', ');
      failures.push({ relPath, why: why || 'no results at all' });
      console.log(`  ✖ ${relPath} — ${why || 'no results'}`);
      continue;
    }

    let saved = false;
    const tried = [];

    for (const { item, query } of candidates.slice(0, 4)) {
      try {
        const { buffer, from } = await fetchNormalised(item, width, height);
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, buffer);

        downloaded += 1;
        chosen = item;
        chosenQuery = query;
        console.log(
          `  ✔ ${relPath.padEnd(28)} ${kb(buffer.length).padStart(8)}  ${item.license}  q="${query}"  ← ${from}`
        );
        saved = true;
        break;
      } catch (error) {
        tried.push(error.message.slice(0, 50));
      }
    }

    if (!saved) {
      failures.push({ relPath, why: tried.join(' | ') || 'download failed' });
      console.log(`  ✖ ${relPath} — ${tried.join(' | ') || 'download failed'}`);
      continue;
    }

    credits.push({
      file: relPath,
      title: chosen.title ?? '',
      creator: chosen.creator ?? 'unknown',
      license: `${chosen.license} ${chosen.license_version ?? ''}`.trim(),
      source: chosen.source ?? '',
      page: chosen.foreign_landing_url ?? '',
      query: chosenQuery,
    });
  }
  console.log('');
}

/* --------------------------------------------------------------- credits file */

if (credits.length) {
  const stamp = new Date().toISOString().slice(0, 10);
  const lines = [
    '# Image credits',
    '',
    'Third-party photographs downloaded by `npm run assets:photos`.',
    '',
    'Source: [Openverse](https://openverse.org/) — licence filter `cc0,pdm`',
    '(public domain, so attribution is not legally required). Attribution is',
    'recorded anyway as good practice.',
    '',
    '> These are **representative stock photos, not photographs of the actual',
    '> product**, and trademarked products were rejected. Replace them with',
    '> real product photography before selling.',
    '',
    `Last updated: ${stamp}`,
    '',
    '| File | Title | Creator | Licence | Source |',
    '| --- | --- | --- | --- | --- |',
    ...credits.map(
      (c) =>
        `| \`${c.file}\` | ${String(c.title).replace(/\|/g, '/')} | ${c.creator} | ${c.license} | [link](${c.page}) |`
    ),
    '',
  ];

  writeFileSync(resolve(IMG, 'CREDITS.md'), lines.join('\n'), 'utf8');
  console.log(`Wrote CREDITS.md (${credits.length} entries).`);
}

console.log(`\nDone. downloaded=${downloaded} kept=${kept} failed=${failures.length}`);

if (failures.length) {
  console.log('\nNot downloaded — these keep whatever they already had (or nothing):');
  for (const f of failures) console.log(`  · ${f.relPath} — ${f.why}`);
  console.log(
    '\nThese images were NOT written. Review them, adjust the queries in this\n' +
      "script, or leave the generated SVG placeholders in place. Do NOT point\n" +
      'src/data/products.js at a file that does not exist — `npm run check:assets`\n' +
      'will fail the build.'
  );
}

process.exit(failures.length ? 1 : 0);