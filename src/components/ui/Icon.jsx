/**
 * Inline SVG icon set.
 *
 * Why inline instead of an icon font or <img> sprites?
 *  - No extra network request, no FOUC.
 *  - Icons inherit `currentColor`, so they follow theming automatically.
 *  - `aria-hidden` + `focusable="false"` keeps them out of the a11y tree —
 *    the surrounding label/button name is what gets announced.
 */

const PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  cart: <><path d="M2.5 3h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.3h8.4a1.5 1.5 0 0 0 1.5-1.2L20 7H5.2" /><circle cx="9.5" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /></>,
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>,
  heart: <path d="M12 20s-7.5-4.7-7.5-9.6A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8C19.5 15.3 12 20 12 20z" />,
  star: <path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8z" />,
  chevronDown: <path d="m5 8 7 7 7-7" />,
  chevronLeft: <path d="m14 5-7 7 7 7" />,
  chevronRight: <path d="m10 5 7 7-7 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M3.5 6h17M3.5 12h17M3.5 18h17" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: <><path d="M4 7h16" /><path d="M9 7V4.5h6V7" /><path d="M6 7l1 13h10l1-13" /></>,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  bolt: <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z" />,
  truck: <><path d="M1.5 5.5h12v11h-12z" /><path d="M13.5 9h4l3 3.2v4.3h-7z" /><circle cx="6" cy="18.5" r="1.7" /><circle cx="17" cy="18.5" r="1.7" /></>,
  shield: <><path d="M12 2.8 4.5 5.6v6c0 4.6 3.1 8.2 7.5 9.6 4.4-1.4 7.5-5 7.5-9.6v-6z" /><path d="m8.8 12 2.3 2.3 4.2-4.6" /></>,
  headset: <><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><path d="M4 13h2.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5.5A1.5 1.5 0 0 1 4 17.5z" /><path d="M20 13h-2.5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h.5a1.5 1.5 0 0 0 1.5-1.5z" /></>,
  refresh: <><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4v5h-5" /></>,
  facebook: <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6A21 21 0 0 0 14.3 3.5c-2.4 0-4 1.45-4 4.1V9.9H7.6V13h2.7v8z" />,
  twitter: <path d="M20.5 6.3a7.4 7.4 0 0 1-2.14.59 3.73 3.73 0 0 0 1.64-2.06 7.5 7.5 0 0 1-2.37.9 3.73 3.73 0 0 0-6.36 3.4A10.6 10.6 0 0 1 3.7 5.15a3.73 3.73 0 0 0 1.15 4.98A3.7 3.7 0 0 1 3.1 9.65v.05a3.74 3.74 0 0 0 3 3.67 3.8 3.8 0 0 1-1.69.06 3.74 3.74 0 0 0 3.49 2.6A7.5 7.5 0 0 1 2.4 17.5a10.57 10.57 0 0 0 5.72 1.68c6.86 0 10.62-5.69 10.62-10.62 0-.16 0-.32-.01-.48a7.6 7.6 0 0 0 1.77-1.77z" />,
  instagram: <><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="16.9" cy="7.1" r="1.1" fill="currentColor" stroke="none" /></>,
  youtube: <><rect x="2.6" y="5.6" width="18.8" height="12.8" rx="4" /><path d="m10.4 9.4 5 2.6-5 2.6z" fill="currentColor" stroke="none" /></>,
  linkedin: <><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="3" /><path d="M7.4 10.4v7.2M7.4 7.3v.1M11.4 17.6v-7.2M11.4 13.2c0-1.6 1-2.8 2.5-2.8s2.5 1.2 2.5 2.8v4.4" /></>,
  bell: <><path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5z" /><path d="M10 18.5a2.2 2.2 0 0 0 4 0" /></>,
  whatsapp:
    <>
      {/* Solid glyph on purpose: the WhatsApp mark reads better as a filled
          shape than as an outline, especially at 24px. */}
      <path
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.38c0-4.54 3.7-8.23 8.24-8.23a8.23 8.23 0 0 1 0 16.47zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.09-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.49-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"
        fill="currentColor"
        stroke="none"
      />
    </>,
  pin: <><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></>,
  gift: <><rect x="3" y="8.5" width="18" height="4" rx="1" /><path d="M4.5 12.5V20h15v-7.5M12 8.5V20" /><path d="M12 8.5S10.8 4 8.4 4a2.2 2.2 0 0 0 0 4.5zM12 8.5S13.2 4 15.6 4a2.2 2.2 0 0 1 0 4.5z" /></>,
  wallet: <><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 9.5h18" /><circle cx="16.8" cy="14" r="1.2" fill="currentColor" stroke="none" /></>,
  filter: <path d="M3.5 6.5h17M6.5 12h11M10 17.5h4" />,
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
  arrowUp: <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />,
};

/**
 * @param {object} props
 * @param {keyof PATHS} props.name
 * @param {number}  [props.size=20]
 * @param {string}  [props.className]
 * @param {string}  [props.title] Supply only when the icon is meaningful on its own.
 */
export default function Icon({ name, size = 20, className = '', title, strokeWidth = 1.7 }) {
  const path = PATHS[name];

  if (!path) {
    if (import.meta.env.DEV) console.warn(`<Icon> unknown name: "${name}"`);
    return null;
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {path}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(PATHS);