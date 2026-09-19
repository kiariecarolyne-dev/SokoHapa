import { normalizeKenyanPhoneDisplay, normalizeKenyanPhoneE164 } from './format';

const TILL_NUMBER_PATTERN = /^\d{5,10}$/;

// Normalizes a Buy Goods Till number. Till (Lipa na M-PESA / Buy Goods Till)
// numbers are biller short codes, NOT phone numbers, so they are kept as
// digits only and never normalized as a Kenyan phone line.
export function normalizeTillNumber(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const cleaned = raw.replace(/[\s\-()]/g, '').trim();
  if (!TILL_NUMBER_PATTERN.test(cleaned)) return null;
  return cleaned;
}

// Builds the immutable `paymentVendor` snapshot that is stored on an order at
// checkout:
//   { sendMoneyNumber?: string(E.164), tillNumber?: string(digits) }
//
// The vendor's configured Send Money number takes precedence; when the vendor
// has configured nothing, the legacy vendor phone is used as the Send Money
// number so existing vendors keep a working pay method. Returns null only
// when no usable number exists at all.
export function normalizeVendorPaymentMethods(config = {}, fallbackPhone = null) {
  const sendMoneyNumber =
    normalizeKenyanPhoneE164(config?.sendMoneyNumber) ||
    normalizeKenyanPhoneE164(fallbackPhone);
  const tillNumber = normalizeTillNumber(config?.tillNumber);
  if (!sendMoneyNumber && !tillNumber) return null;
  return {
    sendMoneyNumber: sendMoneyNumber || null,
    tillNumber: tillNumber || null,
  };
}

// Builds the immutable `paymentVendor` snapshot attached to an order at
// checkout. The Firestore rules require paymentVendor to ALWAYS be a map with
// exactly the two keys sendMoneyNumber/tillNumber and to agree exactly with the
// vendor's stored M-PESA configuration, so this:
//   - keeps the configured values VERBATIM (raw stored strings): the rules
//     compare pv.sendMoneyNumber != stored.sendMoneyNumber, and a verbatim copy
//     passes whether the stored config was saved app-normalized or seeded
//     externally with formatting;
//   - falls back to the vendor's phone as the Send Money number when nothing is
//     configured (same fallback as normalizeVendorPaymentMethods);
//   - ALWAYS returns the fixed { sendMoneyNumber, tillNumber } shape and never
//     null, so the rules' `paymentVendor is map` and keys().hasOnly(...)
//     checks can never fail. A null key means no usable destination exists.
//
// Buyer-facing displays still normalize on READ via buildPaymentMethodRows, so
// a clean number is always shown/copied regardless of how it is stored.
export function buildOrderPaymentVendorSnapshot(config = null, fallbackPhone = null) {
  const m = config && typeof config === 'object' ? config : {};
  const fallback =
    typeof fallbackPhone === 'string' ? fallbackPhone.trim() : '';
  return {
    sendMoneyNumber:
      typeof m.sendMoneyNumber === 'string' ? m.sendMoneyNumber : fallback || null,
    tillNumber:
      typeof m.tillNumber === 'string' ? m.tillNumber : null,
  };
}

// Rows used for the buyer-facing payment displays. The order snapshot is the
// primary source; the legacy vendor phone (identity.vendor.phone) is the
// fallback so older orders without a paymentVendor snapshot still show a
// usable Send Money number.
export function buildPaymentMethodRows(paymentVendor = null, vendorPhone = null) {
  const pv = paymentVendor && typeof paymentVendor === 'object' ? paymentVendor : {};
  const rows = [];
  const sendMoney =
    normalizeKenyanPhoneE164(pv.sendMoneyNumber) ||
    normalizeKenyanPhoneE164(vendorPhone);
  const till = normalizeTillNumber(pv.tillNumber);
  if (sendMoney) {
    rows.push({
      id: 'send-money',
      label: 'Send Money',
      copyValue: sendMoney,
      displayValue: normalizeKenyanPhoneDisplay(sendMoney) || sendMoney,
    });
  }
  if (till) {
    rows.push({
      id: 'till',
      label: 'Buy Goods Till',
      copyValue: till,
      displayValue: till,
    });
  }
  return rows;
}

// One-line summary of the vendor's pay destination (used on the vendor's own
// payment-verification screen). Empty when the vendor has no usable method.
export function paymentVendorSummary(paymentVendor = null, vendorPhone = null) {
  const rows = buildPaymentMethodRows(paymentVendor, vendorPhone);
  return rows.map((row) => `${row.label}: ${row.displayValue}`).join(' | ');
}