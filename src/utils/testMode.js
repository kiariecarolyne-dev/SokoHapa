// TEMPORARY DEVELOPMENT TEST MODE.
// MUST BE DISABLED FOR PRODUCTION.
//
// THIS FILE IS THE ONLY PLACE IN THE APP THAT DECIDES WHETHER THE SAFE
// DEVELOPMENT TEST MODE IS ON. Do not add competing test flags elsewhere.
//
// What TEST_MODE does:
//   - Lets a vendor manage their store (add/edit/remove products) without an
//     active subscription, so the complete Buyer -> Vendor -> Delivery
//     workflow can be exercised during development/testing.
//
// What TEST_MODE does NOT do:
//   - It NEVER writes fake subscription data to Firestore.
//   - It NEVER overwrites `subscriptionStatus`, `subscriptionStartDate`,
//     `subscriptionExpiryDate`, `premiumPlan`, `premiumUntil` or `isPremium`.
//   - It NEVER hardcodes every vendor as subscribed.
//   - It NEVER bypasses M-PESA / international payment processing (there is no
//     payment processing in this prototype yet; the real subscription screen
//     remains the gate when TEST_MODE is off).
//   - The underlying real subscription checks stay intact and are the ONLY
//     ones used when TEST_MODE is disabled.
//
// How to enable/disable:
//   - Set TEST_MODE_ACTIVE to `true` to enable (development only).
//   - Set TEST_MODE_ACTIVE to `false` to disable; normal subscription rules
//     apply again immediately.
//   - The __DEV__ guard additionally means TEST_MODE can NEVER be active in a
//     release/production bundle (__DEV__ is false there), so this can never
//     become a production payment bypass.

const TEST_MODE_ACTIVE = true;

export const TEST_MODE =
  (typeof __DEV__ === 'boolean' && __DEV__) && TEST_MODE_ACTIVE;

import {
  buildTestOrderFromCart,
  submitTestOrder,
  updateOrderRecord,
  addTestDeliveryRequest,
  setActiveDeliveryFromOrder,
  addDeliveryHistoryRecord,
  getOrderByOrderNumber,
  activeDelivery,
  deliveryRequests,
} from '../services/mockData';

// True when the vendor's Firestore profile shows an active subscription.
// The Firestore profile is the source of truth; this helper is intentionally
// not altered by TEST_MODE.
export function isVendorSubscribed(profile) {
  if (!profile || profile.subscriptionStatus !== 'active') {
    return false;
  }
  // Respect an existing expiry date (Firestore Timestamp or ISO/datetime
  // string) if present. There is currently no code that writes expiry dates,
  // but this keeps the real expiration rule intact if one is ever set.
  const expiry = profile.subscriptionExpiryDate;
  if (expiry) {
    const expiryMs =
      typeof expiry.toMillis === 'function'
        ? expiry.toMillis()
        : new Date(expiry).getTime();
    if (Number.isFinite(expiryMs) && expiryMs <= Date.now()) {
      return false;
    }
  }
  return true;
}

// Whether a vendor may perform subscription-protected store actions
// (add/edit/remove store products).
//
// Production rule: only vendors with an active subscription (isVendorSubscribed).
// Development rule: TEST_MODE grants the same access for testing WITHOUT
// touching Firestore subscription data.
export function vendorCanManageStore(profile) {
  if (TEST_MODE) {
    return true;
  }
  return isVendorSubscribed(profile);
}

// ---- TEST_MODE order & delivery workflow helpers ----
// Every helper below is a no-op (returns null) unless TEST_MODE is active, so a
// production / release build (or TEST_MODE_ACTIVE = false) never creates fake
// orders, fake payments or fake delivery activity.

// Creates a test order from the current cart and makes it visible to BOTH the
// buyer and vendor order lists. Returns the new order (or null when TEST_MODE).
export function placeTestOrder(input) {
  if (!TEST_MODE) return null;
  const order = buildTestOrderFromCart(input);
  return submitTestOrder(order);
}

// Applies status updates to an order shared by the buyer and vendor lists.
export function updateVendorOrderStatus(orderId, updates) {
  if (!TEST_MODE) return null;
  return updateOrderRecord(orderId, updates);
}

// Assigns a delivery person to an order, moves it to 'Out for Delivery' and
// creates an incoming delivery request for the rider.
export function assignTestDeliveryPerson(orderId, person) {
  if (!TEST_MODE) return null;
  const order = updateOrderRecord(orderId, {
    status: 'Out for Delivery',
    deliveryStatus: 'With Rider',
    assignedDeliveryPerson: person ? person.fullName : 'Unassigned',
  });
  if (!order) {
    return null;
  }
  addTestDeliveryRequest(order);
  return order;
}

// Accepts a vendor's delivery request: starts the active delivery for the
// rider and keeps the order's delivery status in sync.
export function acceptTestDeliveryRequest(requestId) {
  if (!TEST_MODE) return null;
  const index = deliveryRequests.findIndex((request) => request.id === requestId);
  if (index < 0) {
    return null;
  }
  const request = deliveryRequests[index];
  const order = getOrderByOrderNumber(request.orderNumber);
  if (!order) {
    return null;
  }
  deliveryRequests.splice(index, 1);
  updateOrderRecord(order.id, { deliveryStatus: 'With Rider' });
  setActiveDeliveryFromOrder(order);
  return order;
}

// Marks a test delivery completed: updates the order to Completed/Delivered
// for buyer + vendor, records it in delivery history and clears the active
// delivery.
export function completeTestDelivery(orderNumber) {
  if (!TEST_MODE) return null;
  const order = getOrderByOrderNumber(orderNumber);
  if (order) {
    updateOrderRecord(order.id, { status: 'Completed', deliveryStatus: 'Delivered' });
    addDeliveryHistoryRecord(order);
  }
  Object.assign(activeDelivery, {
    orderNumber: '',
    vendorStore: '',
    pickupLocation: '',
    deliveryLocation: '',
    buyerPhone: '',
    parcelStatus: 'Pending Pickup',
  });
  return order;
}