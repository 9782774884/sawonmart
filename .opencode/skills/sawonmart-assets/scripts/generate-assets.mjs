/**
 * generate-assets.mjs
 * -----------------------------------------------------------------------------
 * Offline SVG placeholder generator for the Flipkart-style homepage.
 *
 * Why a generator?  So that every image lives in its own folder under
 * assets/images/<group>/ and can be regenerated at any time without opening
 * a design tool.  All output is plain, hand-editable SVG.
 *
 * Usage:  node tools/generate-assets.mjs
 * -----------------------------------------------------------------------------
 */

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Walk up from this file until we find the directory holding `package.json`.
 *
 * This script lives at .opencode/skills/sawonmart-assets/scripts/, so a fixed
 * `../../..` would silently break the moment the skill moves. Anchoring on
 * package.json keeps it correct wherever it is placed.
 */
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
// Vite copies everything in /public to the site root as-is.
const IMG = resolve(ROOT, 'public', 'assets', 'images');

/* ---------------------------------------------------------------- helpers */

const svgFile = (w, h, body, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none"${extra}>\n${body}\n</svg>\n`;

const write = (group, name, content) => {
  const dir = resolve(IMG, group);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, `${name}.svg`), content, 'utf8');
  return `${group}/${name}.svg`;
};

const R = (n) => Math.round(n * 100) / 100;

/* ------------------------------------------------------------- palettes */

const PALETTES = {
  blue:   { bg: '#e8f0fe', deep: '#1a49c4', mid: '#3f76e0', soft: '#b9cdf7' },
  teal:   { bg: '#e3f6f4', deep: '#0d6b62', mid: '#25988c', soft: '#a8ddd6' },
  violet: { bg: '#f0eafd', deep: '#4b2aa8', mid: '#7a55d8', soft: '#cdbcf4' },
  rose:   { bg: '#fdeaf0', deep: '#a31649', mid: '#d4427a', soft: '#f5b9cd' },
  amber:  { bg: '#fef3e0', deep: '#9a5b00', mid: '#dd8b12', soft: '#f8d79a' },
  green:  { bg: '#e9f7ec', deep: '#1c6b32', mid: '#33994d', soft: '#b3e0bd' },
  slate:  { bg: '#eef1f6', deep: '#2f3b52', mid: '#5a6a89', soft: '#c6cfdd' },
  sand:   { bg: '#f7f1e8', deep: '#6b4b23', mid: '#a1762f', soft: '#e0cda6' },
};

/* ==========================================================================
   PRODUCT SHAPES  — viewBox 400x400, drawn in a single accent colour so the
   generated file stays small and easy to restyle.
   ========================================================================== */

const SHAPES = {
  phone: (c) => `
  <rect x="146" y="96" width="108" height="208" rx="18" fill="${c.deep}"/>
  <rect x="156" y="110" width="88" height="166" rx="10" fill="${c.soft}"/>
  <rect x="182" y="100" width="36" height="6" rx="3" fill="${c.soft}"/>
  <circle cx="200" cy="290" r="7" fill="${c.soft}"/>
  <circle cx="200" cy="182" r="26" fill="${c.mid}"/>`,

  laptop: (c) => `
  <rect x="112" y="118" width="176" height="116" rx="10" fill="${c.deep}"/>
  <rect x="122" y="128" width="156" height="96" rx="6" fill="${c.soft}"/>
  <path d="M92 244h216l16 26a8 8 0 0 1-7 12H83a8 8 0 0 1-7-12z" fill="${c.mid}"/>
  <rect x="176" y="252" width="48" height="6" rx="3" fill="${c.soft}"/>`,

  headphones: (c) => `
  <path d="M104 214v-14a96 96 0 0 1 192 0v14" stroke="${c.deep}" stroke-width="20" stroke-linecap="round"/>
  <rect x="80" y="204" width="52" height="88" rx="24" fill="${c.mid}"/>
  <rect x="268" y="204" width="52" height="88" rx="24" fill="${c.mid}"/>
  <rect x="92" y="220" width="28" height="56" rx="14" fill="${c.soft}"/>
  <rect x="280" y="220" width="28" height="56" rx="14" fill="${c.soft}"/>`,

  watch: (c) => `
  <path d="M164 82h72l-8 74h-56z" fill="${c.mid}"/>
  <path d="M164 318h72l-8-74h-56z" fill="${c.mid}"/>
  <circle cx="200" cy="200" r="72" fill="${c.deep}"/>
  <circle cx="200" cy="200" r="56" fill="${c.bg}"/>
  <path d="M200 168v34l22 14" stroke="${c.mid}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="268" y="190" width="12" height="22" rx="6" fill="${c.mid}"/>`,

  tv: (c) => `
  <rect x="70" y="112" width="260" height="164" rx="12" fill="${c.deep}"/>
  <rect x="82" y="124" width="236" height="128" rx="6" fill="${c.soft}"/>
  <rect x="176" y="276" width="48" height="22" fill="${c.mid}"/>
  <rect x="140" y="298" width="120" height="14" rx="7" fill="${c.mid}"/>`,

  camera: (c) => `
  <rect x="82" y="142" width="236" height="150" rx="18" fill="${c.deep}"/>
  <rect x="150" y="112" width="96" height="34" rx="10" fill="${c.mid}"/>
  <circle cx="200" cy="217" r="58" fill="${c.mid}"/>
  <circle cx="200" cy="217" r="40" fill="${c.bg}"/>
  <circle cx="200" cy="217" r="20" fill="${c.deep}"/>
  <circle cx="278" cy="166" r="10" fill="${c.soft}"/>`,

  speaker: (c) => `
  <rect x="136" y="86" width="128" height="228" rx="26" fill="${c.deep}"/>
  <circle cx="200" cy="146" r="32" fill="${c.mid}"/>
  <circle cx="200" cy="146" r="14" fill="${c.soft}"/>
  <circle cx="200" cy="240" r="42" fill="${c.mid}"/>
  <circle cx="200" cy="240" r="20" fill="${c.soft}"/>`,

  shirt: (c) => `
  <path d="M152 96l48 22 48-22 74 40-30 52-32-18v134H140V170l-32 18-30-52z" fill="${c.deep}"/>
  <path d="M176 96a24 24 0 0 0 48 0" fill="${c.soft}"/>
  <rect x="176" y="196" width="48" height="12" rx="6" fill="${c.soft}"/>`,

  shoes: (c) => `
  <path d="M74 268c0-26 8-52 22-72l34 26 44-30 46 34c34 22 68 34 84 46 12 9 20 22 20 36H74z" fill="${c.deep}"/>
  <path d="M74 302h250v22a10 10 0 0 1-10 10H84a10 10 0 0 1-10-10z" fill="${c.mid}"/>
  <path d="M156 210l34 26M186 190l46 32" stroke="${c.soft}" stroke-width="12" stroke-linecap="round"/>`,

  bag: (c) => `
  <path d="M138 168h124l22 148H116z" fill="${c.deep}"/>
  <path d="M160 178c0-38 18-62 40-62s40 24 40 62" stroke="${c.mid}" stroke-width="16" stroke-linecap="round"/>
  <rect x="176" y="216" width="48" height="16" rx="8" fill="${c.soft}"/>`,

  perfume: (c) => `
  <rect x="172" y="82" width="56" height="46" rx="8" fill="${c.mid}"/>
  <path d="M164 128h72l18 60v132a14 14 0 0 1-14 14H160a14 14 0 0 1-14-14V188z" fill="${c.deep}"/>
  <rect x="172" y="196" width="56" height="104" rx="8" fill="${c.soft}"/>`,

  microwave: (c) => `
  <rect x="66" y="128" width="268" height="164" rx="16" fill="${c.deep}"/>
  <rect x="86" y="148" width="150" height="124" rx="10" fill="${c.soft}"/>
  <circle cx="290" cy="176" r="18" fill="${c.mid}"/>
  <rect x="256" y="216" width="60" height="14" rx="7" fill="${c.mid}"/>
  <rect x="256" y="248" width="60" height="14" rx="7" fill="${c.mid}"/>`,

  fridge: (c) => `
  <rect x="112" y="74" width="176" height="252" rx="18" fill="${c.deep}"/>
  <path d="M112 168h176" stroke="${c.bg}" stroke-width="8"/>
  <rect x="132" y="106" width="10" height="42" rx="5" fill="${c.soft}"/>
  <rect x="132" y="200" width="10" height="70" rx="5" fill="${c.soft}"/>
  <rect x="258" y="200" width="10" height="70" rx="5" fill="${c.soft}"/>`,

  ac: (c) => `
  <rect x="70" y="118" width="260" height="112" rx="22" fill="${c.deep}"/>
  <path d="M96 168h208" stroke="${c.soft}" stroke-width="12" stroke-linecap="round"/>
  <circle cx="312" cy="146" r="8" fill="${c.mid}"/>
  <path d="M140 254c0 18-16 18-16 36M200 254c0 18-16 18-16 36M260 254c0 18-16 18-16 36"
        stroke="${c.mid}" stroke-width="12" stroke-linecap="round"/>`,

  monitor: (c) => `
  <rect x="74" y="98" width="252" height="164" rx="12" fill="${c.deep}"/>
  <rect x="88" y="112" width="224" height="128" rx="6" fill="${c.soft}"/>
  <rect x="180" y="262" width="40" height="26" fill="${c.mid}"/>
  <rect x="140" y="288" width="120" height="16" rx="8" fill="${c.mid}"/>`,

  keyboard: (c) => `
  <rect x="58" y="132" width="284" height="140" rx="16" fill="${c.deep}"/>
  <rect x="76" y="150" width="248" height="104" rx="8" fill="${c.soft}"/>
  <g fill="${c.mid}">
    <rect x="92" y="164" width="26" height="18" rx="5"/><rect x="126" y="164" width="26" height="18" rx="5"/>
    <rect x="160" y="164" width="26" height="18" rx="5"/><rect x="194" y="164" width="26" height="18" rx="5"/>
    <rect x="228" y="164" width="26" height="18" rx="5"/><rect x="262" y="164" width="46" height="18" rx="5"/>
    <rect x="92" y="192" width="34" height="18" rx="5"/><rect x="134" y="192" width="26" height="18" rx="5"/>
    <rect x="168" y="192" width="26" height="18" rx="5"/><rect x="202" y="192" width="26" height="18" rx="5"/>
    <rect x="236" y="192" width="72" height="18" rx="5"/>
    <rect x="92" y="220" width="46" height="18" rx="5"/><rect x="146" y="220" width="130" height="18" rx="5"/>
    <rect x="284" y="220" width="40" height="18" rx="5"/>
  </g>`,

  mouse: (c) => `
  <path d="M200 84c52 0 78 40 78 96v44c0 56-26 96-78 96s-78-40-78-96v-44c0-56 26-96 78-96z" fill="${c.deep}"/>
  <path d="M200 84v104" stroke="${c.bg}" stroke-width="8"/>
  <rect x="188" y="112" width="24" height="52" rx="12" fill="${c.soft}"/>`,

  book: (c) => `
  <rect x="92" y="118" width="216" height="46" rx="8" fill="${c.deep}"/>
  <rect x="92" y="176" width="216" height="46" rx="8" fill="${c.mid}"/>
  <rect x="92" y="234" width="216" height="46" rx="8" fill="${c.deep}"/>
  <rect x="92" y="118" width="16" height="162" fill="${c.soft}"/>
  <rect x="118" y="188" width="90" height="10" rx="5" fill="${c.soft}"/>
  <rect x="118" y="246" width="60" height="10" rx="5" fill="${c.soft}"/>`,

  kettle: (c) => `
  <path d="M132 168h136v116a26 26 0 0 1-26 26H158a26 26 0 0 1-26-26z" fill="${c.deep}"/>
  <path d="M268 194l50-26v56l-50-8z" fill="${c.mid}"/>
  <path d="M144 168c0-38 20-56 56-56s56 18 56 56" stroke="${c.mid}" stroke-width="14"/>
  <rect x="150" y="200" width="100" height="46" rx="8" fill="${c.soft}"/>`,

  blender: (c) => `
  <path d="M148 106h104l-18 122H166z" fill="${c.deep}"/>
  <path d="M152 168h96l-14 60h-68z" fill="${c.soft}"/>
  <rect x="126" y="238" width="148" height="76" rx="16" fill="${c.mid}"/>
  <circle cx="200" cy="276" r="22" fill="${c.bg}"/>`,

  toy: (c) => `
  <circle cx="140" cy="132" r="34" fill="${c.mid}"/>
  <circle cx="260" cy="132" r="34" fill="${c.mid}"/>
  <circle cx="200" cy="200" r="84" fill="${c.deep}"/>
  <circle cx="174" cy="186" r="13" fill="${c.bg}"/>
  <circle cx="226" cy="186" r="13" fill="${c.bg}"/>
  <ellipse cx="200" cy="222" rx="20" ry="14" fill="${c.soft}"/>
  <rect x="176" y="272" width="48" height="52" rx="14" fill="${c.mid}"/>`,

  helmet: (c) => `
  <path d="M84 250c0-72 52-130 116-130s116 58 116 130z" fill="${c.deep}"/>
  <path d="M160 250v-58a40 40 0 0 1 80 0v58z" fill="${c.bg}"/>
  <rect x="76" y="248" width="248" height="26" rx="13" fill="${c.mid}"/>
  <path d="M124 178l24-34M200 160v-38M276 178l-24-34"
        stroke="${c.soft}" stroke-width="12" stroke-linecap="round"/>`,

  printer: (c) => `
  <rect x="128" y="94" width="144" height="60" rx="8" fill="${c.deep}"/>
  <rect x="82" y="150" width="236" height="116" rx="16" fill="${c.mid}"/>
  <rect x="128" y="200" width="144" height="106" rx="8" fill="${c.deep}"/>
  <rect x="148" y="226" width="104" height="12" rx="6" fill="${c.soft}"/>
  <rect x="148" y="252" width="104" height="12" rx="6" fill="${c.soft}"/>
  <circle cx="282" cy="182" r="12" fill="${c.bg}"/>`,

  chair: (c) => `
  <path d="M132 96h136a16 16 0 0 1 16 16v92a16 16 0 0 1-16 16H132a16 16 0 0 1-16-16v-92a16 16 0 0 1 16-16z" fill="${c.deep}"/>
  <rect x="116" y="236" width="168" height="34" rx="14" fill="${c.mid}"/>
  <rect x="192" y="270" width="16" height="34" fill="${c.mid}"/>
  <path d="M136 304h128M200 304l-40 46M200 304l40 46" stroke="${c.mid}" stroke-width="14" stroke-linecap="round"/>
  <rect x="152" y="120" width="96" height="80" rx="10" fill="${c.soft}"/>`,

  shoeBox: (c) => `
  <path d="M96 168l104-48 104 48v128l-104 48-104-48z" fill="${c.deep}"/>
  <path d="M96 168l104 48 104-48M200 216v128" stroke="${c.soft}" stroke-width="10"/>
  <path d="M148 144l104 48" stroke="${c.mid}" stroke-width="10"/>`,

  cycle: (c) => `
  <circle cx="118" cy="266" r="62" stroke="${c.deep}" stroke-width="16"/>
  <circle cx="282" cy="266" r="62" stroke="${c.deep}" stroke-width="16"/>
  <path d="M118 266l70-116 44 116M188 150h58l36 116M164 266h52" stroke="${c.mid}" stroke-width="14"
        stroke-linecap="round" stroke-linejoin="round"/>`,

  wallet: (c) => `
  <rect x="76" y="140" width="248" height="150" rx="18" fill="${c.deep}"/>
  <path d="M76 168a14 14 0 0 1 14-14h220v36H90a14 14 0 0 0-14 14z" fill="${c.mid}"/>
  <rect x="236" y="196" width="88" height="52" rx="12" fill="${c.soft}"/>
  <circle cx="266" cy="222" r="10" fill="${c.deep}"/>`,
};

/* ------------------------------------------------ product placeholder set */

const PRODUCTS = [
  ['product/phone-1',      'phone',      'blue'],
  ['product/phone-2',      'phone',      'violet'],
  ['product/laptop-1',     'laptop',     'slate'],
  ['product/laptop-2',     'laptop',     'blue'],
  ['product/headphone-1',  'headphones', 'rose'],
  ['product/headphone-2',  'headphones', 'slate'],
  ['product/watch-1',      'watch',      'teal'],
  ['product/watch-2',      'watch',      'amber'],
  ['product/tv-1',         'tv',         'slate'],
  ['product/camera-1',     'camera',     'slate'],
  ['product/speaker-1',    'speaker',    'violet'],
  ['product/keyboard-1',   'keyboard',   'slate'],
  ['product/mouse-1',      'mouse',      'violet'],
  ['product/monitor-1',    'monitor',    'blue'],
  ['product/shirt-1',      'shirt',      'blue'],
  ['product/shirt-2',      'shirt',      'rose'],
  ['product/shirt-3',      'shirt',      'green'],
  ['product/shoes-1',      'shoes',      'sand'],
  ['product/shoes-2',      'shoes',      'violet'],
  ['product/bag-1',        'bag',        'rose'],
  ['product/wallet-1',     'wallet',     'sand'],
  ['product/perfume-1',    'perfume',    'amber'],
  ['product/perfume-2',    'perfume',    'rose'],
  ['product/microwave-1',  'microwave',  'slate'],
  ['product/fridge-1',     'fridge',     'blue'],
  ['product/ac-1',         'ac',         'teal'],
  ['product/kettle-1',     'kettle',     'sand'],
  ['product/blender-1',    'blender',    'rose'],
  ['product/toy-1',        'toy',        'amber'],
  ['product/book-1',       'book',       'green'],
  ['product/book-2',       'book',       'blue'],
  ['product/helmet-1',     'helmet',     'rose'],
  ['product/printer-1',    'printer',    'slate'],
  ['product/chair-1',      'chair',      'amber'],
  ['product/sofa-1',       'shoeBox',    'sand'],
  ['product/box-1',        'shoeBox',    'blue'],
  ['product/cycle-1',      'cycle',      'teal'],
];

/* ----------------------------------------------------- category glyph set */

const CATEGORIES = {
  fashion:  `<path d="M74 96l52 26 52-26 62 36-26 46-30-16v146H98V162l-30 16-26-46z" fill="currentColor"/><path d="M126 96a26 26 0 0 0 52 0" fill="none" stroke="#fff" stroke-width="12"/>`,
  electronics: `<rect x="46" y="88" width="92" height="168" rx="16" fill="currentColor"/><rect x="162" y="130" width="96" height="126" rx="12" fill="currentColor"/><rect x="60" y="102" width="64" height="128" rx="8" fill="#fff" opacity=".55"/><rect x="176" y="144" width="68" height="80" rx="6" fill="#fff" opacity=".55"/>`,
  home: `<path d="M50 154L150 62l100 92v112a12 12 0 0 1-12 12H62a12 12 0 0 1-12-12z" fill="currentColor"/><rect x="122" y="196" width="56" height="82" rx="6" fill="#fff" opacity=".6"/>`,
  beauty: `<path d="M150 62c-14 44-14 78 0 104 10 18 10 40 4 62-8 28-4 54 22 60 42 10 74-16 74-58 0-40-32-62-44-90-12-28-12-52 0-78z" fill="currentColor" transform="translate(-30 0)"/>`,
  toys: `<circle cx="104" cy="106" r="30" fill="currentColor"/><circle cx="196" cy="106" r="30" fill="currentColor"/><circle cx="150" cy="166" r="76" fill="currentColor"/><circle cx="126" cy="152" r="12" fill="#fff" opacity=".7"/><circle cx="174" cy="152" r="12" fill="#fff" opacity=".7"/><ellipse cx="150" cy="192" rx="18" ry="13" fill="#fff" opacity=".7"/>`,
  groceries: `<path d="M76 92h148l-14 176H90z" fill="currentColor"/><path d="M112 92c0-24 16-38 38-38s38 14 38 38" fill="none" stroke="currentColor" stroke-width="14"/><path d="M112 154h76M110 196h80" stroke="#fff" stroke-width="12" opacity=".6"/>`,
  travel: `<path d="M150 54c40 0 74 34 74 82v22h-18l-22 62h-68l-22-62H76v-22c0-48 34-82 74-82z" fill="currentColor"/><rect x="112" y="120" width="76" height="62" rx="10" fill="#fff" opacity=".55"/><path d="M150 54v66M112 158h76" stroke="currentColor" stroke-width="10"/>`,
  topOffers: `<path d="M150 46l30 62 68 10-49 48 12 68-61-32-61 32 12-68-49-48 68-10z" fill="currentColor"/>`,
  sports: `<circle cx="98" cy="176" r="56" stroke="currentColor" stroke-width="14" fill="none"/><circle cx="202" cy="176" r="56" stroke="currentColor" stroke-width="14" fill="none"/><path d="M98 176l52-88h44l52 88M150 88h44M128 176h44" stroke="currentColor" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  groceryFresh: `<path d="M150 66c34 22 58 52 58 84 0 34-26 52-58 52s-58-18-58-52c0-32 24-62 58-84z" fill="currentColor"/><path d="M150 66v136" stroke="#fff" stroke-width="10" opacity=".6"/><path d="M150 210v26" stroke="currentColor" stroke-width="12" stroke-linecap="round"/>`,
};

const CATEGORY_COLORS = {
  fashion: '#f43f5e',
  electronics: '#2874f0',
  home: '#0f9d58',
  beauty: '#e91e8c',
  toys: '#f0a020',
  groceries: '#7c4dff',
  travel: '#00a3bf',
  topOffers: '#ff4747',
  sports: '#12a3c4',
  groceryFresh: '#68a80f',
};

/* --------------------------------------------------------- brand wordmarks */

const BRANDS = [
  ['brand/boat',       'boAt',            '#c8102e'],
  ['brand/lego',       'LEGO',            '#e3000b'],
  ['brand/pepsi',      'pepsi',           '#0d47a1'],
  ['brand/amazon',     'amazon',          '#232f3e'],
  ['brand/adidas',     'adidas',          '#111111'],
  ['brand/nike',       'NIKE',            '#111111'],
  ['brand/mi',         'Mi',              '#ff6900'],
  ['brand/samsung',    'SAMSUNG',         '#1428a0'],
  ['brand/sony',       'SONY',            '#000000'],
  ['brand/dell',       'DELL',            '#007db8'],
  ['brand/realme',     'realme',          '#ffc915'],
  ['brand/puma',       'PUMA',            '#e4002b'],
];

/* --------------------------------------------------------------- banners */

const bannerPalettes = [
  ['#2874f0', '#0b3fa8', '#7db3ff'],
  ['#ff4747', '#b31217', '#ffb3b3'],
  ['#00a3bf', '#00566b', '#9ce8f2'],
  ['#f0a020', '#a45c05', '#ffdfa8'],
  ['#7c4dff', '#3b1a86', '#cdbaff'],
];

function heroBanner(i) {
  const [a, b, c] = bannerPalettes[i % bannerPalettes.length];
  const blobs = [];
  for (let n = 0; n < 7; n++) {
    const cx = 180 + n * 210 + (i * 60) % 90;
    const cy = 120 + ((n * 137 + i * 71) % 380);
    const r = 70 + ((n * 53 + i * 29) % 150);
    blobs.push(
      `<circle cx="${R(cx)}" cy="${R(cy)}" r="${r}" fill="${c}" opacity="${R(0.08 + (n % 3) * 0.05)}"/>`
    );
  }
  return svgFile(
    1600,
    600,
    `<defs>
  <linearGradient id="bg${i}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${a}"/>
    <stop offset="1" stop-color="${b}"/>
  </linearGradient>
  <pattern id="grid${i}" width="44" height="44" patternUnits="userSpaceOnUse">
    <path d="M44 0H0v44" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="1"/>
  </pattern>
</defs>
<rect width="1600" height="600" fill="url(#bg${i})"/>
<rect width="1600" height="600" fill="url(#grid${i})"/>
${blobs.join('\n')}
<path d="M0 470c260-70 420 40 700-20s520-120 900-40v190H0z" fill="#000" opacity=".14"/>
<circle cx="1290" cy="300" r="180" fill="#fff" opacity=".08"/>
<circle cx="1320" cy="272" r="96" fill="#fff" opacity=".12"/>`,
    ' preserveAspectRatio="xMidYMid slice"'
  );
}

/* -------------------------------------------------- small promo strip tiles */

const PROMOS = [
  ['promo/promo-1', 'linear-gradient(135deg,#2874f0,#0b3fa8)'],
  ['promo/promo-2', 'linear-gradient(135deg,#ff4747,#b31217)'],
  ['promo/promo-3', 'linear-gradient(135deg,#00a3bf,#00566b)'],
  ['promo/promo-4', 'linear-gradient(135deg,#f0a020,#a45c05)'],
  ['promo/promo-5', 'linear-gradient(135deg,#7c4dff,#3b1a86)'],
  ['promo/promo-6', 'linear-gradient(135deg,#0f9d58,#065f36)'],
];

const promoTile = (grad, i) => {
  const dots = Array.from({ length: 26 }, (_, n) => {
    const x = 30 + ((n * 137 + i * 61) % 460);
    const y = 24 + ((n * 91 + i * 43) % 200);
    return `<circle cx="${x}" cy="${y}" r="${4 + (n % 4) * 3}" fill="#fff" opacity=".10"/>`;
  }).join('\n');
  return svgFile(
    520,
    250,
    `<defs><linearGradient id="p${i}" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="${grad.match(/#\w{6}/)[0]}"/>
  <stop offset="1" stop-color="${grad.match(/#\w{6}/g)[1]}"/>
</linearGradient></defs>
<rect width="520" height="250" rx="8" fill="url(#p${i})"/>
${dots}
<path d="M0 190c120-40 210 20 330-14s180-52 260-30v104H0z" fill="#000" opacity=".16"/>
<circle cx="430" cy="70" r="86" fill="#fff" opacity=".10"/>
<rect x="34" y="150" width="230" height="18" rx="9" fill="#fff" opacity=".55"/>
<rect x="34" y="182" width="150" height="14" rx="7" fill="#fff" opacity=".35"/>`,
    ' preserveAspectRatio="xMidYMid slice"'
  );
};

/* ------------------------------------------------------------ logo + misc */

const logoMark = () =>
  svgFile(
    64,
    64,
    `<defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#2874f0"/><stop offset="1" stop-color="#0b3fa8"/>
</linearGradient></defs>
<rect width="64" height="64" rx="16" fill="url(#lg)"/>
<path d="M18 22h7v20h-7zM29 14h7v28h-7zM40 26h7v16h-7z" fill="#fff"/>`,
    ' role="img"'
  );

const avatarPlaceholder = (hue, letter) =>
  svgFile(
    96,
    96,
    `<defs><linearGradient id="av" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="${hue}"/><stop offset="1" stop-color="#101c33"/>
</linearGradient></defs>
<rect width="96" height="96" rx="48" fill="url(#av)"/>
<circle cx="48" cy="38" r="16" fill="#fff" opacity=".9"/>
<path d="M18 84a30 30 0 0 1 60 0z" fill="#fff" opacity=".9"/>
<text x="48" y="52" font-family="system-ui,sans-serif" font-size="0" fill="none">${letter}</text>`,
    ' role="img"'
  );

const favicon = () =>
  svgFile(
    32,
    32,
    `<rect width="32" height="32" rx="8" fill="#2874f0"/>
<path d="M9 11h3.5v10H9zM14.2 7h3.5v14h-3.5zM20 13h3.5v8H20z" fill="#fff"/>`,
    ' role="img"'
  );

/* ------------------------------------------------------------------ main */

const made = [];

for (const [path, shape, palName] of PRODUCTS) {
  const c = PALETTES[palName];
  const body = `
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${c.bg}"/><stop offset="1" stop-color="#ffffff"/>
  </linearGradient>
</defs>
<rect width="400" height="400" fill="url(#g)"/>
<circle cx="330" cy="76" r="96" fill="${c.soft}" opacity=".35"/>
<circle cx="72" cy="330" r="70" fill="${c.soft}" opacity=".3"/>
${SHAPES[shape](c)}`;
  made.push(write('products', path.split('/')[1], svgFile(400, 400, body, ' role="img"')));
}

for (const [name, glyph] of Object.entries(CATEGORIES)) {
  const color = CATEGORY_COLORS[name];
  const body = `
<circle cx="150" cy="150" r="150" fill="${color}" opacity=".12"/>
<circle cx="150" cy="150" r="118" fill="${color}"/>
<g transform="translate(0,-6)">${glyph}</g>`;
  made.push(write('categories', name, svgFile(300, 300, body, ' role="img"')));
}

for (const [path, label, color] of BRANDS) {
  const body = `
<rect width="200" height="80" rx="10" fill="#fff"/>
<text x="100" y="52" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,sans-serif"
      font-size="30" font-weight="700" letter-spacing="${label.length > 6 ? -1 : 2}"
      fill="${color}">${label}</text>`;
  made.push(write('brands', path.split('/')[1], svgFile(200, 80, body, ' role="img"')));
}

bannerPalettes.forEach((_, i) => made.push(write('banners', `hero-${i + 1}`, heroBanner(i))));
PROMOS.forEach(([path, grad], i) => made.push(write('banners', path.split('/')[1], promoTile(grad, i))));

made.push(write('brand', 'logo-mark', logoMark()));
made.push(write('brand', 'favicon', favicon()));
[
  ['avatar-a', '#2874f0', 'A'],
  ['avatar-b', '#7c4dff', 'R'],
  ['avatar-c', '#0f9d58', 'S'],
].forEach(([n, hue, l]) => made.push(write('brand', n, avatarPlaceholder(hue, l))));

console.log(`✔ ${made.length} SVG assets generated under public/assets/images/`);
made.forEach((m) => console.log(`  · public/assets/images/${m}`));