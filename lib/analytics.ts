// GTM data layer helpers — event names and parameter shapes follow
// la-cuisine-datalayer-spec.md (v2). Every push gets `page_path` added.

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

export type CtaType = 'book_now' | 'contact_us'
export type CtaLocation =
  | 'header_nav'
  | 'hero'
  | 'services_intro'
  | 'service_card_corporate'
  | 'service_card_private'
  | 'why_us'
  | 'bottom_cta'
  | 'faq'
  | 'final_cta'
  | 'footer'
  | 'footer_secondary'
  | 'sticky_bar'
  | 'contact_page'
  | 'other'

export type ContactMethod = 'phone' | 'email' | 'whatsapp'
export type ContactLocation =
  | 'header'
  | 'footer'
  | 'floating_button'
  | 'final_cta_section'
  | 'contact_page'
  | 'contact_page_hero'
  | 'booking_success'
  | 'contact_form_success'
  | 'other'

export type TrackedSection = 'services' | 'usps' | 'gallery' | 'testimonials' | 'faq'
export type ScrollPercent = 25 | 50 | 75 | 90 | 100
export type LeadType = 'booking_started' | 'direct_contact' | 'booking_completed' | 'contact_form'
export type FormName = 'booking_wizard' | 'contact_us'

export type BookingStepName =
  | 'event_type'
  | 'event_format'
  | 'event_date'
  | 'guest_count'
  | 'location'
  | 'budget_range'
  | 'cuisine_interests'
  | 'preferred_contact_channel'
  | 'contact_details'

export type BookingStepValue =
  | string
  | number
  | string[]
  | { format: string; additional_services: string[] }
  | null

type BookingStep = {
  booking_id: string
  step_number: number
  step_name: BookingStepName
}

export type DataLayerEvents = {
  page_view: { page_title: string; page_location: string }
  scroll_depth: { scroll_percent: ScrollPercent | null; section: TrackedSection | null }
  cta_click: { cta_type: CtaType; cta_location: CtaLocation; destination_url: string }
  contact_click: {
    contact_method: ContactMethod
    contact_value: string
    contact_location: ContactLocation
  }
  generate_lead: { lead_type: LeadType }
  booking_step_view: BookingStep & { step_value: null }
  booking_step_complete: BookingStep & { step_value: BookingStepValue }
  booking_step_abandon: { booking_id: string; last_step_completed: number }
  booking_form_submit: {
    booking_id: string
    event_type: string
    event_format: string
    additional_services: string[]
    event_date: string
    guest_count: number
    location: string
    budget_range: string | null
    cuisine_interests: string[]
    preferred_contact_channel: string
  }
  form_start: { form_name: FormName }
  form_submit: { form_name: FormName }
  form_error: { form_name: FormName; step_number?: number; error_message: string }
  contact_form_submit: { contact_reason?: string; preferred_contact_channel?: string }
}

export type DataLayerEventName = keyof DataLayerEvents

export function pushEvent<E extends DataLayerEventName>(event: E, params: DataLayerEvents[E]) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event,
    page_path: window.location.pathname,
    ...params,
    // GTM deep-merges arrays/objects into its data model by default; this makes
    // the push overwrite instead, so e.g. a shorter cuisine_interests array
    // doesn't inherit trailing items from a previous push.
    _clear: true,
  })
}

// ---- Composite events (custom event + its GA4 recommended alias) ----

export function trackCtaClick(params: DataLayerEvents['cta_click']) {
  pushEvent('cta_click', params)
  if (params.cta_type === 'book_now') pushEvent('generate_lead', { lead_type: 'booking_started' })
}

export function trackContactClick(params: DataLayerEvents['contact_click']) {
  pushEvent('contact_click', params)
  pushEvent('generate_lead', { lead_type: 'direct_contact' })
}

export function trackBookingSubmit(params: DataLayerEvents['booking_form_submit']) {
  pushEvent('booking_form_submit', params)
  pushEvent('form_submit', { form_name: 'booking_wizard' })
  pushEvent('generate_lead', { lead_type: 'booking_completed' })
  clearBookingId()
}

export function trackContactFormSubmit(params: DataLayerEvents['contact_form_submit'] = {}) {
  pushEvent('contact_form_submit', params)
  pushEvent('form_submit', { form_name: 'contact_us' })
  pushEvent('generate_lead', { lead_type: 'contact_form' })
}

// ---- booking_id persistence (sessionStorage, 24h expiry) ----

const BOOKING_ID_KEY = 'booking_id'
const BOOKING_ID_TS_KEY = 'booking_id_ts'
const BOOKING_ID_TTL_MS = 24 * 60 * 60 * 1000

export function getBookingId() {
  try {
    const id = sessionStorage.getItem(BOOKING_ID_KEY)
    const ts = Number(sessionStorage.getItem(BOOKING_ID_TS_KEY))
    if (id && Date.now() - ts < BOOKING_ID_TTL_MS) return id
    const fresh = crypto.randomUUID()
    sessionStorage.setItem(BOOKING_ID_KEY, fresh)
    sessionStorage.setItem(BOOKING_ID_TS_KEY, String(Date.now()))
    return fresh
  } catch {
    // Storage blocked (private mode etc.) — still return a per-mount id.
    return crypto.randomUUID()
  }
}

export function clearBookingId() {
  try {
    sessionStorage.removeItem(BOOKING_ID_KEY)
    sessionStorage.removeItem(BOOKING_ID_TS_KEY)
  } catch {}
}
