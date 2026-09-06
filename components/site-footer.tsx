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
          <h4>Navigation</h4>
          <ul>
            <li><a href="#services">Services</a></li>
            <li><a href="#usps">Why Us</a></li>
            <li><a href="#gallery">Inspiration</a></li>
            <li><a href="#testimonials">Reviews</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>

        <div className="footer-info">
          <h4>Inquiries &amp; Service</h4>
          <span>Abu Dhabi · Dubai · UAE</span>
          <a href="mailto:bonjour@lacuisinedemanou.fr">bonjour@lacuisinedemanou.fr</a>
          <a href="tel:+971500000000">+971 50 000 0000</a>
          <p className="footer-hours">Daily: 9:00 AM – 9:00 PM</p>
        </div>

        <div className="footer-actions">
          <h4>Ready to Plan?</h4>
          <Link className="book-button" href="/book">
            Start your order ↗
          </Link>
          <Link className="outline-button footer-outline" href="/contact">
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
