const dateParts = (value: Date, timezone: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day) };
};

export const dateKeyInTimeZone = (value: string | Date, timezone: string) => {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = dateParts(date, timezone);
  return `${parts.year.toString().padStart(4, "0")}-${parts.month.toString().padStart(2, "0")}-${parts.day.toString().padStart(2, "0")}`;
};

export const shiftDateKey = (dateKey: string, days: number) => {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const getWeekStartKey = (value: Date, timezone: string, weekStartsOn: 1 | 7 = 1) => {
  const local = dateParts(value, timezone);
  const date = new Date(Date.UTC(local.year, local.month - 1, local.day, 12));
  const day = date.getUTCDay();
  const offset = weekStartsOn === 1 ? (day + 6) % 7 : day;
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
};

export const formatDateInTimeZone = (value: string, timezone: string) =>
  new Intl.DateTimeFormat("es-BO", { dateStyle: "medium", timeZone: timezone }).format(new Date(value));

export const formatShortDateInTimeZone = (value: string, timezone: string) =>
  new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "short", timeZone: timezone }).format(new Date(value));
