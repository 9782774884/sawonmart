/**
 * verify-assets.mjs
 * -----------------------------------------------------------------------------
 * Fails the build if any image referenced from source does not exist under
 * public/assets/.
 *
 * Why this exists: images are referenced as plain strings in data files and
 * JSX, so adding a product with a typo'd `image:` value produces a silently
 * broken <img> at runtime — nothing warns you at build time. This turns that
 * into a hard error.
 *
 * Usage:  node tools/verify-assets.mjs
 * -----------------------------------------------------------------------------
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Walk up to the directory holding package.json — see generate-assets.mjs. */
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
  throw new Error('Could not locate the project root (no package.json found above this script).');
}

const ROOT = findProjectRoot(dirname(fileURLToPath(import.meta.url)));
const SRC = join(ROOT, 'src');
const PUBLIC = join(ROOT, 'public');

const EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.html', '.css']);

/* ---------------------------------------------------------------- helpers */

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (EXTENSIONS.has(full.slice(full.lastIndexOf('.')))) out.push(full);
  }
  return out;
}

/** Pulls every "/assets/images/..." literal out of a source file. */
function referencedPaths(text) {
  const found = new Set();

  // Template-literal paths such as `${product.image}` are resolved separately
  // (they are prefixes, not complete filenames), so skip anything with `${`.
  for (const m of text.matchAll(/["'`](\/assets\/images\/[^"'`\s]+)["'`]/g)) {
    if (!m[1].includes('${')) found.add(m[1]);
  }

  // Prefixes used with dynamic segments: /assets/images/products/${...}
  for (const m of text.matchAll(/["'`](\/assets\/images\/[A-Za-z0-9_\-/]+)\$\{/g)) {
    found.add(`${m[1]}`); // marker: prefix, checked as a directory below
  }

  return found;
}

/**
 * Catches the bulk of our references: data files store bare group-relative
 * paths (image: 'products/phone-1.svg') that get prefixed at render time by
 * `/assets/images/${image}`. Verifying these is what actually protects the
 * product grid, the carousels and the search thumbnails.
 */
const GROUPS = ['products', 'banners', 'brands', 'categories', 'brand'];

function referencedDataImages(text) {
  const found = new Set();
  for (const m of text.matchAll(/image:\s*'([^']+\.svg)'/g)) {
    found.add(m[1]);
  }
  // Explicit src attributes in JSX, e.g. src="/assets/images/banners/hero-1.svg"
  for (const m of text.matchAll(/["'`](\/assets\/images\/[A-Za-z0-9_\-/]+\.svg)["'`]/g)) {
    found.add(m[1].replace(/^\/assets\/images\//, ''));
  }
  return [...found].filter((p) => GROUPS.some((g) => p.startsWith(`${g}/`)));
}

/* ------------------------------------------------------------------- main */

const files = [...walk(SRC), join(ROOT, 'index.html')];

const missing = [];
const dynamicPrefixes = new Set();
let checked = 0;

for (const file of files) {
  const text = readFileSync(file, 'utf8');

  for (const ref of referencedPaths(text)) {
    const rel = relative(ROOT, file);

    if (text.includes(`\`${ref}\${`)) {
      dynamicPrefixes.add(ref);
      continue;
    }

    checked += 1;
    const onDisk = join(PUBLIC, ref.replace(/^\//, ''));
    if (!existsSync(onDisk)) missing.push({ ref, rel });
  }

  for (const ref of referencedDataImages(text)) {
    checked += 1;
    if (!existsSync(join(PUBLIC, 'assets', 'images', ref))) {
      missing.push({ ref: `/assets/images/${ref}`, rel: relative(ROOT, file) });
    }
  }
}

// Every dynamic prefix must at least be a real directory.
for (const prefix of dynamicPrefixes) {
  const dir = join(PUBLIC, prefix.replace(/^\//, ''));
  if (!existsSync(dir)) {
    missing.push({ ref: `${prefix}*`, rel: '(dynamic prefix)' });
    continue;
  }
  const files_ = readdirSync(dir).filter((f) => f.endsWith('.svg'));
  if (files_.length === 0) {
    missing.push({ ref: `${prefix}*`, rel: '(dynamic prefix has no files)' });
  }
}

/* ---------------------------------------------------------------- report */

console.log(`Checked ${checked} static image reference(s) across ${files.length} source file(s).`);
console.log(`Checked ${dynamicPrefixes.size} dynamic image prefix(es).`);

if (missing.length === 0) {
  console.log('✔ Every referenced image exists under public/assets/.');
  process.exit(0);
}

console.error(`\n✖ ${missing.length} missing image reference(s):\n`);
for (const { ref, rel } of missing) {
  console.error(`  ${ref}\n      referenced in ${rel}`);
}
console.error('\nRun `npm run assets` to generate them, or fix the path.\n');
process.exit(1);