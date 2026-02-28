export function formatUtcToIST(date: string | Date): string {
  const utcDate = typeof date === "string" ? new Date(date) : date;

  return utcDate.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}