'use client'

import { ArrowRight, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const navItems = [
  { label: 'Services', id: 'services' },
  { label: 'Why Us', id: 'usps' },
  { label: 'Gallery', id: 'gallery' },
  { label: 'Reviews', id: 'testimonials' },
  { label: 'FAQ', id: 'faq' },
  { label: 'Contact', id: 'contact' },
]

export function SiteHeader({ variant = 'inner' }: { variant?: 'home' | 'inner' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(variant === 'inner')
  const [activeSection, setActiveSection] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  // Track scroll state for sticky header background
  useEffect(() => {
    if (variant !== 'home') return

    const onScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [variant])

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    if (variant !== 'home') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-25% 0px -65% 0px' },
    )

    navItems.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [variant])

  const goHomeSection = (id: string) => {
    setMenuOpen(false)
    if (pathname === '/') {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        history.pushState(null, '', `#${id}`)
      }
      return
    }
    router.push(`/#${id}`)
  }

  return (
    <>
      <header
        className={`site-header ${scrolled || variant === 'inner' ? 'site-header--scrolled' : ''}`}
        role="banner"
      >
        <Link href="/" className="wordmark" aria-label="La Cuisine de Manou — Home">
          LA CUISINE <span>DE MANOU</span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map(({ label, id }) => (
            <button
              key={id}
              type="button"
              className={`nav-link ${activeSection === id ? 'nav-link--active' : ''}`}
              onClick={() => goHomeSection(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <Link className="book-button header-book" href="/book">
            Book now <ArrowRight size={14} />
          </Link>
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          id="mobile-nav-panel"
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="mobile-menu__inner">
            <div className="mobile-menu__header">
              <span className="mobile-menu__brand">Navigation</span>
              <button
                type="button"
                className="mobile-menu__close-btn"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>
            <div className="mobile-menu__links">
              {navItems.map(({ label, id }) => (
                <button
                  key={id}
                  type="button"
                  className={`mobile-menu__link ${activeSection === id ? 'is-active' : ''}`}
                  onClick={() => goHomeSection(id)}
                >
                  <span>{label}</span>
                  <ArrowRight size={17} />
                </button>
              ))}
            </div>
            <div className="mobile-menu__cta-group">
              <Link href="/book" className="book-button mobile-cta-btn" onClick={() => setMenuOpen(false)}>
                Book now <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="outline-button mobile-cta-btn" onClick={() => setMenuOpen(false)}>
                Contact us <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
