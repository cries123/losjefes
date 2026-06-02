export const MEAT_OPTIONS = ["Carne Asada", "Chicken", "Al Pastor"] as const;

export type MeatOption = (typeof MEAT_OPTIONS)[number];

export const MINIMUM_GUESTS = 30;
export const MINIMUM_TOTAL_CENTS = 75000;
export const STANDARD_RATE_CENTS = 2500;
export const LARGE_GROUP_RATE_CENTS = 2000;
export const LARGE_GROUP_THRESHOLD = 60;
export const DEPOSIT_PERCENTAGE = 0.2;

export type CateringEstimate = {
  guestCount: number;
  billableGuestCount: number;
  perPersonRateCents: number;
  additionalGuestRateCents: number;
  baseGuestCount: number;
  additionalGuestCount: number;
  baseSubtotalCents: number;
  additionalSubtotalCents: number;
  subtotalCents: number;
  totalCents: number;
  depositCents: number;
  minimumApplied: boolean;
};

export function calculateCateringEstimate(guestCount: number): CateringEstimate {
  const normalizedGuestCount = Number.isFinite(guestCount)
    ? Math.max(0, Math.trunc(guestCount))
    : 0;
  const minimumApplied = normalizedGuestCount < MINIMUM_GUESTS;
  const billableGuestCount = minimumApplied ? MINIMUM_GUESTS : normalizedGuestCount;
  const baseGuestCount = Math.min(billableGuestCount, LARGE_GROUP_THRESHOLD);
  const additionalGuestCount = Math.max(
    billableGuestCount - LARGE_GROUP_THRESHOLD,
    0
  );
  const baseSubtotalCents = baseGuestCount * STANDARD_RATE_CENTS;
  const additionalSubtotalCents = additionalGuestCount * LARGE_GROUP_RATE_CENTS;
  const subtotalCents = baseSubtotalCents + additionalSubtotalCents;

  return {
    guestCount: normalizedGuestCount,
    billableGuestCount,
    perPersonRateCents: STANDARD_RATE_CENTS,
    additionalGuestRateCents: LARGE_GROUP_RATE_CENTS,
    baseGuestCount,
    additionalGuestCount,
    baseSubtotalCents,
    additionalSubtotalCents,
    subtotalCents,
    totalCents: subtotalCents,
    depositCents: Math.round(subtotalCents * DEPOSIT_PERCENTAGE),
    minimumApplied
  };
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(cents / 100);
}

export function isMeatOption(value: string): value is MeatOption {
  return MEAT_OPTIONS.includes(value as MeatOption);
}

export function isWeekendDate(dateString: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) {
    return false;
  }

  const [, year, month, day] = match;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), 12)
  );
  const dayOfWeek = date.getUTCDay();

  return dayOfWeek === 0 || dayOfWeek === 6;
}

export function getTodayDateValue(): string {
  return new Date().toISOString().slice(0, 10);
}
