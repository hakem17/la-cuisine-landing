// Per PRD Section 4 (Q6). "Live Station" and "VIP Events" intentionally have
// no entry — the client has not provided pricing for them, so calculateBudget
// must block and prompt for manual pricing rather than guess (see Section 8).
const AVG_PRICE_PER_GUEST: Record<string, number> = {
  Birthday: 175,
  Wedding: 275,
  Engagement: 225,
  "Baby Shower": 175,
  "Luxury Buffet": 375,
  "Pass Around": 225,
  "Finger Food & Canapes": 175,
  "Breakfast & Coffee Break": 125,
  "Afternoon Tea Tower": 125,
  Lunch: 195,
  Dinner: 195,
  "Custom Menus & Themed Catering": 275,
};

const MIN_BUDGET = 5000;

function ceilTo1000(n: number) {
  return Math.ceil(n / 1000) * 1000;
}

export type BudgetResult =
  | { status: "missing_price" }
  | { status: "ok"; min: number; max: number };

export function calculateBudget({
  eventSelection,
  guestCount,
  location,
  isVip,
}: {
  eventSelection: string;
  guestCount: number;
  location: string;
  isVip: boolean;
}): BudgetResult {
  const avgPricePerGuest = AVG_PRICE_PER_GUEST[eventSelection];
  if (avgPricePerGuest === undefined) {
    return { status: "missing_price" };
  }

  const rawMin = avgPricePerGuest * guestCount;
  const abuDhabiMin = Math.max(ceilTo1000(rawMin), MIN_BUDGET);

  const minBudget = isVip
    ? ceilTo1000(abuDhabiMin * 2)
    : location === "Abu Dhabi"
      ? abuDhabiMin
      : ceilTo1000(abuDhabiMin * 1.5);

  const maxBudget = ceilTo1000(abuDhabiMin * 4);

  return { status: "ok", min: minBudget, max: maxBudget };
}

export function formatBudgetRange(min: number, max: number) {
  const format = (n: number) => n.toLocaleString("en-US");
  return `AED ${format(min)} - ${format(max)}`;
}
