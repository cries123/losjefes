"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
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

const initialContactForm: ContactForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: ""
};

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
  if (form.meats.length !== 2) {
    errors.meats = "Choose exactly 2 meats.";
  }

  return errors;
}

function getContactErrors(form: ContactForm) {
  const errors: Record<string, string> = {};

  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.email.trim()) errors.email = "Email is required.";
  if (!form.phone.trim()) errors.phone = "Phone number is required.";
  if (!form.subject.trim()) errors.subject = "Subject is required.";
  if (!form.message.trim()) errors.message = "Message is required.";

  return errors;
}

export default function Home() {
  const today = useMemo(() => getTodayDateValue(), []);
  const [bookingForm, setBookingForm] = useState<BookingForm>(initialBookingForm);
  const [contactForm, setContactForm] = useState<ContactForm>(initialContactForm);
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({});
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [bookingStatus, setBookingStatus] = useState<FormStatus>({
    type: "idle",
    message: ""
  });
  const [contactStatus, setContactStatus] = useState<FormStatus>({
    type: "idle",
    message: ""
  });

  const estimate = useMemo(
    () => calculateCateringEstimate(bookingForm.guestCount),
    [bookingForm.guestCount]
  );
  const isBookingLoading = bookingStatus.type === "loading";
  const isContactLoading = contactStatus.type === "loading";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const booking = params.get("booking");

    if (booking === "deposit-success") {
      setBookingStatus({
        type: "success",
        message:
          "Deposit received. Your weekend slot is being secured and our team will follow up shortly."
      });
    }

    if (booking === "deposit-cancelled") {
      setBookingStatus({
        type: "error",
        message:
          "Checkout was cancelled. You can try Pay Now again or choose Pay Later."
      });
    }
  }, []);

  function updateBookingField<K extends keyof BookingForm>(
    field: K,
    value: BookingForm[K]
  ) {
    setBookingForm((current) => ({
      ...current,
      [field]: value
    }));
    setBookingErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function updateContactField<K extends keyof ContactForm>(
    field: K,
    value: ContactForm[K]
  ) {
    setContactForm((current) => ({
      ...current,
      [field]: value
    }));
    setContactErrors((current) => {
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

      return {
        ...current,
        meats: [...current.meats, meat]
      };
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...bookingForm,
          paymentPreference
        })
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

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = getContactErrors(contactForm);

    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      setContactStatus({
        type: "error",
        message: "Please fix the highlighted contact details."
      });
      return;
    }

    setContactStatus({
      type: "loading",
      message: "Sending your message..."
    });

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(contactForm)
    });
    const result = await response.json();

    if (!response.ok) {
      setContactErrors(result.errors ?? {});
      setContactStatus({
        type: "error",
        message:
          result.error ?? "We could not send your message. Please try again."
      });
      return;
    }

    setContactStatus({
      type: "success",
      message: "Message sent. The Los Jefes team will be in touch soon."
    });
    setContactForm(initialContactForm);
  }

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#top" aria-label="Los Jefes home">
          Los Jefes
        </a>
        <div className="navLinks">
          <a href="#menu">Menu</a>
          <a href="#booking">Book Catering</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="heroCopy">
          <p className="eyebrow">Weekend taco catering</p>
          <h1>Modern Mexican catering for gatherings with flavor.</h1>
          <p>
            Los Jefes brings a clean, full-service taco package to birthdays,
            office events, family parties, and weekend celebrations.
          </p>
          <div className="heroActions">
            <a className="button primary" href="#booking">
              Get an Estimate
            </a>
            <a className="button secondary" href="#menu">
              View Package
            </a>
          </div>
        </div>
        <div className="heroCard" aria-label="Los Jefes package highlight">
          <span className="heroBadge">Included</span>
          <h2>4 tacos per guest</h2>
          <p>
            Served with limes, onions, cilantro, two red salsas, two green
            salsas, rice, beans, horchata, and jamaica.
          </p>
        </div>
      </section>

      <section className="section package" id="menu">
        <div className="sectionHeading">
          <p className="eyebrow">Catering package</p>
          <h2>Everything your guests need, priced per person.</h2>
        </div>
        <div className="packageGrid">
          <article>
            <span>01</span>
            <h3>Tacos</h3>
            <p>
              Four tacos per person with your choice of exactly two meats:
              carne asada, chicken, or al pastor.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Toppings & Salsas</h3>
            <p>
              Limes, onions, cilantro, two red salsas, and two green salsas are
              included with every event.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Sides & Drinks</h3>
            <p>
              Rice, beans, and two complimentary aguas frescas: horchata and
              jamaica.
            </p>
          </article>
        </div>
      </section>

      <section className="section bookingSection" id="booking">
        <div className="sectionHeading">
          <p className="eyebrow">Booking & estimator</p>
          <h2>Reserve a Saturday or Sunday event.</h2>
          <p>
            Standard pricing is $25 per person. Groups over 60 guests are $20
            per person. Events under 30 guests default to the $750 minimum.
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
                  onChange={(event) =>
                    updateBookingField("eventDate", event.target.value)
                  }
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
                <dt>Rate</dt>
                <dd>{formatCurrency(estimate.perPersonRateCents)} / person</dd>
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
                Includes tacos, toppings, salsas, rice, beans, horchata, and
                jamaica.
              </p>
            )}
          </aside>
        </div>
      </section>

      <section className="section contactSection" id="contact">
        <div className="sectionHeading">
          <p className="eyebrow">Contact us</p>
          <h2>Have a general question?</h2>
          <p>
            Send us a note for availability questions, custom requests, or
            anything that is not ready for the booking estimator.
          </p>
        </div>

        <form className="card contactForm" onSubmit={submitContact}>
          <div className="formGrid">
            <label>
              Name
              <input
                value={contactForm.name}
                onChange={(event) => updateContactField("name", event.target.value)}
                placeholder="Your name"
              />
              {contactErrors.name && <span>{contactErrors.name}</span>}
            </label>
            <label>
              Email
              <input
                type="email"
                value={contactForm.email}
                onChange={(event) => updateContactField("email", event.target.value)}
                placeholder="you@example.com"
              />
              {contactErrors.email && <span>{contactErrors.email}</span>}
            </label>
            <label>
              Phone Number
              <input
                type="tel"
                value={contactForm.phone}
                onChange={(event) => updateContactField("phone", event.target.value)}
                placeholder="(555) 555-5555"
              />
              {contactErrors.phone && <span>{contactErrors.phone}</span>}
            </label>
            <label>
              Subject
              <input
                value={contactForm.subject}
                onChange={(event) =>
                  updateContactField("subject", event.target.value)
                }
                placeholder="How can we help?"
              />
              {contactErrors.subject && <span>{contactErrors.subject}</span>}
            </label>
          </div>
          <label>
            Message
            <textarea
              value={contactForm.message}
              onChange={(event) => updateContactField("message", event.target.value)}
              placeholder="Write your message here."
            />
            {contactErrors.message && <span>{contactErrors.message}</span>}
          </label>
          {contactStatus.message && (
            <p className={`status ${contactStatus.type}`}>{contactStatus.message}</p>
          )}
          <button className="button primary" type="submit" disabled={isContactLoading}>
            Send Inquiry
          </button>
        </form>
      </section>
    </main>
  );
}
