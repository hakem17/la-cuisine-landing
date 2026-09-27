'use client'

import {
  pushEvent,
  trackContactClick,
  trackCtaClick,
  type ContactLocation,
  type CtaLocation,
  type ScrollPercent,
  type TrackedSection,
} from '@/lib/analytics'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const SCROLL_THRESHOLDS: ScrollPercent[] = [25, 50, 75, 90, 100]
const SECTIONS: TrackedSection[] = ['services', 'usps', 'gallery', 'testimonials', 'faq']
const CTA_DESTINATIONS = { '/book': 'book_now', '/contact-us': 'contact_us' } as const

// Site-wide tracking mounted once in the root layout:
// page_view per route, scroll_depth (thresholds + named sections), and
// delegated clicks on CTA / tel / mailto / WhatsApp links. Link locations come
// from the nearest [data-cta-location] / [data-contact-location] ancestor.
export function AnalyticsListener() {
  const pathname = usePathname()

  useEffect(() => {
    pushEvent('page_view', {
      page_title: document.title,
      page_location: window.location.origin + pathname,
    })
  }, [pathname])

  useEffect(() => {
    const fired = new Set<ScrollPercent>()
    const onScroll = () => {
      const { scrollHeight } = document.documentElement
      const percent = ((window.scrollY + window.innerHeight) / scrollHeight) * 100
      for (const threshold of SCROLL_THRESHOLDS) {
        // 99.5 so sub-pixel rounding still counts as reaching the bottom.
        if (fired.has(threshold) || percent < Math.min(threshold, 99.5)) continue
        fired.add(threshold)
        pushEvent('scroll_depth', { scroll_percent: threshold, section: null })
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // A section counts as viewed once it crosses the middle of the viewport,
    // which also works for sections taller than the screen.
    const seen = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id as TrackedSection
          if (!entry.isIntersecting || seen.has(id)) return
          seen.add(id)
          pushEvent('scroll_depth', { scroll_percent: null, section: id })
        })
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [pathname])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href]')
      if (!link) return
      const href = link.getAttribute('href') || ''
      const contactLocation = (link.closest('[data-contact-location]')?.getAttribute('data-contact-location') ||
        'other') as ContactLocation

      if (href.startsWith('tel:')) {
        trackContactClick({ contact_method: 'phone', contact_value: href.slice(4), contact_location: contactLocation })
        return
      }
      if (href.startsWith('mailto:')) {
        trackContactClick({
          contact_method: 'email',
          contact_value: href.slice(7).split('?')[0],
          contact_location: contactLocation,
        })
        return
      }

      let url: URL
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.hostname === 'wa.me') {
        trackContactClick({
          contact_method: 'whatsapp',
          contact_value: `+${url.pathname.replace(/\D/g, '')}`,
          contact_location: contactLocation,
        })
        return
      }

      const ctaType = url.origin === window.location.origin && CTA_DESTINATIONS[url.pathname as keyof typeof CTA_DESTINATIONS]
      if (ctaType) {
        trackCtaClick({
          cta_type: ctaType,
          cta_location: (link.closest('[data-cta-location]')?.getAttribute('data-cta-location') ||
            'other') as CtaLocation,
          destination_url: url.pathname + url.search,
        })
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
