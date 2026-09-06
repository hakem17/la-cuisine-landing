import { BookingWizard } from '@/components/booking-wizard'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export const metadata = {
  title: 'Book an event — La Cuisine de Manou',
  description: 'Start your catering order with La Cuisine de Manou. Private dinners, weddings and corporate gatherings across the UAE.',
}

export default function BookNowPage() {
  return (
    <main className="inner-page">
      <SiteHeader />
      <section className="inner-hero">
        <p className="eyebrow">Start your order</p>
        <h1>
          Tell us about
          <br />
          <em>the table.</em>
        </h1>
        <p>Six short steps. We’ll take care of the rest — menu, service and the feeling of the evening.</p>
      </section>
      <section className="inner-body">
        <BookingWizard />
      </section>
      <SiteFooter />
    </main>
  )
}
