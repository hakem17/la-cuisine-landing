import { CONTACT } from '@/lib/contact-info'

export function ContactDetails() {
  return (
    <aside className="contact-details" aria-label="Contact details">
      <p className="contact-details__lead">{CONTACT.tagline}</p>
      <h2>{CONTACT.name}</h2>
      <dl>
        <div>
          <dt>Office hours</dt>
          <dd>{CONTACT.officeHours}</dd>
        </div>
        <div>
          <dt>Operational hours</dt>
          <dd>{CONTACT.operationalHours}</dd>
        </div>
        <div>
          <dt>Contact</dt>
          <dd>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </dd>
          <dd>
            <a href={`tel:${CONTACT.landline.tel}`}>{CONTACT.landline.display}</a>
            {' | '}
            <a href={`tel:${CONTACT.mobile.tel}`}>{CONTACT.mobile.display}</a>
          </dd>
        </div>
      </dl>
    </aside>
  )
}
