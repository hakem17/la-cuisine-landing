import { getAvailableDates } from '@/lib/store'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json(getAvailableDates())
}
