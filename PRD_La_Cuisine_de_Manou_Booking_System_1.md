# Product Requirements Document
## La Cuisine de Manou — Event Booking & Contact Form System

**Status:** Draft for client/dev sign-off
**Version:** 1.0
**Prepared from:** Client spec doc ("Explain the la cuisine de manou booking system & contact form")

---

## 1. Overview

La Cuisine de Manou needs a multi-step booking form that qualifies a lead (event type → event → guests → date → location → budget → cuisine → contact details), calculates a live budget estimate, records the booking against an availability calendar, and routes the customer to a confirmation/contact screen. The system must also power a persistent contact widget (WhatsApp always, Phone Call only during business hours).

## 2. Goals

- Reduce back-and-forth by capturing structured event requirements up front.
- Auto-generate a realistic budget range so customers self-qualify before contacting the team.
- Prevent double-booking by syncing confirmed dates against a live availability source (spreadsheet-backed).
- Give corporate and private customers different question paths without duplicating the form.
- Provide a fast escape hatch for simple "Food Delivery" requests (skip straight to contact).

## 3. User Flow Summary

```
Q1 Event Type ──┬── Food Delivery ──> Date/Time picker ──> Contact Us page (END, skip Q2–Q13)
                 ├── Private ────────> Q2 (Private event list)
                 └── Corporate ──────> Q2 (Corporate event list)

Q2 Event ──> Additional Services (optional, multi-select) ──> Q3 Date ──> Q4 Guest Count
   ──> Q5 Location ──> Q6 Budget (auto-calculated, editable range) ──> Q7 Cuisine Interests
   ──> Q8 Preferred Contact Channel ──> Q9 Full Name ──> Q10 Phone ──> Q11 Email
   ──> [If Corporate: Q12 Company Website, Q13 Role]
   ──> Review Screen ──> Submit ──> Thank You / Contact Screen
```

---

## 4. Functional Requirements

### Q1 — Event Type
- **Type:** Single-select.
- **Options:** `Private` | `Corporate / Office` | `Food Delivery`.
- **Branching:**
  - `Food Delivery` → show only a date + time picker, then route directly to the Contact Us page. All subsequent questions (Q2–Q13) are skipped entirely for this branch.
  - `Private` or `Corporate` → proceed to Q2 using the matching event list.

### Q2 — Event
- **Type:** Single-select, options depend on Q1.
- **Corporate options:** Breakfast & Coffee Break, Finger Food & Canapés, Afternoon Tea Tower, Luxury Buffet, Pass Around, Custom Menus & Themed Catering, Live Station.
- **Private options:** Birthday, Wedding, Baby Shower, Dinner, Luxury Buffet, Pass Around, Custom Menus & Themed Catering, Live Station, **VIP Events**.
- **Special rule:** Selecting `VIP Events` (Private only) sets an `isVIP` flag used later to unlock/require the >20-guest tier in Q4 and to trigger the VIP budget multiplier in Q6.
- **After Q2 — Additional Services (optional, multi-select):** Live Cooking Station, Bar, Chairs, Tables, Coffee Station, Mocktail Station, Other. Selecting `Other` reveals a free-text field for the customer to specify.

### Q3 — Event Date
- **Type:** Calendar date picker (compact/inline widget).
- **Data requirement:** Must read/write against a spreadsheet (Google Sheets or Excel) where each date has an adjacent "status" column.
- **Booking behavior:** When a booking is confirmed, the corresponding date row must be marked booked/removed from availability so it can no longer be selected by future customers.
- **Open question:** Confirm whether this is single-date selection or a date range (spec says "date range choose from calendar" in the heading but describes a single event date in practice) — flagged in Section 8.

### Q4 — Expected Guest Count
- **Type:** Numeric stepper (+/− buttons) with direct text entry also allowed.
- **Corporate rules:**
  - Starts at 1.
  - Under 10 guests → show inline alert: *"This is treated as a VIP booking and will cost more."*
  - Between 2–10 (as written) → show inline alert: *"This will cost you more."*
  - 20 and above → normal, no alert.
  - **⚠ Flag:** the "under 10" and "under 2 and above 10" thresholds overlap/conflict as written in the source spec — see Section 8 for the clarification needed before build.
- **Private rules:**
  - Starts at 5.
  - Under 20 guests → show inline alert: *"This is treated as a VIP booking and will cost more."*
  - 20 and above → normal, no alert.

### Q5 — Location
- **Type:** Single-select.
- **Options:** Abu Dhabi, Dubai, Other UAE Location.
- **Other UAE Location:** reveals a free-text field; the intended sub-options are Sharjah, Ajman, Ras Al Khaimah, Fujairah, Umm Al Quwain, Al Ain (display as suggestions/autocomplete or a secondary dropdown rather than raw free text, to keep the location value clean for the budget calculation — see Section 8).
- **Budget relevance:** Only "Abu Dhabi" vs. "everything else" matters for the Q6 pricing logic (a non-Abu-Dhabi location triggers the 1.5× multiplier).

### Q6 — Budget (auto-calculated, editable range slider)

**Purpose:** Automatically compute a min/max AED range from event type, guest count, location, and VIP status, shown as a draggable dual-handle slider (step = AED 1,000).

**Inputs:**
| Input | Source |
|---|---|
| `eventType` | Selected event from Q2 |
| `guestCount` | Value from Q4 |
| `location` | Value from Q5 |
| `isVIP` | `true` if Q2 = "VIP Events" (Private flow only) |
| `avgPricePerGuest` | Looked up from the price table below |

**Avg. Price/Guest Table (AED):**
| Event | Avg. Price/Guest |
|---|---|
| Birthday | 175 |
| Wedding | 275 |
| Engagement | 225 |
| Baby Shower | 175 |
| Luxury Buffet | 375 |
| Pass Around | 225 |
| Finger Food & Canapés | 175 |
| Breakfast & Coffee Break | 125 |
| Afternoon Tea Tower | 125 |
| Lunch | 195 |
| Dinner | 195 |
| Custom Menus & Themed Catering | 275 |

> **⚠ Missing pricing:** "Live Station" (appears in both Corporate and Private event lists) has no entry in this table. Per the client's own edge-case rule (Section 4.7 below), calculation must **block and prompt for manual pricing input** rather than default to 0 or guess. This needs a price from the client before launch.
>
> **⚠ Orphan entries:** "Engagement" and "Lunch" appear in the price table but are **not** present in either the Private or Corporate event lists in Q2. Confirm with client whether these events should be added to one of the Q2 lists, or whether the price rows are leftover/for future use.

**Calculation Logic (apply in exact order):**

*Step 1 — Base Abu Dhabi minimum:*
```
rawMin_AbuDhabi = avgPricePerGuest × guestCount
roundedMin_AbuDhabi = ROUND_UP(rawMin_AbuDhabi, nearest 1000)
minBudget_AbuDhabi = MAX(roundedMin_AbuDhabi, 5000)
```
- Floor is always 5,000 AED regardless of guest count or event.
- Always round **up** to the next thousand, never nearest/down.

*Step 2 — Location adjustment:*
```
if location == "Abu Dhabi":
    minBudget = minBudget_AbuDhabi
else:
    minBudget = ROUND_UP(minBudget_AbuDhabi × 1.5, nearest 1000)
```

*Step 3 — VIP override:*
```
if isVIP == true:
    minBudget = ROUND_UP(minBudget_AbuDhabi × 2, nearest 1000)
```
- VIP multiplier applies to the **Abu Dhabi base**, not the location-adjusted value — VIP replaces the location multiplier, it does not stack with it.

*Step 4 — Maximum budget (always):*
```
maxBudget = ROUND_UP(minBudget_AbuDhabi × 4, nearest 1000)
```
- Max is always derived from the Abu Dhabi base minimum, regardless of location/VIP status.

**Slider Behavior:**
- Unit: AED, increments of 1,000 (no partial-thousand values).
- Default handles: `minBudget` (left) and `maxBudget` (right).
- User may drag handles to adjust; left handle cannot go below `minBudget`; neither handle can go below 5,000.
- Display format: `AED {min} - {max}` (e.g. "AED 5,000 - 20,000").
- Recompute live whenever `eventType`, `guestCount`, `location`, or `isVIP` changes.

**Worked Examples:**

| Example | Inputs | Calculation | Result |
|---|---|---|---|
| A | Birthday, 20 guests, Abu Dhabi, not VIP | 175×20=3,500 → round up 4,000 → floor → min 5,000; max = 5,000×4 = 20,000 | AED 5,000 – 20,000 |
| B | Wedding, 50 guests, Dubai, not VIP | AD base: 275×50=13,750 → 14,000; location: 14,000×1.5=21,000 → min 21,000; max = 14,000×4 = 56,000 | AED 21,000 – 56,000 |
| C | Luxury Buffet, 8 guests, Abu Dhabi, VIP | AD base: 375×8=3,000 → floor 5,000; VIP: 5,000×2=10,000 → min 10,000; max = 5,000×4 = 20,000 | AED 10,000 – 20,000 |

**Edge Cases:**
- If `avgPricePerGuest` is missing for the chosen event → block calculation, prompt for manual pricing input. Never default to 0 or guess.
- Always round up, never down.
- Recompute live on any relevant input change.

### Q7 — Cuisine Interests
- **Type:** Multi-select.
- **Options:** American, Italian, French, Mexican & Latin American, Spanish, Healthy & Plant-Based, Bakery & Pastry, Desserts & Sweet Treats, Other (reveals free-text field).

### Q8 — Preferred Contact Channel
- **Type:** Single-select.
- **Options:** WhatsApp, Email, Phone, Other (reveals free-text field).

### Q9 — Full Name
- **Type:** Text input, required.

### Q10 — Phone Number
- **Type:** Text input with country-code selector, required.
- **Default country code:** UAE (+971).

### Q11 — Email
- **Type:** Text input, required.
- **Validation:** Must contain `@`. (Recommend upgrading to a standard email regex at build time to also require a valid domain segment — see Section 8.)

### Q12 — Company Website *(Corporate only)*
- **Visibility:** Only shown if Q1 = Corporate.
- **Validation:** Must contain a `.` (as all domains include one).

### Q13 — Role *(Corporate only)*
> Note: this was labeled "Q12" a second time in the source spec — renumbered here to avoid duplicate numbering.
- **Visibility:** Only shown if Q1 = Corporate.
- **Type:** Text input.

---

## 5. Review, Submit & Confirmation

1. **Review screen:** show all captured answers (event type, event, additional services, date, guest count, location, budget range, cuisine interests, contact channel, name, phone, email, and — if corporate — website & role) for the customer to confirm before submitting.
2. **Submit:** on confirmation, write the booking to the backend and mark the chosen date as booked in the spreadsheet (removing it from future availability, per Q3).
3. **Post-submit:** offer the customer a direct "Contact us on WhatsApp" option.
4. **Thank You / Contact screen (final):**
   - **WhatsApp Message button:** always visible.
   - **Phone Call button:** visible **only** during business hours — Monday–Friday, 9:00 AM–5:00 PM (confirm timezone, presumed Gulf Standard Time / Asia:Dubai — see Section 8). Outside these hours, hide the Phone Call option and show WhatsApp only.

---

## 6. Data & Integration Requirements

- **Availability store:** Spreadsheet (Google Sheets or Excel) with a date column and an adjacent status column. Booking flow must read current availability and write a "booked" status back on confirmation.
- **Booking submission:** All form fields need to be persisted (booking record) — destination system (CRM, database, or spreadsheet row) to be confirmed with client/dev team.
- **Business hours check:** Server-side (or client-side with server validation) check against Mon–Fri 9–5 for the Phone Call button.

## 7. Validation Rules Summary

| Field | Rule |
|---|---|
| Email (Q11) | Must contain `@` |
| Company Website (Q12) | Must contain `.` |
| Phone (Q10) | Required, defaults to +971 country code |
| Guest Count (Q4) | Numeric, stepper + manual entry, min per Q1 branch (Corporate: 1, Private: 5) |
| Budget (Q6) | Auto-calculated; user-adjustable within floor/ceiling constraints; 1,000 AED increments |

---

## 8. Open Questions / Flags for Client Sign-Off

1. **Live Station pricing missing** — needed for both Corporate and Private "Live Station" events before the budget calculator can handle them.
2. **"Engagement" and "Lunch" in the price table but absent from Q2's event lists** — confirm intended placement or whether these are legacy/future entries.
3. **Corporate guest-count alert thresholds (Q4) overlap** — "under 10" and "under 2 and above 10" produce ambiguous/overlapping conditions as written; need the exact numeric bands confirmed (e.g., 1–9 = VIP alert, 10–19 = cost alert, 20+ = normal?).
4. **Q3 "date range" vs. single date** — heading says "date range" but the described behavior (mark one date as booked) implies a single date. Confirm which is required.
5. **"Other UAE Location" sub-list** — should Sharjah/Ajman/RAK/Fujairah/UAQ/Al Ain be a dropdown/autocomplete rather than free text, to keep the value clean for downstream use (e.g., internal reporting)? Free text is fine for display but is easy to typo.
6. **Business hours timezone** — confirm Mon–Fri 9–5 is Gulf Standard Time (UTC+4).
7. **Email validation strength** — spec requires only `@` present; recommend confirming whether a fuller format check (e.g., domain + TLD) is acceptable, since "must contain @" alone would accept invalid addresses like `a@b`.
8. **Booking destination system** — confirm where submitted bookings should ultimately live (spreadsheet row, CRM, database) beyond the availability-calendar spreadsheet.

---

## 9. Out of Scope (for this phase, unless confirmed otherwise)

- Payment processing / deposits.
- Multi-language support.
- Admin dashboard for managing bookings beyond the spreadsheet.
