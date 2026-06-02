import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  estimateForBooking,
  validateBookingRequest
} from "@/lib/validation";

export const runtime = "nodejs";

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}

function truncateMetadata(value: string, maxLength = 500): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const validation = validateBookingRequest(payload);

  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  if (validation.data.paymentPreference !== "pay-now") {
    return NextResponse.json(
      { errors: { paymentPreference: "Use bookings for pay-later reservations." } },
      { status: 400 }
    );
  }

  const stripe = getStripeClient();

  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured yet. Add STRIPE_SECRET_KEY to enable pay-now deposits."
      },
      { status: 501 }
    );
  }

  const estimate = estimateForBooking(validation.data);
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: validation.data.email,
    phone_number_collection: {
      enabled: true
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: estimate.depositCents,
          product_data: {
            name: "Los Jefes Catering Deposit",
            description: `20% deposit for ${validation.data.eventDate} catering reservation`
          }
        }
      }
    ],
    metadata: {
      name: truncateMetadata(validation.data.name),
      email: validation.data.email,
      phone: validation.data.phone,
      eventDate: validation.data.eventDate,
      guestCount: String(validation.data.guestCount),
      meats: validation.data.meats.join(", "),
      totalCents: String(estimate.totalCents),
      depositCents: String(estimate.depositCents),
      notes: truncateMetadata(validation.data.notes ?? "")
    },
    success_url: `${origin}/?booking=deposit-success&session_id={CHECKOUT_SESSION_ID}#booking`,
    cancel_url: `${origin}/?booking=deposit-cancelled#booking`
  });

  return NextResponse.json({
    ok: true,
    checkoutUrl: session.url,
    estimate
  });
}
