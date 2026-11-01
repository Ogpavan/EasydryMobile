export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
export const dateLabel = (
  value: string,
  options?: Intl.DateTimeFormatOptions,
) =>
  new Date(`${value}T12:00:00`).toLocaleDateString(
    "en-IN",
    options ?? { day: "numeric", month: "short", weekday: "short" },
  );
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const nextDates = () =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
// getRandomValues works on hotspot HTTP, where randomUUID is unavailable.
// These identifiers label demo records; they are not authentication tokens.
export const uid = (prefix: string) => {
  const bytes = new Uint8Array(4);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
    return `${prefix}-${Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0"),
    )
      .join("")
      .toUpperCase()}`;
  }
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
};
