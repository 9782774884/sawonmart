import { useEffect } from 'react';

/**
 * Keeps <title> and the meta description in sync with the current route.
 *
 * Why this is not done in the router: `document.title` is global state, so it
 * has to be set from a component that mounts per route. Doing it here keeps
 * the SEO concern out of the page components' markup.
 */
export function useDocumentMeta(title, description) {
  useEffect(() => {
    if (title) document.title = title;

    if (!description) return undefined;

    // Create the tag only if the page did not already declare one.
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }

    const previous = tag.getAttribute('content');
    tag.setAttribute('content', description);

    // Restore the previous value when leaving the route.
    return () => {
      if (previous !== null) tag.setAttribute('content', previous);
    };
  }, [title, description]);
}