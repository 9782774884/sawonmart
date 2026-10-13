import { Link } from 'react-router-dom';

/**
 * Breadcrumb trail.
 *
 * Uses an ordered list wrapped in a labelled <nav>, which is the pattern
 * assistive tech expects. The current page is marked with aria-current="page"
 * and is not a link.
 */
export default function Breadcrumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol className="crumbs__list">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;

          return (
            <li key={item.label} className="crumbs__item">
              {isLast ? (
                <span className="crumbs__current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link className="crumbs__link" to={item.to}>
                    {item.label}
                  </Link>
                  <span className="crumbs__sep" aria-hidden="true">
                    ›
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}