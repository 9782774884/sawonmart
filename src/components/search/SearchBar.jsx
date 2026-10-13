import { useEffect, useRef, useState } from 'react';
import Icon from '../ui/Icon.jsx';
import { SEARCH_INDEX } from '../../data/products.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useOnClickOutside } from '../../hooks/useOnClickOutside.js';
import { cx, formatPrice, highlightMatch } from '../../utils/format.js';

const POPULAR = [
  'iPhone 15',
  'Bluetooth earbuds',
  'Kurti under 500',
  'Air fryer',
  'Running shoes',
  'Gift set for him',
];

/** Max suggestions shown in the dropdown. */
const MAX_RESULTS = 7;

/**
 * Search field with a suggestions combobox.
 *
 * ARIA 1.2 combobox pattern:
 *  - input[role=combobox] owns aria-expanded / aria-controls / aria-activedescendant.
 *  - The list is a role=listbox of role=option children.
 *  - Arrow keys move the active option, Enter selects, Escape closes.
 */
export default function SearchBar({ onOpenDrawer }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const debouncedQuery = useDebounce(query, 180);

  const results = debouncedQuery.trim().length
    ? SEARCH_INDEX.filter((item) =>
        `${item.title} ${item.brand} ${item.category}`
          .toLowerCase()
          .includes(debouncedQuery.trim().toLowerCase())
      ).slice(0, MAX_RESULTS)
    : [];

  const hasSuggestions = open && (debouncedQuery.trim().length > 0 || query.length === 0);

  useOnClickOutside(wrapRef, () => setOpen(false), open);

  useEffect(() => setActiveIndex(-1), [debouncedQuery]);

  const submit = (event) => {
    event.preventDefault();
    const selected = activeIndex >= 0 ? results[activeIndex] : null;
    setQuery(selected ? selected.title : debouncedQuery);
    setOpen(false);
  };

  const onKeyDown = (event) => {
    if (!open) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((prev) => {
        const next = prev + delta;
        if (next < 0) return results.length - 1;
        if (next >= results.length) return 0;
        return next;
      });
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      setQuery(results[activeIndex].title);
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const onFocus = () => setOpen(true);

  return (
    <div className={cx('search', open && 'is-open')} ref={wrapRef}>
      <form className="search__form" role="search" onSubmit={submit} aria-label="Products search karein">
        <label className="sr-only" htmlFor="site-search">
          Kya dhoondhna hai?
        </label>

        <input
          id="site-search"
          ref={inputRef}
          className="search__input"
          type="search"
          name="q"
          value={query}
          placeholder="SawonMart par khojein"
          autoComplete="off"
          role="combobox"
          aria-expanded={hasSuggestions}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 && results[activeIndex] ? `suggestion-${results[activeIndex].id}` : undefined
          }
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
        />

        <button type="submit" className="search__submit" aria-label="Search karein">
          <Icon name="search" size={20} />
        </button>
      </form>

      {hasSuggestions ? (
        <div className="search__panel" id="search-suggestions" role="listbox" aria-label="Search suggestions">
          {debouncedQuery.trim() ? (
            <>
              <p className="search__panel-title t-eyebrow">Products</p>

              {results.length === 0 ? (
                <p className="search__empty">
                  “{debouncedQuery}” ka koi product nahi mila. Doosre shabd try karein.
                </p>
              ) : (
                <ul className="search__list">
                  {results.map((item, index) => (
                    <li key={item.id} className="search__item">
                      <button
                        type="button"
                        id={`suggestion-${item.id}`}
                        role="option"
                        aria-selected={index === activeIndex}
                        className={cx('search__option', index === activeIndex && 'is-active')}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => {
                          setQuery(item.title);
                          setOpen(false);
                        }}
                      >
                        <span className="search__thumb">
                          <img src={`/assets/images/${item.image}`} alt="" loading="lazy" width="40" height="40" />
                        </span>

                        <span className="search__option-text">
                          <span className="search__option-title">
                            {highlightMatch(item.title, debouncedQuery.trim()).map((part, i) =>
                              part.hit ? <mark key={i}>{part.text}</mark> : <span key={i}>{part.text}</span>
                            )}
                          </span>
                          <span className="search__option-meta t-text-muted">
                            {item.brand} · {formatPrice(item.price)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <p className="search__panel-title t-eyebrow">Trending searches</p>
              <ul className="search__chips">
                {POPULAR.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      className="search__chip"
                      onClick={() => {
                        setQuery(term);
                        setOpen(false);
                      }}
                    >
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="search__panel-foot">
            <button type="button" className="search__foot-link" onClick={() => onOpenDrawer?.()}>
              <Icon name="cart" size={16} />
              Cart dekhhein
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}