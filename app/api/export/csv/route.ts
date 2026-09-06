import { exportBookingsCsv } from '@/lib/store'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const { csv } = exportBookingsCsv()
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="bookings.csv"',
    },
  })
}
