import Icon from './Icon.jsx';
import { cx } from '../../utils/format.js';

/**
 * Shared heading for every homepage section.
 * `as` lets callers keep the correct heading level (h2/h3) without duplicating markup.
 */
export default function SectionHeader({
  title,
  subtitle,
  action,
  icon,
  as: Tag = 'h2',
  className = '',
  id,
}) {
  return (
    <div className={cx('section__head', className)}>
      <div className="section__head-text">
        <div className="row">
          {icon ? <Icon name={icon} size={22} className="section__head-icon" /> : null}
          <Tag className="t-section-title" id={id}>
            {title}
          </Tag>
        </div>
        {subtitle ? <p className="t-section-sub">{subtitle}</p> : null}
      </div>

      {action ? <div className="section__head-action">{action}</div> : null}
    </div>
  );
}