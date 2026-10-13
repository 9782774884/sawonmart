import { useEffect } from 'react';

import { absoluteUrl } from '../utils/constants.js';

/**
 * Keeps the document head in sync with the current route.
 *
 * Covers <title>, the meta description, and — importantly — the canonical and
 * Open Graph URLs.
 *
 * Why the canonical has to be per-route: it is a hint that says "this page is
 * the real one, index it here". A single canonical pinned to the homepage tells
 * a crawler that every product page is a duplicate of `/`, which is precisely
 * how a catalogue ends up with only the homepage indexed. The homepage value
 * in index.html is only a pre-hydration fallback for the first paint.
 *
 * Each tag is written only if the page did not already declare one, and the
 * previous value is restored on unmount so navigating between routes cannot
 * leave a stale URL behind.
 */

/** Sets or updates one <meta> tag, remembering what it replaced. */
function upsertMeta(selector, attrs) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    Object.entries(attrs).forEach(([key, value]) => {
      if (key !== 'content') tag.setAttribute(key, value);
    });
    document.head.appendChild(tag);
  }

  const previous = Object.fromEntries(
    Object.keys(attrs)
      .map((key) => [key, tag.getAttribute(key)])
      .filter(([, value]) => value !== null)
  );

  Object.entries(attrs).forEach(([key, value]) => tag.setAttribute(key, value));

  return () => {
    if (Object.keys(previous).length === 0) {
      tag.remove();
      return;
    }
    Object.entries(previous).forEach(([key, value]) => {
      if (value === null) tag.removeAttribute(key);
      else tag.setAttribute(key, value);
    });
  };
}

/** Same idea for <link rel="canonical">, which is a link not a meta. */
function upsertCanonical(href) {
  let tag = document.head.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', 'canonical');
    document.head.appendChild(tag);
  }

  const previous = tag.getAttribute('href');
  tag.setAttribute('href', href);

  return () => {
    if (previous === null) tag.remove();
    else tag.setAttribute('href', previous);
  };
}

/**
 * @param {string} title     Route-level document title.
 * @param {string} [description] Meta description for this route.
 * @param {string} [path]    Site-relative path, e.g. '/product/sm-ph-01'.
 *                           Drives the canonical and og:url.
 * @param {string} [image]   Site-relative share image. Falls back to the
 *                           homepage banner.
 */
export function useDocumentMeta(title, description, path, image) {
  useEffect(() => {
    if (title) document.title = title;

    const cleanups = [];

    if (description) {
      cleanups.push(upsertMeta('meta[name="description"]', { name: 'description', content: description }));
    }

    // Only rewrite URL tags on a real path, so a page that does not care about
    // SEO inherits the homepage's values rather than claiming `/undefined`.
    if (path) {
      const url = absoluteUrl(path);
      cleanups.push(upsertCanonical(url));
      cleanups.push(upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url }));

      if (title) {
        cleanups.push(upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title }));
      }
    }

    if (image) {
      cleanups.push(
        upsertMeta('meta[property="og:image"]', { property: 'og:image', content: absoluteUrl(image) })
      );
    }

    return () => cleanups.forEach((fn) => fn());
  }, [title, description, path, image]);
}