import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { safeOnSnapshot } from './listenerLogging';
import {
  DELIVERY_STATUS,
  getOrderById,
  orderDocRef,
  ORDER_STATUS,
  updateOrder,
} from './orderService';

export const USERS_COLLECTION = 'users';
export const DELIVERY_REQUESTS_COLLECTION = 'deliveryRequests';
export const DELIVERY_ASSIGNMENTS_COLLECTION = 'deliveryAssignments';

export const DELIVERY_REQUEST_STATUS = {
  AWAITING_ACCEPT: 'Awaiting Accept',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
};

export const DELIVERY_ASSIGNMENT_STATUS = {
  CONFIRMED: 'Confirmed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  PICKED_UP: 'Picked Up',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
};

export const ACTIVE_ASSIGNMENT_STATUSES = [
  DELIVERY_ASSIGNMENT_STATUS.CONFIRMED,
  DELIVERY_ASSIGNMENT_STATUS.OUT_FOR_DELIVERY,
  DELIVERY_ASSIGNMENT_STATUS.PICKED_UP,
];

export const COMPLETED_ASSIGNMENT_STATUSES = [
  DELIVERY_ASSIGNMENT_STATUS.DELIVERED,
  DELIVERY_ASSIGNMENT_STATUS.COMPLETED,
];

// Normalizes the per-order delivery destination into a stable { address,
// directions } shape for display. Supports the current per-order snapshot
// (an object) as well as the legacy flat-string form found in older orders and
// prototype mock data.
export function normalizeDeliveryLocation(location) {
  if (!location) {
    return { address: '', directions: '' };
  }
  if (typeof location === 'string') {
    return { address: location.trim(), directions: '' };
  }
  if (typeof location === 'object') {
    return {
      address:
        typeof location.address === 'string' ? location.address.trim() : '',
      directions:
        typeof location.directions === 'string' ? location.directions.trim() : '',
    };
  }
  return { address: '', directions: '' };
}

export function usersCollectionRef() {
  return collection(db, USERS_COLLECTION);
}

export function deliveryRequestsCollectionRef() {
  return collection(db, DELIVERY_REQUESTS_COLLECTION);
}

export function deliveryRequestDocRef(requestId) {
  return doc(db, DELIVERY_REQUESTS_COLLECTION, requestId);
}

export function deliveryAssignmentsCollectionRef() {
  return collection(db, DELIVERY_ASSIGNMENTS_COLLECTION);
}

export function deliveryAssignmentDocRef(orderId) {
  return doc(db, DELIVERY_ASSIGNMENTS_COLLECTION, orderId);
}

export function normalizeDeliveryPerson(docSnap) {
  if (!docSnap || !docSnap.exists) return null;
  const data = docSnap.exists() ? docSnap.data() : null;
  if (!data) return null;
  return {
    id: data.uid ?? docSnap.id,
    uid: data.uid ?? docSnap.id,
    fullName: data.fullName ?? '',
    phone: data.phone ?? '',
    vehicleType: data.vehicleType ?? '',
    plateNumber: data.vehiclePlateNumber ?? data.plateNumber ?? null,
    availability: data.availability ?? 'Available',
    rating: typeof data.rating === 'number' ? data.rating : null,
    profilePhoto: data.profilePhoto ?? null,
  };
}

export function normalizeDeliveryRequest(docSnap) {
  if (!docSnap || !docSnap.exists) return null;
  const data = docSnap.exists() ? docSnap.data() : null;
  if (!data) return null;
  return { id: docSnap.id, requestId: data.requestId ?? docSnap.id, ...data };
}

export function normalizeDeliveryAssignment(docSnap) {
  if (!docSnap || !docSnap.exists) return null;
  const data = docSnap.exists() ? docSnap.data() : null;
  if (!data) return null;
  return { id: docSnap.id, assignmentId: data.assignmentId ?? docSnap.id, ...data };
}

// Persists the delivery profile's availability flag on users/{uid}. The vendor
// "choose delivery person" list filters on this field.
export async function setDeliveryAvailability(uid, availability) {
  if (!uid) {
    throw new Error('setDeliveryAvailability: uid is required');
  }
  const allowed = ['Available', 'Unavailable', 'Busy'];
  if (!allowed.includes(availability)) {
    throw new Error(
      `setDeliveryAvailability: invalid availability "${availability}"`
    );
  }
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    availability,
    updatedAt: serverTimestamp(),
  });
}

export async function getDeliveryPeople({ availableOnly = true } = {}) {
  const snapshot = await getDocs(
    query(usersCollectionRef(), where('role', '==', 'delivery'))
  );
  const people = snapshot.docs.map(normalizeDeliveryPerson).filter(Boolean);
  if (!availableOnly) return people;
  return people.filter(
    (person) =>
      person.availability !== 'Busy' && person.availability !== 'Unavailable'
  );
}

export function onDeliveryPeople(callback, { availableOnly = true } = {}) {
  return safeOnSnapshot(
    query(usersCollectionRef(), where('role', '==', 'delivery')),
    {
      source: 'deliveryService/onDeliveryPeople',
      path: 'users',
      query: "where('role','==','delivery')",
      onData: (snapshot) => {
        const people = snapshot.docs.map(normalizeDeliveryPerson).filter(Boolean);
        callback(
          availableOnly
            ? people.filter(
                (person) =>
                  person.availability !== 'Busy' &&
                  person.availability !== 'Unavailable'
              )
            : people
        );
      },
    }
  );
}

export async function createDeliveryRequest({ order, deliveryUid }) {
  if (!order || !order.id) {
    throw new Error('createDeliveryRequest: order is required');
  }
  if (!deliveryUid) {
    throw new Error('createDeliveryRequest: deliveryUid is required');
  }
  const vendorIdentity = order.identity?.vendor ?? null;
  const buyerIdentity = order.identity?.buyer ?? null;
  const record = {
    requestId: '',
    orderId: order.id,
    orderNumber: order.orderNumber,
    vendorUid: order.vendorUid ?? vendorIdentity?.uid ?? null,
    buyerUid: order.buyerUid ?? buyerIdentity?.uid ?? null,
    deliveryUid,
    vendor: vendorIdentity,
    buyer: buyerIdentity,
    pickupLocation:
      order.delivery?.pickupLocation ?? vendorIdentity?.location ?? null,
    deliveryLocation:
      order.deliveryLocation ??
      order.delivery?.deliveryLocation ??
      null,
    distanceKm: order.delivery?.distanceKm ?? null,
    items: order.items ?? [],
    packaging: order.packaging ?? null,
    packagingFee: order.packagingFee ?? 0,
    subtotal: order.subtotal ?? 0,
    total: order.total ?? 0,
    deliveryStatus: DELIVERY_REQUEST_STATUS.AWAITING_ACCEPT,
    deliveryAccepted: false,
    status: DELIVERY_REQUEST_STATUS.AWAITING_ACCEPT,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = doc(deliveryRequestsCollectionRef());
  record.requestId = ref.id;
  await setDoc(ref, record);
  return { id: ref.id, ...record };
}

export async function getDeliveryRequests(deliveryUid, { status } = {}) {
  if (!deliveryUid) return [];
  const constraints = [where('deliveryUid', '==', deliveryUid)];
  if (status) {
    constraints.push(where('status', '==', status));
  }
  const snapshot = await getDocs(query(deliveryRequestsCollectionRef(), ...constraints));
  return snapshot.docs.map(normalizeDeliveryRequest).filter(Boolean);
}

export function onDeliveryRequests(deliveryUid, callback, { status } = {}) {
  if (!deliveryUid) {
    callback([]);
    return () => {};
  }
  const constraints = [where('deliveryUid', '==', deliveryUid)];
  if (status) {
    constraints.push(where('status', '==', status));
  }
  const statusLabel = status ? ` status=='${status}'` : '';
  return safeOnSnapshot(
    query(deliveryRequestsCollectionRef(), ...constraints),
    {
      source: 'deliveryService/onDeliveryRequests',
      path: 'deliveryRequests',
      query: `where('deliveryUid','==',uid)${statusLabel}`,
      onData: (snapshot) => {
        callback(snapshot.docs.map(normalizeDeliveryRequest).filter(Boolean));
      },
    }
  );
}

export async function getPendingDeliveryRequests(deliveryUid) {
  return getDeliveryRequests(deliveryUid, {
    status: DELIVERY_REQUEST_STATUS.AWAITING_ACCEPT,
  });
}

export function onPendingDeliveryRequests(deliveryUid, callback) {
  return onDeliveryRequests(
    deliveryUid,
    callback,
    { status: DELIVERY_REQUEST_STATUS.AWAITING_ACCEPT }
  );
}

export async function acceptDeliveryRequest(requestId, { deliveryUid, deliveryPerson = null }) {
  if (!requestId) {
    throw new Error('acceptDeliveryRequest: requestId is required');
  }
  const requestRef = deliveryRequestDocRef(requestId);
  const requestSnapshot = await getDoc(requestRef);
  if (!requestSnapshot.exists()) {
    return null;
  }
  const requestData = requestSnapshot.data();
  const request = { id: requestId, ...requestData };
  const uid = deliveryUid ?? requestData.deliveryUid ?? null;

  try {
    // All three writes are committed atomically so the delivery person can
    // never end up in the broken state where the request and order are
    // "Accepted"/"Out for Delivery" but no assignment record exists.
    const batch = writeBatch(db);

    // Rules only allow the request update while it is still "Awaiting Accept".
    if (requestData.status === DELIVERY_REQUEST_STATUS.AWAITING_ACCEPT) {
      const requestUpdates = {
        status: DELIVERY_REQUEST_STATUS.ACCEPTED,
        deliveryAccepted: true,
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (uid) {
        requestUpdates.deliveryUid = uid;
      }
      batch.update(requestRef, requestUpdates);
    }

    if (request.orderId) {
      const orderUpdates = {
        deliveryStatus: DELIVERY_STATUS.OUT_FOR_DELIVERY,
        deliveryAccepted: true,
        deliveryAcceptedAt: serverTimestamp(),
        deliveryRequestId: requestId,
        updatedAt: serverTimestamp(),
      };
      // The order rules reject assignedDelivery == null, so only write the
      // delivery person fields when we actually have a profile to store.
      if (deliveryPerson) {
        orderUpdates.assignedDeliveryPerson = deliveryPerson.fullName ?? null;
        orderUpdates.assignedDelivery = {
          uid: deliveryPerson.uid ?? uid ?? null,
          fullName: deliveryPerson.fullName ?? null,
          phone: deliveryPerson.phone ?? null,
          vehicleType: deliveryPerson.vehicleType ?? null,
          plateNumber: deliveryPerson.plateNumber ?? null,
          profilePhoto: deliveryPerson.profilePhoto ?? null,
        };
      }
      batch.update(orderDocRef(request.orderId), orderUpdates);
      batch.set(
        deliveryAssignmentDocRef(request.orderId),
        buildDeliveryAssignmentRecord(request.orderId, {
          requestId,
          deliveryUid: deliveryPerson?.uid ?? uid,
          order: request,
        })
      );
    }

    await batch.commit();
    return getDoc(requestRef).then(normalizeDeliveryRequest);
  } catch (error) {
    console.error(
      '[FIRESTORE/DELIVERY FAILURE]',
      'Operation: acceptDeliveryRequest',
      `Role: delivery`,
      `UID: ${uid ?? 'unknown'}`,
      `RequestId: ${requestId}`,
      `OrderId: ${request.orderId ?? 'unknown'}`,
      `Code: ${error?.code ?? 'unknown'}`,
      `Message: ${error?.message ?? 'unknown'}`
    );
    throw error;
  }
}

export async function declineDeliveryRequest(requestId) {
  if (!requestId) return null;
  await updateDoc(deliveryRequestDocRef(requestId), {
    status: DELIVERY_REQUEST_STATUS.DECLINED,
    declinedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return getDoc(deliveryRequestDocRef(requestId)).then(normalizeDeliveryRequest);
}

export function buildDeliveryAssignmentRecord(orderId, { requestId, deliveryUid, order }) {
  const orderData = order ? order : {};
  const vendorIdentity = orderData.vendor ?? orderData.identity?.vendor ?? null;
  const buyerIdentity = orderData.buyer ?? orderData.identity?.buyer ?? null;
  const assignedDelivery = orderData.assignedDelivery ?? null;
  return {
    assignmentId: orderId,
    orderId,
    requestId: requestId ?? null,
    deliveryUid: deliveryUid ?? assignedDelivery?.uid ?? null,
    vendorUid: orderData.vendorUid ?? vendorIdentity?.uid ?? null,
    buyerUid: orderData.buyerUid ?? buyerIdentity?.uid ?? null,
    orderNumber: orderData.orderNumber ?? null,
    vendorStore: vendorIdentity?.storeName ?? orderData.vendorStore ?? null,
    pickupLocation: orderData.pickupLocation ?? orderData.delivery?.pickupLocation ?? null,
    deliveryLocation: orderData.deliveryLocation ?? orderData.delivery?.deliveryLocation ?? null,
    buyerPhone: orderData.buyerPhone ?? buyerIdentity?.phone ?? null,
    parcelStatus: 'Pending Pickup',
    items: orderData.items ?? [],
    packaging: orderData.packaging ?? null,
    packagingFee: orderData.packagingFee ?? 0,
    subtotal: orderData.subtotal ?? 0,
    total: orderData.total ?? 0,
    status: DELIVERY_ASSIGNMENT_STATUS.CONFIRMED,
    deliveryStatus: orderData.deliveryStatus ?? DELIVERY_STATUS.OUT_FOR_DELIVERY,
    vendor: vendorIdentity,
    buyer: buyerIdentity,
    assignedDelivery,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: null,
  };
}

export async function getOrCreateDeliveryAssignment(orderId, { requestId, deliveryUid, order }) {
  if (!orderId) {
    throw new Error('getOrCreateDeliveryAssignment: orderId is required');
  }
  const ref = deliveryAssignmentDocRef(orderId);
  try {
    const existing = await getDoc(ref);
    if (existing.exists()) {
      return normalizeDeliveryAssignment(existing);
    }
  } catch (error) {
    console.error(
      '[FIRESTORE/DELIVERY FAILURE]',
      'Operation: getOrCreateDeliveryAssignment (read)',
      `Role: delivery`,
      `UID: ${deliveryUid ?? 'unknown'}`,
      `RequestId: ${requestId ?? 'unknown'}`,
      `OrderId: ${orderId}`,
      `Code: ${error?.code ?? 'unknown'}`,
      `Message: ${error?.message ?? 'unknown'}`
    );
  }
  const record = buildDeliveryAssignmentRecord(orderId, { requestId, deliveryUid, order });
  try {
    await setDoc(ref, record);
  } catch (error) {
    console.error(
      '[FIRESTORE/DELIVERY FAILURE]',
      'Operation: getOrCreateDeliveryAssignment (create)',
      `Role: delivery`,
      `UID: ${deliveryUid ?? 'unknown'}`,
      `RequestId: ${requestId ?? 'unknown'}`,
      `OrderId: ${orderId}`,
      `Code: ${error?.code ?? 'unknown'}`,
      `Message: ${error?.message ?? 'unknown'}`
    );
    throw error;
  }
  return { id: ref.id, ...record };
}

export function getActiveAssignmentQuery(deliveryUid) {
  return query(
    deliveryAssignmentsCollectionRef(),
    where('deliveryUid', '==', deliveryUid),
    where('status', 'in', ACTIVE_ASSIGNMENT_STATUSES)
  );
}

export function toActiveDelivery(assignment, orderData = null) {
  const vendor = assignment.vendor ?? orderData?.identity?.vendor ?? null;
  const buyer = assignment.buyer ?? orderData?.identity?.buyer ?? null;
  const assignedDelivery = orderData?.assignedDelivery ?? assignment.assignedDelivery ?? null;
  return {
    id: assignment.id,
    orderId: assignment.orderId,
    requestId: assignment.requestId ?? null,
    orderNumber: assignment.orderNumber ?? orderData?.orderNumber ?? null,
    vendorStore: vendor?.storeName ?? assignment.vendorStore ?? null,
    pickupLocation: assignment.pickupLocation ?? orderData?.delivery?.pickupLocation ?? null,
    deliveryLocation:
      orderData?.deliveryLocation ??
      assignment.deliveryLocation ??
      orderData?.delivery?.deliveryLocation ??
      null,
    buyerPhone: buyer?.phone ?? assignment.buyerPhone ?? null,
    parcelStatus: assignment.parcelStatus ?? 'Pending Pickup',
    items: assignment.items ?? [],
    packaging: assignment.packaging ?? null,
    packagingFee: assignment.packagingFee ?? 0,
    subtotal: assignment.subtotal ?? 0,
    total: assignment.total ?? 0,
    deliveryStatus: orderData?.deliveryStatus ?? assignment.deliveryStatus ?? null,
    deliveryAccepted: true,
    status: assignment.status,
    vendor,
    buyer,
    assignedDelivery,
  };
}

export async function getActiveDelivery(deliveryUid) {
  if (!deliveryUid) return null;
  const snapshot = await getDocs(getActiveAssignmentQuery(deliveryUid));
  if (snapshot.empty) return null;
  const assignment = normalizeDeliveryAssignment(snapshot.docs[0]);
  const order = assignment.orderId ? await getOrderById(assignment.orderId) : null;
  return toActiveDelivery(assignment, order);
}

export function onActiveDelivery(deliveryUid, callback) {
  if (!deliveryUid) {
    callback(null);
    return () => {};
  }
  return safeOnSnapshot(getActiveAssignmentQuery(deliveryUid), {
    source: 'deliveryService/onActiveDelivery',
    path: 'deliveryAssignments',
    query: "where('deliveryUid','==',uid) where('status','in',ACTIVE)",
    onData: (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }
      callback(normalizeDeliveryAssignment(snapshot.docs[0]));
    },
  });
}

export function getCompletedAssignmentQuery(deliveryUid) {
  return query(
    deliveryAssignmentsCollectionRef(),
    where('deliveryUid', '==', deliveryUid),
    where('status', 'in', COMPLETED_ASSIGNMENT_STATUSES)
  );
}

export async function getDeliveryHistory(deliveryUid) {
  if (!deliveryUid) return [];
  const snapshot = await getDocs(getCompletedAssignmentQuery(deliveryUid));
  const assignments = snapshot.docs.map(normalizeDeliveryAssignment).filter(Boolean);
  return assignments.sort((a, b) => {
    const at = a.completedAt ?? a.updatedAt ?? null;
    const bt = b.completedAt ?? b.updatedAt ?? null;
    if (!at || !bt) return 0;
    const aMs = typeof at.toMillis === 'function' ? at.toMillis() : new Date(at).getTime();
    const bMs = typeof bt.toMillis === 'function' ? bt.toMillis() : new Date(bt).getTime();
    return bMs - aMs;
  });
}

export function onDeliveryHistory(deliveryUid, callback) {
  if (!deliveryUid) {
    callback([]);
    return () => {};
  }
  return safeOnSnapshot(getCompletedAssignmentQuery(deliveryUid), {
    source: 'deliveryService/onDeliveryHistory',
    path: 'deliveryAssignments',
    query: "where('deliveryUid','==',uid) where('status','in',COMPLETED)",
    onData: (snapshot) => {
      const assignments = snapshot.docs.map(normalizeDeliveryAssignment).filter(Boolean);
      callback(
        assignments.sort((a, b) => {
          const at = a.completedAt ?? a.updatedAt ?? null;
          const bt = b.completedAt ?? b.updatedAt ?? null;
          if (!at || !bt) return 0;
          const aMs = typeof at.toMillis === 'function' ? at.toMillis() : new Date(at).getTime();
          const bMs = typeof bt.toMillis === 'function' ? bt.toMillis() : new Date(bt).getTime();
          return bMs - aMs;
        })
      );
    },
  });
}

export async function updateDeliveryStatus(orderId, { deliveryStatus = null, parcelStatus = null } = {}) {
  if (!orderId) {
    throw new Error('updateDeliveryStatus: orderId is required');
  }
  try {
    // Defensive guard: a cancelled order should never be advanced by a delivery
    // partner. The Firestore rules already block this for normal cases (no
    // assignment exists for cancelled orders), but this prevents action on any
    // stale or malformed data that somehow bypassed earlier checks.
    const orderDoc = await getOrderById(orderId);
    if (orderDoc && orderDoc.status === ORDER_STATUS.CANCELLED) {
      const error = new Error(
        'This order has been cancelled and cannot be updated.'
      );
      error.code = 'order-cancelled';
      throw error;
    }

    const orderUpdates = {};
    if (parcelStatus) orderUpdates.parcelStatus = parcelStatus;
    if (deliveryStatus) orderUpdates.deliveryStatus = deliveryStatus;
    if (deliveryStatus && deliveryStatus === DELIVERY_STATUS.PICKED_UP) {
      orderUpdates.status = ORDER_STATUS.OUT_FOR_DELIVERY;
    }
    if (deliveryStatus && deliveryStatus === DELIVERY_STATUS.DELIVERED) {
      orderUpdates.status = ORDER_STATUS.COMPLETED;
    }
    const order = await updateOrder(orderId, orderUpdates);

    const assignmentRef = deliveryAssignmentDocRef(orderId);
    const assignmentSnapshot = await getDoc(assignmentRef);
    if (assignmentSnapshot.exists()) {
      const assignmentUpdates = { updatedAt: serverTimestamp() };
      if (parcelStatus) assignmentUpdates.parcelStatus = parcelStatus;
      if (deliveryStatus) assignmentUpdates.deliveryStatus = deliveryStatus;
      if (deliveryStatus && deliveryStatus === DELIVERY_STATUS.DELIVERED) {
        assignmentUpdates.status = DELIVERY_ASSIGNMENT_STATUS.COMPLETED;
        assignmentUpdates.completedAt = serverTimestamp();
      }
      await updateDoc(assignmentRef, assignmentUpdates);
    }

    return order;
  } catch (error) {
    console.error(
      '[FIRESTORE/DELIVERY FAILURE]',
      'Operation: updateDeliveryStatus',
      `Role: delivery`,
      `OrderId: ${orderId}`,
      `DeliveryStatus: ${deliveryStatus ?? 'none'}`,
      `ParcelStatus: ${parcelStatus ?? 'none'}`,
      `Code: ${error?.code ?? 'unknown'}`,
      `Message: ${error?.message ?? 'unknown'}`
    );
    throw error;
  }
}

export async function markDeliveryPickedUp(orderId) {
  return updateDeliveryStatus(orderId, {
    deliveryStatus: DELIVERY_STATUS.PICKED_UP,
    parcelStatus: DELIVERY_ASSIGNMENT_STATUS.PICKED_UP,
  });
}

export async function markDeliveryDelivered(orderId) {
  return updateDeliveryStatus(orderId, {
    deliveryStatus: DELIVERY_STATUS.DELIVERED,
    parcelStatus: DELIVERY_ASSIGNMENT_STATUS.DELIVERED,
  });
}