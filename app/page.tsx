"use client";

import { FormEvent, useMemo, useState } from "react";
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

const idleStatus: FormStatus = {
  type: "idle",
  message: ""
};

function getInitialBookingStatus(): FormStatus {
  if (typeof window === "undefined") {
    return idleStatus;
  }

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
  const [bookingStatus, setBookingStatus] = useState<FormStatus>(getInitialBookingStatus);
  const [contactStatus, setContactStatus] = useState<FormStatus>(idleStatus);

  const estimate = useMemo(
    () => calculateCateringEstimate(bookingForm.guestCount),
    [bookingForm.guestCount]
  );
  const isBookingLoading = bookingStatus.type === "loading";
  const isContactLoading = contactStatus.type === "loading";

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
      <div className="scrollProgress" aria-hidden="true" />
      <nav className="nav">
        <a className="brand" href="#top" aria-label="Los Jefes home">
          <span className="brandLogo" aria-hidden="true">
            <span className="brandLogoHat" />
            <span className="brandLogoFace">LJ</span>
          </span>
          <span>Los Jefes</span>
        </a>
        <div className="navLinks">
          <a href="/menu">Menu</a>
          <a href="#gallery">Gallery</a>
          <a href="#faq">FAQ</a>
          <a href="#booking">Book Catering</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <section className="hero mexicanHero" id="top">
        <div className="papelBanner papelBannerEdge" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
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
            <a className="button secondary" href="/menu">
              View Full Menu
            </a>
          </div>
        </div>
        <div className="heroCard mexicanArchCard" aria-label="Los Jefes package highlight">
          <div className="agaveMark" aria-hidden="true"><span /><span /><span /></div>
          <div className="mascotMark mascotMarkHero" aria-hidden="true">
            <span className="sombrero" />
            <span className="face">LJ</span>
            <span className="mustache" />
          </div>
          <span className="heroBadge">Taquiza Package</span>
          <h2>4 tacos per guest</h2>
          <p>
            Served with limes, onions, cilantro, two red salsas, two green
            salsas, rice, beans, and your choice of agua fresca.
          </p>
        </div>
      </section>

      <div className="talaveraDivider" aria-hidden="true" />

      <section className="scrollRibbon" aria-label="Los Jefes highlights">
        <div className="scrollRibbonTrack">
          <span>Weekend catering</span>
          <span>Brown & green salsa bar</span>
          <span>Rice and beans included</span>
          <span>Fresh aguas frescas</span>
          <span>Weekend catering</span>
          <span>Brown & green salsa bar</span>
          <span>Rice and beans included</span>
          <span>Fresh aguas frescas</span>
        </div>
      </section>

      <section className="scrollExperience mexicanPatternSection" aria-label="Scroll through the Los Jefes experience">
        <div className="scrollStage reveal">
          <p className="eyebrow">Scroll feature</p>
          <h2>The party builds as you move.</h2>
          <p>
            Layers, cards, and color blocks now respond to the page scroll so the
            site feels less static and more like a guided catering experience.
          </p>
          <div className="scrollPlate" aria-hidden="true">
            <span className="plateOrbit orbitOne" />
            <span className="plateOrbit orbitTwo" />
            <span className="plateCenter">Los Jefes</span>
          </div>
        </div>
        <div className="scrollSteps">
          <article className="scrollStep reveal">
            <span>Step 1</span>
            <h3>Pick the weekend</h3>
            <p>Only Saturdays and Sundays are accepted while the calendar grows.</p>
          </article>
          <article className="scrollStep reveal">
            <span>Step 2</span>
            <h3>Choose two meats</h3>
            <p>Carne asada, chicken, and al pastor now have their own designed menu page.</p>
          </article>
          <article className="scrollStep reveal">
            <span>Step 3</span>
            <h3>Watch the estimate</h3>
            <p>Pricing updates live as the guest count crosses the 60-person tier.</p>
          </article>
        </div>
      </section>

      <section className="section storySection mexicanPatternSection">
        <div className="sectionHeading reveal">
          <p className="eyebrow">The Los Jefes flow</p>
          <h2>Scroll through the weekend catering experience.</h2>
          <p>
            From menu selection to deposit, the site keeps guests moving through
            a simple path while the operations team gets clean Discord alerts.
          </p>
        </div>
        <div className="storyGrid">
          <article className="storyCard reveal">
            <span>01</span>
            <h3>Choose your two meats</h3>
            <p>
              Carne asada, chicken, and al pastor live on the dedicated menu
              page with earthy placeholder photography ready for final images.
            </p>
            <a className="textLink" href="/menu">Explore the menu</a>
          </article>
          <article className="storyCard reveal">
            <span>02</span>
            <h3>Build a live estimate</h3>
            <p>
              The first 60 guests are priced at $25 per person. Every additional
              guest is added at $20 per person, with the $750 minimum preserved.
            </p>
          </article>
          <article className="storyCard reveal">
            <span>03</span>
            <h3>Secure or submit</h3>
            <p>
              Pay the 20% Stripe deposit now or send the reservation as pending
              contact so the team can follow up.
            </p>
          </article>
        </div>
      </section>

      <section className="section processSection">
        <div className="processPanel reveal">
          <p className="eyebrow">What is included</p>
          <h2>Four tacos, rice, beans, salsas, garnishes, and agua fresca.</h2>
          <p>
            Each package comes with limes, onions, cilantro, two red salsas, two
            green salsas, rice and beans on the side, and a complimentary drink
            choice of horchata or jamaica.
          </p>
        </div>
      </section>

      <div className="papelBanner papelBannerBottom" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <section className="section bookingSection mexicanBooking" id="booking">
        <div className="sectionHeading">
          <p className="eyebrow">Booking & estimator</p>
          <h2>Reserve your weekend taquiza.</h2>
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

      <section className="section mascotSection" id="brand">
        <div className="mascotPanel reveal">
          <div className="mascotMark mascotMarkLarge" aria-hidden="true">
            <span className="sombrero" />
            <span className="face">LJ</span>
            <span className="mustache" />
          </div>
          <div>
            <p className="eyebrow">Mascot mark</p>
            <h2>Meet the Los Jefes mark.</h2>
            <p>
              A simple jefe-inspired mascot placeholder gives the brand an icon
              that can later become a polished logo, sticker, menu stamp, or
              social profile image.
            </p>
          </div>
        </div>
      </section>

      <section className="section gallerySection" id="gallery">
        <div className="sectionHeading reveal">
          <p className="eyebrow">Event gallery</p>
          <h2>Photos will bring the taquiza to life.</h2>
          <p>
            These placeholders are ready for real setup shots, taco closeups,
            salsa tables, aguas frescas, and happy guest moments once you start
            posting.
          </p>
        </div>
        <div className="galleryGrid">
          <article className="galleryTile galleryTall reveal">
            <span>Setup photo</span>
            <strong>Serving station</strong>
          </article>
          <article className="galleryTile reveal">
            <span>Food photo</span>
            <strong>Tacos on the plancha</strong>
          </article>
          <article className="galleryTile reveal">
            <span>Drink photo</span>
            <strong>Aguas frescas</strong>
          </article>
          <article className="galleryTile reveal">
            <span>Details photo</span>
            <strong>Salsa bar</strong>
          </article>
          <article className="galleryTile galleryWide reveal">
            <span>Event photo</span>
            <strong>Guests enjoying Los Jefes</strong>
          </article>
        </div>
      </section>

      <section className="section faqSection" id="faq">
        <div className="sectionHeading reveal">
          <p className="eyebrow">FAQ</p>
          <h2>Quick answers before guests book.</h2>
        </div>
        <div className="faqGrid">
          <details className="faqItem reveal" open>
            <summary>What do you need for setup?</summary>
            <p>
              We recommend a flat serving area with access to parking nearby.
              Add venue notes during booking so the team can confirm the best
              setup plan.
            </p>
          </details>
          <details className="faqItem reveal">
            <summary>How far do you travel?</summary>
            <p>
              Travel details can be confirmed after the reservation request.
              Add the event city and venue notes so Los Jefes can follow up
              with any travel fee or availability details.
            </p>
          </details>
          <details className="faqItem reveal">
            <summary>How does the deposit work?</summary>
            <p>
              A 20% deposit secures the weekend slot. Guests can pay now through
              Stripe or submit as Pay Later so the team can contact them.
            </p>
          </details>
          <details className="faqItem reveal">
            <summary>What is the cancellation policy?</summary>
            <p>
              Add the final cancellation policy here once it is set. For now,
              guests should contact Los Jefes as early as possible if plans
              change.
            </p>
          </details>
        </div>
      </section>

      <section className="section contactSection mexicanContact" id="contact">
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

      <footer className="siteFooter">
        <div className="footerBrand">
          <a className="brand footerLogo" href="#top" aria-label="Los Jefes home">
            <span className="brandLogo" aria-hidden="true">
              <span className="brandLogoHat" />
              <span className="brandLogoFace">LJ</span>
            </span>
            <span>Los Jefes</span>
          </a>
          <p>Weekend taquiza catering with tacos, rice, beans, salsas, and aguas frescas.</p>
        </div>
        <div className="footerColumns">
          <div>
            <h3>Explore</h3>
            <a href="/menu">Menu</a>
            <a href="#gallery">Gallery</a>
            <a href="#faq">FAQ</a>
          </div>
          <div>
            <h3>Book</h3>
            <a href="#booking">Catering estimator</a>
            <a href="#contact">Contact us</a>
            <span>Saturday & Sunday events</span>
          </div>
          <div>
            <h3>Social</h3>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer">TikTok</a>
            <span>Replace with your real handles</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
