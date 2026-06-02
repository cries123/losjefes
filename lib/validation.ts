import {
  MEAT_OPTIONS,
  type MeatOption,
  calculateCateringEstimate,
  isMeatOption,
  isWeekendDate
} from "@/lib/pricing";

export type PaymentPreference = "pay-now" | "pay-later";

export type BookingRequest = {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  guestCount: number;
  meats: MeatOption[];
  paymentPreference: PaymentPreference;
  notes?: string;
};

export type ContactRequest = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === "object" ? (input as Record<string, unknown>) : {};
}

function requiredString(
  input: Record<string, unknown>,
  field: string,
  label: string,
  errors: Record<string, string>
): string {
  const value = typeof input[field] === "string" ? input[field].trim() : "";

  if (!value) {
    errors[field] = `${label} is required.`;
  }

  return value;
}

function optionalString(input: Record<string, unknown>, field: string): string {
  return typeof input[field] === "string" ? input[field].trim() : "";
}

export function validateBookingRequest(
  input: unknown
): ValidationResult<BookingRequest> {
  const payload = asRecord(input);
  const errors: Record<string, string> = {};
  const name = requiredString(payload, "name", "Name", errors);
  const email = requiredString(payload, "email", "Email", errors);
  const phone = requiredString(payload, "phone", "Phone number", errors);
  const eventDate = requiredString(payload, "eventDate", "Event date", errors);
  const notes = optionalString(payload, "notes");
  const guestCount = Number(payload.guestCount);
  const rawPaymentPreference = payload.paymentPreference;
  const paymentPreference: PaymentPreference | null =
    rawPaymentPreference === "pay-now" || rawPaymentPreference === "pay-later"
      ? rawPaymentPreference
      : null;
  const rawMeats = Array.isArray(payload.meats) ? payload.meats : [];
  const meats = rawMeats.filter(
    (meat): meat is MeatOption => typeof meat === "string" && isMeatOption(meat)
  );

  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!Number.isInteger(guestCount) || guestCount < 1) {
    errors.guestCount = "Guest count must be a positive whole number.";
  }

  if (eventDate && !isWeekendDate(eventDate)) {
    errors.eventDate = "We are currently booking Saturdays and Sundays only.";
  }

  if (meats.length !== 2 || new Set(meats).size !== 2) {
    errors.meats = `Select exactly 2 meats from ${MEAT_OPTIONS.join(", ")}.`;
  }

  if (!paymentPreference) {
    errors.paymentPreference = "Choose whether to pay the deposit now or later.";
  }

  if (Object.keys(errors).length > 0 || !paymentPreference) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      phone,
      eventDate,
      guestCount,
      meats,
      paymentPreference,
      ...(notes ? { notes } : {})
    }
  };
}

export function validateContactRequest(
  input: unknown
): ValidationResult<ContactRequest> {
  const payload = asRecord(input);
  const errors: Record<string, string> = {};
  const name = requiredString(payload, "name", "Name", errors);
  const email = requiredString(payload, "email", "Email", errors);
  const phone = requiredString(payload, "phone", "Phone number", errors);
  const subject = requiredString(payload, "subject", "Subject", errors);
  const message = requiredString(payload, "message", "Message", errors);

  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      phone,
      subject,
      message
    }
  };
}

export function estimateForBooking(booking: BookingRequest) {
  return calculateCateringEstimate(booking.guestCount);
}
