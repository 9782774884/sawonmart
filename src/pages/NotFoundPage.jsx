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