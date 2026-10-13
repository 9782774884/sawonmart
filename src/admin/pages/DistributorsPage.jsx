import { PageHeader, Panel, StatCard } from '../components/AdminUI.jsx';
import { useAdmin, selectDashboard } from '../data/store.js';
import { formatCompact, formatPrice } from '../../utils/format.js';

/**
 * Distributor / BV module — scaffolded only.
 *
 * This module is intentionally NOT implemented. Building a live commission and
 * payout engine without legal sign-off would be a serious mistake, so this
 * screen states plainly what is missing and what must be settled first.
 *
 * The specific risks:
 *
 * 1. Pyramid-scheme risk. Under the Prize Chits and Money Circulation Schemes
 *    (Banning) Act, 1978 and the 2018 amendment, a scheme is unlawful if
 *    compensation for recruitment exceeds compensation for sales, or if
 *    entry money is required. "Level income" and "direct referral bonus" sit
 *    directly on that line. Business must be retail sales-led, not recruitment-
 *    led, and this has to be evidenced.
 *
 * 2. TDS. Commission paid to a distributor is income of the recipient and is
 *    deductible by you under section 194J. You must withhold TDS, issue Form
 *    16A, and file a quarterly TDS return. That is a statutory obligation, not
 *    an optional feature, so it cannot be "added later" — it changes the
 *    payout calculation itself.
 *
 * 3. Direct Selling Guidelines. Consumer Protection (Direct Selling) Rules,
 *    2021 require prescribed disclosures to every participant, a written
 *    contract, a cooling-off period, and no entry fee charged to participants.
 *
 * Get a CA and a Direct Selling Guidelines review before any of this is enabled.
 */
export default function DistributorsPage() {
  const state = useAdmin();
  const d = selectDashboard(state, 30);

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Admin' }, { label: 'Distributors' }]}
        title="Distributor & network marketing"
        subtitle="Phase 3 — scaffolded, deliberately not built"
      />

      <Panel>
        <div className="adm-phase adm-phase--danger">
          <span className="adm-phase__badge">Not implemented</span>
          <p>
            <strong>This module is not built, on purpose.</strong> A commission engine that pays real
            money needs legal sign-off before code, not after.
          </p>
        </div>
      </Panel>

      <div className="adm-grid adm-grid--3">
        <Panel title="Compliance gates" subtitle="Must clear before build">
          <ol className="adm-scope">
            <li><span className="adm-scope__no">1</span><span>Written opinion from a chartered accountant on the TDS treatment under 194J.</span></li>
            <li><span className="adm-scope__no">2</span><span>Direct Selling Rules 2021 compliance review — disclosures, contract, cooling-off period.</span></li>
            <li><span className="adm-scope__no">3</span><span>Adequacy check on the reward matrix: retail sales must dominate recruitment.</span></li>
            <li><span className="adm-scope__no">4</span><span>Confirmation that no entry fee is charged to any participant.</span></li>
            <li><span className="adm-scope__no">5</span><span>Auditable, immutable commission ledger design signed off before launch.</span></li>
          </ol>
        </Panel>

        <Panel title="Why a scaffold rather than a stub">
          <p>
            A half-built payout screen is worse than none. If the commission formula changes after
            TDS is introduced, every historical payout is wrong — and correcting that means paying
            interest and re-filing returns.
          </p>
          <p>
            The data model is the easy part and is already implied by the product pricing fields
            (<code>distributorPrice</code> on each product). What is missing is the ledger, the
            approval chain and the bank integration.
          </p>
        </Panel>

        <Panel title="Readiness signals" subtitle="Available from existing data">
          <dl className="adm-kv adm-kv--stack">
            <div><dt>Catalogue SKUs priced for distributors</dt>
              <dd className="t-numeric">{formatCompact(state.products.filter((p) => !p.archived).length)}</dd></div>
            <div><dt>Last 30 days revenue</dt><dd className="t-numeric">{formatPrice(d.extras.rangeRevenue)}</dd></div>
            <div><dt>Gross margin available</dt><dd className="t-numeric">{d.extras.grossMargin.toFixed(1)}%</dd></div>
            <div><dt>Distributor records</dt><dd>None — table not created</dd></div>
            <div><dt>BV ledger</dt><dd>None — see item 171 design note</dd></div>
            <div><dt>Payout approvals</dt><dd>None — no approval workflow</dd></div>
          </dl>
        </Panel>
      </div>

      <Panel title="Full requested scope" subtitle="Items 166–185 — recorded, not started">
        <div className="adm-columns">
          <ul className="adm-scope adm-scope--dense">
            {['Distributor registration', 'Distributor ID', 'Sponsor ID', 'Upline/downline tree', 'Distributor pricing', 'Product-wise BV', 'Monthly BV calculation', 'Rank qualification', 'Team business report', 'Direct referral bonus'].map((t) => (
              <li key={t}><span className="adm-scope__no">○</span><span>{t}</span></li>
            ))}
          </ul>
          <ul className="adm-scope adm-scope--dense">
            {['Level income calculation', 'Overlapping income config', 'Leadership bonus', 'Training fund', 'Commission wallet', 'Commission approval', 'Payout processing', 'Commission statement', 'TDS and tax handling', 'Performance dashboard'].map((t) => (
              <li key={t}><span className="adm-scope__no">○</span><span>{t}</span></li>
            ))}
          </ul>
        </div>
        <p className="adm-muted adm-note">
          Note on "overlapping income": where two uplines can both be paid on the same sale, the
          applicable rate usually falls to zero above a threshold. That is the rule most often got
          wrong, and it must be implemented server-side and be visible to the participant.
        </p>
      </Panel>
    </>
  );
}