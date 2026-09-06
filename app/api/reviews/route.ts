import { getPlaceReviews } from '@/lib/google-reviews'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const data = await getPlaceReviews()
    return NextResponse.json({ success: true, ...data })
  } catch {
    return NextResponse.json({ success: false, reviews: [] }, { status: 500 })
  }
}
