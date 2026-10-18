/**
 * Timezone utilities for Uplivo.
 * All normalized solve dates and daily metrics are calculated using the Asia/Kolkata timezone.
 */

const KOLKATA_TIMEZONE = 'Asia/Kolkata';

/**
 * Converts a Date object or Unix timestamp (seconds or milliseconds) to a YYYY-MM-DD string in Asia/Kolkata.
 */
export function toKolkataDate(timestamp: number | Date | string): string {
  let date: Date;

  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'number') {
    // If timestamp is in seconds (e.g., LeetCode 10-digit timestamp ~1700000000), convert to ms
    if (timestamp < 1e11) {
      date = new Date(timestamp * 1000);
    } else {
      date = new Date(timestamp);
    }
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date/timestamp provided to toKolkataDate: ${timestamp}`);
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: KOLKATA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(date);
}

/**
 * Returns current date string (YYYY-MM-DD) in Asia/Kolkata.
 */
export function getTodayKolkata(): string {
  return toKolkataDate(new Date());
}

/**
 * Returns yesterday's date string (YYYY-MM-DD) in Asia/Kolkata.
 */
export function getYesterdayKolkata(): string {
  const now = new Date();
  // Subtract 24 hours in milliseconds as a safe baseline, then format in Kolkata timezone
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return toKolkataDate(yesterday);
}

/**
 * Returns an array of the last N days as YYYY-MM-DD strings in Asia/Kolkata up to today.
 */
export function getLastNDaysKolkata(n: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dates.push(toKolkataDate(d));
  }
  return dates;
}
