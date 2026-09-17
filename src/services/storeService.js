import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { safeOnSnapshot } from './listenerLogging';

export const STORES_COLLECTION = 'stores';

export const DEFAULT_STORE_STATUS = 'Open';
export const DEFAULT_STORE_RATING = 5;

export function storeDocRef(storeId) {
  return doc(db, STORES_COLLECTION, storeId);
}

export function storesCollectionRef() {
  return collection(db, STORES_COLLECTION);
}

export function normalizeStore(snapshotOrData, id) {
  if (snapshotOrData && typeof snapshotOrData.exists === 'function') {
    if (!snapshotOrData.exists()) return null;
    return { id: snapshotOrData.id, ...snapshotOrData.data() };
  }
  if (!snapshotOrData) return null;
  return { id, ...snapshotOrData };
}

export async function getStoreById(storeId) {
  if (!storeId) return null;
  const snapshot = await getDoc(storeDocRef(storeId));
  return normalizeStore(snapshot);
}

export async function getActiveStores() {
  const snapshot = await getDocs(
    query(storesCollectionRef(), where('isActive', '==', true))
  );
  return snapshot.docs
    .map((docSnap) => normalizeStore(docSnap))
    .filter(Boolean);
}

// Creates the vendor's store document (keyed by their Firebase uid) on first
// use if it does not exist yet, then returns it. Used by vendor screens in
// NORMAL (non-test) mode so both new and existing vendor accounts end up with
// a real store record.
export async function ensureVendorStore({
  ownerUid,
  vendorName = '',
  name = '',
  phone = '',
  location = '',
  description = '',
  profilePhoto = null,
}) {
  if (!ownerUid) {
    throw new Error('ensureVendorStore: ownerUid is required');
  }
  const existing = await getStoreById(ownerUid);
  if (existing) return existing;
  return createVendorStore({
    ownerUid,
    vendorUid: ownerUid,
    name: name || vendorName || 'My Store',
    vendorName,
    phone,
    location,
    description,
    profilePhoto,
  });
}

export async function getVendorStores(vendorUid) {
  if (!vendorUid) return [];
  const snapshot = await getDocs(
    query(storesCollectionRef(), where('ownerUid', '==', vendorUid))
  );
  return snapshot.docs
    .map((docSnap) => normalizeStore(docSnap))
    .filter(Boolean);
}

export function onActiveStores(callback) {
  return safeOnSnapshot(
    query(storesCollectionRef(), where('isActive', '==', true)),
    {
      source: 'storeService/onActiveStores',
      path: 'stores',
      query: "where('isActive','==',true)",
      onData: (snapshot) => {
        callback(
          snapshot.docs
            .map((docSnap) => normalizeStore(docSnap))
            .filter(Boolean)
        );
      },
    }
  );
}

export function onStore(storeId, callback) {
  return safeOnSnapshot(storeDocRef(storeId), {
    source: 'storeService/onStore',
    path: `stores/${storeId}`,
    query: 'get',
    onData: (snapshot) => {
      callback(normalizeStore(snapshot));
    },
  });
}

export function onVendorStores(vendorUid, callback) {
  if (!vendorUid) {
    callback([]);
    return () => {};
  }
  return safeOnSnapshot(
    query(storesCollectionRef(), where('ownerUid', '==', vendorUid)),
    {
      source: 'storeService/onVendorStores',
      path: 'stores',
      query: "where('ownerUid','==',uid)",
      onData: (snapshot) => {
        callback(
          snapshot.docs
            .map((docSnap) => normalizeStore(docSnap))
            .filter(Boolean)
        );
      },
    }
  );
}

export async function createVendorStore({
  ownerUid,
  vendorUid = ownerUid,
  name,
  description = '',
  location = '',
  phone = '',
  profilePhoto = null,
  vendorName = '',
  status = DEFAULT_STORE_STATUS,
  rating = DEFAULT_STORE_RATING,
  isActive = true,
}) {
  if (!ownerUid) {
    throw new Error('createVendorStore: ownerUid is required');
  }
  if (!name || !name.trim()) {
    throw new Error('createVendorStore: name is required');
  }

  const record = {
    ownerUid,
    vendorUid: vendorUid || ownerUid,
    name: name.trim(),
    description,
    location,
    phone,
    profilePhoto,
    vendorName,
    status,
    rating,
    isActive,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = storeDocRef(ownerUid);
  await setDoc(ref, { ...record, storeId: ownerUid });
  return { id: ref.id, ...record, storeId: ownerUid };
}

export async function updateVendorStore(storeId, updates) {
  if (!storeId) {
    throw new Error('updateVendorStore: storeId is required');
  }
  const allowed = [
    'name',
    'description',
    'location',
    'phone',
    'profilePhoto',
    'vendorName',
    'status',
    'rating',
    'isActive',
  ];
  const cleanUpdates = {};
  for (const key of allowed) {
    if (updates && key in updates) {
      cleanUpdates[key] = updates[key];
    }
  }
  cleanUpdates.updatedAt = serverTimestamp();
  await updateDoc(storeDocRef(storeId), cleanUpdates);
  return getStoreById(storeId);
}