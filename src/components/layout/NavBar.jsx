import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import { NAV_LINKS, NAV_MENUS } from '../../data/site.js';
import { cx } from '../../utils/format.js';

/**
 * Category navigation bar with mega-menus.
 *
 * Keyboard/AT behaviour:
 *  - Each item is a <button> with aria-expanded / aria-controls.
 *  - Panels close on Escape and on blur leaving the bar.
 *  - The trigger exposes `aria-haspopup="true"`.
 */
export default function NavBar() {
  const [openId, setOpenId] = useState(null);

  const close = () => setOpenId(null);

  return (
    <nav
      className={cx('navbar', openId && 'is-open')}
      aria-label="Category navigation"
      onBlur={(event) => {
        // Close when focus leaves the whole bar (relatedTarget is outside it).
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') close();
      }}
    >
      <div className="container navbar__inner">
        <ul className="navbar__list">
          {NAV_LINKS.map((link) => {
            const panelId = `nav-panel-${link.id}`;
            const isOpen = openId === link.id;
            const columns = NAV_MENUS[link.id];

            return (
              <li key={link.id} className="navbar__item">
                <button
                  type="button"
                  className={cx('navbar__trigger', isOpen && 'is-active')}
                  aria-expanded={isOpen}
                  aria-controls={columns ? panelId : undefined}
                  aria-haspopup={columns ? 'true' : undefined}
                  onClick={() => setOpenId(isOpen ? null : link.id)}
                  onMouseEnter={() => columns && setOpenId(link.id)}
                >
                  {link.label}
                  {columns ? <Icon name="chevronDown" size={14} /> : null}
                </button>

                {columns ? (
                  <div
                    id={panelId}
                    className="megamenu"
                    hidden={!isOpen}
                    onMouseLeave={close}
                  >
                    <div className="megamenu__inner">
                      {columns.map((column) => (
                        <div key={column.heading} className="megamenu__col">
                          <p className="megamenu__heading">{column.heading}</p>
                          <ul className="megamenu__links">
                            {column.links.map((item) => (
                              <li key={item}>
                                <a href={`#${link.id}-${item.toLowerCase().replace(/\s+/g, '-')}`}>
                                  {item}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      <div className="megamenu__promo">
                        <img src="/assets/images/banners/promo-1.svg" alt="" width="220" height="105" />
                        <p className="megamenu__promo-title">EMI 0% par shopping</p>
                        <p className="megamenu__promo-text t-text-muted">
                          Selected banks par 6 mahine tak EMI
                        </p>
                        <a className="link" href="#emi">
                          Jaankar dekhein
                        </a>
                      </div>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>

        <a className="navbar__flame u-hide-sm" href="#deals">
          <Icon name="bolt" size={16} />
          <span>Deals</span>
        </a>
      </div>
    </nav>
  );
}