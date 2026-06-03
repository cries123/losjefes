"use client";

import { FormEvent, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";

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

const initialContactForm: ContactForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: ""
};

function getContactErrors(form: ContactForm) {
  const errors: Record<string, string> = {};

  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.email.trim()) errors.email = "Email is required.";
  if (!form.phone.trim()) errors.phone = "Phone number is required.";
  if (!form.subject.trim()) errors.subject = "Subject is required.";
  if (!form.message.trim()) errors.message = "Message is required.";

  return errors;
}

export default function ContactPage() {
  const [contactForm, setContactForm] = useState<ContactForm>(initialContactForm);
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [contactStatus, setContactStatus] = useState<FormStatus>({
    type: "idle",
    message: ""
  });
  const isContactLoading = contactStatus.type === "loading";

  function updateContactField<K extends keyof ContactForm>(
    field: K,
    value: ContactForm[K]
  ) {
    setContactForm((current) => ({ ...current, [field]: value }));
    setContactErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
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

    setContactStatus({ type: "loading", message: "Sending your message..." });

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactForm)
    });
    const result = await response.json();

    if (!response.ok) {
      setContactErrors(result.errors ?? {});
      setContactStatus({
        type: "error",
        message: result.error ?? "We could not send your message. Please try again."
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
      <SiteNav />
      <section className="section contactSection mexicanContact pageSection" id="contact">
        <div className="sectionHeading">
          <p className="eyebrow">Contact us</p>
          <h1>Have a general question?</h1>
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
                onChange={(event) => updateContactField("subject", event.target.value)}
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
      <SiteFooter />
    </main>
  );
}
