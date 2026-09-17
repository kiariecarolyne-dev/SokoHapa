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