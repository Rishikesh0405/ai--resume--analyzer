export function cn(...classes: (string | undefined | null | boolean | Record<string, boolean>)[]) {
  const result: string[] = [];
  for (const c of classes) {
    if (!c) continue;
    if (typeof c === "string") {
      result.push(c);
    } else if (typeof c === "object") {
      for (const [key, value] of Object.entries(c)) {
        if (value) result.push(key);
      }
    }
  }
  return result.join(" ");
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Unknown Date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
