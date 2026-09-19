// Composes a vendor's structured location (vendorLocation: {area, town,
// county}) into a single "Area, Town, County" line. Falls back to the legacy
// free-text `location` field when the structured map is missing or empty.
// Returns null when no usable location is present.
export function formatVendorLocation(source) {
  const loc = source?.vendorLocation;
  if (loc && typeof loc === 'object') {
    const parts = [loc.area, loc.town, loc.county].filter(
      (part) => part && String(part).trim().length > 0
    );
    if (parts.length > 0) return parts.join(', ');
  }
  const legacy = source?.location;
  return legacy && String(legacy).trim().length > 0 ? String(legacy) : null;
}

export function formatKES(amount) {
  const rounded = Math.round(amount || 0);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `KES ${formatted}`;
}

export function formatQuantity(kg) {
  return `${kg} kg`;
}

// Normalizes a Kenyan phone/M-PESA number to an E.164 (2547XXXXXXXX) form, or
// null when the value does not look like a Kenyan number. Handles the common
// formats stored by the app: '+254 712 345 678', '0712345678', '254712345678',
// '712345678'.
export function normalizeKenyanPhoneE164(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let cleaned = raw.replace(/[\s\-()]/g, '').trim();
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
  if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);
  if (cleaned.startsWith('7') && cleaned.length === 9) cleaned = '254' + cleaned;
  if (cleaned.startsWith('1') && cleaned.length === 9) cleaned = '254' + cleaned;
  if (!/^254(1|7)\d{8}$/.test(cleaned)) return null;
  return cleaned;
}

// Human-friendly display form (07XXXXXXXX) of a Kenyan number, or null when
// the value is not recognized as a Kenyan number.
export function normalizeKenyanPhoneDisplay(raw) {
  const e164 = normalizeKenyanPhoneE164(raw);
  if (!e164) return null;
  const nationalDigits = e164.substring(3);
  return `0${nationalDigits}`;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Renders an order timestamp. Accepts a Firestore Timestamp, Date, ISO string
// or number, while passing through existing human-readable display strings
// (e.g. TEST_MODE mock values like 'Today, 09:42') unchanged.
export function formatOrderTime(value) {
  if (!value) return '';
  if (typeof value.toDate === 'function') {
    return formatOrderDate(value.toDate());
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatOrderDate(value);
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime()) && /[^\d]/.test(String(value))) {
      return formatOrderDate(date);
    }
    return String(value);
  }
  return String(value);
}

function formatOrderDate(date) {
  const today = new Date();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${hh}:${mm}`;
  }
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const sameYear = date.getFullYear() === today.getFullYear();
  return `${day} ${month}${sameYear ? '' : ` ${date.getFullYear()}`}, ${hh}:${mm}`;
}