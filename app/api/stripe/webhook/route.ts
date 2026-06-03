import { NextResponse } from "next/server";
import Stripe from "stripe";
import { buildBookingEmbed, sendDiscordEmbed } from "@/lib/discord";
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

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!stripe || !webhookSecret || !signature) {
    return NextResponse.json(
      {
        error:
          "Stripe webhook is not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET."
      },
      { status: 501 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata ?? {};
  const validation = validateBookingRequest({
    name: metadata.name,
    email: metadata.email,
    phone: metadata.phone,
    eventDate: metadata.eventDate,
    guestCount: Number(metadata.guestCount),
    meats: metadata.meats?.split(",").map((meat) => meat.trim()),
    paymentPreference: "pay-now",
    notes: [metadata.notes, `Stripe checkout session: ${session.id}`]
      .filter(Boolean)
      .join("\n")
  });

  if (!validation.ok) {
    console.error("Invalid booking metadata from Stripe", validation.errors);

    return NextResponse.json(
      { error: "Stripe booking metadata was invalid." },
      { status: 400 }
    );
  }

  const estimate = estimateForBooking(validation.data);

  try {
    await sendDiscordEmbed(
      "booking",
      buildBookingEmbed(
        validation.data,
        estimate,
        "Paid 20% Deposit via Stripe"
      )
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Stripe payment captured, but Discord alert failed." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
