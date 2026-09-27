import { FaqAccordion, type Faq } from "@/components/home/faq-accordion";
import { GalleryScroller } from "@/components/home/gallery-scroller";
import { HashScroll } from "@/components/home/hash-scroll";
import { StickyCtaBar } from "@/components/home/sticky-cta-bar";
import { TestimonialsCarousel } from "@/components/home/testimonials-carousel";
import { UspScrollSync } from "@/components/home/usp-scroll-sync";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CONTACT } from "@/lib/contact-info";
import { getTestimonials } from "@/lib/testimonials";
import { ArrowRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Statically rendered; Google reviews are re-read at most once an hour
// (the underlying Serper feed is itself cached for 5 days).
export const revalidate = 3600;

const circularFoodImages = [
  { label: "French Starter Plating", src: "/images/plates-2.jpg" },
  { label: "Herb-Crusted Lamb / Beef", src: "/images/plates-3.jpg" },
  { label: "Affiné Cheese Selection", src: "/images/plates-4.jpg" },
  { label: "Citrus Tartlet & Pastry", src: "/images/plates-5.jpg" },
  { label: "Passed Gourmet Canapés", src: "/images/plates-6.jpg" },
  { label: "Scallop & Salmon Tartare", src: "/images/plates-7.jpg" },
];

const galleryCards = [
  { label: "Candlelit Private Table", src: "/images/gallery-1.jpg" },
  { label: "Chef Precision Garnish", src: "/images/gallery-2.jpg" },
  { label: "Passed Hors d’Oeuvres", src: "/images/gallery-3.jpg" },
  { label: "Cascading French Buffet", src: "/images/gallery-4.jpg" },
  { label: "Al Fresco Dining Setup", src: "/images/gallery-5.jpg" },
  { label: "Patisserie & Sweet Display", src: "/images/gallery-6.jpg" },
  { label: "Corporate VIP Banquet", src: "/images/gallery-7.jpg" },
];

const faqs: Faq[] = [
  {
    q: "What areas across the UAE do you serve?",
    a: "We provide full-service catering and private chef experiences across Abu Dhabi, Dubai, and the wider Emirates.",
  },
  {
    q: "How far should we reserve our date?",
    a: "We recommend booking Thanksgiving, Christmas, New Year’s Eve, Ramadan Iftar and Suhoor, and large corporate events 4–6 weeks in advance. For weddings, we suggest booking 2–3 months ahead, while other events are best booked 3–4 weeks in advance. We’re also happy to accommodate short-notice requests, subject to availability.",
  },
  {
    q: "Can dietary preferences and allergies be accommodated?",
    a: "Every menu is bespoke. We curate dedicated menus for vegetarian, vegan, gluten-free, dairy-free, and specific allergy requirements without compromising culinary craftsmanship.",
  },
  {
    q: "Do you provide full front-of-house service staff and tableware?",
    a: "Yes. Depending on your needs, we provide discreet chef-only execution or complete front-of-house teams including service captains, mixologists, bespoke tableware, linens, and tabletop styling.",
  },
  {
    q: "What is the booking and consultation process?",
    a: "You submit your event details through our online booking wizard. Within 48 hours, our culinary team contacts you with bespoke menu proposals, format recommendations, and an itemized quote.",
  },
];

const usps = [
  {
    num: "01",
    title: "Personalized touch",
    desc: "Our menus are tailored to your taste, event, and needs. Choose from our culinary offerings and customize your selections and quantities to create a celebration that feels uniquely yours.",
    image: "/images/why-choose-us-main.jpg",
    imageLabel: "Chef selecting seasonal ingredients",
  },
  {
    num: "02",
    title: "Premium Quality",
    desc: "We source quality ingredients from trusted suppliers to create exquisite dishes and beautifully presented buffets ensuring exceptional taste and memorable dining moments.",
    image: "/images/gallery-8.jpg",
    imageLabel: "Chef Manou tailoring a bespoke menu",
  },
  {
    num: "03",
    title: "Expert Team",
    desc: "Our skilled chefs and professional service team bring expertise, care, and attention to detail to every occasion creating an unforgettable gathering.",
    image: "/images/event-1.jpg",
    imageLabel: "Flawless on-site event execution",
  },
  {
    num: "04",
    title: "Full-Service Catering",
    desc: "From buffet setup, tables, seating, and tableware to glassware and LED based equipment, we take care of every detail from start to finish allowing you to enjoy a truly effortless occasion.",
    image: "/images/event-2.jpg",
    imageLabel: "Refined final plating detail",
  },
];

export default async function Home() {
  const testimonials = await getTestimonials();

  return (
    <main id="top" className="landing-main">
      <HashScroll />
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
            <h1>
              <em>Luxury </em>
              <br />
              <strong>GOURMET CATERING </strong>
            </h1>
            <svg
              className="hero-underline"
              viewBox="0 0 200 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 13C42 3 84 3 116 9C148 15 178 15 196 6"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
            <p className="hero-text">
              Exceptional dining inspired by authentic flavors and warm
              hospitality. Thoughtfully tailored for every occasion from
              intimate gatherings to grand celebrations across Dubai, Abu Dhabi,
              and the wider UAE.
            </p>
            <div className="hero-actions">
              <Link className="book-button book-button--light" href="/book">
                Book now
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <Image
              src="/images/cover.jpg"
              alt="Signature seasonal dining spread"
              fill
              preload
              className="hero-placeholder"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
          </div>
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
                <Image
                  src={dish.src}
                  alt={dish.label}
                  fill
                  className="food-marquee__circle"
                  sizes="190px"
                />
              </div>
            ))}
            {/* Duplicated set for continuous seamless loop */}
            {circularFoodImages.map((dish, i) => (
              <div
                key={`dish-b-${i}`}
                className="food-marquee__item"
                aria-hidden="true"
              >
                <Image
                  src={dish.src}
                  alt={dish.label}
                  fill
                  className="food-marquee__circle"
                  sizes="190px"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            SECTION 4: SERVICES / OFFERINGS SECTION
            ================================================== */}
        <section
          id="services"
          className="section-pad services"
          aria-label="Our Catering Services"
        >
          <div className="section-intro reveal">
            {/* <p className="eyebrow">The Manou Experience</p> */}
            <h2>Our Catering Services</h2>
            <p>
              From corporate gatherings to special celebrations, we create
              diverse catering experiences designed to make every occasion
              memorable. Every dish is prepared with care, precision, and a
              commitment to quality bringing together rich flavors, beautiful
              presentation, and gracious hospitality for an event your guests
              will cherish.
            </p>
            <div className="section-intro__cta">
              <Link className="text-link" href="/book">
                Enquire now <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="service-grid">
            {/* Corporate Card */}
            <article className="service-card service-card--corporate reveal">
              <div className="service-card__media">
                <Image
                  src="/images/event-2.jpg"
                  alt="Corporate catering — executive breakfast, canapés & buffets"
                  fill
                  className="service-placeholder"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="service-card__content">
                <span className="card-number">01 / 02</span>
                <h3>Corporate gatherings</h3>
                <p>
                  We offer prestigious catering for corporate events including
                  business breakfasts, working lunches, product launches,
                  executive dinners, VIP hospitality, meetings, and conferences.
                  Enjoy premium menus and attentive service for every corporate
                  occasion.
                </p>
                <div className="service-tags">
                  <span>Coffee Break </span>
                  <span>Breakfast </span>
                  <span>Lunch </span>
                  <span>official Events </span>
                  <span>Other </span>
                </div>
                <Link
                  className="book-button service-btn"
                  href="/book?type=corporate"
                >
                  Book now <ArrowRight size={15} />
                </Link>
              </div>
            </article>

            {/* Private Occasions Card */}
            <article className="service-card service-card--private reveal">
              <div className="service-card__media">
                <Image
                  src="/images/event-1.jpg"
                  alt="Private & special events — plated dinners, weddings & celebrations"
                  fill
                  className="service-placeholder"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="service-card__content">
                <span className="card-number">02 / 02</span>
                <h3>Private & Special events</h3>
                <p>
                  We create first class catering experiences for weddings,
                  birthdays, anniversaries, engagements, private parties, and
                  special celebrations. From exquisite buffet displays to
                  professional service, our skilled chefs and dedicated team
                  craft every detail with precision, elegance, and care.
                </p>
                <div className="service-tags">
                  <span>Birthday </span>
                  <span>Anniversary </span>
                  <span>Wedding </span>
                  <span>Engagement </span>
                  <span>Family Gathering</span>
                  <span>Baby Shower </span>
                  <span>Other </span>
                </div>
                <Link
                  className="book-button service-btn"
                  href="/book?type=private"
                >
                  Book now <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* ==================================================
            SECTION 5: WHY US / BRAND USPS SECTION
            ================================================== */}
        <section
          id="usps"
          className="section-pad usps"
          aria-label="Why Choose La Cuisine de Manou"
        >
          <div className="usp-visual">
            {usps.map((item, index) => (
              <div
                key={item.num}
                className={`usp-visual__frame ${index === 0 ? "is-active" : ""}`}
              >
                <Image
                  src={item.image}
                  alt={item.imageLabel}
                  fill
                  className="usp-placeholder"
                  sizes="(max-width: 900px) 100vw, 42vw"
                />
              </div>
            ))}
          </div>

          <div className="usp-copy reveal">
            <div className="usp-copy__header">
              <p className="eyebrow">Why choose La Cuisine de Manou?</p>
              <h2>
                More than
                <br />
                <em>a meal.</em>
              </h2>
              <p className="usp-lead">
                At La Cuisine de Manou, we believe exceptional catering is about
                more than great food. It’s about creating moments worth
                remembering. From the first detail to the final touch, we bring
                together exceptional cuisine, attentive service, and thoughtful
                touches to make every occasion special.
              </p>
            </div>

            <div className="usp-list">
              {usps.map((item, index) => (
                <div
                  key={item.num}
                  data-usp-index={index}
                  className={`usp-item ${index === 0 ? "is-active" : ""}`}
                >
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
                Plan Your Event <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <UspScrollSync sectionId="usps" />
        </section>

        {/* ==================================================
            SECTION 6: SCROLLING GALLERY
            ================================================== */}
        <section
          id="gallery"
          className="gallery-section"
          aria-label="Scrolling Visual Gallery"
        >
          <div className="gallery-header text-center">
            <p className="eyebrow">Experience &amp; Atmosphere</p>
            <h2>
              <em>Gallery</em>
            </h2>
            <p className="gallery-subhead">
              A glimpse into beautifully crafted events and exquisite dining
              experiences created by La Cuisine de Manou.
            </p>
          </div>

          <GalleryScroller>
            {galleryCards.map((card, idx) => (
              <div key={idx} className="gallery-card">
                <Image
                  src={card.src}
                  alt={card.label}
                  fill
                  className="gallery-card__placeholder"
                  sizes="320px"
                />
              </div>
            ))}
          </GalleryScroller>
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
            <p className="eyebrow">Trusted by Our Clients</p>
            <h2>Customer testimonials</h2>
            <p className="testimonials-subtitle">Customer Testimonials</p>
          </div>

          <TestimonialsCarousel testimonials={testimonials} />
        </section>

        {/* ==================================================
            SECTION 8: MID-PAGE CONVERSION BANNER
            ================================================== */}
        <section className="booking-banner" aria-label="Call to action">
          <div className="booking-banner__inner">
            <p className="eyebrow">Your Occasion, Our Expertise</p>
            <h2>Enjoy an elevated catering experience</h2>
            <p className="booking-banner__text">
              Share your date, guest count, and culinary preferences and we’ll
              create a tailored catering experience to make your occasion
              unforgettable.
            </p>
            <div className="booking-banner__actions">
              <Link className="book-button book-button--light" href="/book">
                Plan your event <ArrowRight size={16} />
              </Link>
              <Link
                className="outline-button outline-button--light"
                href="/contact-us"
              >
                Message us
              </Link>
            </div>
          </div>
        </section>

        {/* ==================================================
            SECTION 9: FAQ ACCORDION SECTION
            ================================================== */}
        <section
          id="faq"
          className="section-pad faq-section"
          aria-label="Frequently Asked Questions"
        >
          <div className="faq-intro">
            <p className="eyebrow">Frequently Asked Questions</p>
            <h2>
              Everything You
              <br />
              <em>Need to Know</em>
            </h2>
            <p>
              Find answers to common questions about our menus, services,
              events, and catering services.
            </p>
            <Link className="text-link" href="/contact-us">
              Message us <ArrowRight size={15} />
            </Link>
          </div>

          <FaqAccordion faqs={faqs} />
        </section>

        {/* ==================================================
            SECTION 10: CONTACT / PRE-FOOTER INQUIRY SECTION
            ================================================== */}
        <section className="contact-banner" aria-label="Contact and Inquiries">
          <div className="contact-banner__inner">
            <p className="eyebrow">Plan Your Event</p>
            <h2>Let&apos;s create something remarkable</h2>
            <p className="contact-banner__text">
              Tell us about your event and we&apos;ll help bring your vision to
              life with an exquisite catering experience starting from the menu
              to the final detail.
            </p>
            <div className="contact-banner__actions">
              <Link className="book-button book-button--light" href="/book">
                Book now <ArrowRight size={16} />
              </Link>
              <Link
                className="outline-button outline-button--light"
                href="/contact-us"
              >
                Contact us
              </Link>
            </div>
            <div className="contact-banner__note">
              <span>Direct inquiries: </span>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              <span> · </span>
              <a href={`tel:${CONTACT.landline.tel}`}>
                {CONTACT.landline.display}
              </a>
              <span> | </span>
              <a href={`tel:${CONTACT.mobile.tel}`}>{CONTACT.mobile.display}</a>
            </div>
          </div>
        </section>
      </div>

      {/* ==================================================
          STICKY CONVERSION BAR (Scroll Activated)
          ================================================== */}
      <StickyCtaBar>
        <div className="sticky-cta-bar__content">
          <div className="sticky-cta-bar__text">
            <strong>La Cuisine de Manou</strong>
            <span>Seasonal French Catering · UAE</span>
          </div>
          <div className="sticky-cta-bar__buttons">
            <Link className="book-button sticky-btn" href="/book">
              Book now <ArrowRight size={14} />
            </Link>
            <Link
              className="outline-button sticky-btn--subtle"
              href="/contact-us"
            >
              <MessageCircle size={14} /> Inquire
            </Link>
          </div>
        </div>
      </StickyCtaBar>

      <SiteFooter />
    </main>
  );
}
