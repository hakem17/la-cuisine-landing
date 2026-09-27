import { CONTACT } from '@/lib/contact-info'
import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link href="/" className="wordmark" aria-label="La Cuisine de Manou — Home">
            LA CUISINE <span>DE MANOU</span>
          </Link>
          <p>
            Bespoke French catering &amp; private chef experiences for memorable tables across the UAE.
          </p>
          <div className="footer-badge">
            <span>French Culinary Heritage · UAE Nationwide</span>
          </div>
        </div>

        <div className="footer-links">
          <h3>Navigation</h3>
          <ul>
            <li><a href="#services">Services</a></li>
            <li><a href="#usps">Why Us</a></li>
            <li><a href="#gallery">Inspiration</a></li>
            <li><a href="#testimonials">Reviews</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>

        <div className="footer-info" data-contact-location="footer">
          <h3>Inquiries &amp; Service</h3>
          <span>Abu Dhabi · Dubai · UAE</span>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <a href={`tel:${CONTACT.landline.tel}`}>{CONTACT.landline.display}</a>
          <a href={`tel:${CONTACT.mobile.tel}`}>{CONTACT.mobile.display}</a>
          <p className="footer-hours">
            Office hours: {CONTACT.officeHours}
            <br />
            Operational hours: {CONTACT.operationalHours}
          </p>
        </div>

        <div className="footer-actions" data-cta-location="footer_secondary">
          <h3>Ready to Plan?</h3>
          <Link className="book-button" href="/book">
            Start your order ↗
          </Link>
          <Link className="outline-button footer-outline" href="/contact-us">
            Submit a question ↗
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} La Cuisine de Manou. All rights reserved.</span>
        <div className="footer-bottom__links">
          <span>Private Chef &amp; Catering Solutions</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  )
}
