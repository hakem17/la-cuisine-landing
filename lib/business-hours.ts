const BUSINESS_TIMEZONE = "Asia/Dubai";
const OPEN_HOUR = 9;
const CLOSE_HOUR = 17;
const CLOSED_DAYS = new Set(["Sat", "Sun"]);

export function isBusinessHours(date: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIMEZONE,
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(date);

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;

  if (CLOSED_DAYS.has(weekday)) return false;
  return hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}
