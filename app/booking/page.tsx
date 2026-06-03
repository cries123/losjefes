"use client";

import { useMemo, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import {
  MEAT_OPTIONS,
  type MeatOption,
  calculateCateringEstimate,
  formatCurrency,
  getTodayDateValue,
  isWeekendDate
} from "@/lib/pricing";

type BookingForm = {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  guestCount: number;
  meats: MeatOption[];
  notes: string;
};

type FormStatus = {
  type: "idle" | "loading" | "success" | "error";
  message: string;
};

const initialBookingForm: BookingForm = {
  name: "",
  email: "",
  phone: "",
  eventDate: "",
  guestCount: 30,
  meats: [],
  notes: ""
};

const idleStatus: FormStatus = { type: "idle", message: "" };

function getInitialBookingStatus(): FormStatus {
  if (typeof window === "undefined") return idleStatus;

  const booking = new URLSearchParams(window.location.search).get("booking");

  if (booking === "deposit-success") {
    return {
      type: "success",
      message:
        "Deposit received. Your weekend slot is being secured and our team will follow up shortly."
    };
  }

  if (booking === "deposit-cancelled") {
    return {
      type: "error",
      message: "Checkout was cancelled. You can try Pay Now again or choose Pay Later."
    };
  }

  return idleStatus;
}

function getBookingErrors(form: BookingForm) {
  const errors: Record<string, string> = {};

  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.email.trim()) errors.email = "Email is required.";
  if (!form.phone.trim()) errors.phone = "Phone number is required.";
  if (!form.eventDate) {
    errors.eventDate = "Choose an event date.";
  } else if (!isWeekendDate(form.eventDate)) {
    errors.eventDate = "Los Jefes is currently booking Saturdays and Sundays only.";
  }
  if (!Number.isInteger(form.guestCount) || form.guestCount < 1) {
    errors.guestCount = "Enter a positive whole number of guests.";
  }
  if (form.meats.length !== 2) errors.meats = "Choose exactly 2 meats.";

  return errors;
}

export default function BookingPage() {
  const today = useMemo(() => getTodayDateValue(), []);
  const [bookingForm, setBookingForm] = useState<BookingForm>(initialBookingForm);
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({});
  const [bookingStatus, setBookingStatus] = useState<FormStatus>(getInitialBookingStatus);
  const estimate = useMemo(
    () => calculateCateringEstimate(bookingForm.guestCount),
    [bookingForm.guestCount]
  );
  const isBookingLoading = bookingStatus.type === "loading";

  function updateBookingField<K extends keyof BookingForm>(
    field: K,
    value: BookingForm[K]
  ) {
    setBookingForm((current) => ({ ...current, [field]: value }));
    setBookingErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function toggleMeat(meat: MeatOption) {
    setBookingForm((current) => {
      const selected = current.meats.includes(meat);

      if (selected) {
        setBookingErrors((errors) => {
          const next = { ...errors };
          delete next.meats;
          return next;
        });
        return {
          ...current,
          meats: current.meats.filter((currentMeat) => currentMeat !== meat)
        };
      }

      if (current.meats.length === 2) {
        setBookingErrors((errors) => ({
          ...errors,
          meats: "Only 2 meats can be selected."
        }));
        return current;
      }

      setBookingErrors((errors) => {
        const next = { ...errors };
        delete next.meats;
        return next;
      });

      return { ...current, meats: [...current.meats, meat] };
    });
  }

  async function submitBooking(paymentPreference: "pay-now" | "pay-later") {
    const errors = getBookingErrors(bookingForm);

    if (Object.keys(errors).length > 0) {
      setBookingErrors(errors);
      setBookingStatus({
        type: "error",
        message: "Please fix the highlighted booking details."
      });
      return;
    }

    setBookingStatus({
      type: "loading",
      message:
        paymentPreference === "pay-now"
          ? "Preparing secure Stripe checkout..."
          : "Submitting your reservation..."
    });

    const response = await fetch(
      paymentPreference === "pay-now" ? "/api/checkout" : "/api/bookings",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bookingForm, paymentPreference })
      }
    );
    const result = await response.json();

    if (!response.ok) {
      setBookingErrors(result.errors ?? {});
      setBookingStatus({
        type: "error",
        message:
          result.error ??
          "We could not submit the reservation. Please review the form and try again."
      });
      return;
    }

    if (paymentPreference === "pay-now" && result.checkoutUrl) {
      window.location.assign(result.checkoutUrl);
      return;
    }

    setBookingStatus({
      type: "success",
      message:
        "Reservation submitted. We will contact you shortly to arrange the 20% deposit."
    });
    setBookingForm(initialBookingForm);
  }

  return (
    <main>
      <SiteNav />
      <section className="section bookingSection mexicanBooking pageSection" id="booking">
        <div className="sectionHeading">
          <p className="eyebrow">Booking & estimator</p>
          <h1>Reserve your weekend taquiza.</h1>
          <p>
            Guests 1-60 are priced at $25 per person. Every additional guest
            after 60 is added at $20 per person. Events under 30 guests still
            default to the $750 minimum.
          </p>
        </div>

        <div className="bookingLayout">
          <form className="card formCard" onSubmit={(event) => event.preventDefault()}>
            <div className="formGrid">
              <label>
                Name
                <input
                  value={bookingForm.name}
                  onChange={(event) => updateBookingField("name", event.target.value)}
                  placeholder="Your name"
                />
                {bookingErrors.name && <span>{bookingErrors.name}</span>}
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={bookingForm.email}
                  onChange={(event) => updateBookingField("email", event.target.value)}
                  placeholder="you@example.com"
                />
                {bookingErrors.email && <span>{bookingErrors.email}</span>}
              </label>
              <label>
                Phone Number
                <input
                  type="tel"
                  value={bookingForm.phone}
                  onChange={(event) => updateBookingField("phone", event.target.value)}
                  placeholder="(555) 555-5555"
                />
                {bookingErrors.phone && <span>{bookingErrors.phone}</span>}
              </label>
              <label>
                Event Date
                <input
                  type="date"
                  min={today}
                  value={bookingForm.eventDate}
                  onChange={(event) => updateBookingField("eventDate", event.target.value)}
                />
                <small>Saturdays and Sundays only.</small>
                {bookingErrors.eventDate && <span>{bookingErrors.eventDate}</span>}
              </label>
              <label>
                Guest Count
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={bookingForm.guestCount}
                  onChange={(event) =>
                    updateBookingField("guestCount", Number(event.target.value))
                  }
                />
                {bookingErrors.guestCount && <span>{bookingErrors.guestCount}</span>}
              </label>
            </div>

            <fieldset>
              <legend>Choose exactly 2 meats</legend>
              <div className="meatOptions">
                {MEAT_OPTIONS.map((meat) => (
                  <label key={meat} className="checkboxCard">
                    <input
                      type="checkbox"
                      checked={bookingForm.meats.includes(meat)}
                      onChange={() => toggleMeat(meat)}
                    />
                    <span>{meat}</span>
                  </label>
                ))}
              </div>
              {bookingErrors.meats && <span className="fieldError">{bookingErrors.meats}</span>}
            </fieldset>

            <label>
              Notes
              <textarea
                value={bookingForm.notes}
                onChange={(event) => updateBookingField("notes", event.target.value)}
                placeholder="Tell us about the venue, timing, or setup needs."
              />
            </label>

            {bookingStatus.message && (
              <p className={`status ${bookingStatus.type}`}>{bookingStatus.message}</p>
            )}

            <div className="paymentActions">
              <button
                className="button primary"
                type="button"
                disabled={isBookingLoading}
                onClick={() => submitBooking("pay-now")}
              >
                Pay 20% Deposit Now
              </button>
              <button
                className="button secondary"
                type="button"
                disabled={isBookingLoading}
                onClick={() => submitBooking("pay-later")}
              >
                Pay Later
              </button>
            </div>
          </form>

          <aside className="card estimateCard" aria-live="polite">
            <p className="eyebrow">Live estimate</p>
            <h3>{formatCurrency(estimate.totalCents)}</h3>
            <dl>
              <div>
                <dt>Guests entered</dt>
                <dd>{estimate.guestCount || "Not set"}</dd>
              </div>
              <div>
                <dt>Guests billed</dt>
                <dd>{estimate.billableGuestCount}</dd>
              </div>
              <div>
                <dt>First 60 guests</dt>
                <dd>{formatCurrency(estimate.perPersonRateCents)} / person</dd>
              </div>
              <div>
                <dt>Additional guests</dt>
                <dd>{formatCurrency(estimate.additionalGuestRateCents)} / person</dd>
              </div>
              <div>
                <dt>Additional guest count</dt>
                <dd>{estimate.additionalGuestCount}</dd>
              </div>
              <div>
                <dt>20% deposit</dt>
                <dd>{formatCurrency(estimate.depositCents)}</dd>
              </div>
            </dl>
            {estimate.minimumApplied ? (
              <p className="minimumNote">
                The $750 minimum has been applied because this estimate is below
                30 guests.
              </p>
            ) : (
              <p>
                Includes tacos, toppings, salsas, rice, beans, and a
                complimentary choice of horchata or jamaica.
              </p>
            )}
          </aside>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
