import { calculateBudget } from '@/lib/budget'
import { createBooking } from '@/lib/store'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    if (data.event_type !== 'private' && data.event_type !== 'corporate') {
      return NextResponse.json({ success: false, error: 'Please choose an event type.' }, { status: 400 })
    }
    if (!data.event_selection) {
      return NextResponse.json({ success: false, error: 'Please choose your event.' }, { status: 400 })
    }
    const eventDate = new Date(data.event_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (!data.event_date || eventDate <= today) {
      return NextResponse.json({ success: false, error: 'Please choose a future date.' }, { status: 400 })
    }
    const guests = Number(data.guest_count)
    if (!Number.isFinite(guests) || guests < 1) {
      return NextResponse.json({ success: false, error: 'Please enter a guest count.' }, { status: 400 })
    }
    if (data.event_selection === 'VIP Events' && guests < 20) {
      return NextResponse.json({ success: false, error: 'Minimum 20 guests for VIP events.' }, { status: 400 })
    }
    if (!data.location) {
      return NextResponse.json({ success: false, error: 'Please choose a location.' }, { status: 400 })
    }
    if (!data.full_name || String(data.full_name).trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Please enter your full name.' }, { status: 400 })
    }
    if (!data.phone || !/^[0-9\s]+$/.test(data.phone)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid phone number.' }, { status: 400 })
    }
    if (!data.email || !String(data.email).includes('@') || !String(data.email).includes('.')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 })
    }
    if (!data.contact_channel) {
      return NextResponse.json({ success: false, error: 'Please choose a contact channel.' }, { status: 400 })
    }

    const isVip = data.event_selection === 'VIP Events'
    const budget = calculateBudget(guests, data.location, isVip)

    const booking = createBooking({
      event_type: data.event_type,
      event_selection: data.event_selection,
      event_date: data.event_date,
      guest_count: guests,
      location: data.location,
      location_other: data.location_other || null,
      budget_min: Number(data.budget_min) || budget.min,
      budget_max: Number(data.budget_max) || budget.max,
      cuisine: Array.isArray(data.cuisine) ? data.cuisine : [],
      cuisine_other: data.cuisine_other || null,
      contact_channel: data.contact_channel,
      channel_other: data.channel_other || null,
      full_name: String(data.full_name).trim(),
      country_code: data.country_code || '+971',
      phone: String(data.phone).trim(),
      email: String(data.email).trim(),
      company_website: data.company_website || null,
      role: data.role || null,
    })

    return NextResponse.json({ success: true, booking_id: booking.booking_id })
  } catch (error) {
    if (error instanceof Error && error.message === 'DATE_UNAVAILABLE') {
      return NextResponse.json({ success: false, error: 'That date is already booked.' }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: 'Could not save your booking.' }, { status: 500 })
  }
}
