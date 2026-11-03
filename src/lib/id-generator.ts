/**
 * CHAKRI SHEBA (চাকরি সেবা) — SMART IDENTIFIER & USERNAME GENERATION ENGINE
 * Generates enterprise, human-readable, brand-aligned IDs for:
 * - Applications (e.g. CS2611-48291)
 * - Candidate Accounts & IDs (e.g. CS-USR-26-366647)
 * - Smart Usernames (e.g. tanvir.ahmed.5678, leon.rahman.6647)
 * - Financial Transactions (e.g. CS-TXN-2611-9821)
 * - Notifications (e.g. CS-NOTIF-2611-042)
 */

const COMMON_BN_TO_EN_NAMES: Record<string, string> = {
  'তানভীর': 'tanvir',
  'তানজিম': 'tanzim',
  'আহমেদ': 'ahmed',
  'হাসান': 'hasan',
  'হোসেন': 'hossain',
  'রহমান': 'rahman',
  'ইসলাম': 'islam',
  'মাহমুদ': 'mahmud',
  'ফারহানা': 'farhana',
  'শায়লা': 'shayla',
  'শারমিন': 'sharmin',
  'আরিফুল': 'ariful',
  'সুমন': 'sumon',
  'রাকিবুল': 'rakibul',
  'আব্দুর': 'abdur',
  'লিওন': 'leon',
  'মো:': '',
  'মোঃ': '',
  'মোহাম্মদ': 'md',
  'খন্দকার': 'khondokar',
  'চৌধুরী': 'chowdhury',
  'মিয়া': 'mia',
  'খান': 'khan',
  'শেখ': 'sheikh',
  'বেগম': 'begum',
  'আক্তার': 'akter',
  'সুলতানা': 'sultana',
  'জাহান': 'jahan',
  'ইয়াসমিন': 'yasmin',
  'কামরুল': 'kamrul',
  'মেহেদী': 'mehedi',
  'তৌহিদুল': 'touhidul',
  'নুসরাত': 'nusrat',
  'শাহরিয়ার': 'shahriar',
  'আয়েশা': 'ayesha',
  'এনামুল': 'enamul'
};

/**
 * Transliterate or clean a full name into a professional English username slug
 */
export function slugifyCandidateName(name: string): string {
  if (!name || typeof name !== 'string') return 'candidate';

  let str = name.trim();

  // 1. Replace known Bengali name tokens
  for (const [bn, en] of Object.entries(COMMON_BN_TO_EN_NAMES)) {
    str = str.replace(new RegExp(bn, 'gi'), en);
  }

  // 2. Remove non-ascii or punctuation
  const clean = str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');

  return clean && clean.length >= 2 ? clean : 'candidate';
}

/**
 * Generate a smart, human-friendly username
 * Example: 'Abdur Rahman Leon' + '01774366647' -> 'leon.rahman.6647'
 * Example: 'মোঃ তানভীর আহমেদ' + '01712345678' -> 'tanvir.ahmed.5678'
 */
export function generateSmartUsername(
  name: string,
  phone?: string,
  existingCheck?: (u: string) => boolean
): string {
  const base = slugifyCandidateName(name);
  const phoneDigits = phone ? phone.replace(/\D/g, '').slice(-4) : '';
  const yearSuffix = String(new Date().getFullYear()).slice(-2);
  const suffix = phoneDigits || yearSuffix;

  let candidateUsername = `${base}.${suffix}`.replace(/^\./, '');

  // If duplicate, try suffixing with incremental sequence
  if (existingCheck && existingCheck(candidateUsername)) {
    for (let i = 1; i <= 99; i++) {
      const alt = `${candidateUsername}.${i}`;
      if (!existingCheck(alt)) {
        return alt;
      }
    }
  }

  return candidateUsername;
}

/**
 * Generate a smart, enterprise Application ID
 * Format: CS + Year(2) + Month(2) + '-' + 5-digit number
 * Example: CS2611-48291
 */
export function generateSmartApplicationId(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const random5 = Math.floor(10000 + Math.random() * 90000);
  return `CS${yy}${mm}-${random5}`;
}

/**
 * Generate a smart Candidate ID
 * Format: CS-USR- + Year(2) + '-' + last 6 digits of phone (or unique 6 digits)
 * Example: CS-USR-26-366647
 */
export function generateSmartCandidateId(phone?: string): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-6) : '';
  const fallbackDigits = Math.floor(100000 + Math.random() * 900000);
  const digits = cleanPhone && cleanPhone.length === 6 ? cleanPhone : fallbackDigits;
  return `CS-USR-${yy}-${digits}`;
}

/**
 * Generate a smart Ledger / Wallet Transaction ID
 * Format: CS-TXN- + Year(2) + Month(2) + '-' + 4-digit number
 * Example: CS-TXN-2611-4821
 */
export function generateSmartTransactionId(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `CS-TXN-${yy}${mm}-${random4}`;
}

/**
 * Generate a smart Notification Delivery ID
 * Example: CS-NOTIF-2611-042
 */
export function generateSmartNotificationId(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const random3 = Math.floor(100 + Math.random() * 900);
  return `CS-NOTIF-${yy}${mm}-${random3}`;
}

/**
 * Generate a smart Document Vault ID
 * Example: CS-DOC-2611-081
 */
export function generateSmartDocumentId(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const random3 = Math.floor(100 + Math.random() * 900);
  return `CS-DOC-${yy}${mm}-${random3}`;
}

