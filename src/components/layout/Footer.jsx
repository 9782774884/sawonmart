import Icon from '../ui/Icon.jsx';
import { FOOTER_LINKS, SOCIAL_LINKS, TRUST_POINTS } from '../../data/site.js';
import { COMPANY } from '../../data/company.js';
import { SITE, WHATSAPP, whatsappLink } from '../../utils/constants.js';

/** Site footer: link groups, social profiles, app download and legal line. */
export default function Footer() {
  const year = SITE.currentYear;

  return (
    <footer className="footer" role="contentinfo">
      {/* ------------------------------------------------- trust / benefits */}
      <section className="footer__trust" aria-labelledby="trust-heading">
        <div className="container footer__trust-grid">
          <h2 className="sr-only" id="trust-heading">
            SawonMart par kyun khareedein
          </h2>

          <ul className="footer__trust-list">
            {TRUST_POINTS.map((item) => (
              <li key={item.id} className="footer__trust-item">
                <span className="footer__trust-icon" aria-hidden="true">
                  <Icon name={item.icon} size={22} />
                </span>
                <span>
                  <span className="footer__trust-title">{item.title}</span>
                  <span className="footer__trust-text">{item.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------- link groups */}
      <section className="footer__links" aria-labelledby="footer-links-heading">
        <div className="container">
          <h2 className="sr-only" id="footer-links-heading">
            Aur links
          </h2>

          <div className="footer__links-grid">
            {FOOTER_LINKS.map((group) => (
              <nav key={group.heading} className="footer__group" aria-labelledby={`fg-${group.heading}`}>
                <h3 className="footer__group-heading" id={`fg-${group.heading}`}>
                  {group.heading}
                </h3>
                <ul className="footer__group-list">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a href={`#${link.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{link}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            {/* ------------------------------------------------- address block */}
            <div className="footer__group footer__address">
              <h3 className="footer__group-heading" id="fg-registered">
                {COMPANY.registeredOffice.label}
              </h3>

              <p className="footer__legal-name">{COMPANY.legalName}</p>

              <address className="footer__address-text">
                {COMPANY.registeredOffice.address.map((line) => (
                  <span key={line} className="footer__address-line">
                    {line}
                  </span>
                ))}
              </address>

              <h3
                className="footer__group-heading footer__group-heading--spaced"
                id="fg-branch"
              >
                {COMPANY.branchOffice.label}
              </h3>

              <address className="footer__address-text">
                {COMPANY.branchOffice.address.map((line) => (
                  <span key={line} className="footer__address-line">
                    {line}
                  </span>
                ))}
              </address>

              <p className="footer__gstin">
                <span className="footer__gstin-label">GSTIN:</span>{' '}
                {/* Links to the official GST portal so buyers can verify it. */}
                <a href={COMPANY.gstinUrl} target="_blank" rel="noopener noreferrer">
                  {COMPANY.gstin}
                </a>
              </p>

              <ul className="footer__contact">
                <li>
                  <a href={`mailto:${SITE.email}`}>
                    <Icon name="bell" size={15} />
                    {SITE.email}
                  </a>
                </li>
                <li>
                  <a href={`tel:${SITE.phone.replace(/-/g, '')}`}>
                    <Icon name="headset" size={15} />
                    {SITE.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappLink('Hi SawonMart! Mujhe order ke baare mein madad chahiye.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__whatsapp"
                  >
                    <Icon name="whatsapp" size={15} strokeWidth={0} />
                    WhatsApp {WHATSAPP.display}
                  </a>
                </li>
              </ul>
            </div>

            {/* -------------------------------------------------- download app */}
            <div className="footer__group footer__app" id="download">
              <h3 className="footer__group-heading">APP DOWNLOAD KAREIN</h3>

              <div className="footer__store-badges">
                <a className="store-badge" href="#app-store">
                  <span className="store-badge__text">
                    <span className="store-badge__sub">Download on the</span>
                    <span className="store-badge__name">App Store</span>
                  </span>
                </a>

                <a className="store-badge" href="#play-store">
                  <span className="store-badge__text">
                    <span className="store-badge__sub">GET IT ON</span>
                    <span className="store-badge__name">Google Play</span>
                  </span>
                </a>
              </div>

              <h3 className="footer__group-heading footer__group-heading--spaced">SOCIAL LINKS</h3>
              <ul className="footer__social">
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.id}>
                    <a
                      href={social.href}
                      className="footer__social-link"
                      aria-label={`${SITE.name} par ${social.label} par jaayein`}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      <Icon name={social.id} size={18} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- legal */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copy">
            © {SITE.foundedYear}–{year} {SITE.name}.com · {COMPANY.legalName} · GSTIN{' '}
            {COMPANY.gstin}
          </p>

          <ul className="footer__bottom-links">
            <li>
              <a href="#broadcast">Broadcast Envelopes</a>
            </li>
            <li>
              <a href="#advertise">Advertise</a>
            </li>
            <li>
              <a href="#feedback">Feedback</a>
            </li>
            <li>
              <a href="#ncl">Online NCL</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}