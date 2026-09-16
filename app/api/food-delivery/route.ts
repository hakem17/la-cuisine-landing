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

    const request_row = createFoodDeliveryRequest({
      delivery_date: data.delivery_date,
      delivery_time: data.delivery_time,
    })

    return NextResponse.json({ success: true, request_id: request_row.request_id })
  } catch {
    return NextResponse.json({ success: false, error: 'Could not save your delivery request.' }, { status: 500 })
  }
}
