'use client'

import { calculateBudget, formatBudgetRange } from '@/lib/budget'
import { whatsappLink } from '@/lib/whatsapp'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Globe,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Sparkles,
  User,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react'

const STEPS = ['Event Type', 'Event', 'Details', 'Preferences', 'Your Info', 'Review']

const EVENT_OPTIONS = {
  corporate: [
    'Breakfast & Coffee Break',
    'Finger Food & Canapes',
    'Afternoon Tea Tower',
    'Luxury Buffet',
    'Pass Around',
    'Custom Menus & Themed Catering',
    'Live Station',
  ],
  private: [
    'Birthday',
    'Wedding',
    'Baby Shower',
    'Dinner',
    'Luxury Buffet',
    'Pass Around',
    'Custom Menus & Themed Catering',
    'Live Station',
    'VIP Events',
  ],
}

const OTHER_EMIRATES = [
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
  'Al Ain',
]

const CUISINES = [
  'American',
  'Italian',
  'French',
  'Mexican & Latin American',
  'Spanish',
  'Healthy & Plant-Based',
  'Bakery & Pastry',
  'Desserts & Sweet Treats',
  'Other',
]

const CHANNELS = [
  { id: 'WhatsApp', icon: MessageCircle },
  { id: 'Email', icon: Mail },
  { id: 'Phone', icon: Phone },
  { id: 'Other', icon: Heart },
]

const COUNTRIES = [
  { code: '+971', label: 'UAE' },
  { code: '+966', label: 'Saudi' },
  { code: '+974', label: 'Qatar' },
  { code: '+973', label: 'Bahrain' },
  { code: '+968', label: 'Oman' },
  { code: '+965', label: 'Kuwait' },
  { code: '+1', label: 'USA' },
  { code: '+44', label: 'UK' },
]

type FormState = {
  event_type: 'private' | 'corporate' | ''
  event_selection: string
  event_date: string
  guest_count: number
  location: 'Abu Dhabi' | 'Dubai' | 'Other' | ''
  location_other: string
  cuisine: string[]
  cuisine_other: string
  contact_channel: string
  channel_other: string
  full_name: string
  country_code: string
  phone: string
  email: string
  company_website: string
  role: string
}

const initialForm: FormState = {
  event_type: '',
  event_selection: '',
  event_date: '',
  guest_count: 20,
  location: '',
  location_other: '',
  cuisine: [],
  cuisine_other: '',
  contact_channel: '',
  channel_other: '',
  full_name: '',
  country_code: '+971',
  phone: '',
  email: '',
  company_website: '',
  role: '',
}

function BookingWizardContent() {
  const searchParams = useSearchParams()
  const initialType = searchParams.get('type')
  const initialEvent = searchParams.get('event')

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(() => {
    const isPrivate = initialType === 'private'
    const isCorporate = initialType === 'corporate'
    const validEvent =
      initialEvent &&
      ((isPrivate && EVENT_OPTIONS.private.includes(initialEvent)) ||
        (isCorporate && EVENT_OPTIONS.corporate.includes(initialEvent)))
        ? initialEvent
        : ''

    return {
      ...initialForm,
      event_type: isPrivate ? 'private' : isCorporate ? 'corporate' : '',
      event_selection: validEvent,
    }
  })

  useEffect(() => {
    if (initialType === 'private' || initialType === 'corporate') {
      setForm((prev) => ({
        ...prev,
        event_type: initialType,
      }))
      setStep(2)
    }
  }, [initialType])

  const [error, setError] = useState('')
  const [guestAlert, setGuestAlert] = useState<{ tone: 'amber' | 'blue' | 'red'; text: string } | null>(null)
  const [bookedDates, setBookedDates] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [bookingId, setBookingId] = useState('')

  const isVip = form.event_selection === 'VIP Events'
  const budget = useMemo(
    () => calculateBudget(form.guest_count || 0, form.location, isVip),
    [form.guest_count, form.location, isVip],
  )

  useEffect(() => {
    fetch('/api/available-dates')
      .then((res) => res.json())
      .then((data) => setBookedDates(data.booked_dates || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setGuestAlert(validateGuests(form.guest_count, form.event_type, isVip))
  }, [form.guest_count, form.event_type, isVip])

  const today = new Date().toISOString().slice(0, 10)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  const validateStep = (current: number) => {
    if (current === 1 && !form.event_type) {
      return 'Please choose your event type (Private or Corporate / Office).'
    }
    if (current === 2 && !form.event_selection) {
      return 'Please choose the specific event format.'
    }
    if (current === 3) {
      if (!form.event_date) return 'Please choose an event date from the calendar.'
      if (form.event_date <= today) return 'Please choose a future date.'
      if (bookedDates.includes(form.event_date)) {
        return 'That date is already confirmed and booked. Please choose another date.'
      }
      if (form.event_type === 'private' && form.guest_count < 5) {
        return 'Private events require at least 5 guests.'
      }
      if (form.event_type === 'corporate' && form.guest_count < 1) {
        return 'Please enter a valid guest count (minimum 1 guest).'
      }
      if (isVip && form.guest_count < 20) {
        return 'VIP Events require a minimum of 20 guests.'
      }
      if (!form.location) return 'Please select your event location.'
      if (form.location === 'Other' && form.location_other.trim().length < 2) {
        return 'Please specify your UAE location (e.g. Sharjah, Ajman, Ras Al Khaimah, etc.).'
      }
    }
    if (current === 4) {
      if (!form.contact_channel) return 'Please choose your preferred contact channel.'
      if (form.contact_channel === 'Other' && form.channel_other.trim().length < 2) {
        return 'Please specify your preferred contact channel.'
      }
      if (form.cuisine.includes('Other') && form.cuisine_other.trim().length < 2) {
        return 'Please specify your custom cuisine interest.'
      }
    }
    if (current === 5) {
      if (!/^[A-Za-zÀ-ÿ\s-]{2,}$/.test(form.full_name.trim())) {
        return 'Please enter your full name.'
      }
      if (!/^[0-9\s]{6,}$/.test(form.phone.trim())) {
        return 'Please enter a valid phone number.'
      }
      if (!form.email.includes('@') || !form.email.includes('.')) {
        return 'Please enter a valid email address (must contain @ and domain).'
      }
      if (form.event_type === 'corporate') {
        if (form.company_website && !form.company_website.includes('.')) {
          return 'Please enter a valid company website containing a dot domain (e.g., company.com).'
        }
      }
    }
    return ''
  }

  const next = () => {
    const message = validateStep(step)
    if (message) {
      setError(message)
      return
    }
    setError('')
    setStep((s) => Math.min(6, s + 1))
  }

  const prev = () => {
    setError('')
    setStep((s) => Math.max(1, s - 1))
  }

  const goTo = (target: number) => {
    setError('')
    setStep(target)
  }

  const toggleCuisine = (item: string) => {
    setForm((prev) => ({
      ...prev,
      cuisine: prev.cuisine.includes(item)
        ? prev.cuisine.filter((c) => c !== item)
        : [...prev.cuisine, item],
    }))
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const message = validateStep(5)
    if (message) {
      setError(message)
      setStep(5)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: form.event_type,
          event_selection: form.event_selection,
          event_date: form.event_date,
          guest_count: form.guest_count,
          location: form.location,
          location_other: form.location === 'Other' ? form.location_other : null,
          budget_min: budget.min,
          budget_max: budget.max,
          cuisine: form.cuisine.filter((c) => c !== 'Other'),
          cuisine_other: form.cuisine.includes('Other') ? form.cuisine_other : null,
          contact_channel: form.contact_channel,
          channel_other: form.contact_channel === 'Other' ? form.channel_other : null,
          full_name: form.full_name.trim(),
          country_code: form.country_code,
          phone: form.phone.trim(),
          email: form.email.trim(),
          company_website: form.event_type === 'corporate' ? form.company_website || null : null,
          role: form.event_type === 'corporate' ? form.role || null : null,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not submit booking')
      setBookingId(data.booking_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (bookingId) {
    const locText = form.location === 'Other' ? form.location_other : form.location
    const wa = whatsappLink(
      `Bonjour La Cuisine de Manou,\n\nI have submitted my catering enquiry!\n\n• Booking ID: ${bookingId}\n• Type: ${form.event_type === 'corporate' ? 'Corporate / Office' : 'Private'}\n• Event: ${form.event_selection}\n• Date: ${form.event_date}\n• Guests: ${form.guest_count}\n• Location: ${locText}\n• Budget Range: ${formatBudgetRange(budget.min, budget.max)}\n• Contact: ${form.full_name} (${form.country_code} ${form.phone})\n\nLooking forward to discussing our bespoke menu!`,
    )
    return (
      <div className="success-panel">
        <p className="eyebrow">Request received</p>
        <h2>
          Thank you,
          <br />
          <em>{form.full_name.split(' ')[0] || form.full_name}.</em>
        </h2>
        <p>
          Your catering enquiry is safely with us. Our culinary team will review your requirements and
          get in touch shortly with bespoke menus and availability.
        </p>
        <div className="booking-id">Booking ID · {bookingId}</div>
        <a className="book-button" href={wa} target="_blank" rel="noreferrer">
          Chat with us on WhatsApp <ArrowRight size={16} />
        </a>
      </div>
    )
  }

  return (
    <form className="wizard" onSubmit={onSubmit}>
      <ol className="step-bar" aria-label="Booking progress">
        {STEPS.map((label, index) => {
          const n = index + 1
          const state = n < step ? 'done' : n === step ? 'current' : 'todo'
          return (
            <li key={label} className={`step-dot step-dot--${state}`}>
              <span>{state === 'done' ? <Check size={14} /> : n}</span>
              <em>{label}</em>
            </li>
          )
        })}
      </ol>

      {/* ==================================================
          Q1: EVENT TYPE
          ================================================== */}
      {step === 1 && (
        <section className="wizard-step">
          <p className="eyebrow">Q1 · Event Type</p>
          <h2>
            What type of event
            <br />
            <em>are you planning?</em>
          </h2>
          <div className="choice-grid choice-grid--two">
            <button
              type="button"
              className={`choice-card ${form.event_type === 'private' ? 'is-selected' : ''}`}
              onClick={() => {
                update('event_type', 'private')
                update('event_selection', '')
              }}
            >
              <Heart size={28} className="text-terracotta" />
              <strong>Private</strong>
              <span>Birthdays, weddings, dinners, baby showers &amp; milestone celebrations</span>
            </button>
            <button
              type="button"
              className={`choice-card ${form.event_type === 'corporate' ? 'is-selected' : ''}`}
              onClick={() => {
                update('event_type', 'corporate')
                update('event_selection', '')
              }}
            >
              <Briefcase size={28} className="text-terracotta" />
              <strong>Corporate / Office</strong>
              <span>Executive meetings, breakfasts, canapés, summits &amp; luxury buffets</span>
            </button>
          </div>
        </section>
      )}

      {/* ==================================================
          Q2: CHOOSE THE EVENT
          ================================================== */}
      {step === 2 && (
        <section className="wizard-step">
          <p className="eyebrow">Q2 · Choose the Event</p>
          <h2>
            Choose
            <br />
            <em>your event format.</em>
          </h2>
          <div className="choice-grid">
            {(form.event_type === 'corporate' ? EVENT_OPTIONS.corporate : EVENT_OPTIONS.private).map(
              (item) => (
                <button
                  type="button"
                  key={item}
                  className={`choice-card choice-card--compact ${
                    form.event_selection === item ? 'is-selected' : ''
                  }`}
                  onClick={() => update('event_selection', item)}
                >
                  <strong>{item}</strong>
                  {item === 'VIP Events' && (
                    <span className="text-xs text-terracotta flex items-center gap-1 mt-1">
                      <Sparkles size={12} /> Minimum 20 guests
                    </span>
                  )}
                </button>
              ),
            )}
          </div>
        </section>
      )}

      {/* ==================================================
          Q3, Q4, Q5: EVENT DATE, GUEST COUNT, LOCATION
          ================================================== */}
      {step === 3 && (
        <section className="wizard-step">
          <p className="eyebrow">Q3, Q4, Q5 · Event Details</p>
          <h2>
            Date, guests
            <br />
            <em>&amp; location.</em>
          </h2>

          {/* Q3: Event Date */}
          <label className="field">
            <span>Q3 · Event Date (Pick from calendar)</span>
            <input
              type="date"
              min={today}
              value={form.event_date}
              onChange={(e) => update('event_date', e.target.value)}
            />
          </label>

          {/* Q4: Expected Guest Count */}
          <label className="field">
            <span>Q4 · Expected Guest Count</span>
            <div className="stepper">
              <button
                type="button"
                onClick={() =>
                  update(
                    'guest_count',
                    Math.max(form.event_type === 'private' ? 5 : 1, form.guest_count - 1),
                  )
                }
                aria-label="Decrease guests"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min={form.event_type === 'private' ? 5 : 1}
                value={form.guest_count}
                onChange={(e) =>
                  update(
                    'guest_count',
                    Number(e.target.value) || (form.event_type === 'private' ? 5 : 1),
                  )
                }
              />
              <button
                type="button"
                onClick={() => update('guest_count', form.guest_count + 1)}
                aria-label="Increase guests"
              >
                <Plus size={16} />
              </button>
            </div>
          </label>

          {/* Guest Count Alerts based on logic */}
          {guestAlert && <p className={`note note--${guestAlert.tone}`}>{guestAlert.text}</p>}

          {/* Q5: Location */}
          <fieldset className="field">
            <legend>Q5 · Location</legend>
            <div className="radio-row">
              {(['Abu Dhabi', 'Dubai', 'Other'] as const).map((place) => (
                <label key={place} className={form.location === place ? 'is-selected' : ''}>
                  <input
                    type="radio"
                    name="location"
                    value={place}
                    checked={form.location === place}
                    onChange={() => update('location', place)}
                  />
                  {place === 'Other' ? 'Other UAE Location' : place}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Other UAE Location Input & Pills */}
          {form.location === 'Other' && (
            <div className="field">
              <span>Which UAE Location?</span>
              <input
                type="text"
                placeholder="Sharjah, Ajman, Ras Al Khaimah, Fujairah, Umm Al Quwain, Al Ain..."
                value={form.location_other}
                onChange={(e) => update('location_other', e.target.value)}
              />
              <div className="location-pills">
                {OTHER_EMIRATES.map((emirate) => (
                  <button
                    key={emirate}
                    type="button"
                    className={`pill-button ${
                      form.location_other === emirate ? 'pill-button--active' : ''
                    }`}
                    onClick={() => update('location_other', emirate)}
                  >
                    <MapPin size={12} /> {emirate}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================================================
          Q6, Q7, Q8: BUDGET, CUISINE, CONTACT CHANNEL
          ================================================== */}
      {step === 4 && (
        <section className="wizard-step">
          <p className="eyebrow">Q6, Q7, Q8 · Budget &amp; Preferences</p>
          <h2>
            Budget, cuisine
            <br />
            <em>&amp; contact channel.</em>
          </h2>

          {/* Q6: Budget calculation range */}
          <div className="budget-box">
            <span>Q6 · Estimated Budget Range</span>
            <strong>{formatBudgetRange(budget.min, budget.max)}</strong>
            <em>
              Based on {form.guest_count} guests · {form.location === 'Other' ? form.location_other || 'Other UAE Location' : form.location || 'your location'}
              {isVip && ' · VIP Event multiplier applied'}
            </em>
          </div>

          {/* Q7: Cuisine Interests */}
          <div className="field">
            <span>Q7 · Cuisine Interests (Choose all that apply)</span>
            <div className="choice-grid">
              {CUISINES.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`choice-card choice-card--compact ${
                    form.cuisine.includes(item) ? 'is-selected' : ''
                  }`}
                  onClick={() => toggleCuisine(item)}
                >
                  <strong>{item}</strong>
                </button>
              ))}
            </div>
          </div>

          {/* Q7: Other Cuisine input */}
          {form.cuisine.includes('Other') && (
            <label className="field">
              <span>Specify Other Cuisine</span>
              <input
                type="text"
                placeholder="e.g. Japanese, Greek, Levantine, Fusion..."
                value={form.cuisine_other}
                onChange={(e) => update('cuisine_other', e.target.value)}
              />
            </label>
          )}

          {/* Q8: Preferred Contact Channel */}
          <div className="field">
            <span>Q8 · Preferred Contact Channel</span>
            <div className="choice-grid choice-grid--four">
              {CHANNELS.map(({ id, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  className={`choice-card ${form.contact_channel === id ? 'is-selected' : ''}`}
                  onClick={() => update('contact_channel', id)}
                >
                  <Icon size={22} />
                  <strong>{id}</strong>
                </button>
              ))}
            </div>
          </div>

          {/* Q8: Other Channel input */}
          {form.contact_channel === 'Other' && (
            <label className="field">
              <span>Specify Contact Method</span>
              <input
                type="text"
                placeholder="e.g., Telegram, Zoom, Direct Call at specified hour..."
                value={form.channel_other}
                onChange={(e) => update('channel_other', e.target.value)}
              />
            </label>
          )}
        </section>
      )}

      {/* ==================================================
          Q9, Q10, Q11, Q12, Q13: YOUR INFO
          ================================================== */}
      {step === 5 && (
        <section className="wizard-step">
          <p className="eyebrow">Q9 to Q13 · Your Information</p>
          <h2>
            A little
            <br />
            <em>about you.</em>
          </h2>

          {/* Q9: Full Name */}
          <label className="field">
            <span>Q9 · Full Name</span>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)}
              placeholder="Your full name"
            />
          </label>

          {/* Q10: Phone Number with Country Code */}
          <label className="field">
            <span>Q10 · Phone Number</span>
            <div className="phone-row">
              <select
                value={form.country_code}
                onChange={(e) => update('country_code', e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label} {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="50 123 4567"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </div>
          </label>

          {/* Q11: Email */}
          <label className="field">
            <span>Q11 · Email Address</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          {/* Q12 & Q13: Corporate Only (Company Website & Role) */}
          {form.event_type === 'corporate' && (
            <>
              <label className="field">
                <span>Q12 · Company Website (must contain a domain dot)</span>
                <input
                  type="url"
                  value={form.company_website}
                  onChange={(e) => update('company_website', e.target.value)}
                  placeholder="https://company.com"
                />
              </label>
              <label className="field">
                <span>Q13 · Your Role / Job Title</span>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => update('role', e.target.value)}
                  placeholder="e.g., Event Director, Executive Assistant, CEO"
                />
              </label>
            </>
          )}
        </section>
      )}

      {/* ==================================================
          STEP 6: REVIEW & SUBMISSION
          ================================================== */}
      {step === 6 && (
        <section className="wizard-step">
          <p className="eyebrow">Step 06 · Review &amp; Confirmation</p>
          <h2>
            Does this
            <br />
            <em>feel right?</em>
          </h2>

          <article className="review-card">
            <header>
              <h3>Event Details</h3>
              <button type="button" onClick={() => goTo(1)}>Edit</button>
            </header>
            <dl>
              <div><dt>Type</dt><dd>{form.event_type === 'corporate' ? 'Corporate / Office' : 'Private'}</dd></div>
              <div><dt>Event</dt><dd>{form.event_selection}</dd></div>
              <div><dt>Date</dt><dd>{form.event_date}</dd></div>
              <div><dt>Guests</dt><dd>{form.guest_count}</dd></div>
              <div><dt>Location</dt><dd>{form.location === 'Other' ? form.location_other : form.location}</dd></div>
              <div><dt>Budget Range</dt><dd>{formatBudgetRange(budget.min, budget.max)}</dd></div>
            </dl>
          </article>

          <article className="review-card">
            <header>
              <h3>Preferences</h3>
              <button type="button" onClick={() => goTo(4)}>Edit</button>
            </header>
            <dl>
              <div>
                <dt>Cuisine</dt>
                <dd>
                  {[
                    ...form.cuisine.filter((c) => c !== 'Other'),
                    form.cuisine_other ? `Other (${form.cuisine_other})` : null,
                  ]
                    .filter(Boolean)
                    .join(', ') || 'Chef Recommendation'}
                </dd>
              </div>
              <div>
                <dt>Contact Via</dt>
                <dd>{form.contact_channel === 'Other' ? form.channel_other : form.contact_channel}</dd>
              </div>
            </dl>
          </article>

          <article className="review-card">
            <header>
              <h3>Contact Info</h3>
              <button type="button" onClick={() => goTo(5)}>Edit</button>
            </header>
            <dl>
              <div><dt>Name</dt><dd>{form.full_name}</dd></div>
              <div><dt>Phone</dt><dd>{form.country_code} {form.phone}</dd></div>
              <div><dt>Email</dt><dd>{form.email}</dd></div>
              {form.event_type === 'corporate' && form.company_website && (
                <div><dt>Website</dt><dd>{form.company_website}</dd></div>
              )}
              {form.event_type === 'corporate' && form.role && (
                <div><dt>Role</dt><dd>{form.role}</dd></div>
              )}
            </dl>
          </article>
        </section>
      )}

      {error && <p className="note note--red">{error}</p>}

      <div className="wizard-nav">
        {step > 1 ? (
          <button type="button" className="outline-button" onClick={prev}>
            <ArrowLeft size={16} /> Back
          </button>
        ) : (
          <span />
        )}
        {step < 6 ? (
          <button type="button" className="book-button" onClick={next}>
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button type="submit" className="book-button" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit enquiry'} {!submitting && <ArrowRight size={16} />}
          </button>
        )}
      </div>
    </form>
  )
}

export function BookingWizard() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm opacity-60">Loading booking wizard...</div>}>
      <BookingWizardContent />
    </Suspense>
  )
}

function validateGuests(count: number, type: FormState['event_type'], isVip: boolean) {
  if (isVip && count < 20) {
    return { tone: 'red' as const, text: 'VIP Events require a minimum of 20 guests.' }
  }
  if (type === 'corporate' && count >= 1 && count <= 9) {
    return { tone: 'amber' as const, text: 'VIP pricing applies — this is for VIPs and will cost you more.' }
  }
  if (type === 'corporate' && count >= 10 && count <= 19) {
    return { tone: 'blue' as const, text: 'Additional costs apply for smaller groups (under 20 guests).' }
  }
  if (type === 'private' && count >= 5 && count <= 19) {
    return { tone: 'amber' as const, text: 'VIP pricing applies — this is for VIPs and will cost you more.' }
  }
  return null
}
