'use client'

import { AssetPlaceholder } from '@/components/asset-placeholder'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import {
  ArrowDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Minus,
  Plus,
  Sparkles,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const circularFoodImages = [
  { label: '[IMAGE PLACEHOLDER — AMUSE-BOUCHE]', hint: 'Circle 1:1 · Artisanal Amuse-Bouche' },
  { label: '[IMAGE PLACEHOLDER — SEASONAL ENTRÉE]', hint: 'Circle 1:1 · French Starter Plating' },
  { label: '[IMAGE PLACEHOLDER — SIGNATURE MAIN]', hint: 'Circle 1:1 · Herb-Crusted Lamb / Beef' },
  { label: '[IMAGE PLACEHOLDER — ARTISANAL CHEESE]', hint: 'Circle 1:1 · Affiné Cheese Selection' },
  { label: '[IMAGE PLACEHOLDER — FRENCH PÂTISSERIE]', hint: 'Circle 1:1 · Citrus Tartlet & Pastry' },
  { label: '[IMAGE PLACEHOLDER — CANAPÉ SELECTION]', hint: 'Circle 1:1 · Passed Gourmet Canapés' },
  { label: '[IMAGE PLACEHOLDER — TARTARE & SEAFOOD]', hint: 'Circle 1:1 · Scallop & Salmon Tartare' },
  { label: '[IMAGE PLACEHOLDER — PETITS FOURS]', hint: 'Circle 1:1 · Mignardises & Sweet Treats' },
]

const galleryCards = [
  {
    label: '[IMAGE PLACEHOLDER — GALLERY 01: PLATED DINNER TABLE]',
    hint: 'Portrait 9:16 · Candlelit Private Table',
  },
  {
    label: '[IMAGE PLACEHOLDER — GALLERY 02: CHEF PLATING & SERVICE]',
    hint: 'Portrait 9:16 · Chef Precision Garnish',
  },
  {
    label: '[IMAGE PLACEHOLDER — GALLERY 03: COCKTAIL & CANAPÉ RECEPTION]',
    hint: 'Portrait 9:16 · Passed Hors d’Oeuvres',
  },
  {
    label: '[IMAGE PLACEHOLDER — GALLERY 04: LUXURY BUFFET PRESENTATION]',
    hint: 'Portrait 9:16 · Cascading French Buffet',
  },
  {
    label: '[IMAGE PLACEHOLDER — GALLERY 05: OUTDOOR ESTATE GATHERING]',
    hint: 'Portrait 9:16 · Al Fresco Dining Setup',
  },
  {
    label: '[IMAGE PLACEHOLDER — GALLERY 06: ARTISANAL DESSERT ATELIER]',
    hint: 'Portrait 9:16 · Patisserie & Sweet Display',
  },
  {
    label: '[IMAGE PLACEHOLDER — GALLERY 07: EXECUTIVE BANQUET SETUP]',
    hint: 'Portrait 9:16 · Corporate VIP Banquet',
  },
]

const testimonials = [
  {
    id: 1,
    quote:
      'Every detail felt effortless, from the first conversation to the last plate. The food was extraordinary and our guests are still talking about the evening. Chef Manou and the team crafted a seasonal five-course menu that perfectly captured authentic Parisian gastronomy with stunning presentation.',
    name: 'Camille & Thomas',
    event: 'Private Dinner · Abu Dhabi',
    rating: 5,
  },
  {
    id: 2,
    quote:
      'Manou understood our brand brief immediately and delivered an executive reception that was both elevated and deeply hospitable. Pure Parisian finesse. The passed canapés and artisanal patisserie were exceptional.',
    name: 'Sophie Laurent',
    event: 'Luxury Brand Launch · DIFC, Dubai',
    rating: 5,
  },
  {
    id: 3,
    quote:
      'A rare combination of calm, precision, and genuine warmth. The table looked breathtaking, and every course arrived at the perfect cadence. Truly made our milestone anniversary unforgettable.',
    name: 'The Martin Family',
    event: 'Anniversary Celebration · Saadiyat Island',
    rating: 5,
  },
  {
    id: 4,
    quote:
      'Flawless execution for our 80-guest reception. The live stations were a major highlight, and the seamless front-of-house service gave us total peace of mind throughout the entire night.',
    name: 'Alexandre & Nour',
    event: 'Wedding Reception · Dubai',
    rating: 5,
  },
  {
    id: 5,
    quote:
      'Discreet, highly sophisticated, and punctual. The seasonal French dishes were plated with Michelin-level finesse. Our international board members were thoroughly impressed.',
    name: 'David K.',
    event: 'Executive Board Dinner · ADGM, Abu Dhabi',
    rating: 5,
  },
  {
    id: 6,
    quote:
      'From the bespoke canapé selection to the signature dessert tower, everything exceeded our high expectations. The team handled every dietary request with grace and creativity.',
    name: 'Elena Rostova',
    event: 'VIP Birthday Soirée · Palm Jumeirah',
    rating: 5,
  },
]

const faqs = [
  {
    q: 'What areas across the UAE do you serve?',
    a: 'We provide full-service catering and private chef experiences across Abu Dhabi, Dubai, and the wider Emirates. For special destination celebrations or private estates, we accommodate custom travel arrangements.',
  },
  {
    q: 'How far in advance should we reserve our date?',
    a: 'We recommend inquiring 3–6 weeks in advance for intimate private dining and 2–3 months in advance for larger corporate events or weddings. We also accommodate short-notice requests based on calendar availability.',
  },
  {
    q: 'Can dietary preferences and allergies be accommodated?',
    a: 'Every menu is bespoke. We curate dedicated menus for vegetarian, vegan, gluten-free, dairy-free, halal-certified, and specific allergy requirements without compromising culinary craftsmanship.',
  },
  {
    q: 'Do you provide full front-of-house service staff and tableware?',
    a: 'Yes. Depending on your needs, we provide discreet chef-only execution or complete front-of-house teams including service captains, mixologists, bespoke tableware, linens, and tabletop styling.',
  },
  {
    q: 'What is the booking and consultation process?',
    a: 'You submit your event details through our online booking wizard. Within 24 hours, our culinary team contacts you with bespoke menu proposals, format recommendations, and an itemized quote.',
  },
]

const usps = [
  {
    num: '01',
    title: 'Seasonal by nature',
    desc: 'Bespoke menus driven by fresh market arrivals and authentic French gastronomic traditions.',
  },
  {
    num: '02',
    title: 'Personal by design',
    desc: 'Tailored specifically to your occasion, dietary needs, guest profile, and aesthetic vision.',
  },
  {
    num: '03',
    title: 'Seamless in practice',
    desc: 'Calm, disciplined hospitality and flawless execution from initial briefing to final clearing.',
  },
  {
    num: '04',
    title: 'Uncompromising excellence',
    desc: 'High-end ingredients, refined presentation, and zero-stress coordination for the host.',
  },
]

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0)
  const [showStickyCta, setShowStickyCta] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Drag-to-scroll state for Section 6 gallery
  const galleryRef = useRef<HTMLDivElement>(null)
  const isGalleryDragging = useRef(false)
  const galleryStartX = useRef(0)
  const galleryScrollLeftStart = useRef(0)

  // Carousel state for Section 7 Testimonials
  const testimonialCarouselRef = useRef<HTMLDivElement>(null)
  const [activeTestimonialPage, setActiveTestimonialPage] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [selectedReviewModal, setSelectedReviewModal] = useState<(typeof testimonials)[0] | null>(null)

  const handleGalleryScroll = () => {
    if (!galleryRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = galleryRef.current
    const maxScroll = scrollWidth - clientWidth
    if (maxScroll > 0) {
      setScrollProgress(scrollLeft / maxScroll)
    }
  }

  const onGalleryMouseDown = (e: React.MouseEvent) => {
    if (!galleryRef.current) return
    isGalleryDragging.current = true
    galleryRef.current.classList.add('is-dragging')
    galleryStartX.current = e.pageX - galleryRef.current.offsetLeft
    galleryScrollLeftStart.current = galleryRef.current.scrollLeft
  }

  const onGalleryMouseMove = (e: React.MouseEvent) => {
    if (!isGalleryDragging.current || !galleryRef.current) return
    e.preventDefault()
    const x = e.pageX - galleryRef.current.offsetLeft
    const walk = (x - galleryStartX.current) * 1.5
    galleryRef.current.scrollLeft = galleryScrollLeftStart.current - walk
  }

  const onGalleryMouseUpOrLeave = () => {
    isGalleryDragging.current = false
    galleryRef.current?.classList.remove('is-dragging')
  }

  // Testimonials Carousel scroll sync
  const updateTestimonialState = () => {
    if (!testimonialCarouselRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = testimonialCarouselRef.current
    const maxScroll = scrollWidth - clientWidth
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < maxScroll - 10)

    // Calculate active page based on card width
    const cardWidth = testimonialCarouselRef.current.firstElementChild
      ? (testimonialCarouselRef.current.firstElementChild as HTMLElement).offsetWidth + 24
      : 300
    const page = Math.round(scrollLeft / cardWidth)
    setActiveTestimonialPage(Math.min(testimonials.length - 1, Math.max(0, page)))
  }

  const scrollTestimonials = (direction: 'left' | 'right') => {
    if (!testimonialCarouselRef.current) return
    const cardWidth = testimonialCarouselRef.current.firstElementChild
      ? (testimonialCarouselRef.current.firstElementChild as HTMLElement).offsetWidth + 24
      : 320
    const delta = direction === 'left' ? -cardWidth : cardWidth
    testimonialCarouselRef.current.scrollBy({ left: delta, behavior: 'smooth' })
  }

  const jumpToTestimonial = (index: number) => {
    if (!testimonialCarouselRef.current) return
    const cardWidth = testimonialCarouselRef.current.firstElementChild
      ? (testimonialCarouselRef.current.firstElementChild as HTMLElement).offsetWidth + 24
      : 320
    testimonialCarouselRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' })
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCta(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash) {
      const el = document.getElementById(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <main id="top" className="landing-main">
      <a href="#content" className="skip-link">
        Skip to content
      </a>

      <SiteHeader variant="home" />

      <div id="content">
        {/* ==================================================
            SECTION 1: HERO SECTION
            ================================================== */}
        <section className="hero" aria-label="Hero Introduction">
          <div className="hero-copy reveal">
            <div className="hero-badge">
              <Sparkles size={13} className="text-terracotta" />
              <span>Private Chef &amp; Premium Catering</span>
            </div>
            <h1>
              <em>Taste</em>
              <br />
              <strong>THE SEASON</strong>
            </h1>
            <p className="hero-text">
              Seasonal French cuisine, prepared with precision and served with warmth. For tables
              worth gathering around across Abu Dhabi, Dubai, and the UAE.
            </p>
            <div className="hero-actions">
              <Link className="book-button" href="/book">
                Start your catering order <ArrowRight size={16} />
              </Link>
              <Link className="outline-button" href="#services">
                Explore services
              </Link>
            </div>
            <div className="hero-meta">
              <span className="hero-note">Abu Dhabi · Dubai · UAE Nationwide</span>
              <span className="hero-subnote">Private Dinners · Corporate Gatherings · Milestones</span>
            </div>
          </div>

          <div className="hero-visual">
            <AssetPlaceholder
              label="[IMAGE PLACEHOLDER — HERO: SIGNATURE SEASONAL DINING]"
              dimensionsHint="Desktop 16:9 / 4:5 · High-end table setting & dishes"
              className="hero-placeholder"
            />
          </div>

          <a href="#food-marquee" className="hero-scroll" aria-label="Scroll to discover">
            <ArrowDown size={15} /> Scroll to discover
          </a>
        </section>

        {/* ==================================================
            SECTION 2 / 3: SCROLLING CIRCULAR IMAGE GALLERY / MARQUEE
            ================================================== */}
        <section
          id="food-marquee"
          className="food-marquee"
          aria-label="Continuous scrolling circular food imagery gallery"
        >
          <div className="food-marquee__track">
            {/* Primary set of circular food images */}
            {circularFoodImages.map((dish, i) => (
              <div key={`dish-a-${i}`} className="food-marquee__item">
                <AssetPlaceholder
                  label={dish.label}
                  shape="circle"
                  dimensionsHint={dish.hint}
                  className="food-marquee__circle"
                />
              </div>
            ))}
            {/* Duplicated set for continuous seamless loop */}
            {circularFoodImages.map((dish, i) => (
              <div key={`dish-b-${i}`} className="food-marquee__item" aria-hidden="true">
                <AssetPlaceholder
                  label={dish.label}
                  shape="circle"
                  dimensionsHint={dish.hint}
                  className="food-marquee__circle"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            SECTION 4: SERVICES / OFFERINGS SECTION
            ================================================== */}
        <section id="services" className="section-pad services" aria-label="Our Catering Services">
          <div className="section-intro reveal">
            <p className="eyebrow">What We Do</p>
            <h2>
              Good food.
              <br />
              <em>Great company.</em>
            </h2>
            <p>
              From an intimate dinner at home to executive summits and milestone receptions, we shape
              every menu to make hosting feel effortlessly elegant.
            </p>
            <div className="section-intro__cta">
              <Link className="text-link" href="/book">
                View all catering formats <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="service-grid">
            {/* Corporate Card */}
            <article className="service-card service-card--corporate reveal">
              <div className="service-card__media">
                <AssetPlaceholder
                  label="[IMAGE PLACEHOLDER — CORPORATE CATERING]"
                  dimensionsHint="Ratio 16:10 · Executive Breakfast, Canapés & Buffets"
                  className="service-placeholder"
                />
              </div>
              <div className="service-card__content">
                <span className="card-number">01 / 02</span>
                <h3>
                  Corporate
                  <br />
                  <em>gatherings</em>
                </h3>
                <p>
                  Thoughtful food and seamless service for product launches, executive dinners, VIP
                  hospitality, and office summits.
                </p>
                <div className="service-tags">
                  <span>Canapés &amp; Finger Food</span>
                  <span>Luxury Buffets</span>
                  <span>Afternoon Tea</span>
                </div>
                <Link className="book-button service-btn" href="/book?type=corporate">
                  Plan your corporate event <ArrowRight size={15} />
                </Link>
              </div>
            </article>

            {/* Private Occasions Card */}
            <article className="service-card service-card--private reveal">
              <div className="service-card__media">
                <AssetPlaceholder
                  label="[IMAGE PLACEHOLDER — SPECIAL OCCASIONS & PRIVATE EVENTS]"
                  dimensionsHint="Ratio 16:10 · Plated Dinners, Weddings & Celebrations"
                  className="service-placeholder"
                />
              </div>
              <div className="service-card__content">
                <span className="card-number">02 / 02</span>
                <h3>
                  Special
                  <br />
                  <em>occasions</em>
                </h3>
                <p>
                  Beautifully composed menus and private chef service for weddings, anniversaries, and
                  milestones that deserve unforgettable care.
                </p>
                <div className="service-tags">
                  <span>Plated Multi-Course</span>
                  <span>Live Chef Stations</span>
                  <span>Custom Themed Menus</span>
                </div>
                <Link className="book-button service-btn" href="/book?type=private">
                  Make it memorable <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* ==================================================
            SECTION 5: WHY US / BRAND USPS SECTION
            ================================================== */}
        <section id="usps" className="section-pad usps" aria-label="Why Choose La Cuisine de Manou">
          <div className="usp-visual">
            <AssetPlaceholder
              label="[IMAGE PLACEHOLDER — CHEF & ATELIER KITCHEN]"
              dimensionsHint="Ratio 3:4 · Chef Manou crafting dishes in kitchen"
              className="usp-placeholder"
            />
          </div>

          <div className="usp-copy reveal">
            <p className="eyebrow">Why Choose Us</p>
            <h2>
              More than
              <br />
              <em>a meal.</em>
            </h2>
            <p className="usp-lead">
              We believe the best hosting is felt, not fussed over. Every menu, gesture, and detail is
              considered so you can be fully present with your guests.
            </p>

            <div className="usp-list">
              {usps.map((item) => (
                <div key={item.num} className="usp-item">
                  <span className="usp-num">{item.num}</span>
                  <div className="usp-text">
                    <strong>{item.title}</strong>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="usp-action">
              <Link className="book-button" href="/book">
                Consult with our chef <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ==================================================
            SECTION 6: SCROLLING GALLERY
            ================================================== */}
        <section id="gallery" className="gallery-section" aria-label="Scrolling Visual Gallery">
          <div className="gallery-header text-center">
            <p className="eyebrow">Experience &amp; Atmosphere</p>
            <h2>
              <em>Gallery</em>
            </h2>
            <p className="gallery-subhead">
              A glimpse into our private chef tables, milestone celebrations, and bespoke catering moments.
            </p>
          </div>

          <div className="gallery-wrapper">
            <div
              ref={galleryRef}
              className="gallery-row"
              role="region"
              aria-label="Scrollable horizontal image gallery"
              tabIndex={0}
              onScroll={handleGalleryScroll}
              onMouseDown={onGalleryMouseDown}
              onMouseMove={onGalleryMouseMove}
              onMouseUp={onGalleryMouseUpOrLeave}
              onMouseLeave={onGalleryMouseUpOrLeave}
            >
              {galleryCards.map((card, idx) => (
                <div key={idx} className="gallery-card">
                  <AssetPlaceholder
                    label={card.label}
                    dimensionsHint={card.hint}
                    className="gallery-card__placeholder"
                  />
                </div>
              ))}
            </div>

            {/* Thin vertical scrollbar indicator on the far right edge */}
            <div className="gallery-scrollbar-track" aria-hidden="true">
              <div
                className="gallery-scrollbar-thumb"
                style={{
                  top: `${scrollProgress * 70}%`,
                }}
              />
            </div>
          </div>
        </section>

        {/* ==================================================
            SECTION 7: CUSTOMER TESTIMONIALS
            ================================================== */}
        <section
          id="testimonials"
          className="section-pad testimonials-section"
          aria-label="Customer Testimonials"
        >
          <div className="testimonials-header">
            <p className="eyebrow">Social Proof &amp; Trust</p>
            <h2>Customer testimonials</h2>
            <p className="testimonials-subtitle">What our customers are saying...</p>
          </div>

          {/* Testimonial Cards Carousel Row */}
          <div
            ref={testimonialCarouselRef}
            className="testimonials-carousel"
            role="region"
            aria-label="Customer reviews carousel"
            tabIndex={0}
            onScroll={updateTestimonialState}
          >
            {testimonials.map((item) => (
              <article key={item.id} className="testimonial-box">
                <div className="testimonial-box__top">
                  <div className="stars-row" aria-label={`${item.rating} out of 5 stars`}>
                    {'★'.repeat(item.rating)}
                  </div>
                </div>

                <div className="testimonial-box__body">
                  <p className="testimonial-box__quote">“{item.quote}”</p>
                  <button
                    type="button"
                    className="testimonial-full-link"
                    onClick={() => setSelectedReviewModal(item)}
                  >
                    Full Review
                  </button>
                </div>

                <div className="testimonial-box__name-bar">
                  <strong>{item.name}</strong>
                  <span>{item.event}</span>
                </div>
              </article>
            ))}
          </div>

          {/* Navigation Controls: Dots on Left, Arrow Buttons on Right */}
          <div className="testimonials-controls">
            <div className="testimonials-dots" role="tablist" aria-label="Testimonial pages">
              {testimonials.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  role="tab"
                  aria-label={`Go to review ${dotIdx + 1}`}
                  aria-selected={activeTestimonialPage === dotIdx}
                  className={`testimonial-dot ${activeTestimonialPage === dotIdx ? 'is-active' : ''}`}
                  onClick={() => jumpToTestimonial(dotIdx)}
                />
              ))}
            </div>

            <div className="testimonials-arrows" aria-label="Carousel navigation">
              <button
                type="button"
                className="carousel-circle-btn"
                aria-label="Previous testimonials"
                disabled={!canScrollLeft}
                onClick={() => scrollTestimonials('left')}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="carousel-circle-btn"
                aria-label="Next testimonials"
                disabled={!canScrollRight}
                onClick={() => scrollTestimonials('right')}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* Full Review Modal */}
        {selectedReviewModal && (
          <div
            className="review-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label={`Full review by ${selectedReviewModal.name}`}
            onClick={() => setSelectedReviewModal(null)}
          >
            <div className="review-modal-panel" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="review-modal-close"
                aria-label="Close review modal"
                onClick={() => setSelectedReviewModal(null)}
              >
                <X size={20} />
              </button>
              <div className="stars-row" aria-label={`${selectedReviewModal.rating} stars`}>
                {'★'.repeat(selectedReviewModal.rating)}
              </div>
              <blockquote className="review-modal-quote">
                “{selectedReviewModal.quote}”
              </blockquote>
              <div className="review-modal-footer">
                <strong>{selectedReviewModal.name}</strong>
                <span>{selectedReviewModal.event}</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            SECTION 8: MID-PAGE CONVERSION BANNER
            ================================================== */}
        <section className="booking-banner" aria-label="Call to action">
          <div className="booking-banner__inner">
            <p className="eyebrow">Your Occasion, Considered</p>
            <h2>
              Let&apos;s make
              <br />
              <em>something memorable.</em>
            </h2>
            <p className="booking-banner__text">
              Share your date, guest count, and culinary preferences. We’ll curate an unforgettable
              gathering.
            </p>
            <div className="booking-banner__actions">
              <Link className="book-button book-button--light" href="/book">
                Tell us about your event <ArrowRight size={16} />
              </Link>
              <Link className="outline-button outline-button--light" href="/contact">
                Have a quick question?
              </Link>
            </div>
          </div>
        </section>

        {/* ==================================================
            SECTION 9: FAQ ACCORDION SECTION
            ================================================== */}
        <section id="faq" className="section-pad faq-section" aria-label="Frequently Asked Questions">
          <div className="faq-intro">
            <p className="eyebrow">Questions, Answered</p>
            <h2>
              Good to
              <br />
              <em>know.</em>
            </h2>
            <p>
              Have a specific inquiry about locations, setup, menus, or service staff?
            </p>
            <Link className="text-link" href="/contact">
              Submit a custom question <ArrowRight size={15} />
            </Link>
          </div>

          <div className="faq-list" role="region" aria-label="FAQ Accordion">
            {faqs.map((faq, i) => {
              const isOpen = activeFaq === i
              const faqId = `faq-answer-${i}`
              const btnId = `faq-button-${i}`
              return (
                <div className="faq-item" key={faq.q}>
                  <button
                    id={btnId}
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={faqId}
                  >
                    <span>{faq.q}</span>
                    <span className="faq-icon" aria-hidden="true">
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div id={faqId} role="region" aria-labelledby={btnId} className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ==================================================
            SECTION 10: CONTACT / PRE-FOOTER INQUIRY SECTION
            ================================================== */}
        <section id="contact" className="section-pad contact" aria-label="Contact and Inquiries">
          <div className="contact-heading">
            <p className="eyebrow">Start a Conversation</p>
            <h2>
              Gather
              <br />
              <em>beautifully.</em>
            </h2>
          </div>

          <div className="contact-copy">
            <p>
              Tell us a little about your occasion and we&apos;ll come back to you with bespoke ideas,
              availability, and a seasonal menu crafted just for your guests.
            </p>
            <div className="contact-actions">
              <Link className="book-button" href="/book">
                Book now <ArrowRight size={16} />
              </Link>
              <Link className="outline-button" href="/contact">
                Contact us <ArrowRight size={16} />
              </Link>
            </div>
            <div className="contact-channels-note">
              <span>Direct inquiries: </span>
              <a href="mailto:bonjour@lacuisinedemanou.fr">bonjour@lacuisinedemanou.fr</a>
              <span> · </span>
              <a href="tel:+971500000000">+971 50 000 0000</a>
            </div>
          </div>
        </section>
      </div>

      {/* ==================================================
          STICKY CONVERSION BAR (Scroll Activated)
          ================================================== */}
      <aside
        className={`sticky-cta-bar ${showStickyCta ? 'is-visible' : ''}`}
        aria-label="Quick booking actions"
      >
        <div className="sticky-cta-bar__content">
          <div className="sticky-cta-bar__text">
            <strong>La Cuisine de Manou</strong>
            <span>Seasonal French Catering · UAE</span>
          </div>
          <div className="sticky-cta-bar__buttons">
            <Link className="book-button sticky-btn" href="/book">
              Book now <ArrowRight size={14} />
            </Link>
            <Link className="outline-button sticky-btn--subtle" href="/contact">
              <MessageCircle size={14} /> Inquire
            </Link>
          </div>
        </div>
      </aside>

      <SiteFooter />
    </main>
  )
}
