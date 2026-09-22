import { google } from 'googleapis'

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replaceAll('\\n', '\n')

const BOOKINGS_HEADER = [
  'id', 'booking_id', 'event_type', 'event_selection', 'additional_services',
  'additional_services_other', 'event_date', 'guest_count', 'location', 'location_other',
  'budget_min', 'budget_max', 'cuisine_interests', 'cuisine_other', 'contact_channel',
  'channel_other', 'full_name', 'phone', 'email', 'company_website', 'role', 'status', 'created_at',
]
const CONTACTS_HEADER = ['id', 'question', 'full_name', 'phone', 'email', 'created_at']
const FOOD_DELIVERY_HEADER = ['id', 'request_id', 'delivery_date', 'delivery_time', 'created_at']

const SHEETS = {
  bookings: { title: 'Bookings', header: BOOKINGS_HEADER },
  contacts: { title: 'Contacts', header: CONTACTS_HEADER },
  food_delivery_requests: { title: 'FoodDeliveryRequests', header: FOOD_DELIVERY_HEADER },
} as const

type SheetKey = keyof typeof SHEETS

function isConfigured() {
  return Boolean(SPREADSHEET_ID && CLIENT_EMAIL && PRIVATE_KEY)
}

function getClient() {
  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

async function ensureSheet(sheets: ReturnType<typeof getClient>, key: SheetKey) {
  const { title, header } = SHEETS[key]
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID! })
  const exists = meta.data.sheets?.some((s) => s.properties?.title === title)
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID!,
      requestBody: { requests: [{ addSheet: { properties: { title } } }] },
    })
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID!,
      range: `${title}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [header] },
    })
    return
  }
  const headerRow = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID!,
    range: `${title}!A1:1`,
  })
  if (!headerRow.data.values || headerRow.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID!,
      range: `${title}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [header] },
    })
  }
}

export function isSheetsConfigured() {
  return isConfigured()
}

export async function getSheetRows(key: SheetKey): Promise<Record<string, string>[]> {
  if (!isConfigured()) {
    throw new Error('Google Sheets is not configured (missing GOOGLE_SHEETS_* env vars)')
  }
  const sheets = getClient()
  await ensureSheet(sheets, key)
  const { title, header } = SHEETS[key]
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID!,
    range: `${title}!A2:${String.fromCharCode(64 + header.length)}`,
  })
  const rows = res.data.values ?? []
  return rows.map((r) => {
    const obj: Record<string, string> = {}
    header.forEach((h, i) => {
      obj[h] = r[i] ?? ''
    })
    return obj
  })
}

export async function appendRowToSheet(key: SheetKey, row: Record<string, unknown>) {
  if (!isConfigured()) {
    throw new Error('Google Sheets is not configured (missing GOOGLE_SHEETS_* env vars)')
  }
  const sheets = getClient()
  await ensureSheet(sheets, key)
  const { title, header } = SHEETS[key]
  const values = header.map((h) => {
    const value = row[h]
    return value == null ? '' : String(value)
  })
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID!,
    range: `${title}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  })
}
