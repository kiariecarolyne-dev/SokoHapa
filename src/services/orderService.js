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
import { db } from './firebase';
import { safeOnSnapshot } from './listenerLogging';

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

  const record = {
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
    assignedDeliveryPerson: null,
    assignedDelivery: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = doc(ordersCollectionRef());
  record.orderId = ref.id;
  await setDoc(ref, record);
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