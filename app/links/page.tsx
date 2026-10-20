import { SocialIcon, WhatsAppIcon } from '@/components/brand-icons'
import { CONTACT } from '@/lib/contact-info'
import { LINKS_ACCESS, SOCIAL_LINKS } from '@/lib/link-in-bio'
import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Follow Us — La Cuisine de Manou',
  description:
    'Follow La Cuisine de Manou on Instagram, TikTok and Facebook, visit our website, or chat with us on WhatsApp.',
  // Reached via the printed QR code only; keep it out of search results.
  robots: { index: false, follow: false },
}

export default async function LinksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Reading searchParams makes this route render per request, so the check runs
  // server-side on direct visits, refreshes and client-side navigations alike.
  const hasAccess = (await searchParams)[LINKS_ACCESS.param] === LINKS_ACCESS.value

  return (
    <main className="links-page">
      <div className="links-card">
        <Image
          className="links-logo"
          src="/images/logo.avif"
          alt="La Cuisine de Manou"
          width={203}
          height={120}
          priority
        />

        {hasAccess ? (
          <>
            <header className="links-intro">
              <p className="eyebrow">Private chef &amp; catering · UAE</p>
              <h1>
                French heritage, <em>seasonal tables.</em>
              </h1>
              <p>Bespoke menus for intimate dinners, celebrations and corporate gatherings across Abu Dhabi and Dubai.</p>
            </header>

            <section className="links-section" aria-labelledby="links-follow">
              <h2 id="links-follow">Follow Us On</h2>
              <ul className="links-list">
                {SOCIAL_LINKS.map((link) => (
                  <li key={link.platform}>
                    <a
                      className={`links-item links-item--${link.platform}`}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="links-item__icon">
                        <SocialIcon platform={link.platform} size={22} />
                      </span>
                      <span className="links-item__text">
                        <span className="links-item__label">{link.label}</span>
                        <span className="links-item__meta">{link.handle}</span>
                      </span>
                      <ArrowUpRight className="links-item__arrow" size={18} aria-hidden="true" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <section className="links-section links-contact" aria-labelledby="links-contact" data-contact-location="links_page">
              <h2 id="links-contact">Contact Us</h2>
              <a
                className="links-item links-item--whatsapp"
                href={`https://wa.me/${CONTACT.mobile.tel.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="links-item__icon">
                  <WhatsAppIcon size={24} />
                </span>
                <span className="links-item__text">
                  <span className="links-item__label">Chat with us on WhatsApp</span>
                  <span className="links-item__meta">{CONTACT.mobile.intl}</span>
                </span>
                <ArrowUpRight className="links-item__arrow" size={18} aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </section>
          </>
        ) : (
          <section className="links-intro links-denied" aria-labelledby="links-denied">
            <p className="eyebrow">Scan to continue</p>
            <h1 id="links-denied">
              This page opens <em>from our QR code.</em>
            </h1>
            <p>Please scan the QR code on our menu or packaging to see all our links.</p>
            <Link className="book-button" href="/">
              Visit La Cuisine de Manou
            </Link>
          </section>
        )}

        <footer className="links-footer">
          © {new Date().getFullYear()} {CONTACT.name}
        </footer>
      </div>
    </main>
  )
}
