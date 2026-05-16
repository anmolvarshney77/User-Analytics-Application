export function formatDateTime(iso: string, timeStyle: "short" | "medium" = "short") {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
