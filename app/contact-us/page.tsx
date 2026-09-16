import { ContactForm } from '@/components/contact-form'
import { PhoneCallButton } from '@/components/phone-call-button'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { whatsappLink } from '@/lib/whatsapp'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Contact — La Cuisine de Manou',
  description: 'Ask a question about catering, private chef services or availability.',
}

export default async function ContactUsPage({
  searchParams,
}: {
  searchParams: Promise<{ flow?: string; date?: string; time?: string }>
}) {
  const params = await searchParams
  const isFoodDelivery = params.flow === 'food-delivery'
  const initialQuestion = isFoodDelivery
    ? `Hi, I'd like to request a food delivery on ${params.date || '[date]'} at ${params.time || '[time]'}. `
    : ''
  const wa = whatsappLink(
    isFoodDelivery
      ? `Bonjour La Cuisine de Manou, I'd like to request a food delivery on ${params.date || '[date]'} at ${params.time || '[time]'}.`
      : 'Bonjour La Cuisine de Manou, I have a question.',
  )

  return (
    <main className="inner-page">
      <SiteHeader />
      <section className="inner-hero">
        <p className="eyebrow">{isFoodDelivery ? 'Food delivery request' : 'A conversation'}</p>
        <h1>
          {isFoodDelivery ? (
            <>
              Let's confirm
              <br />
              <em>your delivery.</em>
            </>
          ) : (
            <>
              Ask us
              <br />
              <em>anything.</em>
            </>
          )}
        </h1>
        {isFoodDelivery ? (
          <p>
            Requested for <strong>{params.date}</strong> at <strong>{params.time}</strong>. Reach us directly below,
            or send the details through the form and our team will confirm shortly.
          </p>
        ) : (
          <p>
            Prefer to start an order instead?{' '}
            <Link href="/book" className="text-link">
              Book now
            </Link>
          </p>
        )}
        <div className="contact-actions">
          <a className="book-button" href={wa} target="_blank" rel="noreferrer">
            Chat with us on WhatsApp <ArrowRight size={16} />
          </a>
          <PhoneCallButton />
        </div>
      </section>
      <section className="inner-body inner-body--narrow">
        <ContactForm initialQuestion={initialQuestion} />
      </section>
      <SiteFooter />
    </main>
  )
}
