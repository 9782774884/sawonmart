import { Panel } from '../components/AdminUI.jsx';

/**
 * Honest placeholder for Phase 2 and 3 modules.
 *
 * Deliberately says what is missing rather than showing an empty table that
 * looks like "no data yet". A screen full of zeros is indistinguishable from a
 * broken screen, and this way nobody ships a module that was never built.
 *
 * Callers that already render their own <PageHeader> should leave `header`
 * off: rendering a second one produced an empty <h1> and a duplicate
 * "Breadcrumb" landmark, which are both accessibility failures.
 */
export default function PhasePlaceholderPage({
  title,
  phase,
  items,
  notes = [],
  header = false,
  children,
}) {
  return (
    <>
      {header && title ? (
        <header className="adm-pagehead">
          <div className="adm-pagehead__text">
            <h1 className="adm-pagehead__title">{title}</h1>
            <p className="adm-pagehead__sub">Planned for {phase}</p>
          </div>
        </header>
      ) : null}

      <Panel>
        <div className="adm-phase">
          <span className="adm-phase__badge">Phase {String(phase).replace('Phase ', '')}</span>
          <p>
            <strong>This module is not built, on purpose.</strong> The route, navigation entry and
            data model are in place; the screens below are not.
          </p>
        </div>

        {children}

        {items.length ? (
          <>
            <h2 className="adm-grouphead">Scope</h2>
            <ol className="adm-scope">
              {items.map((item, i) => (
                <li key={item}>
                  <span className="adm-scope__no">{i + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </>
        ) : null}

        {notes.length ? (
          <>
            <h2 className="adm-grouphead">What is needed before this can be built</h2>
            <ul className="adm-notes">
              {notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </>
        ) : null}
      </Panel>
    </>
  );
}