import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EmptyState } from './AdminUI.jsx';
import { cx } from '../../utils/format.js';

/**
 * Sortable, searchable, paginated table.
 *
 * Deliberately hand-rolled rather than pulled from a library: the admin needs
 * are modest and the bundle cost of a data-grid plus a virtualiser outweighs
 * it at this row count.
 */
export default function DataTable({
  columns,
  rows,
  rowKey = (r) => r.id,
  empty = { title: 'Nothing here yet' },
  pageSize = 12,
  initialSort,
  onRowClick,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  toolbar,
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(initialSort ?? null);
  const [page, setPage] = useState(1);
  const scrollRef = useRef(null);
  const [scrollsSideways, setScrollsSideways] = useState(false);

  /**
   * A horizontally scrollable region must be reachable by keyboard. Adding a
   * tab stop to every table would be noise, so this only applies when the
   * table actually overflows.
   */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    const measure = () => setScrollsSideways(el.scrollWidth - el.clientWidth > 1);
    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rows.length, pageSize, columns.length]);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((row) =>
      columns.some((c) => String(c.value(row) ?? '').toLowerCase().includes(q))
    );
  }, [rows, query, columns]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;

    return [...filtered].sort((a, b) => {
      const av = col.sortValue ? col.sortValue(a) : col.value(a);
      const bv = col.sortValue ? col.sortValue(b) : col.value(b);
      if (typeof av === 'number' && typeof bv === 'number') {
        return sort.dir === 'asc' ? av - bv : bv - av;
      }
      return sort.dir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filtered, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages);
  const view = sorted.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (key) =>
    setSort((prev) =>
      prev?.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );

  const allOnPageSelected =
    view.length > 0 && view.every((r) => selectedIds.includes(rowKey(r)));

  const toggleAll = () => {
    const keys = view.map(rowKey);
    const next = allOnPageSelected
      ? selectedIds.filter((id) => !keys.includes(id))
      : [...new Set([...selectedIds, ...keys])];
    onSelectionChange?.(next);
  };

  return (
    <div className="adm-table-wrap">
      {toolbar ? (
        <div className="adm-table__toolbar">
          {toolbar}
          <input
            className="adm-input adm-table__search"
            type="search"
            placeholder="Search…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            aria-label="Search table"
          />
        </div>
      ) : (
        <input
          className="adm-input adm-table__search adm-table__search--alone"
          type="search"
          placeholder="Search…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          aria-label="Search table"
        />
      )}

      {view.length === 0 ? (
        <EmptyState title={empty.title} text={empty.text} icon={empty.icon} />
      ) : (
        <div
          className="adm-table__scroll"
          ref={scrollRef}
          role="region"
          aria-label={`${columns.length} column table`}
          tabIndex={scrollsSideways ? 0 : undefined}
        >
          <table className="adm-table">
            <thead>
              <tr>
                {selectable ? (
                  <th scope="col" className="adm-table__check">
                    {/* The checkbox column has no visible label, but an empty
                        <th> leaves every data cell unassociated, which fails the
                        "td-has-header" rule. Name it for assistive tech only. */}
                    <span className="sr-only">Select</span>
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleAll}
                      aria-label="Select all rows on this page"
                    />
                  </th>
                ) : null}
                {columns.map((col) => (
                  <th
                    key={col.key ?? col.header}
                    scope="col"
                    className={cx(col.align && `is-${col.align}`, col.sortable !== false && 'is-sortable')}
                    onClick={col.sortable === false ? undefined : () => toggleSort(col.key)}
                    aria-sort={
                      sort?.key === col.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                  >
                    {/* An action column renders no visible text; naming it keeps
                        the header association intact. */}
                    {col.header || <span className="sr-only">{col.srHeader ?? 'Actions'}</span>}
                    {sort?.key === col.key ? (
                      <span className="adm-table__sort" aria-hidden="true">
                        {sort.dir === 'asc' ? '▲' : '▼'}
                      </span>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={cx(onRowClick && 'is-clickable')}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {selectable ? (
                    <td className="adm-table__check" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(rowKey(row))}
                        onChange={() => {
                          const id = rowKey(row);
                          onSelectionChange?.(
                            selectedIds.includes(id)
                              ? selectedIds.filter((x) => x !== id)
                              : [...selectedIds, id]
                          );
                        }}
                        aria-label={`Select ${rowKey(row)}`}
                      />
                    </td>
                  ) : null}
                  {columns.map((col) => (
                    <td key={col.key ?? col.header} className={col.align && `is-${col.align}`}>
                      {col.render ? col.render(row) : col.value(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="adm-table__foot">
        <p className="adm-table__count">
          Showing {sorted.length === 0 ? 0 : (current - 1) * pageSize + 1}–
          {Math.min(current * pageSize, sorted.length)} of {sorted.length}
        </p>

        {pages > 1 ? (
          <nav className="adm-pager" aria-label="Pagination">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={current === 1}>
              Prev
            </button>
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  type="button"
                  className={n === current ? 'is-active' : undefined}
                  aria-current={n === current ? 'page' : undefined}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              );
            })}
            <button type="button" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={current === pages}>
              Next
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}