import fs from 'fs'
import path from 'path'

export type Booking = {
  id: number
  booking_id: string
  event_type: string
  event_selection: string
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

type DatabaseFile = {
  bookings: Booking[]
  date_availability: DateAvailability[]
  contact_submissions: ContactSubmission[]
}

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'la-cuisine-data')
  : path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'database.json')
const CSV_FILE = path.join(process.cwd(), 'data', 'bookings.csv')

function emptyDb(): DatabaseFile {
  return { bookings: [], date_availability: [], contact_submissions: [] }
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

export function getAdminData() {
  const db = readDb()
  return {
    bookings: [...db.bookings].reverse(),
    contacts: [...db.contact_submissions].reverse(),
    dates: getAvailableDates(),
  }
}

export { CSV_FILE }
