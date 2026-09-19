import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { safeOnSnapshot } from './listenerLogging';
import { buildOrderPaymentVendorSnapshot } from '../utils/paymentMethods';

export const ORDERS_COLLECTION = 'orders';
export const DELIVERY_PAYMENT_METHOD = { CASH: 'cash' };

export const ORDER_STATUS = {
  NEW: 'New',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready for Pickup',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const DELIVERY_STATUS = {
  AWAITING_ACCEPT: 'Awaiting Accept',
  PREPARING_ORDER: 'Preparing Order',
  PARCEL_READY: 'Parcel Ready',
  WITH_RIDER: 'With Rider',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  PICKED_UP: 'Picked Up',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  REPORTED: 'Reported',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
};

export const PAYMENT_METHOD = {
  MPESA_DIRECT: 'mpesa_direct',
};

export const PAYMENT_VERIFICATION_METHOD = {
  VENDOR_MANUAL: 'vendor_manual',
};

export function ordersCollectionRef() {
  return collection(db, ORDERS_COLLECTION);
}

export function orderDocRef(orderId) {
  return doc(db, ORDERS_COLLECTION, orderId);
}

export function normalizeOrder(docSnap) {
  if (!docSnap || !docSnap.exists) return null;
  const data = docSnap.exists() ? docSnap.data() : null;
  if (!data) return null;
  return { id: docSnap.id, ...data, orderId: data.orderId ?? docSnap.id };
}

export function generateOrderNumber(now = new Date()) {
  const stamp = now.getTime().toString().slice(-8);
  const suffix = Math.floor(Math.random() * 90000 + 10000);
  return `SH-${stamp}${suffix}`;
}

// The single canonical builder for the order-create payload. createOrder()
// writes EXACTLY the object returned here (with the generated orderId), so the
// __DEV__ diagnostics and the document sent to Firestore can never diverge.
// Every field is either required by the orders `allow create` rule, consumed
// later in the order lifecycle by the permitted update branches, or starts
// null and is only ever populated by those branches.
export function buildCanonicalOrderRecord({
  buyerUid,
  vendorUid,
  storeId,
  orderNumber,
  items,
  subtotal,
  packaging = null,
  packagingFee = 0,
  total,
  buyer = null,
  vendor = null,
  delivery = null,
  deliveryLocation = null,
  paymentVendor = null,
}) {
  if (!buyerUid) {
    throw new Error('createOrder: buyerUid is required');
  }
  if (!vendorUid) {
    throw new Error('createOrder: vendorUid is required');
  }
  if (!storeId) {
    throw new Error('createOrder: storeId is required');
  }
  if (!orderNumber) {
    throw new Error('createOrder: orderNumber is required');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('createOrder: items must be a non-empty array');
  }

  const buyerIdentity = {
    uid: buyer?.uid ?? buyerUid,
    fullName: buyer?.fullName ?? '',
    phone: buyer?.phone ?? '',
    profilePhoto: buyer?.profilePhoto ?? null,
  };

  const vendorIdentity = {
    uid: vendor?.uid ?? vendorUid,
    fullName: vendor?.fullName ?? '',
    storeName: vendor?.storeName ?? '',
    location: vendor?.location ?? '',
    phone: vendor?.phone ?? '',
    profilePhoto: vendor?.profilePhoto ?? null,
  };

  return {
    orderId: '',
    orderNumber,
    buyerUid,
    vendorUid,
    storeId,
    items,
    subtotal,
    packaging: packaging || null,
    packagingFee: packagingFee || 0,
    total,
    deliveryPaymentMethod: DELIVERY_PAYMENT_METHOD.CASH,
    paymentStatus: 'Pending',
    status: ORDER_STATUS.NEW,
    deliveryStatus: DELIVERY_STATUS.AWAITING_ACCEPT,
    deliveryAccepted: false,
    identity: {
      buyer: buyerIdentity,
      vendor: vendorIdentity,
    },
    delivery: delivery || null,
    deliveryLocation: deliveryLocation || null,
    // Snapshot of the vendor's configured M-PESA payment methods at checkout.
    // Captured once and immutable - no update branch in the rules writes it,
    // so it stays linked to the numbers the buyer actually paid to. Always a
    // fixed { sendMoneyNumber, tillNumber } map (never null) so the rules'
    // `paymentVendor is map` / keys().hasOnly(...) checks always pass.
    paymentVendor: buildOrderPaymentVendorSnapshot(paymentVendor),
    assignedDeliveryPerson: null,
    assignedDelivery: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

// Reports the dotted path of every `undefined` value anywhere in a payload
// tree. Development-only: an undefined value is dropped (or rejected) by the
// Firestore SDK before the request reaches the rules engine, so a rules check
// like `request.resource.data.orderId == orderId` can fail even when the
// locally-constructed object appears to hold the value. Firestore value
// sentinels (serverTimestamp()) are treated as leaves and never descended.
const SKIP_UNDEFINED_SCAN_KEYS = new Set(['createdAt', 'updatedAt']);
export function findUndefinedPaths(value, path = '', out = []) {
  if (value === undefined) {
    out.push(path || '(root)');
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((child, index) =>
      findUndefinedPaths(child, `${path}[${index}]`, out)
    );
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (SKIP_UNDEFINED_SCAN_KEYS.has(key)) continue;
      const nextPath = path ? `${path}.${key}` : key;
      findUndefinedPaths(child, nextPath, out);
    }
  }
  return out;
}

export async function createOrder({
  buyerUid,
  vendorUid,
  storeId,
  orderNumber,
  items,
  subtotal,
  packaging = null,
  packagingFee = 0,
  total,
  buyer = null,
  vendor = null,
  delivery = null,
  deliveryLocation = null,
  paymentVendor = null,
}) {
  const record = buildCanonicalOrderRecord({
    buyerUid,
    vendorUid,
    storeId,
    orderNumber,
    items,
    subtotal,
    packaging,
    packagingFee,
    total,
    buyer,
    vendor,
    delivery,
    deliveryLocation,
    paymentVendor,
  });

  const ref = doc(ordersCollectionRef());
  record.orderId = ref.id;

  // The orders `allow create` rule evaluates the order against the vendor's
  // ACTUAL Firestore document: vendorEntitled reads users/{vendorUid}.
  // subscription* fields and paymentVendorSnapshotMatches compares the order's
  // paymentVendor to users/{vendorUid}.mpesaPaymentMethods. Re-read that same
  // document here and rebuild the immutable snapshot from it so the payload
  // always conforms to the rule, whatever the calling screen captured earlier
  // (a stale or normalized snapshot can otherwise disagree with the stored
  // configuration and get denied).
  let liveVendor = null;
  try {
    const vendorSnap = await getDoc(doc(db, 'users', vendorUid));
    liveVendor = vendorSnap.exists() ? vendorSnap.data() : null;
  } catch (error) {
    liveVendor = null;
  }

  if (liveVendor) {
    // Configured values are snapshotted VERBATIM because the rule requires an
    // exact match against the stored config. The checkout-supplied snapshot is
    // reused only as the Send Money fallback (store phone) when the vendor has
    // configured no Send Money number themselves; for unconfigured methods the
    // rule skips the comparison so the fallback stays legal.
    const prior =
      paymentVendor && typeof paymentVendor === 'object' ? paymentVendor : {};
    const fallbackPhone =
      typeof prior.sendMoneyNumber === 'string' && prior.sendMoneyNumber.trim()
        ? prior.sendMoneyNumber.trim()
        : liveVendor.phone || null;
    record.paymentVendor = buildOrderPaymentVendorSnapshot(
      liveVendor.mpesaPaymentMethods || null,
      fallbackPhone
    );
    if (!record.identity.vendor.phone) {
      record.identity.vendor.phone = liveVendor.phone || '';
    }
  } else {
    // Vendor document unreadable: keep the calling screen's snapshot. The
    // rules still fail closed on vendorEntitled, which is the correct security
    // behaviour when the vendor cannot be verified.
    record.paymentVendor = buildOrderPaymentVendorSnapshot(paymentVendor);
  }

  if (__DEV__) {
    // Development-only diagnostics. Never shipped in production builds
    // (__DEV__ is false there). No passwords, tokens, M-Pesa PINs, private
    // keys or Firebase secrets are logged - only the order payload fields and
    // the vendor profile fields the app already reads to render checkout.
    const debugAuthUid = auth?.currentUser?.uid ?? null;
    if (debugAuthUid) {
      console.log('[DEBUG AUTH UID]', debugAuthUid);
    }

    // Recursive scan for `undefined` anywhere inside the EXACT object that
    // setDoc(ref, record) will serialize. An undefined value is stripped (or
    // rejected) by the SDK before the rules engine runs, so it can silently
    // void a rule condition while the local object still looks complete.
    const undefinedPaths = findUndefinedPaths(record);

    const timestampType = (value) =>
      value != null && typeof value?.toMillis === 'function'
        ? `Timestamp(${new Date(value.toMillis()).toISOString()})`
        : `missing (${typeof value})`;

    const storedPv = liveVendor?.mpesaPaymentMethods ?? null;
    const configured = storedPv != null && typeof storedPv === 'object';
    const pv = record.paymentVendor ?? {};
    const sendMoneyMatches = configured
      ? !(
          typeof storedPv.sendMoneyNumber === 'string' &&
          storedPv.sendMoneyNumber.length > 0 &&
          pv.sendMoneyNumber !== storedPv.sendMoneyNumber
        )
      : true;
    const tillMatches = configured
      ? !(
          typeof storedPv.tillNumber === 'string' &&
          storedPv.tillNumber.length > 0 &&
          pv.tillNumber !== storedPv.tillNumber
        )
      : true;

    const vendorDoc = liveVendor
      ? {
          uid: liveVendor.uid ?? vendorUid,
          role: liveVendor.role ?? null,
          subscriptionStatus: liveVendor.subscriptionStatus ?? null,
          subscriptionExpiryDate: timestampType(liveVendor.subscriptionExpiryDate),
          subscriptionExpiresAt: timestampType(liveVendor.subscriptionExpiresAt),
          mpesaPaymentMethods: liveVendor.mpesaPaymentMethods ?? null,
          phone: liveVendor.phone ?? '',
          relatedStoreId: storeId,
        }
      : { exists: false, vendorUid: vendorUid ?? null };

    const vendorEntitledCheck =
      liveVendor != null &&
      liveVendor.subscriptionStatus === 'active' &&
      (liveVendor.subscriptionExpiryDate == null ||
        (typeof liveVendor.subscriptionExpiryDate?.toMillis === 'function' &&
          liveVendor.subscriptionExpiryDate.toMillis() > Date.now())) &&
      (liveVendor.subscriptionExpiresAt == null ||
        (typeof liveVendor.subscriptionExpiresAt?.toMillis === 'function' &&
          liveVendor.subscriptionExpiresAt.toMillis() > Date.now()));

    const paidOrVerifiedFields = [
      'paymentReported',
      'paymentReportedAt',
      'mpesaConfirmationMessage',
      'paymentVerifiedBy',
      'paymentVerifiedAt',
      'paymentVerificationMethod',
    ];

    const checklist = {
      'request.auth != null': debugAuthUid != null,
      'orderId == path orderId': record.orderId === ref.id,
      'buyerUid == auth uid': record.buyerUid === debugAuthUid,
      'identity.buyer.uid == auth uid': record.identity?.buyer?.uid === debugAuthUid,
      'vendorUid is string': typeof record.vendorUid === 'string',
      'storeId is string': typeof record.storeId === 'string',
      'orderNumber is string': typeof record.orderNumber === 'string',
      "status == 'New'": record.status === 'New',
      'vendorEntitled(userData(vendorUid))': vendorEntitledCheck,
      'deliveryLocation is map':
        record.deliveryLocation != null && typeof record.deliveryLocation === 'object',
      'deliveryLocation.address non-empty string':
        typeof record.deliveryLocation?.address === 'string' &&
        record.deliveryLocation.address.length > 0,
      'paymentVendor is map': pv != null && typeof pv === 'object',
      'paymentVendor keys only [sendMoneyNumber, tillNumber]':
        pv != null &&
        Object.keys(pv).length === 2 &&
        Object.keys(pv).every((key) => key === 'sendMoneyNumber' || key === 'tillNumber'),
      'paymentVendor.sendMoneyNumber null-or-string':
        pv.sendMoneyNumber == null || typeof pv.sendMoneyNumber === 'string',
      'paymentVendor.tillNumber null-or-string':
        pv.tillNumber == null || typeof pv.tillNumber === 'string',
      'identity.vendor.uid == vendorUid': record.identity?.vendor?.uid === record.vendorUid,
      'paymentVendorSnapshotMatches': sendMoneyMatches && tillMatches,
      "deliveryStatus == 'Awaiting Accept'": record.deliveryStatus === 'Awaiting Accept',
      'deliveryAccepted == false': record.deliveryAccepted === false,
      "paymentStatus == 'Pending'": record.paymentStatus === 'Pending',
      'items is non-empty list':
        Array.isArray(record.items) && record.items.length > 0,
      'subtotal is number':
        typeof record.subtotal === 'number' && Number.isFinite(record.subtotal),
      'total is number': typeof record.total === 'number' && Number.isFinite(record.total),
      'no prohibited payment-report fields': !Object.keys(record).some((key) =>
        paidOrVerifiedFields.includes(key)
      ),
      'no undefined values in payload': undefinedPaths.length === 0,
    };

    const failures = Object.entries(checklist).filter(([, ok]) => !ok);

    console.log('[DEBUG FINAL ORDER KEYS]', JSON.stringify(Object.keys(record).sort()));
    console.log(
      '[DEBUG ORDER UNDEFINED FIELDS]',
      undefinedPaths.length > 0 ? JSON.stringify(undefinedPaths) : '[]'
    );
    console.log('[DEBUG ORDER PAYLOAD]', JSON.stringify(record, null, 2));
    console.log('[DEBUG VENDOR DOC]', JSON.stringify(vendorDoc, null, 2));
    console.log('[DEBUG CLIENT PAYLOAD CHECKLIST]', JSON.stringify(checklist, null, 2));
    console.log(
      '[DEBUG CLIENT PAYLOAD FAILURES]',
      failures.length > 0
        ? JSON.stringify(failures.map(([name]) => name), null, 2)
        : 'NONE - client-side payload conditions all satisfied (NOT a Firestore Rules evaluation; server may still reject)'
    );
  }

  try {
    await setDoc(ref, record);
  } catch (error) {
    if (__DEV__) {
      console.log('[ORDER CREATE ERROR]', {
        code: error?.code ?? null,
        message: error?.message ?? null,
        path: `orders/${ref.id}`,
        documentId: ref.id,
      });
    }
    throw error;
  }
  return { id: ref.id, ...record };
}

export async function getOrderById(orderId) {
  if (!orderId) return null;
  const snapshot = await getDoc(orderDocRef(orderId));
  return normalizeOrder(snapshot);
}

export async function getBuyerOrders(buyerUid) {
  if (!buyerUid) return [];
  const snapshot = await getDocs(
    query(
      ordersCollectionRef(),
      where('buyerUid', '==', buyerUid),
      orderBy('createdAt', 'desc')
    )
  );
  return snapshot.docs.map(normalizeOrder).filter(Boolean);
}

export async function getVendorOrders(vendorUid) {
  if (!vendorUid) return [];
  const snapshot = await getDocs(
    query(
      ordersCollectionRef(),
      where('vendorUid', '==', vendorUid),
      orderBy('createdAt', 'desc')
    )
  );
  return snapshot.docs.map(normalizeOrder).filter(Boolean);
}

export function onBuyerOrders(buyerUid, callback) {
  if (!buyerUid) {
    callback([]);
    return () => {};
  }
  return safeOnSnapshot(
    query(
      ordersCollectionRef(),
      where('buyerUid', '==', buyerUid),
      orderBy('createdAt', 'desc')
    ),
    {
      source: 'orderService/onBuyerOrders',
      path: 'orders',
      query: "where('buyerUid','==',uid) orderBy('createdAt','desc')",
      onData: (snapshot) => {
        callback(snapshot.docs.map(normalizeOrder).filter(Boolean));
      },
    }
  );
}

export function onVendorOrders(vendorUid, callback) {
  if (!vendorUid) {
    callback([]);
    return () => {};
  }
  return safeOnSnapshot(
    query(
      ordersCollectionRef(),
      where('vendorUid', '==', vendorUid),
      orderBy('createdAt', 'desc')
    ),
    {
      source: 'orderService/onVendorOrders',
      path: 'orders',
      query: "where('vendorUid','==',uid) orderBy('createdAt','desc')",
      onData: (snapshot) => {
        callback(snapshot.docs.map(normalizeOrder).filter(Boolean));
      },
    }
  );
}

const ALLOWED_ORDER_UPDATES = [
  'status',
  'deliveryStatus',
  'deliveryAccepted',
  'deliveryAcceptedAt',
  'assignedDeliveryPerson',
  'assignedDelivery',
  'paymentStatus',
  'deliveryRequestId',
  'deliveryAssignmentId',
  'delivery',
];

export async function updateOrder(orderId, updates) {
  if (!orderId) {
    throw new Error('updateOrder: orderId is required');
  }
  const cleanUpdates = {};
  for (const key of ALLOWED_ORDER_UPDATES) {
    if (updates && key in updates) {
      cleanUpdates[key] = updates[key];
    }
  }
  if (updates && 'status' in cleanUpdates) {
    const validStatuses = Object.values(ORDER_STATUS);
    if (!validStatuses.includes(cleanUpdates.status)) {
      throw new Error(`updateOrder: invalid status "${cleanUpdates.status}"`);
    }
  }
  if (updates && 'deliveryStatus' in cleanUpdates) {
    const validDeliveryStatuses = Object.values(DELIVERY_STATUS);
    if (!validDeliveryStatuses.includes(cleanUpdates.deliveryStatus)) {
      throw new Error(
        `updateOrder: invalid deliveryStatus "${cleanUpdates.deliveryStatus}"`
      );
    }
  }
  cleanUpdates.updatedAt = serverTimestamp();
  await updateDoc(orderDocRef(orderId), cleanUpdates);
  return getOrderById(orderId);
}

export function onOrder(orderId, callback, { onError = null } = {}) {
  if (!orderId) {
    callback(null, { exists: false });
    return () => {};
  }
  return safeOnSnapshot(orderDocRef(orderId), {
    source: 'orderService/onOrder',
    path: `orders/${orderId}`,
    query: 'get',
    onData: (snapshot) => {
      callback(normalizeOrder(snapshot), { exists: snapshot.exists() });
    },
    onError,
  });
}

// Cancels an order. Only the buyer may call this and only while the order is
// still 'New'; the Firestore rules enforce both conditions server-side.
// Updates are strictly limited to status/deliveryStatus/cancelReason/
// cancelledAt/updatedAt.
export async function cancelOrder(orderId, { reason = '' } = {}) {
  if (!orderId) {
    throw new Error('cancelOrder: orderId is required');
  }
  await updateDoc(orderDocRef(orderId), {
    status: ORDER_STATUS.CANCELLED,
    deliveryStatus: DELIVERY_STATUS.CANCELLED,
    cancelReason:
      typeof reason === 'string' && reason.trim() ? reason.trim() : null,
    cancelledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return getOrderById(orderId);
}

// Edits the buyer-side snapshot fields of a still-'New' order (items,
// subtotal, packaging, packagingFee, total) and tracks editedAt/editCount.
// Ownership, identity and delivery fields can never be changed; the Firestore
// rules are the authority and will reject any edit attempt on an order the
// vendor has already started processing.
export async function editOrder(orderId, updates) {
  if (!orderId) {
    throw new Error('editOrder: orderId is required');
  }
  if (!updates || typeof updates !== 'object') {
    throw new Error('editOrder: updates are required');
  }
  const current = await getOrderById(orderId);
  if (!current) {
    const error = new Error('Order not found. It may have been removed.');
    error.code = 'order-not-found';
    throw error;
  }
  if (current.status !== ORDER_STATUS.NEW) {
    const error = new Error(
      'This order can no longer be edited because the vendor has already started processing it.'
    );
    error.code = 'order-not-editable';
    throw error;
  }
  if (!Array.isArray(updates.items) || updates.items.length === 0) {
    const error = new Error('An order must contain at least one item.');
    error.code = 'edit-empty-items';
    throw error;
  }
  const allowedKeys = ['items', 'subtotal', 'packaging', 'packagingFee', 'total'];
  const cleanUpdates = {};
  for (const key of allowedKeys) {
    if (key in updates) {
      cleanUpdates[key] = updates[key];
    }
  }
  cleanUpdates.editedAt = serverTimestamp();
  cleanUpdates.editCount = (current.editCount || 0) + 1;
  cleanUpdates.updatedAt = serverTimestamp();
  await updateDoc(orderDocRef(orderId), cleanUpdates);
  return getOrderById(orderId);
}

// Buyer reports a direct M-PESA payment made to the vendor by pasting the
// M-PESA confirmation message received on their phone. The report is only
// accepted while the order is still 'New'; the Firestore rules enforce this
// and the field allowlist server-side. SokoHapa never receives or verifies
// the money - the vendor compares the pasted message with their real M-PESA
// transaction and decides whether to verify or reject it.
export async function reportPayment(orderId, { mpesaConfirmationMessage }) {
  if (!orderId) {
    throw new Error('reportPayment: orderId is required');
  }
  const message =
    typeof mpesaConfirmationMessage === 'string'
      ? mpesaConfirmationMessage.trim()
      : '';
  if (!message) {
    const error = new Error(
      'Please paste the M-PESA confirmation message you received.'
    );
    error.code = 'payment-message-required';
    throw error;
  }
  const current = await getOrderById(orderId);
  if (!current) {
    const error = new Error('Order not found. It may have been removed.');
    error.code = 'order-not-found';
    throw error;
  }
  if (current.status !== ORDER_STATUS.NEW) {
    const error = new Error(
      'This order is no longer New, so its payment report can no longer be changed.'
    );
    error.code = 'payment-not-editable';
    throw error;
  }
  await updateDoc(orderDocRef(orderId), {
    paymentMethod: PAYMENT_METHOD.MPESA_DIRECT,
    paymentReported: true,
    paymentReportedAt: serverTimestamp(),
    mpesaConfirmationMessage: message,
    paymentStatus: PAYMENT_STATUS.REPORTED,
    updatedAt: serverTimestamp(),
  });
  return getOrderById(orderId);
}

// Vendor manually verifies the buyer's M-PESA payment report. This means the
// vendor compared the pasted message against their actual M-PESA transaction
// and confirmed the payment is genuine. The order then enters the normal
// vendor processing flow (status -> Preparing). Only succeeds while the order
// is still 'New' with paymentStatus 'Reported'; Firestore rules make the
// transition atomic so a stale screen can never double-verify or verify a
// payment that has already been rejected.
export async function verifyVendorPayment(orderId, { vendorUid }) {
  if (!orderId) {
    throw new Error('verifyVendorPayment: orderId is required');
  }
  if (!vendorUid) {
    throw new Error('verifyVendorPayment: vendorUid is required');
  }
  const current = await getOrderById(orderId);
  if (!current) {
    const error = new Error('Order not found. It may have been removed.');
    error.code = 'order-not-found';
    throw error;
  }
  if (current.vendorUid !== vendorUid) {
    const error = new Error(
      'Only the vendor who owns this order can verify its payment.'
    );
    error.code = 'permission-denied';
    throw error;
  }
  if (current.status !== ORDER_STATUS.NEW) {
    const error = new Error(
      'This order is no longer New, so its payment can no longer be verified.'
    );
    error.code = 'order-not-verifiable';
    throw error;
  }
  if (current.paymentStatus !== PAYMENT_STATUS.REPORTED) {
    const error = new Error(
      'This order has no buyer payment report to verify.'
    );
    error.code = 'payment-not-reported';
    throw error;
  }
  await updateDoc(orderDocRef(orderId), {
    paymentStatus: PAYMENT_STATUS.VERIFIED,
    paymentVerifiedBy: vendorUid,
    paymentVerifiedAt: serverTimestamp(),
    paymentVerificationMethod: PAYMENT_VERIFICATION_METHOD.VENDOR_MANUAL,
    status: ORDER_STATUS.PREPARING,
    deliveryStatus: DELIVERY_STATUS.PREPARING_ORDER,
    updatedAt: serverTimestamp(),
  });
  return getOrderById(orderId);
}

// Vendor rejects the buyer's M-PESA payment report and cancels the order. The
// buyer is informed (order appears under Cancelled Orders with the reason).
// Only succeeds while the order is still 'New' with paymentStatus 'Reported',
// so a rejected order can never later be accepted or delivered.
export async function rejectVendorPayment(orderId, { vendorUid, reason = '' }) {
  if (!orderId) {
    throw new Error('rejectVendorPayment: orderId is required');
  }
  if (!vendorUid) {
    throw new Error('rejectVendorPayment: vendorUid is required');
  }
  const current = await getOrderById(orderId);
  if (!current) {
    const error = new Error('Order not found. It may have been removed.');
    error.code = 'order-not-found';
    throw error;
  }
  if (current.vendorUid !== vendorUid) {
    const error = new Error(
      'Only the vendor who owns this order can reject its payment.'
    );
    error.code = 'permission-denied';
    throw error;
  }
  if (current.status !== ORDER_STATUS.NEW) {
    const error = new Error(
      'This order is no longer New, so its payment report can no longer be rejected.'
    );
    error.code = 'order-not-rejectable';
    throw error;
  }
  if (current.paymentStatus !== PAYMENT_STATUS.REPORTED) {
    const error = new Error('This order has no buyer payment report.');
    error.code = 'payment-not-reported';
    throw error;
  }
  const cleanReason =
    typeof reason === 'string' && reason.trim()
      ? reason.trim().slice(0, 300)
      : 'Payment could not be confirmed';
  await updateDoc(orderDocRef(orderId), {
    paymentStatus: PAYMENT_STATUS.REJECTED,
    status: ORDER_STATUS.CANCELLED,
    deliveryStatus: DELIVERY_STATUS.CANCELLED,
    cancelledBy: 'vendor',
    cancelledByUid: vendorUid,
    cancelledAt: serverTimestamp(),
    cancelReason: cleanReason,
    updatedAt: serverTimestamp(),
  });
  return getOrderById(orderId);
}