import { describe, it, expect } from 'vitest';
import { toKolkataDate, getTodayKolkata, getYesterdayKolkata, getLastNDaysKolkata } from './timezone';

describe('Timezone Utilities (Asia/Kolkata)', () => {
  it('converts UTC midnight correctly to Asia/Kolkata date', () => {
    // 2026-10-17 00:00:00 UTC is 2026-10-17 05:30:00 IST -> '2026-10-17'
    const dateUtc = new Date('2026-10-17T00:00:00.000Z');
    expect(toKolkataDate(dateUtc)).toBe('2026-10-17');

    // 2026-10-17 18:45:00 UTC is 2026-10-18 00:15:00 IST -> '2026-10-18'
    const dateLateUtc = new Date('2026-10-17T18:45:00.000Z');
    expect(toKolkataDate(dateLateUtc)).toBe('2026-10-18');
  });

  it('converts numeric unix timestamps in seconds', () => {
    // 1700000000 = Wed Nov 14 2023 22:13:20 UTC = Nov 15 2023 03:43:20 IST
    const dateStr = toKolkataDate(1700000000);
    expect(dateStr).toBe('2023-11-15');
  });

  it('generates last N days correctly', () => {
    const days = getLastNDaysKolkata(7);
    expect(days).toHaveLength(7);
    expect(days[6]).toBe(getTodayKolkata());
  });

  it('getYesterdayKolkata returns valid date format', () => {
    const yesterday = getYesterdayKolkata();
    expect(yesterday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
