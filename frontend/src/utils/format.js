export const currency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    value ?? 0,
  );

export const shortDate = (value) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
