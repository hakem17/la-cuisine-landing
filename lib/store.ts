import fs from 'fs'
import path from 'path'
import { appendRowToSheet, getSheetRows } from './google-sheets'

export type Booking = {
  id: number
  booking_id: string
  event_type: string
  event_selection: string
  additional_services: string
  additional_services_other: string | null
  event_date: string
  guest_count: number
  location: string
  location_other: string | null
  budget_min: number
  budget_max: number
  cuisine_interests: string
  cuisine_other: string | null
  contact_channel: string
  channel_other: string | null
  full_name: string
  phone: string
  email: string
  company_website: string | null
  role: string | null
  status: string
  created_at: string
}

export type DateAvailability = {
  id: number
  event_date: string
  status: 'available' | 'booked'
  booking_id: string | null
}

export type ContactSubmission = {
  id: number
  question: string
  full_name: string
  phone: string
  email: string
  created_at: string
}

export type FoodDeliveryRequest = {
  id: number
  request_id: string
  delivery_date: string
  delivery_time: string
  created_at: string
}

type DatabaseFile = {
  bookings: Booking[]
  date_availability: DateAvailability[]
  contact_submissions: ContactSubmission[]
  food_delivery_requests: FoodDeliveryRequest[]
}

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'la-cuisine-data')
  : path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'database.json')
const CSV_FILE = path.join(DATA_DIR, 'bookings.csv')
const FOOD_DELIVERY_CSV_FILE = path.join(DATA_DIR, 'food-delivery-requests.csv')

function emptyDb(): DatabaseFile {
  return { bookings: [], date_availability: [], contact_submissions: [], food_delivery_requests: [] }
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function seedDates(db: DatabaseFile) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const existing = new Set(db.date_availability.map((d) => d.event_date))
  let nextId = db.date_availability.reduce((max, row) => Math.max(max, row.id), 0)
  for (let i = 0; i < 90; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const iso = date.toISOString().slice(0, 10)
    if (existing.has(iso)) continue
    nextId += 1
    db.date_availability.push({ id: nextId, event_date: iso, status: 'available', booking_id: null })
  }
}

function readDb(): DatabaseFile {
  ensureDir()
  if (!fs.existsSync(DB_FILE)) {
    const db = emptyDb()
    seedDates(db)
    writeDb(db)
    return db
  }
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as DatabaseFile
  db.food_delivery_requests ??= []
  seedDates(db)
  return db
}

function writeDb(db: DatabaseFile) {
  ensureDir()
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
}

function nextNDays(n: number) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days: string[] = []
  for (let i = 0; i < n; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    days.push(date.toISOString().slice(0, 10))
  }
  return days
}

export async function getBookedDates(): Promise<Set<string>> {
  const rows = await getSheetRows('bookings')
  return new Set(rows.map((r) => r.event_date).filter(Boolean))
}

export async function getAvailableDates() {
  const bookedDates = await getBookedDates()
  const days = nextNDays(90)
  return {
    available_dates: days.filter((d) => !bookedDates.has(d)),
    booked_dates: days.filter((d) => bookedDates.has(d)),
  }
}

const BOOKINGS_CSV_HEADERS = [
  'id',
  'booking_id',
  'event_type',
  'event_selection',
  'additional_services',
  'additional_services_other',
  'event_date',
  'guest_count',
  'location',
  'location_other',
  'budget_min',
  'budget_max',
  'cuisine_interests',
  'cuisine_other',
  'contact_channel',
  'channel_other',
  'full_name',
  'phone',
  'email',
  'company_website',
  'role',
  'status',
  'created_at',
]

function rowsToCsv(headers: string[], rows: Record<string, unknown>[]) {
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(
      headers
        .map((key) => {
          const value = row[key]
          const text = value == null ? '' : String(value)
          return `"${text.replaceAll('"', '""')}"`
        })
        .join(','),
    )
  }
  return lines.join('\n')
}

export function exportBookingsCsv(db?: DatabaseFile) {
  const data = db ?? readDb()
  const csv = rowsToCsv(BOOKINGS_CSV_HEADERS, data.bookings)
  ensureDir()
  fs.writeFileSync(CSV_FILE, csv)
  return { csv, path: CSV_FILE }
}

export async function exportBookingsCsvFromSheet() {
  const rows = await getSheetRows('bookings')
  return rowsToCsv(BOOKINGS_CSV_HEADERS, rows)
}

export async function createBooking(input: {
  event_type: string
  event_selection: string
  additional_services: string[]
  additional_services_other: string | null
  event_date: string
  guest_count: number
  location: string
  location_other: string | null
  budget_min: number
  budget_max: number
  cuisine: string[]
  cuisine_other: string | null
  contact_channel: string
  channel_other: string | null
  full_name: string
  country_code: string
  phone: string
  email: string
  company_website: string | null
  role: string | null
}) {
  const existingRows = await getSheetRows('bookings')
  const booked = existingRows.some((r) => r.event_date === input.event_date)
  if (booked) {
    throw new Error('DATE_UNAVAILABLE')
  }

  const sameDay = existingRows.filter((r) => r.event_date === input.event_date).length
  const dateStr = input.event_date.replaceAll('-', '')
  const booking_id = `BK-${dateStr}-${String(sameDay + 1).padStart(3, '0')}`
  const nextId = existingRows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1
  const booking: Booking = {
    id: nextId,
    booking_id,
    event_type: input.event_type,
    event_selection: input.event_selection,
    additional_services: input.additional_services.join(', '),
    additional_services_other: input.additional_services_other,
    event_date: input.event_date,
    guest_count: input.guest_count,
    location: input.location,
    location_other: input.location_other,
    budget_min: input.budget_min,
    budget_max: input.budget_max,
    cuisine_interests: input.cuisine.join(', '),
    cuisine_other: input.cuisine_other,
    contact_channel: input.contact_channel,
    channel_other: input.channel_other,
    full_name: input.full_name,
    phone: `${input.country_code} ${input.phone}`.trim(),
    email: input.email,
    company_website: input.company_website,
    role: input.role,
    status: 'pending',
    created_at: new Date().toISOString(),
  }
  await appendRowToSheet('bookings', booking)

  try {
    const db = readDb()
    db.bookings.push(booking)
    writeDb(db)
    exportBookingsCsv(db)
  } catch {
    // Local cache is best-effort; Google Sheets is the source of truth.
  }

  return booking
}

export async function createContact(input: { question: string; full_name: string; country_code: string; phone: string; email: string }) {
  const existingRows = await getSheetRows('contacts')
  const nextId = existingRows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1
  const row: ContactSubmission = {
    id: nextId,
    question: input.question,
    full_name: input.full_name,
    phone: `${input.country_code} ${input.phone}`.trim(),
    email: input.email,
    created_at: new Date().toISOString(),
  }
  await appendRowToSheet('contacts', row)

  try {
    const db = readDb()
    db.contact_submissions.push(row)
    writeDb(db)
  } catch {
    // Local cache is best-effort; Google Sheets is the source of truth.
  }

  return row
}

function exportFoodDeliveryCsv(db?: DatabaseFile) {
  const data = db ?? readDb()
  const headers = ['id', 'request_id', 'delivery_date', 'delivery_time', 'created_at']
  const lines = [headers.join(',')]
  for (const row of data.food_delivery_requests) {
    lines.push(
      headers
        .map((key) => {
          const value = row[key as keyof FoodDeliveryRequest]
          const text = value == null ? '' : String(value)
          return `"${text.replaceAll('"', '""')}"`
        })
        .join(','),
    )
  }
  ensureDir()
  const csv = lines.join('\n')
  fs.writeFileSync(FOOD_DELIVERY_CSV_FILE, csv)
  return { csv, path: FOOD_DELIVERY_CSV_FILE }
}

// Q1 "Food Delivery" branch: the wizard saves the requested date/time to the
// spreadsheet before routing the customer to the Contact Us page (no full
// booking form is collected for this branch, per the PRD).
export async function createFoodDeliveryRequest(input: { delivery_date: string; delivery_time: string }) {
  const existingRows = await getSheetRows('food_delivery_requests')
  const nextId = existingRows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1
  const dateStr = input.delivery_date.replaceAll('-', '')
  const sameDay = existingRows.filter((r) => r.delivery_date === input.delivery_date).length
  const request_id = `FD-${dateStr}-${String(sameDay + 1).padStart(3, '0')}`
  const row: FoodDeliveryRequest = {
    id: nextId,
    request_id,
    delivery_date: input.delivery_date,
    delivery_time: input.delivery_time,
    created_at: new Date().toISOString(),
  }
  await appendRowToSheet('food_delivery_requests', row)

  try {
    const db = readDb()
    db.food_delivery_requests.push(row)
    writeDb(db)
    exportFoodDeliveryCsv(db)
  } catch {
    // Local cache is best-effort; Google Sheets is the source of truth.
  }

  return row
}

export async function getAdminData() {
  const [bookingRows, contactRows, foodDeliveryRows, dates] = await Promise.all([
    getSheetRows('bookings'),
    getSheetRows('contacts'),
    getSheetRows('food_delivery_requests'),
    getAvailableDates(),
  ])
  return {
    bookings: [...bookingRows].reverse(),
    contacts: [...contactRows].reverse(),
    food_delivery_requests: [...foodDeliveryRows].reverse(),
    dates,
  }
}

export { CSV_FILE, FOOD_DELIVERY_CSV_FILE }
