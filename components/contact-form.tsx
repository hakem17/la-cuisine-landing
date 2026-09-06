'use client'

import { whatsappLink } from '@/lib/whatsapp'
import { ArrowRight } from 'lucide-react'
import { FormEvent, useState } from 'react'

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

export function ContactForm() {
  const [question, setQuestion] = useState('')
  const [fullName, setFullName] = useState('')
  const [countryCode, setCountryCode] = useState('+971')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (question.trim().length < 10) {
      return setError('Please tell us a little more — at least 10 characters.')
    }
    if (fullName.trim().length < 2) {
      return setError('Please enter your full name.')
    }
    if (!/^[0-9\s]{6,}$/.test(phone.trim())) {
      return setError('Please enter a valid phone number.')
    }
    if (!email.includes('@') || !email.includes('.')) {
      return setError('Please enter a valid email address.')
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          full_name: fullName.trim(),
          country_code: countryCode,
          phone: phone.trim(),
          email: email.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not send your message')
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="success-panel">
        <p className="eyebrow">Message received</p>
        <h2>
          We’ll be
          <br />
          <em>in touch.</em>
        </h2>
        <p>Thank you for writing to us. A member of our culinary team will respond to your question shortly.</p>
        <a
          className="book-button"
          href={whatsappLink(`Hi, I just submitted an inquiry from the website regarding: "${question.slice(0, 80)}..."`)}
          target="_blank"
          rel="noreferrer"
        >
          Prefer immediate chat? Contact us on WhatsApp <ArrowRight size={16} />
        </a>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <label className="field">
        <span>Your question or brief</span>
        <textarea
          rows={5}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Tell us what you’d like to know about our menus, dates, or bespoke services..."
        />
      </label>
      <label className="field">
        <span>Full name</span>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
        />
      </label>
      <label className="field">
        <span>Phone number</span>
        <div className="phone-row">
          <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label} {c.code}
              </option>
            ))}
          </select>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="50 123 4567"
          />
        </div>
      </label>
      <label className="field">
        <span>Email address</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </label>
      {error && <p className="note note--red">{error}</p>}
      <button className="book-button" type="submit" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send message'} {!submitting && <ArrowRight size={16} />}
      </button>
    </form>
  )
}
