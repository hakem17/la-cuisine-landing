import { createContact } from '@/lib/store'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    if (!data.question || String(data.question).trim().length < 10) {
      return NextResponse.json({ success: false, error: 'Please tell us a little more.' }, { status: 400 })
    }
    if (!data.full_name || String(data.full_name).trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Please enter your full name.' }, { status: 400 })
    }
    if (!data.phone || !/^[0-9\s]+$/.test(data.phone)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid phone number.' }, { status: 400 })
    }
    if (!data.email || !String(data.email).includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 })
    }
    createContact({
      question: String(data.question).trim(),
      full_name: String(data.full_name).trim(),
      country_code: data.country_code || '+971',
      phone: String(data.phone).trim(),
      email: String(data.email).trim(),
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Could not send your message.' }, { status: 500 })
  }
}
