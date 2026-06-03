import { NextResponse } from "next/server";
import { buildContactEmbed, sendDiscordEmbed } from "@/lib/discord";
import { validateContactRequest } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const validation = validateContactRequest(payload);

  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  try {
    await sendDiscordEmbed("contact", buildContactEmbed(validation.data));
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Inquiry received, but the operations alert could not be sent." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
