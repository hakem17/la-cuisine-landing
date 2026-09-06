'use client'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { useEffect, useState } from 'react'

type AdminData = {
  bookings: Array<Record<string, string | number | null>>
  contacts: Array<Record<string, string | number | null>>
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData>({ bookings: [], contacts: [] })

  useEffect(() => {
    fetch('/api/admin')
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
  }, [])

  return (
    <main className="inner-page">
      <SiteHeader />
      <section className="inner-hero">
        <p className="eyebrow">Studio</p>
        <h1>
          Bookings
          <br />
          <em>&amp; messages.</em>
        </h1>
        <a className="book-button" href="/api/export/csv">
          Export CSV
        </a>
      </section>
      <section className="inner-body admin-wrap">
        <h2>Enquiries</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Event</th>
                <th>Date</th>
                <th>Guests</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.bookings.length === 0 && (
                <tr>
                  <td colSpan={6}>No bookings yet.</td>
                </tr>
              )}
              {data.bookings.map((row) => (
                <tr key={String(row.booking_id)}>
                  <td>{row.booking_id}</td>
                  <td>{row.event_selection}</td>
                  <td>{row.event_date}</td>
                  <td>{row.guest_count}</td>
                  <td>{row.full_name}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2>Contact messages</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Question</th>
              </tr>
            </thead>
            <tbody>
              {data.contacts.length === 0 && (
                <tr>
                  <td colSpan={4}>No messages yet.</td>
                </tr>
              )}
              {data.contacts.map((row) => (
                <tr key={String(row.id)}>
                  <td>{row.full_name}</td>
                  <td>{row.email}</td>
                  <td>{row.phone}</td>
                  <td>{row.question}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
