import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { whatsappLink } from '@/lib/whatsapp'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Thank you — La Cuisine de Manou',
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; event?: string; date?: string }>
}) {
  const params = await searchParams
  const wa = whatsappLink(
    params.id
      ? `Hi, I submitted booking ${params.id} for ${params.event || 'an event'} on ${params.date || 'my date'}`
      : 'Hi, I just reached out from the website.',
  )

  return (
    <main className="inner-page">
      <SiteHeader />
      <section className="inner-hero">
        <p className="eyebrow">Received</p>
        <h1>
          Thank you
          <br />
          <em>for writing.</em>
        </h1>
        {params.id && <div className="booking-id">Booking ID · {params.id}</div>}
        <p>We’ll come back to you shortly with ideas and availability.</p>
        <div className="contact-actions">
          <a className="book-button" href={wa} target="_blank" rel="noreferrer">
            Chat with us on WhatsApp <ArrowRight size={16} />
          </a>
          <Link className="outline-button" href="/">
            Back to home
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
