import { NextResponse } from "next/server";
import { buildBookingEmbed, sendDiscordEmbed } from "@/lib/discord";
import {
  estimateForBooking,
  validateBookingRequest
} from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const validation = validateBookingRequest(payload);

  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  if (validation.data.paymentPreference !== "pay-later") {
    return NextResponse.json(
      { errors: { paymentPreference: "Use checkout for pay-now reservations." } },
      { status: 400 }
    );
  }

  const estimate = estimateForBooking(validation.data);

  try {
    await sendDiscordEmbed(
      "booking",
      buildBookingEmbed(validation.data, estimate, "Pay Later / Pending Contact")
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Reservation received, but the operations alert could not be sent." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    estimate
  });
}
