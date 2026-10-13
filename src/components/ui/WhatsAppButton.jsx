import Icon from './Icon.jsx';
import { WHATSAPP, whatsappLink } from '../../utils/constants.js';

/**
 * Floating WhatsApp contact button.
 *
 * Placement note: it sits bottom-LEFT on purpose. The back-to-top button and
 * the toast stack already occupy bottom-right, and on small screens the
 * product page adds a full-width sticky buy bar along the bottom edge.
 *
 * Accessibility:
 *  - A real <a>, so it is focusable, middle-clickable and announced as a link.
 *  - Opens in a new tab with rel="noopener noreferrer".
 *  - The visible label is collapsed on narrow screens, but aria-label keeps
 *    the accessible name intact either way.
 */
export default function WhatsAppButton({ message }) {
  const href = whatsappLink(message);

  return (
    <a
      className="wa-fab"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      /* Tells screen-reader users a new tab/window will open. */
      aria-label={`WhatsApp par ${WHATSAPP.display} se baat karein (naya tab khulega)`}
    >
      <span className="wa-fab__icon" aria-hidden="true">
        <Icon name="whatsapp" size={30} strokeWidth={0} />
      </span>
      <span className="wa-fab__label" aria-hidden="true">
        WhatsApp par baat karein
      </span>
    </a>
  );
}