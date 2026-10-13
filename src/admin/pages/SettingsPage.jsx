import { useState } from 'react';
import { Link } from 'react-router-dom';

import { PageHeader, Panel } from '../components/AdminUI.jsx';
import { COMPANY } from '../../data/company.js';
import { resetAdminData } from '../data/store.js';

export default function SettingsPage() {
  const [resetting, setResetting] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Admin' }, { label: 'Settings' }]}
        title="Website & application settings"
        subtitle="Company details and demo data"
      />

      <div className="adm-grid adm-grid--2">
        {/* ------------------------------------------- 186–187 identity */}
        <Panel title="Company details" subtitle="Items 186–197">
          <dl className="adm-kv adm-kv--stack">
            <div><dt>Legal name</dt><dd>{COMPANY.legalName}</dd></div>
            <div><dt>GSTIN</dt><dd className="t-numeric">
              <a href={COMPANY.gstinUrl} target="_blank" rel="noopener noreferrer">{COMPANY.gstin}</a>
            </dd></div>
            <div>
              <dt>{COMPANY.registeredOffice.label}</dt>
              <dd>{COMPANY.registeredOffice.address.join(', ')}</dd>
            </div>
            <div>
              <dt>{COMPANY.branchOffice.label}</dt>
              <dd>{COMPANY.branchOffice.address.join(', ')}</dd>
            </div>
          </dl>

          <p className="adm-muted adm-note">
            These values live in <code>src/data/company.js</code> and are shared by the storefront
            footer, the admin panel and any future invoice or Terms page. Change them there, not here.
          </p>

          <ul className="adm-notes adm-notes--plain">
            <li><strong>Logo, navigation, homepage slider, banners</strong> — read from code and the SVG generator, not editable in the browser yet.</li>
            <li><strong>Privacy, Terms, Return, Shipping policies</strong> — footer links only. Real policy pages need to be written and reviewed.</li>
            <li><strong>Maintenance mode</strong> — needs a server flag; a client-only toggle would not actually take the site down.</li>
          </ul>
        </Panel>

        {/* ---------------------------------------------- demo data control */}
        <Panel title="Demo data" subtitle="This panel runs on local data">
          <p>
            The admin panel stores everything in this browser's <code>localStorage</code>. It is a
            working demo backend, not a server: nothing is shared between devices, and clearing site
            data wipes it.
          </p>

          <button
            type="button"
            className="adm-btn adm-btn--danger"
            disabled={resetting}
            onClick={() => {
              if (!window.confirm('Reset all admin demo data back to the seeded figures? Any product, order or staff changes you made will be lost.')) return;
              setResetting(true);
              resetAdminData();
              setTimeout(() => {
                setResetting(false);
                setDone(true);
              }, 400);
            }}
          >
            {resetting ? 'Resetting…' : 'Reset demo data'}
          </button>

          {done ? <p className="adm-ok" role="status">Demo data has been reset.</p> : null}

          <h2 className="adm-grouphead adm-mt">Before going live</h2>
          <ol className="adm-scope">
            {[
              'Move products, orders, customers and staff to Firestore or a REST API.',
              'Protect the admin routes with real staff authentication — see RequireAuth.',
              'Enforce permissions on the server. A client-side matrix is a UI hint, not a security control.',
              'Replace the estimated operating expenses in Reports with real ledger entries.',
              'Set up GST invoice PDFs with your GSTIN and e-invoicing (IRN) if turnover requires it.',
            ].map((text, i) => (
              <li key={text}><span className="adm-scope__no">{i + 1}</span><span>{text}</span></li>
            ))}
          </ol>

          <p className="adm-muted adm-note">
            Admin screens already carry <code>noindex, nofollow</code>. See also{' '}
            <Link to="/admin/security">Security</Link> for the audit log.
          </p>
        </Panel>
      </div>
    </>
  );
}