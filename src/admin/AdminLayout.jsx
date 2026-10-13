import { Suspense, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import { cx } from '../utils/format.js';
import { SITE } from '../utils/constants.js';
import { useAdmin } from './data/store.js';

/**
 * Sidebar modules, exactly as proposed:
 * Dashboard, Products, Pricing, Orders, Inventory, Customers, Staff & Roles,
 * Shipping, Payments, Marketing, Distributors, Reports, Security, Settings.
 *
 * `phase` records what is genuinely built. Phase 2 and 3 modules route to a
 * page that says so plainly rather than pretending to work.
 */
export const MODULES = [
  { to: '/admin', label: 'Dashboard', icon: 'grid', end: true, phase: 1 },
  { to: '/admin/products', label: 'Products', icon: 'grid', phase: 1 },
  { to: '/admin/pricing', label: 'Pricing', icon: 'wallet', phase: 1 },
  { to: '/admin/orders', label: 'Orders', icon: 'truck', phase: 1 },
  { to: '/admin/inventory', label: 'Inventory', icon: 'box', phase: 1 },
  { to: '/admin/customers', label: 'Customers', icon: 'user', phase: 1 },
  { to: '/admin/staff', label: 'Staff & Roles', icon: 'shield', phase: 1 },
  { to: '/admin/shipping', label: 'Shipping', icon: 'truck', phase: 2 },
  { to: '/admin/payments', label: 'Payments', icon: 'wallet', phase: 2 },
  { to: '/admin/marketing', label: 'Marketing', icon: 'gift', phase: 2 },
  { to: '/admin/distributors', label: 'Distributors', icon: 'refresh', phase: 3 },
  { to: '/admin/reports', label: 'Reports', icon: 'grid', phase: 1 },
  { to: '/admin/security', label: 'Security', icon: 'shield', phase: 2 },
  { to: '/admin/settings', label: 'Settings', icon: 'filter', phase: 1 },
];

const PHASE_LABEL = { 1: 'Phase 1', 2: 'Phase 2', 3: 'Phase 3' };

export default function AdminLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const state = useAdmin();

  // Admin screens must never be indexed.
  useEffect(() => {
    let tag = document.querySelector('meta[name="robots"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'robots');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', 'noindex, nofollow');

    return () => tag.setAttribute('content', 'index, follow');
  }, []);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setNavOpen(false), [location.pathname]);

  const pending = state.orders.filter((o) => o.status === 'pending').length;
  const lowStock = state.products.filter(
    (p) => !p.archived && p.stock > 0 && p.stock <= p.lowStockThreshold
  ).length;
  const outStock = state.products.filter((p) => !p.archived && p.stock === 0).length;

  const badgeFor = (to) => {
    if (to === '/admin/orders' && pending) return pending;
    if (to === '/admin/inventory' && lowStock + outStock) return lowStock + outStock;
    return null;
  };

  return (
    <div className={cx('adm', navOpen && 'adm--nav-open')}>
      <a className="skip-link" href="#admin-main">Admin content par jaayein</a>

      {/* --------------------------------------------------------- sidebar */}
      <aside className="adm-side" aria-label="Admin navigation">
        <div className="adm-side__brand">
          <span className="adm-side__logo" aria-hidden="true">SW</span>
          <span className="adm-side__brandtext">
            <strong>SAWON</strong>
            <span>E-Commerce</span>
          </span>
          <span className="adm-side__panel">Admin Control Panel</span>
        </div>

        <nav className="adm-side__nav">
          <ul>
            {MODULES.map((m) => {
              const badge = badgeFor(m.to);
              return (
                <li key={m.to}>
                  <NavLink
                    to={m.to}
                    end={m.end}
                    className={({ isActive }) => cx('adm-side__link', isActive && 'is-active')}
                  >
                    <Icon name={m.icon} size={18} />
                    <span className="adm-side__label">{m.label}</span>
                    {m.phase > 1 ? (
                      <span className="adm-side__phase" title={PHASE_LABEL[m.phase]}>
                        P{m.phase}
                      </span>
                    ) : null}
                    {badge ? <span className="adm-side__badge">{badge > 99 ? '99+' : badge}</span> : null}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="adm-side__foot">
          <a className="adm-side__store" href="/" target="_blank" rel="noreferrer">
            <Icon name="search" size={16} />
            View storefront
          </a>
        </div>
      </aside>

      {navOpen ? (
        <button
          type="button"
          className="adm-scrim"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      {/* ---------------------------------------------------------- main */}
      <div className="adm-body">
        <header className="adm-top">
          <button
            type="button"
            className="adm-top__burger"
            aria-label={navOpen ? 'Menu band karein' : 'Menu kholein'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            <Icon name={navOpen ? 'close' : 'menu'} size={22} />
          </button>

          <div className="adm-top__search">
            <Icon name="search" size={17} />
            <input
              type="search"
              placeholder="Orders, products, customers…"
              aria-label="Admin search"
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                const q = e.currentTarget.value.trim();
                if (q) window.location.assign(`/admin/products?q=${encodeURIComponent(q)}`);
              }}
            />
          </div>

          <div className="adm-top__actions">
            {/* The count is visible text, so it must appear in the accessible name
                too — otherwise the label and the visible text disagree. */}
            <button
              type="button"
              className="adm-top__icon"
              aria-label={pending ? `Notifications, ${pending} pending` : 'Notifications'}
            >
              <Icon name="bell" size={19} />
              {pending ? <span className="adm-top__dot" aria-hidden="true">{pending > 9 ? '9+' : pending}</span> : null}
            </button>

            <div className="adm-top__user">
              <span className="adm-top__avatar" aria-hidden="true">SA</span>
              <span className="adm-top__usertext">
                <strong>Super Admin</strong>
                <span>{SITE.email}</span>
              </span>
              <Icon name="chevronDown" size={14} />
            </div>
          </div>
        </header>

        <main className="adm-main" id="admin-main" tabIndex={-1}>
          {/* Route screens are lazy-loaded; this boundary keeps the sidebar and
              top bar visible while a screen chunk arrives. */}
          <Suspense
            fallback={
              <div className="adm-loading" role="status">
                <span className="adm-loading__spinner" aria-hidden="true" />
                <span>Loading…</span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}