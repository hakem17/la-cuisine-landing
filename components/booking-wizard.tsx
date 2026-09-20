"use client";

import { PhoneCallButton } from "@/components/phone-call-button";
import { calculateBudget, formatBudgetRange } from "@/lib/budget";
import { whatsappLink } from "@/lib/whatsapp";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Clock,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Sparkles,
  Truck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";

const STEPS = [
  "Event type",
  "Format",
  "Schedule",
  "Preferences",
  "Your info",
  "Review",
];

// Q2 options — must match the PRD's price table keys exactly (lib/budget.ts)
// so the budget calculator can look up avgPricePerGuest for each selection.
const EVENT_OPTIONS = {
  corporate: [
    "Breakfast & Coffee Break",
    "Finger Food & Canapes",
    "Afternoon Tea",
    "Luxury Buffet",
    "Pass Around",
    "Custom Menus & Themed Catering",
    "Live Station",
  ],
  private: [
    "Birthday",
    "Wedding",
    "Baby Shower",
    "Dinner",
    "Luxury Buffet",
    "Pass Around",
    "Custom Menus & Themed Catering",
    "Live Station",
    "VIP Events",
  ],
};

const ADDITIONAL_SERVICES = [
  "Live Cooking Station",
  "Bar",
  "Chairs",
  "Tables",
  "Coffee Station",
  "Mocktail Station",
  "Other",
];

const OTHER_EMIRATES = [
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
  "Al Ain",
];

const CUISINES = [
  "American",
  "Italian",
  "French",
  "Mexican & Latin American",
  "Spanish",
  "Healthy & Plant-Based",
  "Bakery & Pastry",
  "Desserts & Sweet Treats",
  "Other",
];

const CHANNELS = [
  { id: "WhatsApp", icon: MessageCircle },
  { id: "Email", icon: Mail },
  { id: "Phone", icon: Phone },
  { id: "Other", icon: Heart },
];

const COUNTRIES = [
  { code: "+971", label: "UAE" },
  { code: "+966", label: "Saudi" },
  { code: "+974", label: "Qatar" },
  { code: "+973", label: "Bahrain" },
  { code: "+968", label: "Oman" },
  { code: "+965", label: "Kuwait" },
  { code: "+1", label: "USA" },
  { code: "+44", label: "UK" },
];

type EventType = "private" | "corporate" | "food_delivery" | "";

type FormState = {
  event_type: EventType;
  event_selection: string;
  additional_services: string[];
  additional_services_other: string;
  event_date: string;
  guest_count: number;
  location: "Abu Dhabi" | "Dubai" | "Other" | "";
  location_other: string;
  cuisine: string[];
  cuisine_other: string;
  contact_channel: string;
  channel_other: string;
  full_name: string;
  country_code: string;
  phone: string;
  email: string;
  company_website: string;
  role: string;
  delivery_date: string;
  delivery_time: string;
};

const initialForm: FormState = {
  event_type: "",
  event_selection: "",
  additional_services: [],
  additional_services_other: "",
  event_date: "",
  guest_count: 20,
  location: "",
  location_other: "",
  cuisine: [],
  cuisine_other: "",
  contact_channel: "",
  channel_other: "",
  full_name: "",
  country_code: "+971",
  phone: "",
  email: "",
  company_website: "",
  role: "",
  delivery_date: "",
  delivery_time: "",
};

function BookingWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type");
  const initialEvent = searchParams.get("event");

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => {
    const isPrivate = initialType === "private";
    const isCorporate = initialType === "corporate";
    const validEvent =
      initialEvent &&
      ((isPrivate && EVENT_OPTIONS.private.includes(initialEvent)) ||
        (isCorporate && EVENT_OPTIONS.corporate.includes(initialEvent)))
        ? initialEvent
        : "";

    return {
      ...initialForm,
      event_type: isPrivate ? "private" : isCorporate ? "corporate" : "",
      event_selection: validEvent,
    };
  });

  useEffect(() => {
    if (initialType === "private" || initialType === "corporate") {
      setForm((prev) => ({
        ...prev,
        event_type: initialType,
      }));
      setStep(2);
    }
  }, [initialType]);

  const [error, setError] = useState("");
  const [guestAlert, setGuestAlert] = useState<{
    tone: "amber" | "blue" | "red";
    text: string;
  } | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [submittingDelivery, setSubmittingDelivery] = useState(false);

  const isVip = form.event_selection === "VIP Events";
  const budget = useMemo(
    () =>
      calculateBudget({
        eventSelection: form.event_selection,
        guestCount: form.guest_count || 0,
        location: form.location,
        isVip,
      }),
    [form.event_selection, form.guest_count, form.location, isVip],
  );
  const computedMin = budget.status === "ok" ? budget.min : null;
  const computedMax = budget.status === "ok" ? budget.max : null;

  // Q6: user-adjustable dual-handle budget range, defaulting to the
  // auto-calculated min/max and recomputing whenever the calculation inputs change.
  const [budgetRange, setBudgetRange] = useState<{
    min: number;
    max: number;
  } | null>(null);
  useEffect(() => {
    if (computedMin != null && computedMax != null) {
      setBudgetRange({ min: computedMin, max: computedMax });
    } else {
      setBudgetRange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedMin, computedMax]);
  const sliderCeiling = computedMax
    ? Math.max(computedMax * 2, (computedMin ?? 5000) + 10000)
    : 0;

  useEffect(() => {
    fetch("/api/available-dates")
      .then((res) => res.json())
      .then((data) => setBookedDates(data.booked_dates || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setGuestAlert(validateGuests(form.guest_count, form.event_type, isVip));
  }, [form.guest_count, form.event_type, isVip]);

  const today = new Date().toISOString().slice(0, 10);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const toggleService = (item: string) => {
    setForm((prev) => ({
      ...prev,
      additional_services: prev.additional_services.includes(item)
        ? prev.additional_services.filter((s) => s !== item)
        : [...prev.additional_services, item],
    }));
  };

  const validateStep = (current: number) => {
    if (current === 1 && !form.event_type) {
      return "Please choose your event type.";
    }
    if (current === 2 && form.event_type === "food_delivery") {
      if (!form.delivery_date) return "Please choose a delivery date.";
      if (form.delivery_date <= today) return "Please choose a future date.";
      if (!form.delivery_time) return "Please choose a delivery time.";
      return "";
    }
    if (current === 2 && !form.event_selection) {
      return "Please choose the specific event format.";
    }
    if (current === 2 && budget.status === "missing_price") {
      return "Pricing isn't available yet for this event — please contact us directly to get a quote.";
    }
    if (
      current === 2 &&
      form.additional_services.includes("Other") &&
      form.additional_services_other.trim().length < 2
    ) {
      return "Please specify the additional service you'd like.";
    }
    if (current === 3) {
      if (!form.event_date)
        return "Please choose an event date from the calendar.";
      if (form.event_date <= today) return "Please choose a future date.";
      if (bookedDates.includes(form.event_date)) {
        return "That date is already confirmed and booked. Please choose another date.";
      }
      if (form.event_type === "private" && form.guest_count < 5) {
        return "Private events require at least 5 guests.";
      }
      if (form.event_type === "corporate" && form.guest_count < 1) {
        return "Please enter a valid guest count (minimum 1 guest).";
      }
      if (isVip && form.guest_count < 20) {
        return "VIP Events require a minimum of 20 guests.";
      }
      if (!form.location) return "Please select your event location.";
      if (form.location === "Other" && form.location_other.trim().length < 2) {
        return "Please specify your UAE location (e.g. Sharjah, Ajman, Ras Al Khaimah, etc.).";
      }
    }
    if (current === 4) {
      if (!form.contact_channel)
        return "Please choose your preferred contact channel.";
      if (
        form.contact_channel === "Other" &&
        form.channel_other.trim().length < 2
      ) {
        return "Please specify your preferred contact channel.";
      }
      if (
        form.cuisine.includes("Other") &&
        form.cuisine_other.trim().length < 2
      ) {
        return "Please specify your custom cuisine interest.";
      }
    }
    if (current === 5) {
      if (!/^[A-Za-zÀ-ÿ\s-]{2,}$/.test(form.full_name.trim())) {
        return "Please enter your full name.";
      }
      if (!/^[0-9\s]{6,}$/.test(form.phone.trim())) {
        return "Please enter a valid phone number.";
      }
      if (!form.email.includes("@") || !form.email.includes(".")) {
        return "Please enter a valid email address (must contain @ and domain).";
      }
      if (form.event_type === "corporate") {
        if (form.company_website && !form.company_website.includes(".")) {
          return "Please enter a valid company website containing a dot domain (e.g., company.com).";
        }
      }
    }
    return "";
  };

  const next = async () => {
    const message = validateStep(step);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    if (step === 2 && form.event_type === "food_delivery") {
      setSubmittingDelivery(true);
      try {
        const res = await fetch("/api/food-delivery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            delivery_date: form.delivery_date,
            delivery_time: form.delivery_time,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(
            data.error || "Could not save your delivery request.",
          );
        }
      } catch (err) {
        setSubmittingDelivery(false);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
        return;
      }
      const params = new URLSearchParams({
        flow: "food-delivery",
        date: form.delivery_date,
        time: form.delivery_time,
      });
      router.push(`/contact-us?${params.toString()}`);
      return;
    }
    setStep((s) => Math.min(6, s + 1));
  };

  const prev = () => {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  };

  const goTo = (target: number) => {
    setError("");
    setStep(target);
  };

  const toggleCuisine = (item: string) => {
    setForm((prev) => ({
      ...prev,
      cuisine: prev.cuisine.includes(item)
        ? prev.cuisine.filter((c) => c !== item)
        : [...prev.cuisine, item],
    }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const message = validateStep(5);
    if (message) {
      setError(message);
      setStep(5);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: form.event_type,
          event_selection: form.event_selection,
          additional_services: form.additional_services.filter(
            (s) => s !== "Other",
          ),
          additional_services_other: form.additional_services.includes("Other")
            ? form.additional_services_other
            : null,
          event_date: form.event_date,
          guest_count: form.guest_count,
          location: form.location,
          location_other:
            form.location === "Other" ? form.location_other : null,
          budget_min: budgetRange?.min ?? null,
          budget_max: budgetRange?.max ?? null,
          cuisine: form.cuisine.filter((c) => c !== "Other"),
          cuisine_other: form.cuisine.includes("Other")
            ? form.cuisine_other
            : null,
          contact_channel: form.contact_channel,
          channel_other:
            form.contact_channel === "Other" ? form.channel_other : null,
          full_name: form.full_name.trim(),
          country_code: form.country_code,
          phone: form.phone.trim(),
          email: form.email.trim(),
          company_website:
            form.event_type === "corporate"
              ? form.company_website || null
              : null,
          role: form.event_type === "corporate" ? form.role || null : null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Could not submit booking");
      setBookingId(data.booking_id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (bookingId) {
    const locText =
      form.location === "Other" ? form.location_other : form.location;
    const budgetText = budgetRange
      ? formatBudgetRange(budgetRange.min, budgetRange.max)
      : "To be confirmed";
    const wa = whatsappLink(
      `Bonjour La Cuisine de Manou,\n\nI have submitted my catering enquiry!\n\n• Booking ID: ${bookingId}\n• Type: ${form.event_type === "corporate" ? "Corporate / Office" : "Private"}\n• Event: ${form.event_selection}\n• Date: ${form.event_date}\n• Guests: ${form.guest_count}\n• Location: ${locText}\n• Budget Range: ${budgetText}\n• Contact: ${form.full_name} (${form.country_code} ${form.phone})\n\nLooking forward to discussing our bespoke menu!`,
    );
    return (
      <div className="success-panel">
        <p className="eyebrow">Request received</p>
        <h2>
          Thank you,
          <br />
          <em>{form.full_name.split(" ")[0] || form.full_name}.</em>
        </h2>
        <p>
          Your catering enquiry is safely with us. Our culinary team will review
          your requirements and get in touch shortly with bespoke menus and
          availability.
        </p>
        <div className="booking-id">Booking ID · {bookingId}</div>
        <div className="contact-actions">
          <a className="book-button" href={wa} target="_blank" rel="noreferrer">
            Chat with us on WhatsApp <ArrowRight size={16} />
          </a>
          <PhoneCallButton />
        </div>
      </div>
    );
  }

  return (
    <form className="wizard" onSubmit={onSubmit}>
      {form.event_type !== "food_delivery" && (
        <ol className="step-bar" aria-label="Booking progress">
          {STEPS.map((label, index) => {
            const n = index + 1;
            const state = n < step ? "done" : n === step ? "current" : "todo";
            return (
              <li key={label} className={`step-dot step-dot--${state}`}>
                <span>{state === "done" ? <Check size={14} /> : n}</span>
                <em>{label}</em>
              </li>
            );
          })}
        </ol>
      )}

      {/* ==================================================
          Q1: EVENT TYPE
          ================================================== */}
      {step === 1 && (
        <section className="wizard-step">
          <p className="eyebrow">Q1 · Event type</p>
          <h2>
            What type of event
            <br />
            <em>are you planning?</em>
          </h2>
          <div className="choice-grid choice-grid--three">
            <button
              type="button"
              className={`choice-card ${form.event_type === "private" ? "is-selected" : ""}`}
              onClick={() => {
                update("event_type", "private");
                update("event_selection", "");
              }}
            >
              <Heart size={28} className="text-terracotta" />
              <strong>Private</strong>
              <span>
                Catering thoughtfully tailored to your celebration, guests, and
                preferences.
              </span>
            </button>
            <button
              type="button"
              className={`choice-card ${form.event_type === "corporate" ? "is-selected" : ""}`}
              onClick={() => {
                update("event_type", "corporate");
                update("event_selection", "");
              }}
            >
              <Briefcase size={28} className="text-terracotta" />
              <strong>Corporate</strong>
              <span>
                Professional corporate catering tailored to your event,
                requirements, and guest experience.
              </span>
            </button>
            <button
              type="button"
              className={`choice-card ${form.event_type === "food_delivery" ? "is-selected" : ""}`}
              onClick={() => {
                update("event_type", "food_delivery");
                update("event_selection", "");
              }}
            >
              <Truck size={28} className="text-terracotta" />
              <strong>Food Delivery</strong>
              <span>
                Just need food dropped off? Pick a date and time and we'll take
                it from there.
              </span>
            </button>
          </div>
        </section>
      )}

      {/* ==================================================
          FOOD DELIVERY: DATE + TIME, THEN STRAIGHT TO CONTACT US
          ================================================== */}
      {step === 2 && form.event_type === "food_delivery" && (
        <section className="wizard-step">
          <p className="eyebrow">Food delivery · Date &amp; time</p>
          <h2>
            When should we
            <br />
            <em>drop it off?</em>
          </h2>
          <label className="field">
            <span>Delivery date</span>
            <input
              type="date"
              min={today}
              value={form.delivery_date}
              onChange={(e) => update("delivery_date", e.target.value)}
            />
          </label>
          <label className="field">
            <span>
              <Clock size={12} style={{ display: "inline", marginRight: 4 }} />
              Delivery time
            </span>
            <input
              type="time"
              value={form.delivery_time}
              onChange={(e) => update("delivery_time", e.target.value)}
            />
          </label>
          <p className="note note--blue">
            We'll take you to our contact page next so our team can confirm your
            delivery directly.
          </p>
        </section>
      )}

      {/* ==================================================
          Q2: CHOOSE THE EVENT + ADDITIONAL SERVICES
          ================================================== */}
      {step === 2 && form.event_type !== "food_delivery" && (
        <section className="wizard-step">
          <p className="eyebrow">Q2 · Event format</p>
          <h2>
            Choose
            <br />
            <em>your event format.</em>
          </h2>
          <div className="choice-grid">
            {(form.event_type === "corporate"
              ? EVENT_OPTIONS.corporate
              : EVENT_OPTIONS.private
            ).map((item) => (
              <button
                type="button"
                key={item}
                className={`choice-card choice-card--compact ${
                  form.event_selection === item ? "is-selected" : ""
                }`}
                onClick={() => update("event_selection", item)}
              >
                <strong>{item}</strong>
                {item === "VIP Events" && (
                  <span className="text-xs text-terracotta flex items-center gap-1 mt-1">
                    <Sparkles size={12} /> Minimum 20 guests
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Additional Services (optional, multi-select) */}
          <div className="field" style={{ marginTop: "1.5rem" }}>
            <span>Additional services (optional)</span>
            <div className="choice-grid">
              {ADDITIONAL_SERVICES.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`choice-card choice-card--compact ${
                    form.additional_services.includes(item) ? "is-selected" : ""
                  }`}
                  onClick={() => toggleService(item)}
                >
                  <strong>{item}</strong>
                </button>
              ))}
            </div>
          </div>
          {form.additional_services.includes("Other") && (
            <label className="field">
              <span>Specify Other Service</span>
              <input
                type="text"
                placeholder="e.g. Valet, Photography, Florals..."
                value={form.additional_services_other}
                onChange={(e) =>
                  update("additional_services_other", e.target.value)
                }
              />
            </label>
          )}
        </section>
      )}

      {/* ==================================================
          Q3, Q4, Q5: EVENT DATE, GUEST COUNT, LOCATION
          ================================================== */}
      {step === 3 && (
        <section className="wizard-step">
          <p className="eyebrow">Q3 · Event schedule</p>
          <h2>
            Choose date, guest count,
            <br />
            <em>and location.</em>
          </h2>

          {/* Q3: Event Date */}
          <label className="field">
            <span>Q3 · Event Date (Pick from calendar)</span>
            <input
              type="date"
              min={today}
              value={form.event_date}
              onChange={(e) => update("event_date", e.target.value)}
            />
          </label>

          {/* Q4: Expected Guest Count */}
          <label className="field">
            <span>Q4 · Expected Guest Count</span>
            <div className="stepper">
              <button
                type="button"
                onClick={() =>
                  update(
                    "guest_count",
                    Math.max(
                      form.event_type === "private" ? 5 : 1,
                      form.guest_count - 1,
                    ),
                  )
                }
                aria-label="Decrease guests"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min={form.event_type === "private" ? 5 : 1}
                value={form.guest_count}
                onChange={(e) =>
                  update(
                    "guest_count",
                    Number(e.target.value) ||
                      (form.event_type === "private" ? 5 : 1),
                  )
                }
              />
              <button
                type="button"
                onClick={() => update("guest_count", form.guest_count + 1)}
                aria-label="Increase guests"
              >
                <Plus size={16} />
              </button>
            </div>
          </label>

          {/* Guest Count Alerts based on logic */}
          {guestAlert && (
            <p className={`note note--${guestAlert.tone}`}>{guestAlert.text}</p>
          )}

          {/* Q5: Location */}
          <fieldset className="field">
            <legend>Q5 · Location</legend>
            <div className="radio-row">
              {(["Abu Dhabi", "Dubai", "Other"] as const).map((place) => (
                <label
                  key={place}
                  className={form.location === place ? "is-selected" : ""}
                >
                  <input
                    type="radio"
                    name="location"
                    value={place}
                    checked={form.location === place}
                    onChange={() => update("location", place)}
                  />
                  {place === "Other" ? "Other UAE Location" : place}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Other UAE Location Input & Pills */}
          {form.location === "Other" && (
            <div className="field">
              <span>Which UAE Location?</span>
              <input
                type="text"
                placeholder="Sharjah, Ajman, Ras Al Khaimah, Fujairah, Umm Al Quwain, Al Ain..."
                value={form.location_other}
                onChange={(e) => update("location_other", e.target.value)}
              />
              <div className="location-pills">
                {OTHER_EMIRATES.map((emirate) => (
                  <button
                    key={emirate}
                    type="button"
                    className={`pill-button ${
                      form.location_other === emirate
                        ? "pill-button--active"
                        : ""
                    }`}
                    onClick={() => update("location_other", emirate)}
                  >
                    <MapPin size={12} /> {emirate}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================================================
          Q6, Q7, Q8: BUDGET, CUISINE, CONTACT CHANNEL
          ================================================== */}
      {step === 4 && (
        <section className="wizard-step">
          <p className="eyebrow">Q4 · Budget and preferences</p>
          <h2>
            Choose your budget, cuisine,
            <br />
            <em>and contact channel.</em>
          </h2>

          {/* Q6: Budget calculation range — draggable dual-handle slider */}
          <div className="budget-box">
            <span>Q6 · Estimated Budget Range</span>
            <strong>
              {budgetRange
                ? formatBudgetRange(budgetRange.min, budgetRange.max)
                : "Pricing isn't available for this event yet"}
            </strong>
            <em>
              {budgetRange ? (
                <>
                  Based on {form.guest_count} guests ·{" "}
                  {form.location === "Other"
                    ? form.location_other || "Other UAE Location"
                    : form.location || "your location"}
                  {isVip && " · VIP Event multiplier applied"} · drag to adjust
                </>
              ) : (
                "Our team will confirm your budget directly — please go back and choose a different event, or contact us."
              )}
            </em>

            {budgetRange && (
              <div className="budget-slider">
                <div className="budget-slider__track">
                  <div
                    className="budget-slider__fill"
                    style={{
                      left: `${((budgetRange.min - 5000) / (sliderCeiling - 5000)) * 100}%`,
                      right: `${100 - ((budgetRange.max - 5000) / (sliderCeiling - 5000)) * 100}%`,
                    }}
                  />
                </div>
                <input
                  type="range"
                  aria-label="Minimum budget"
                  className="budget-slider__input"
                  min={computedMin ?? 5000}
                  max={sliderCeiling}
                  step={1000}
                  value={budgetRange.min}
                  onChange={(e) => {
                    const value = Math.min(
                      Number(e.target.value),
                      budgetRange.max,
                    );
                    setBudgetRange((prev) =>
                      prev
                        ? { ...prev, min: Math.max(value, computedMin ?? 5000) }
                        : prev,
                    );
                  }}
                />
                <input
                  type="range"
                  aria-label="Maximum budget"
                  className="budget-slider__input"
                  min={5000}
                  max={sliderCeiling}
                  step={1000}
                  value={budgetRange.max}
                  onChange={(e) => {
                    const value = Math.max(
                      Number(e.target.value),
                      budgetRange.min,
                    );
                    setBudgetRange((prev) =>
                      prev ? { ...prev, max: value } : prev,
                    );
                  }}
                />
              </div>
            )}
          </div>

          {/* Q7: Cuisine Interests */}
          <div className="field">
            <span>Q7 · Cuisine Interests (Choose all that apply)</span>
            <div className="choice-grid">
              {CUISINES.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`choice-card choice-card--compact ${
                    form.cuisine.includes(item) ? "is-selected" : ""
                  }`}
                  onClick={() => toggleCuisine(item)}
                >
                  <strong>{item}</strong>
                </button>
              ))}
            </div>
          </div>

          {/* Q7: Other Cuisine input */}
          {form.cuisine.includes("Other") && (
            <label className="field">
              <span>Specify Other Cuisine</span>
              <input
                type="text"
                placeholder="e.g. Japanese, Greek, Levantine, Fusion..."
                value={form.cuisine_other}
                onChange={(e) => update("cuisine_other", e.target.value)}
              />
            </label>
          )}

          {/* Q8: Preferred Contact Channel */}
          <div className="field">
            <span>Q8 · Preferred Contact Channel</span>
            <div className="choice-grid choice-grid--four">
              {CHANNELS.map(({ id, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  className={`choice-card ${form.contact_channel === id ? "is-selected" : ""}`}
                  onClick={() => update("contact_channel", id)}
                >
                  <Icon size={22} />
                  <strong>{id}</strong>
                </button>
              ))}
            </div>
          </div>

          {/* Q8: Other Channel input */}
          {form.contact_channel === "Other" && (
            <label className="field">
              <span>Specify Contact Method</span>
              <input
                type="text"
                placeholder="e.g., Telegram, Zoom, Direct Call at specified hour..."
                value={form.channel_other}
                onChange={(e) => update("channel_other", e.target.value)}
              />
            </label>
          )}
        </section>
      )}

      {/* ==================================================
          Q9, Q10, Q11, Q12, Q13: YOUR INFO
          ================================================== */}
      {step === 5 && (
        <section className="wizard-step">
          <p className="eyebrow">Q5 · Contact information</p>
          <h2>Your details</h2>

          {/* Q9: Full Name */}
          <label className="field">
            <span>Q9 · Full Name</span>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              placeholder="Your full name"
            />
          </label>

          {/* Q10: Phone Number with Country Code */}
          <label className="field">
            <span>Q10 · Phone Number</span>
            <div className="phone-row">
              <select
                value={form.country_code}
                onChange={(e) => update("country_code", e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label} {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="50 123 4567"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </label>

          {/* Q11: Email */}
          <label className="field">
            <span>Q11 · Email Address</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          {/* Q12 & Q13: Corporate Only (Company Website & Role) */}
          {form.event_type === "corporate" && (
            <>
              <label className="field">
                <span>Q12 · Company Website (must contain a domain dot)</span>
                <input
                  type="url"
                  value={form.company_website}
                  onChange={(e) => update("company_website", e.target.value)}
                  placeholder="https://company.com"
                />
              </label>
              <label className="field">
                <span>Q13 · Your Role / Job Title</span>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  placeholder="e.g., Event Director, Executive Assistant, CEO"
                />
              </label>
            </>
          )}
        </section>
      )}

      {/* ==================================================
          STEP 6: REVIEW & SUBMISSION
          ================================================== */}
      {step === 6 && (
        <section className="wizard-step">
          <p className="eyebrow">Q6 · Review &amp; confirmation</p>
          <h2>
            Confirm your
            <br />
            <em>information.</em>
          </h2>

          <article className="review-card">
            <header>
              <h3>Event Details</h3>
              <button type="button" onClick={() => goTo(1)}>
                Edit
              </button>
            </header>
            <dl>
              <div>
                <dt>Type</dt>
                <dd>
                  {form.event_type === "corporate"
                    ? "Corporate / Office"
                    : "Private"}
                </dd>
              </div>
              <div>
                <dt>Event</dt>
                <dd>{form.event_selection}</dd>
              </div>
              <div>
                <dt>Additional Services</dt>
                <dd>
                  {[
                    ...form.additional_services.filter((s) => s !== "Other"),
                    form.additional_services_other
                      ? `Other (${form.additional_services_other})`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(", ") || "None"}
                </dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{form.event_date}</dd>
              </div>
              <div>
                <dt>Guests</dt>
                <dd>{form.guest_count}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>
                  {form.location === "Other"
                    ? form.location_other
                    : form.location}
                </dd>
              </div>
              <div>
                <dt>Budget Range</dt>
                <dd>
                  {budgetRange
                    ? formatBudgetRange(budgetRange.min, budgetRange.max)
                    : "To be confirmed"}
                </dd>
              </div>
            </dl>
          </article>

          <article className="review-card">
            <header>
              <h3>Preferences</h3>
              <button type="button" onClick={() => goTo(4)}>
                Edit
              </button>
            </header>
            <dl>
              <div>
                <dt>Cuisine</dt>
                <dd>
                  {[
                    ...form.cuisine.filter((c) => c !== "Other"),
                    form.cuisine_other ? `Other (${form.cuisine_other})` : null,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Chef Recommendation"}
                </dd>
              </div>
              <div>
                <dt>Contact Via</dt>
                <dd>
                  {form.contact_channel === "Other"
                    ? form.channel_other
                    : form.contact_channel}
                </dd>
              </div>
            </dl>
          </article>

          <article className="review-card">
            <header>
              <h3>Contact Info</h3>
              <button type="button" onClick={() => goTo(5)}>
                Edit
              </button>
            </header>
            <dl>
              <div>
                <dt>Name</dt>
                <dd>{form.full_name}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  {form.country_code} {form.phone}
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{form.email}</dd>
              </div>
              {form.event_type === "corporate" && form.company_website && (
                <div>
                  <dt>Website</dt>
                  <dd>{form.company_website}</dd>
                </div>
              )}
              {form.event_type === "corporate" && form.role && (
                <div>
                  <dt>Role</dt>
                  <dd>{form.role}</dd>
                </div>
              )}
            </dl>
          </article>
        </section>
      )}

      {error && <p className="note note--red">{error}</p>}

      <div className="wizard-nav">
        {step > 1 ? (
          <button type="button" className="outline-button" onClick={prev}>
            <ArrowLeft size={16} /> Back
          </button>
        ) : (
          <span />
        )}
        {form.event_type === "food_delivery" && step === 2 ? (
          <button
            type="button"
            className="book-button"
            onClick={next}
            disabled={submittingDelivery}
          >
            {submittingDelivery ? "Saving..." : "Continue to Contact Us"}{" "}
            {!submittingDelivery && <ArrowRight size={16} />}
          </button>
        ) : step < 6 ? (
          <button type="button" className="book-button" onClick={next}>
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button type="submit" className="book-button" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit enquiry"}{" "}
            {!submitting && <ArrowRight size={16} />}
          </button>
        )}
      </div>
    </form>
  );
}

export function BookingWizard() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm opacity-60">
          Loading booking wizard...
        </div>
      }
    >
      <BookingWizardContent />
    </Suspense>
  );
}

function validateGuests(
  count: number,
  type: FormState["event_type"],
  isVip: boolean,
) {
  if (isVip && count < 20) {
    return {
      tone: "red" as const,
      text: "VIP Events require a minimum of 20 guests.",
    };
  }
  if (type === "corporate" && count >= 1 && count <= 9) {
    return {
      tone: "amber" as const,
      text: "This is treated as a VIP booking and will cost more.",
    };
  }
  if (type === "corporate" && count >= 10 && count <= 19) {
    return {
      tone: "blue" as const,
      text: "This will cost you more.",
    };
  }
  if (type === "private" && count >= 5 && count <= 19) {
    return {
      tone: "amber" as const,
      text: "This is treated as a VIP booking and will cost more.",
    };
  }
  return null;
}
