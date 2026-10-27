// Small helper functions for showing dates and durations.

// Dates are stored at midnight UTC, so we format in UTC to avoid showing the previous day.
export function formatDate(iso) {
  if (!iso) return 'No date set';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// For <input type="date">, which needs "YYYY-MM-DD"
export function toDateInput(iso) {
  return iso ? new Date(iso).toISOString().slice(0, 10) : '';
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 95 -> "1m 35s", 40 -> "40s", 0 -> "-"
export function formatDuration(seconds) {
  if (!seconds) return '-';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

// 3 -> "03"
export function pad(number) {
  return String(number).padStart(2, '0');
}
