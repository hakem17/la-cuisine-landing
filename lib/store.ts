import fs from 'fs'
import path from 'path'

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
const CSV_FILE = path.join(process.cwd(), 'data', 'bookings.csv')
const FOOD_DELIVERY_CSV_FILE = path.join(process.cwd(), 'data', 'food-delivery-requests.csv')

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

export function getAvailableDates() {
  const db = readDb()
  return {
    available_dates: db.date_availability.filter((d) => d.status === 'available').map((d) => d.event_date),
    booked_dates: db.date_availability.filter((d) => d.status === 'booked').map((d) => d.event_date),
  }
}

export function exportBookingsCsv(db?: DatabaseFile) {
  const data = db ?? readDb()
  const headers = [
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
  const lines = [headers.join(',')]
  for (const row of data.bookings) {
    lines.push(
      headers
        .map((key) => {
          const value = row[key as keyof Booking]
          const text = value == null ? '' : String(value)
          return `"${text.replaceAll('"', '""')}"`
        })
        .join(','),
    )
  }
  ensureDir()
  const csv = lines.join('\n')
  fs.writeFileSync(CSV_FILE, csv)
  return { csv, path: CSV_FILE }
}

export function createBooking(input: {
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
  const db = readDb()
  const booked = db.date_availability.find((d) => d.event_date === input.event_date && d.status === 'booked')
  if (booked) {
    throw new Error('DATE_UNAVAILABLE')
  }

  const sameDay = db.bookings.filter((b) => b.event_date === input.event_date).length
  const dateStr = input.event_date.replaceAll('-', '')
  const booking_id = `BK-${dateStr}-${String(sameDay + 1).padStart(3, '0')}`
  const nextId = db.bookings.reduce((max, row) => Math.max(max, row.id), 0) + 1
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
  db.bookings.push(booking)

  const dateRow = db.date_availability.find((d) => d.event_date === input.event_date)
  if (dateRow) {
    dateRow.status = 'booked'
    dateRow.booking_id = booking_id
  } else {
    const dateId = db.date_availability.reduce((max, row) => Math.max(max, row.id), 0) + 1
    db.date_availability.push({ id: dateId, event_date: input.event_date, status: 'booked', booking_id })
  }

  writeDb(db)
  exportBookingsCsv(db)
  return booking
}

export function createContact(input: { question: string; full_name: string; country_code: string; phone: string; email: string }) {
  const db = readDb()
  const nextId = db.contact_submissions.reduce((max, row) => Math.max(max, row.id), 0) + 1
  const row: ContactSubmission = {
    id: nextId,
    question: input.question,
    full_name: input.full_name,
    phone: `${input.country_code} ${input.phone}`.trim(),
    email: input.email,
    created_at: new Date().toISOString(),
  }
  db.contact_submissions.push(row)
  writeDb(db)
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
export function createFoodDeliveryRequest(input: { delivery_date: string; delivery_time: string }) {
  const db = readDb()
  const nextId = db.food_delivery_requests.reduce((max, row) => Math.max(max, row.id), 0) + 1
  const dateStr = input.delivery_date.replaceAll('-', '')
  const sameDay = db.food_delivery_requests.filter((r) => r.delivery_date === input.delivery_date).length
  const request_id = `FD-${dateStr}-${String(sameDay + 1).padStart(3, '0')}`
  const row: FoodDeliveryRequest = {
    id: nextId,
    request_id,
    delivery_date: input.delivery_date,
    delivery_time: input.delivery_time,
    created_at: new Date().toISOString(),
  }
  db.food_delivery_requests.push(row)
  writeDb(db)
  exportFoodDeliveryCsv(db)
  return row
}

export function getAdminData() {
  const db = readDb()
  return {
    bookings: [...db.bookings].reverse(),
    contacts: [...db.contact_submissions].reverse(),
    food_delivery_requests: [...db.food_delivery_requests].reverse(),
    dates: getAvailableDates(),
  }
}

export { CSV_FILE, FOOD_DELIVERY_CSV_FILE }
