export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function money(value: number | string | null | undefined) {
  const numberValue = typeof value === "string" ? Number(value) : value ?? 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numberValue) ? numberValue : 0);
}

export function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
