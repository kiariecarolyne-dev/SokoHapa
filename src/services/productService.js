import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { safeOnSnapshot } from './listenerLogging';
import {
  buildCustomProductRecord,
  buildVendorProductRecord,
  storeProductDocPath,
} from '../utils/vendorProducts';
import { getMasterProductById, getUnitLabel, isAllowedSellingUnit } from '../utils/productCatalogue';

export function storeProductsCollectionRef(storeId) {
  return collection(db, 'stores', storeId, 'products');
}

export function productDocRef(storeId, productId) {
  if (!storeId || !productId) {
    throw new Error('productDocRef: storeId and productId are required');
  }
  return doc(db, 'stores', storeId, 'products', productId);
}

export function normalizeProduct(docSnap) {
  if (!docSnap.exists) return null;
  const data = docSnap.exists() ? docSnap.data() : null;
  if (!data) return null;
  return {
    id: data.productId ?? data.id ?? docSnap.id,
    name: data.displayName ?? data.name ?? data.nameEnglish ?? '',
    category: data.categoryName ?? data.category ?? 'Other',
    pricePerKg: data.pricePerKg ?? data.price,
    availableQuantity: data.availableQuantity ?? 0,
    available: data.available ?? data.isAvailable ?? true,
    description: data.description ?? '',
    masterProductId: data.masterProductId ?? null,
    unit: data.unit ?? 'kg',
    image: data.image ?? null,
    isCustom: data.isCustom ?? false,
    isAvailable: data.isAvailable ?? data.available ?? true,
    price: data.price ?? data.pricePerKg,
    storeId: data.storeId ?? null,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

export async function getStoreProducts(storeId, { onlyAvailable = false } = {}) {
  if (!storeId) {
    throw new Error('getStoreProducts: storeId is required');
  }
  const snapshot = await getDocs(storeProductsCollectionRef(storeId));
  const products = snapshot.docs.map(normalizeProduct).filter(Boolean);
  return onlyAvailable ? products.filter((product) => product.available) : products;
}

export function onStoreProducts(storeId, callback, { onlyAvailable = false } = {}) {
  if (!storeId) {
    callback([]);
    return () => {};
  }
  return safeOnSnapshot(storeProductsCollectionRef(storeId), {
    source: 'productService/onStoreProducts',
    path: `stores/${storeId}/products`,
    query: 'list',
    onData: (snapshot) => {
      const products = snapshot.docs.map(normalizeProduct).filter(Boolean);
      callback(onlyAvailable ? products.filter((product) => product.available) : products);
    },
  });
}

export async function getProductById(storeId, productId) {
  if (!storeId || !productId) return null;
  const snapshot = await getDoc(productDocRef(storeId, productId));
  return normalizeProduct(snapshot);
}

function enrichVendorRecord(record, { availableQuantity, categoryName, description }) {
  return {
    ...record,
    id: record.productId,
    name: record.displayName,
    category: categoryName ?? record.categoryName ?? 'Other',
    pricePerKg: record.price,
    available: record.isAvailable,
    availableQuantity: Number.isFinite(availableQuantity) ? availableQuantity : 0,
    description: description ?? '',
    categoryName: categoryName ?? null,
  };
}

export async function addMasterProductToStore({
  storeId,
  masterProductId,
  price,
  unit,
  availableQuantity,
  isAvailable = true,
  description,
  now = null,
}) {
  if (!storeId || !masterProductId) {
    throw new Error('addMasterProductToStore: storeId and masterProductId are required');
  }
  if (unit != null && !isAllowedSellingUnit(unit)) {
    throw new Error(`addMasterProductToStore: unit "${unit}" is not an allowed selling unit`);
  }
  const masterProduct = getMasterProductById(masterProductId);
  if (!masterProduct) {
    throw new Error(`addMasterProductToStore: unknown master product "${masterProductId}"`);
  }
  const existing = await getProductById(storeId, masterProduct.productId);
  if (existing) {
    return null;
  }
  const record = buildVendorProductRecord({
    storeId,
    masterProduct,
    price,
    unit,
    isAvailable,
    now: now ?? serverTimestamp(),
  });
  const enriched = enrichVendorRecord(record, {
    availableQuantity,
    categoryName: masterProduct.categoryName,
    description,
  });
  await setDoc(productDocRef(storeId, record.productId), enriched);
  return { ...enriched, id: record.productId };
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export async function addCustomProductToStore({
  storeId,
  nameEnglish,
  nameSwahili = '',
  price,
  unit = 'kg',
  availableQuantity,
  isAvailable = true,
  image = null,
  description = '',
  now = null,
}) {
  if (!storeId || !nameEnglish || !nameEnglish.trim()) {
    throw new Error('addCustomProductToStore: storeId and nameEnglish are required');
  }
  if (unit != null && !isAllowedSellingUnit(unit)) {
    throw new Error(`addCustomProductToStore: unit "${unit}" is not an allowed selling unit`);
  }
  const productId = `${slugify(nameEnglish) || 'product'}-${Date.now().toString().slice(-6)}`;
  const record = buildCustomProductRecord({
    storeId,
    productId,
    nameEnglish: nameEnglish.trim(),
    nameSwahili,
    price,
    unit,
    isAvailable,
    image,
    now: now ?? serverTimestamp(),
  });
  const enriched = {
    ...record,
    id: productId,
    name: record.displayName,
    category: 'Other',
    pricePerKg: record.price,
    available: record.isAvailable,
    availableQuantity: Number.isFinite(availableQuantity) ? availableQuantity : 0,
    description,
  };
  await setDoc(productDocRef(storeId, productId), enriched);
  return enriched;
}

export async function updateVendorProduct(storeId, productId, updates) {
  if (!storeId || !productId) {
    throw new Error('updateVendorProduct: storeId and productId are required');
  }
  const existing = await getProductById(storeId, productId);
  if (!existing) {
    return null;
  }
  const allowed = [
    'price',
    'pricePerKg',
    'unit',
    'isAvailable',
    'available',
    'availableQuantity',
    'name',
    'description',
    'category',
  ];
  const cleanUpdates = {};
  for (const key of allowed) {
    if (updates && key in updates) {
      cleanUpdates[key] = updates[key];
    }
  }
  if ('price' in cleanUpdates) cleanUpdates.pricePerKg = cleanUpdates.price;
  if ('pricePerKg' in cleanUpdates) cleanUpdates.price = cleanUpdates.pricePerKg;
  if ('isAvailable' in cleanUpdates) cleanUpdates.available = cleanUpdates.isAvailable;
  if ('available' in cleanUpdates) cleanUpdates.isAvailable = cleanUpdates.available;
  if ('name' in cleanUpdates && cleanUpdates.name) cleanUpdates.displayName = cleanUpdates.name;
  if ('unit' in cleanUpdates) {
    if (!isAllowedSellingUnit(cleanUpdates.unit)) {
      throw new Error(`updateVendorProduct: unit "${cleanUpdates.unit}" is not an allowed selling unit`);
    }
    cleanUpdates.unitLabel = getUnitLabel(cleanUpdates.unit);
  }
  cleanUpdates.updatedAt = serverTimestamp();
  await updateDoc(productDocRef(storeId, productId), cleanUpdates);
  return getProductById(storeId, productId);
}

export async function removeVendorProduct(storeId, productId) {
  if (!storeId || !productId) return null;
  const existing = await getProductById(storeId, productId);
  await deleteDoc(productDocRef(storeId, productId));
  return existing;
}

export async function setProductAvailability(storeId, productId, isAvailable, availableQuantity) {
  const updates = {
    isAvailable,
    available: isAvailable,
    updatedAt: serverTimestamp(),
  };
  if (Number.isFinite(availableQuantity)) {
    updates.availableQuantity = availableQuantity;
  }
  await updateDoc(productDocRef(storeId, productId), updates);
  return getProductById(storeId, productId);
}

export { storeProductDocPath };