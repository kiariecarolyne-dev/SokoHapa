import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { normalizeVendorPaymentMethods } from '../utils/paymentMethods';

// Saves the vendor's configured M-PESA payment methods on their profile
// (users/{uid}.mpesaPaymentMethods). Only the normalized snapshot fields are
// written; any existing value is replaced wholesale so removed methods are
// cleared. The rules restrict updates to this shape.
export async function updateVendorPaymentMethods(uid, { sendMoneyNumber, tillNumber }) {
  if (!uid) {
    throw new Error('updateVendorPaymentMethods: uid is required');
  }
  const methods = normalizeVendorPaymentMethods(
    { sendMoneyNumber, tillNumber },
    null
  );
  const mpesaPaymentMethods = {};
  if (methods?.sendMoneyNumber) {
    mpesaPaymentMethods.sendMoneyNumber = methods.sendMoneyNumber;
  }
  if (methods?.tillNumber) {
    mpesaPaymentMethods.tillNumber = methods.tillNumber;
  }
  await updateDoc(doc(db, 'users', uid), {
    mpesaPaymentMethods,
    updatedAt: serverTimestamp(),
  });
  return { sendMoneyNumber: methods?.sendMoneyNumber || null, tillNumber: methods?.tillNumber || null };
}