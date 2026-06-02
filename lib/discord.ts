import { formatCurrency, type CateringEstimate } from "@/lib/pricing";
import type { BookingRequest, ContactRequest } from "@/lib/validation";

type DiscordField = {
  name: string;
  value: string;
  inline?: boolean;
};

type DiscordEmbed = {
  title: string;
  description?: string;
  color: number;
  fields: DiscordField[];
  timestamp: string;
};

const BOOKING_COLOR = 0x2f6b3f;
const CONTACT_COLOR = 0x8a5a2b;

function getWebhookUrl(kind: "booking" | "contact"): string | undefined {
  if (kind === "booking") {
    return process.env.DISCORD_BOOKING_WEBHOOK_URL ?? process.env.DISCORD_WEBHOOK_URL;
  }

  return process.env.DISCORD_CONTACT_WEBHOOK_URL ?? process.env.DISCORD_WEBHOOK_URL;
}

function field(name: string, value: string | number, inline = false): DiscordField {
  return {
    name,
    value: String(value || "Not provided"),
    inline
  };
}

export function buildBookingEmbed(
  booking: BookingRequest,
  estimate: CateringEstimate,
  depositStatus: string
): DiscordEmbed {
  const fields = [
    field(
      "Customer Info",
      [`Name: ${booking.name}`, `Email: ${booking.email}`, `Phone: ${booking.phone}`].join(
        "\n"
      )
    ),
    field("Event Date", booking.eventDate, true),
    field("Guest Count", booking.guestCount, true),
    field("Chosen Meats", booking.meats.join(", ")),
    field("Total Calculated Price", formatCurrency(estimate.totalCents), true),
    field("20% Deposit", formatCurrency(estimate.depositCents), true),
    field("Deposit Status", depositStatus),
    field(
      "Pricing Notes",
      estimate.minimumApplied
        ? "Minimum event size applied: flat $750 minimum."
        : `Rate applied: ${formatCurrency(estimate.perPersonRateCents)} per person.`
    )
  ];

  if (booking.notes) {
    fields.push(field("Additional Notes", booking.notes));
  }

  return {
    title: "New Catering Booking",
    description: "Los Jefes catering reservation submitted.",
    color: BOOKING_COLOR,
    fields,
    timestamp: new Date().toISOString()
  };
}

export function buildContactEmbed(contact: ContactRequest): DiscordEmbed {
  return {
    title: "General Inquiry",
    description: "New Los Jefes contact form submission.",
    color: CONTACT_COLOR,
    fields: [
      field(
        "Customer Info",
        [`Name: ${contact.name}`, `Email: ${contact.email}`, `Phone: ${contact.phone}`].join(
          "\n"
        )
      ),
      field("Subject", contact.subject),
      field("Message", contact.message)
    ],
    timestamp: new Date().toISOString()
  };
}

export async function sendDiscordEmbed(
  kind: "booking" | "contact",
  embed: DiscordEmbed
) {
  const webhookUrl = getWebhookUrl(kind);

  if (!webhookUrl) {
    throw new Error(
      `Missing Discord webhook URL for ${kind}. Set DISCORD_${kind.toUpperCase()}_WEBHOOK_URL or DISCORD_WEBHOOK_URL.`
    );
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: "Los Jefes Website",
      embeds: [embed]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Discord webhook failed with ${response.status}: ${body}`);
  }
}
