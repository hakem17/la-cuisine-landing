import { createFoodDeliveryRequest } from '@/lib/store'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const deliveryDate = new Date(data.delivery_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (!data.delivery_date || deliveryDate <= today) {
      return NextResponse.json({ success: false, error: 'Please choose a future delivery date.' }, { status: 400 })
    }
    if (!data.delivery_time) {
      return NextResponse.json({ success: false, error: 'Please choose a delivery time.' }, { status: 400 })
    }

    const fullName = String(data.full_name ?? '').trim()
    const phone = String(data.phone ?? '').trim()
    const email = String(data.email ?? '').trim()
    if (fullName.length < 2) {
      return NextResponse.json({ success: false, error: 'Please enter your full name.' }, { status: 400 })
    }
    if (!/^[0-9\s]{6,}$/.test(phone)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid phone number.' }, { status: 400 })
    }
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const request_row = await createFoodDeliveryRequest({
      delivery_date: data.delivery_date,
      delivery_time: data.delivery_time,
      full_name: fullName,
      country_code: String(data.country_code ?? ''),
      phone,
      email,
    })

    return NextResponse.json({ success: true, request_id: request_row.request_id })
  } catch (error) {
    console.error('POST /api/food-delivery failed:', error)
    return NextResponse.json({ success: false, error: 'Could not save your delivery request.' }, { status: 500 })
  }
}
