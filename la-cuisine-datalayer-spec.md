# La Cuisine de Manou — Data Layer Tracking Spec (v2)
**Site:** https://la-cuisine-landing.vercel.app/
**Container:** GTM-MDS6SP4G (already installed)
**Stack assumption:** Next.js (client-side routed) → GA4 via GTM.

> The `/book` and `/contact-us` pages render their forms client-side, so exact input names must be pulled from the React source by the developer. Everything below is otherwise implementation-ready: event names, when to fire, and the exact parameter shape to push.

---

## 0. What changed from v1 (why this version is better)

| Issue in v1 | Fix in v2 |
|---|---|
| A different `event` name for every CTA (`book_now_click`, `contact_us_click`, `phone_click`...) nested inside `event_action` — redundant and inconsistent | **One event name per intent**, location/detail carried in parameters only. Fewer GTM triggers to maintain. |
| Custom-only event names → GA4 "Lifecycle" auto-reports don't populate | Added **GA4 recommended-event aliases** (`generate_lead`, `form_start`, `form_submit`) fired alongside custom events, mapped in §9. |
| `booking_id` generation mentioned but no persistence mechanism | Specified `sessionStorage` key so refreshes mid-flow don't break the funnel join. |
| No validation/error tracking | Added `form_error` event for both flows. |
| Section-view and scroll depth were separate ad-hoc events | Folded section tracking into scroll depth as a `section` parameter — one listener, less config. |
| No explicit data types → risk of `"80"` string vs `80` number inconsistencies in reporting | Added a parameter data-type table (§8). |

---

## 1. Global Conventions

- Push shape: `window.dataLayer.push({ event: "...", ...params })`
- Naming: `snake_case` for event names and keys.
- **Every push includes:** `page_path` (e.g. `/`, `/book`, `/contact-us`).
- Booking/contact flows include a **flow id** to stitch steps together:
  - `booking_id` — created once per booking attempt: `crypto.randomUUID()`, stored in `sessionStorage.booking_id`, reused on every step push, cleared on successful submit or 24h expiry.
- Do not fire a step-complete event until client-side validation for that step passes.

---

## 2. Page View (SPA route change)

Next.js won't reload GTM's container per route, so push manually on every `usePathname()` change.

```js
window.dataLayer.push({
  event: "page_view",
  page_path: "/book",
  page_title: "Book an event — La Cuisine de Manou",
  page_location: "https://la-cuisine-landing.vercel.app/book"
});
```

---

## 3. Engagement: Scroll Depth & Section Views

One combined event — fire at 25/50/75/90/100% scroll AND whenever a named section crosses 50% viewport visibility (IntersectionObserver), so both signals live in one trigger family.

```js
window.dataLayer.push({
  event: "scroll_depth",
  scroll_percent: 50,          // number: 25 | 50 | 75 | 90 | 100
  section: "usps",             // string, nullable: "services" | "usps" | "gallery" | "testimonials" | "faq" | null
  page_path: "/"
});
```

---

## 4. CTA Clicks — "Book Now" & "Contact Us"

**Single event**, `cta_click`, parameterized by `cta_type` and `cta_location`. This keeps one GTM trigger (click on `a[href]`) with a lookup table variable for `cta_location`, instead of 14 separate triggers.

```js
window.dataLayer.push({
  event: "cta_click",
  cta_type: "book_now",        // "book_now" | "contact_us"
  cta_location: "hero",        // see table below
  destination_url: "/book",
  page_path: "/"
});

// GA4 alias — fire immediately after, only for cta_type = "book_now"
window.dataLayer.push({ event: "generate_lead", lead_type: "booking_started" });
```

**`cta_location` values:**

| Location | `cta_type` | `destination_url` |
|---|---|---|
| `header_nav` | `book_now` | `/book` |
| `header_nav` | `contact_us` | `/contact-us` |
| `hero` | `book_now` | `/book` |
| `services_intro` | `book_now` | `/book` |
| `service_card_corporate` | `book_now` | `/book?type=corporate` |
| `service_card_private` | `book_now` | `/book?type=private` |
| `why_us` | `book_now` | `/book` |
| `bottom_cta` | `book_now` | `/book` |
| `bottom_cta` | `contact_us` | `/contact-us` |
| `faq` | `contact_us` | `/contact-us` |
| `final_cta` | `book_now` | `/book` |
| `final_cta` | `contact_us` | `/contact-us` |
| `footer` | `book_now` | `/book` |
| `footer` | `contact_us` | `/contact-us` |
| `footer_secondary` | `book_now` | `/book` (label: "Start your order ↗") |
| `footer_secondary` | `contact_us` | `/contact-us` (label: "Submit a question ↗") |

---

## 5. Direct Contact Clicks (phone / email / WhatsApp)

```js
window.dataLayer.push({
  event: "contact_click",
  contact_method: "phone",        // "phone" | "email" | "whatsapp"
  contact_value: "+97125526608",  // tel number / email address, in raw href format
  contact_location: "footer",     // "header" | "footer" | "floating_button" | "final_cta_section"
  page_path: "/"
});

window.dataLayer.push({ event: "generate_lead", lead_type: "direct_contact" });
```

Known values on-site:
- Phone: `+97125526608` (`+971 (02) 552 6608`), `+971567322519` (`+971 (0)56 732 2519`)
- Email: `sales@lacuisinedemanou.ae`
- WhatsApp: `+971500000000` (floating button)

---

## 6. Booking Flow (`/book`) — 8-Step Wizard

Fire `booking_step_view` on step render and `booking_step_complete` on successful advance. `step_value` always carries that step's answer so the schema stays uniform across steps (single GTM trigger + variable, instead of 8 differently-shaped events).

```js
// generic shape — identical for every step
window.dataLayer.push({
  event: "booking_step_view",       // or "booking_step_complete"
  booking_id: "b_8f3d1c92",
  step_number: 1,                   // 1–8
  step_name: "event_type",
  step_value: null,                 // populated only on *_complete — see per-step values below
  page_path: "/book"
});
```

**Per-step `step_name` / `step_value` reference:**

| Step | `step_name` | `step_value` type | Example |
|---|---|---|---|
| 1 | `event_type` | string | `"Wedding"` (private) or `"Coffee Break"` (corporate) — full option list below |
| 2 | `event_format` | object `{format, additional_services[]}` | `{ "format": "Plated Dinner", "additional_services": ["Bar Service", "Waitstaff"] }` |
| 3 | `event_date` | string (ISO 8601) | `"2026-11-14"` |
| 4 | `guest_count` | number | `80` |
| 5 | `location` | string | `"Dubai"` |
| 6 | `budget_range` | string | `"AED 20,000–50,000"` |
| 7 | `cuisine_interests` | array of strings | `["French", "Mediterranean", "Lebanese"]` |
| 8 | `preferred_contact_channel` | string | `"WhatsApp"` |

**Step 1 full option list** (confirm exact final copy with dev):
- Corporate: `Coffee Break`, `Breakfast`, `Lunch`, `Official Events`, `Other`
- Private: `Birthday`, `Anniversary`, `Wedding`, `Engagement`, `Family Gathering`, `Baby Shower`, `Other`

Push `form_start` the first time step 1 completes:
```js
window.dataLayer.push({ event: "form_start", form_name: "booking_wizard" });
```

### Abandonment (optional, recommended)
Fire on route change away from `/book` or `beforeunload` if the flow was started but not submitted:
```js
window.dataLayer.push({
  event: "booking_step_abandon",
  booking_id: "b_8f3d1c92",
  last_step_completed: 4,
  page_path: "/book"
});
```

### Submit — success
```js
window.dataLayer.push({
  event: "booking_form_submit",
  booking_id: "b_8f3d1c92",
  event_type: "Wedding",
  event_format: "Plated Dinner",
  additional_services: ["Bar Service", "Waitstaff"],
  event_date: "2026-11-14",
  guest_count: 80,
  location: "Dubai",
  budget_range: "AED 20,000–50,000",
  cuisine_interests: ["French", "Mediterranean", "Lebanese"],
  preferred_contact_channel: "WhatsApp",
  page_path: "/book"
});

window.dataLayer.push({ event: "form_submit", form_name: "booking_wizard" });
window.dataLayer.push({ event: "generate_lead", lead_type: "booking_completed" });
// clear sessionStorage.booking_id here
```

### Submit — error
```js
window.dataLayer.push({
  event: "form_error",
  form_name: "booking_wizard",
  step_number: 6,
  error_message: "Server validation failed: invalid date",
  page_path: "/book"
});
```

---

## 7. Contact Us Flow (`/contact-us`)

```js
window.dataLayer.push({ event: "form_start", form_name: "contact_us", page_path: "/contact-us" });

window.dataLayer.push({
  event: "contact_form_submit",
  contact_reason: "General Inquiry",       // if the form has a subject/topic field, else omit
  preferred_contact_channel: "Email",      // if present on the form, else omit
  page_path: "/contact-us"
});
window.dataLayer.push({ event: "form_submit", form_name: "contact_us" });
window.dataLayer.push({ event: "generate_lead", lead_type: "contact_form" });

// on failure
window.dataLayer.push({
  event: "form_error",
  form_name: "contact_us",
  error_message: "Missing required field: email",
  page_path: "/contact-us"
});
```

---

## 8. Parameter Data Types (for GTM variable + GA4 custom-dimension setup)

| Parameter | Type | Notes |
|---|---|---|
| `page_path` | string | always relative path, no domain |
| `scroll_percent` | integer | 25/50/75/90/100 only |
| `section` | string \| null | one of the 5 anchor ids, or null for a pure scroll event |
| `cta_type` | string | enum: `book_now`, `contact_us` |
| `cta_location` | string | enum, see §4 table |
| `contact_method` | string | enum: `phone`, `email`, `whatsapp` |
| `contact_value` | string | raw tel/email/wa value, not formatted for display |
| `booking_id` | string | UUID, stable per flow attempt |
| `step_number` | integer | 1–8 |
| `step_value` | string \| number \| array \| object | shape depends on step, see §6 table |
| `guest_count` | integer | not a string |
| `cuisine_interests` | array\<string\> | never comma-joined — push as real array |
| `additional_services` | array\<string\> | same as above, `[]` if none selected |

---

## 9. Event Name Summary

| Event | Fires on | GA4 alias also fired |
|---|---|---|
| `page_view` | Route change | — |
| `scroll_depth` | Scroll threshold / section in view | — |
| `cta_click` | Book now / Contact us CTA clicked | `generate_lead` (book_now only) |
| `contact_click` | Phone / email / WhatsApp clicked | `generate_lead` |
| `booking_step_view` | Wizard step rendered | — |
| `booking_step_complete` | Wizard step validated & advanced | `form_start` (step 1 only) |
| `booking_step_abandon` | User leaves flow before submit | — |
| `booking_form_submit` | Full booking submitted | `form_submit`, `generate_lead` |
| `form_error` | Any step/form fails validation or server call | — |
| `form_start` | Contact form first interaction | — |
| `contact_form_submit` | Contact form submitted | `form_submit`, `generate_lead` |

---

## 10. Dev Implementation Checklist

1. Confirm exact copy/values for: Step 1 event-type list per corporate/private branch, Step 2 format + services list, Step 6 budget brackets, and any contact-form subject field — pull from source, not the rendered HTML (client-rendered).
2. `booking_id`: `crypto.randomUUID()` on wizard mount if `sessionStorage.booking_id` absent; reuse otherwise; clear on successful submit.
3. Wire `page_view` manually into the Next.js router (`usePathname` + `useEffect`), since GTM's default history-change listener needs the App Router's client transitions to actually change the URL bar (soft navigation may need `next/navigation` events).
4. Push arrays as real JS arrays, never `.join(",")` — GA4/BigQuery unnest them correctly this way.
5. Only push `*_complete` / `*_submit` events after validation passes; push `form_error` on failure instead of a partial success event.
6. QA in GTM Preview mode: verify `booking_id` stays constant across all 8 steps for a single attempt, and changes between two separate attempts.
