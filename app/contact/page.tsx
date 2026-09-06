import { ContactForm } from '@/components/contact-form'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import Link from 'next/link'

export const metadata = {
  title: 'Contact — La Cuisine de Manou',
  description: 'Ask a question about catering, private chef services or availability.',
}

export default function ContactPage() {
  return (
    <main className="inner-page">
      <SiteHeader />
      <section className="inner-hero">
        <p className="eyebrow">A conversation</p>
        <h1>
          Ask us
          <br />
          <em>anything.</em>
        </h1>
        <p>
          Prefer to start an order instead?{' '}
          <Link href="/book" className="text-link">
            Book now
          </Link>
        </p>
      </section>
      <section className="inner-body inner-body--narrow">
        <ContactForm />
      </section>
      <SiteFooter />
    </main>
  )
}
