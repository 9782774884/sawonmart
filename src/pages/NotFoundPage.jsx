import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import { useDocumentMeta } from '../hooks/useDocumentMeta.js';
import { SITE } from '../utils/constants.js';

/** 404 route — reachable from any unknown URL. */
export default function NotFoundPage() {
  const { pathname } = useLocation();

  useDocumentMeta(
    `Page nahi mila (404) | ${SITE.name}`,
    'Ye page nahi mila. Homepage se apni shopping jaari rakhein.'
  );

  /**
   * A 404 must be excluded from the index, and it must not publish a canonical.
   *
   * Because this is an SPA, a bad URL returns HTTP 200 with this page rendered
   * client-side. Without an explicit noindex the crawler sees a successful
   * response and can happily index every mistyped or stale link as real content.
   * `follow` still lets the crawler walk onward to the homepage.
   *
   * The homepage canonical is also removed for the duration. Leaving it in place
   * would combine `noindex` with a canonical pointing elsewhere — contradictory
   * signals, since a canonical invites indexing of that other URL. Both tags are
   * restored on the way out so the rest of the SPA is unaffected.
   */
  useEffect(() => {
    const setOrRestore = (node, name, value) => {
      const previous = node.getAttribute(name);
      if (value === null) node.removeAttribute(name);
      else node.setAttribute(name, value);
      return () => {
        if (previous === null) node.removeAttribute(name);
        else node.setAttribute(name, previous);
      };
    };

    const ensureMeta = (selector, attrs) => {
      let node = document.head.querySelector(selector);
      if (!node) {
        node = document.createElement('meta');
        Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
        document.head.appendChild(node);
      }
      return node;
    };

    const restore = [
      setOrRestore(ensureMeta('meta[name="robots"]', { name: 'robots' }), 'content', 'noindex, follow'),
      setOrRestore(document.head.querySelector('link[rel="canonical"]'), 'href', null),
      setOrRestore(document.head.querySelector('meta[property="og:url"]'), 'content', null),
    ];

    return () => restore.forEach((fn) => fn());
  }, []);

  return (
    <div className="container">
      <section className="notfound" aria-labelledby="notfound-heading">
        <p className="notfound__code t-eyebrow">Error 404</p>
        <h1 className="notfound__title" id="notfound-heading">
          Ye page nahi mila
        </h1>
        <p className="notfound__text t-text-muted">
          <code className="notfound__path">{pathname}</code> — shayad link purana ho gaya ya
          address mein typo hai.
        </p>

        <div className="notfound__actions">
          <Button as={Link} to="/" variant="primary" size="lg" iconLeft={<Icon name="chevronLeft" size={18} />}>
            Homepage par jaayein
          </Button>
          <Button href="/" variant="outline" size="lg">
            Shopping jaari rakhein
          </Button>
        </div>

        <ul className="notfound__links">
          <li>
            <Link to="/">Electronics</Link>
          </li>
          <li>
            <Link to="/">Fashion</Link>
          </li>
          <li>
            <Link to="/">Home &amp; Kitchen</Link>
          </li>
          <li>
            <Link to="/">Deals</Link>
          </li>
        </ul>
      </section>
    </div>
  );
}