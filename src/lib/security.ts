export function maskIdentifier(value: string, visibleChars = 4): string {
  const normalized = (value || "").replace(/\s+/g, "");
  if (!normalized) {
    return "XXXX";
  }

  const suffix = normalized.slice(-Math.max(visibleChars, 1));
  return `XXXX-XXXX-${suffix}`;
}

export function sanitizePhone(value: string): string {
  const digits = (value || "").replace(/\D/g, "");
  if (digits.length < 4) {
    return "XXXXXX";
  }
  return `XXXXXX${digits.slice(-4)}`;
}

export function normalizeSensitiveValue(value: string): string {
  return (value || "").replace(/\s+/g, "").trim();
}
