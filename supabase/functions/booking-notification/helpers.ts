export function getLocation(dateString: string): string {
  if (!dateString) return "Richmond, New Zealand";
  try {
    const d = new Date(dateString + "T00:00:00");
    const day = d.getDay();
    if (day === 1 || day === 5) {
      return "169 White Rd, Richmond";
    }
    return "Summerset Richmond Ranges, 1 Hill Street North, Richmond 7020";
  } catch {
    return "Richmond, New Zealand";
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return "Not set";
  try {
    const d = new Date(dateString + "T00:00:00");
    return d.toLocaleDateString("en-NZ", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatTime(timeString: string): string {
  if (!timeString) return "";
  try {
    const [hours, minutes] = timeString.split(":");
    const h = parseInt(hours, 10);
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  } catch {
    return timeString;
  }
}
