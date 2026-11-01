/**
 * Chakri Sheba - Asia/Dhaka (BST: UTC+6) Timezone & Bengali Date Engine
 * Step 07: Precise Date Calculations & Normalization
 */

export const BANGLADESH_TIMEZONE = 'Asia/Dhaka';
export const BST_OFFSET_HOURS = 6;
export const BST_OFFSET_MS = BST_OFFSET_HOURS * 60 * 60 * 1000;

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const EN_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const BN_MONTHS_MAP: Record<string, string> = {
  'জানুয়ারি': '01',
  'জানুয়ারি': '01',
  'ফেব্রুয়ারি': '02',
  'ফেব্রুয়ারি': '02',
  'মার্চ': '03',
  'এপ্রিল': '04',
  'মে': '05',
  'জুন': '06',
  'জুলাই': '07',
  'আগস্ট': '08',
  'সেপ্টেম্বর': '09',
  'অক্টোবর': '10',
  'নভেম্বর': '11',
  'ডিসেম্বর': '12',
  'january': '01',
  'february': '02',
  'march': '03',
  'april': '04',
  'may': '05',
  'june': '06',
  'july': '07',
  'august': '08',
  'september': '09',
  'october': '10',
  'november': '11',
  'december': '12'
};

const BN_MONTHS_NAMES = [
  '',
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর'
];

const BN_DAYS_NAMES = [
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
  'শনিবার'
];

export class BangladeshDateHelper {
  /**
   * Convert English digits to Bengali digits
   */
  public static toBnDigits(num: number | string): string {
    return String(num).replace(/[0-9]/g, (d) => BN_DIGITS[parseInt(d, 10)]);
  }

  /**
   * Convert Bengali digits to English digits
   */
  public static toEnDigits(str: string): string {
    return String(str).replace(/[০-৯]/g, (d) => {
      const idx = BN_DIGITS.indexOf(d);
      return idx !== -1 ? EN_DIGITS[idx] : d;
    });
  }

  /**
   * Parse any raw date (Bengali slash, text month, ISO, etc.) into standard 'YYYY-MM-DD'
   */
  public static parseToIsoDate(rawDate?: string | null): string | null {
    if (!rawDate) return null;
    const trimmed = rawDate.trim();
    if (!trimmed) return null;

    // 1. Check if already standard YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    // 2. Check if ISO string with timestamp (e.g., 2026-10-29T18:20:46.464Z)
    if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
      try {
        const utcDate = new Date(trimmed);
        if (!isNaN(utcDate.getTime())) {
          // Add 6 hours to get Asia/Dhaka calendar date
          const bstDate = new Date(utcDate.getTime() + BST_OFFSET_MS);
          const y = bstDate.getUTCFullYear();
          const m = String(bstDate.getUTCMonth() + 1).padStart(2, '0');
          const d = String(bstDate.getUTCDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
      } catch {}
    }

    // 3. Convert all Bengali digits to English
    const enStr = this.toEnDigits(trimmed);

    // 4. Check slash-separated date (e.g. 30/10/2026 or 01/07/2025)
    const slashMatch = enStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (slashMatch) {
      const d = slashMatch[1].padStart(2, '0');
      const m = slashMatch[2].padStart(2, '0');
      const y = slashMatch[3];
      return `${y}-${m}-${d}`;
    }

    // 5. Check text month in Bengali or English (e.g. "২৮ অক্টোবর ২০২৬" or "28 October 2026")
    const words = enStr.split(/\s+/);
    if (words.length >= 2) {
      const dayCandidate = words[0].replace(/[^0-9]/g, '');
      const monthCandidate = words[1].toLowerCase();
      const yearCandidate = (words[2] ? words[2].replace(/[^0-9]/g, '') : '') || '2026';

      if (dayCandidate && yearCandidate && yearCandidate.length === 4) {
        let m = '00';
        for (const [key, val] of Object.entries(BN_MONTHS_MAP)) {
          if (monthCandidate.includes(key)) {
            m = val;
            break;
          }
        }
        if (m !== '00') {
          return `${yearCandidate}-${m}-${dayCandidate.padStart(2, '0')}`;
        }
      }
    }

    return null;
  }

  /**
   * Get today's calendar date info in Asia/Dhaka (BST)
   */
  public static getBangladeshTodayDate(nowInput?: Date): {
    isoDate: string;
    dateBn: string;
    dayBn: string;
    year: number;
    month: number;
    day: number;
    startOfDayUtc: Date;
    endOfDayUtc: Date;
  } {
    const now = nowInput || new Date();
    // Shift UTC time to BST (+6 hours)
    const bstTime = new Date(now.getTime() + BST_OFFSET_MS);

    const year = bstTime.getUTCFullYear();
    const month = bstTime.getUTCMonth() + 1;
    const day = bstTime.getUTCDate();
    const dayOfWeek = bstTime.getUTCDay();

    const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateBn = `${this.toBnDigits(day)} ${BN_MONTHS_NAMES[month]} ${this.toBnDigits(year)}`;
    const dayBn = BN_DAYS_NAMES[dayOfWeek];

    const boundaries = this.getBangladeshDateBoundaries(isoDate);

    return {
      isoDate,
      dateBn,
      dayBn,
      year,
      month,
      day,
      startOfDayUtc: boundaries.startOfDayUtc,
      endOfDayUtc: boundaries.endOfDayUtc
    };
  }

  /**
   * Get UTC start and end timestamps for a specific Bangladesh calendar date (YYYY-MM-DD)
   */
  public static getBangladeshDateBoundaries(isoDate: string): {
    startOfDayUtc: Date;
    endOfDayUtc: Date;
  } {
    const parts = isoDate.split('-');
    if (parts.length !== 3) {
      const now = new Date();
      return { startOfDayUtc: now, endOfDayUtc: now };
    }

    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);

    // Midnight BST (00:00:00.000) corresponds to 18:00:00 of the previous day in UTC
    const startOfDayBstAsUtc = Date.UTC(y, m, d, 0, 0, 0, 0);
    const startOfDayUtc = new Date(startOfDayBstAsUtc - BST_OFFSET_MS);

    // 23:59:59.999 BST corresponds to 17:59:59.999 UTC
    const endOfDayBstAsUtc = Date.UTC(y, m, d, 23, 59, 59, 999);
    const endOfDayUtc = new Date(endOfDayBstAsUtc - BST_OFFSET_MS);

    return { startOfDayUtc, endOfDayUtc };
  }

  /**
   * Format a standard ISO date (YYYY-MM-DD) into full Bengali date string
   * e.g., '2026-10-30' -> '৩০ অক্টোবর ২০২৬'
   */
  public static formatBengaliFullDate(isoDate: string): string {
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    const mName = BN_MONTHS_NAMES[m] || '';
    return `${this.toBnDigits(d)} ${mName} ${this.toBnDigits(y)}`;
  }

  /**
   * Format relative Bengali date:
   * 'আজ প্রকাশিত', 'গতকাল প্রকাশিত', '২ দিন আগে', or '২৮ অক্টোবর ২০২৬'
   */
  public static formatRelativeBengaliDate(rawDate?: string | null, nowInput?: Date): string {
    const isoDate = this.parseToIsoDate(rawDate);
    if (!isoDate) return 'সাম্প্রতিক';

    const todayInfo = this.getBangladeshTodayDate(nowInput);
    if (isoDate === todayInfo.isoDate) {
      return 'আজ প্রকাশিত';
    }

    const todayDate = new Date(`${todayInfo.isoDate}T00:00:00Z`);
    const targetDate = new Date(`${isoDate}T00:00:00Z`);
    const diffMs = todayDate.getTime() - targetDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'গতকাল প্রকাশিত';
    } else if (diffDays > 1 && diffDays <= 7) {
      return `${this.toBnDigits(diffDays)} দিন আগে`;
    } else {
      return this.formatBengaliFullDate(isoDate);
    }
  }

  /**
   * Check if a job's publication date falls within the last N days in Bangladesh
   */
  public static isWithinDays(rawDate: string | null | undefined, days: number, nowInput?: Date): boolean {
    const isoDate = this.parseToIsoDate(rawDate);
    if (!isoDate) return false;

    const todayInfo = this.getBangladeshTodayDate(nowInput);
    const todayDate = new Date(`${todayInfo.isoDate}T00:00:00Z`);
    const targetDate = new Date(`${isoDate}T00:00:00Z`);
    const diffMs = todayDate.getTime() - targetDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    return diffDays >= 0 && diffDays <= days;
  }

  /**
   * Check if deadline is approaching (closing soon)
   */
  public static isClosingSoon(daysRemaining?: number | null, thresholdDays: number = 3): boolean {
    if (daysRemaining === undefined || daysRemaining === null) return false;
    return daysRemaining >= 0 && daysRemaining <= thresholdDays;
  }
}
