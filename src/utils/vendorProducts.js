// SokoHapa vendor product records
//
// Data model for the VENDOR'S OWN store products, separate from the master
// catalogue.
//
//   MASTER CATALOGUE:   products/{productId}            (exists once, central)
//   VENDOR STORE:       stores/{storeId}/products/{productId}
//
// A vendor product references the master catalogue via `masterProductId` and
// copies only display fields it is allowed to control. The vendor controls
// price, unit (where allowed) and isAvailable. The vendor does NOT control the
// master name, category or standard image.
//
// Custom products (not in the master catalogue) are stored in the SAME vendor
// sub-collection but with `isCustom: true`, `masterProductId: null` and a
// vendor-provided image/name. They never overwrite the master catalogue.

import { getUnitLabel, isAllowedSellingUnit } from './productCatalogue';

export const STORES_COLLECTION = 'stores';
export const MASTER_PRODUCTS_COLLECTION = 'products';

export function storeCollectionPath(storeId) {
  return `${STORES_COLLECTION}/${storeId}`;
}

export function storeProductsCollectionPath(storeId) {
  return `${STORES_COLLECTION}/${storeId}/products`;
}

export function storeProductDocPath(storeId, productId) {
  return `${STORES_COLLECTION}/${storeId}/products/${productId}`;
}

// Builds the record saved at stores/{storeId}/products/{masterProductId}.
// `unit` must be one of the vendor selling units (piece, kg or bunch) and is
// independent of the master product's own `availableUnits`: a vendor may sell
// cabbage per piece while another sells the same cabbage per kg.
export function buildVendorProductRecord({
  storeId,
  masterProduct,
  price,
  unit,
  isAvailable = true,
  now = new Date(),
}) {
  if (!storeId) {
    throw new Error('buildVendorProductRecord: storeId is required');
  }
  if (!masterProduct || !masterProduct.productId) {
    throw new Error('buildVendorProductRecord: masterProduct is required');
  }
  if (typeof price !== 'number' || price < 0) {
    throw new Error('buildVendorProductRecord: price must be a non-negative number');
  }
  if (unit != null && !isAllowedSellingUnit(unit)) {
    throw new Error(
      `buildVendorProductRecord: unit "${unit}" is not an allowed selling unit`
    );
  }
  const resolvedUnit =
    unit != null ? unit : isAllowedSellingUnit(masterProduct.defaultUnit) ? masterProduct.defaultUnit : 'kg';
  return {
    productId: masterProduct.productId,
    masterProductId: masterProduct.productId,
    storeId,
    nameEnglish: masterProduct.nameEnglish,
    nameSwahili: masterProduct.nameSwahili,
    displayName: masterProduct.displayName,
    image: masterProduct.image,
    price,
    unit: resolvedUnit,
    unitLabel: getUnitLabel(resolvedUnit),
    isAvailable,
    isCustom: false,
    createdAt: now,
    updatedAt: now,
  };
}

// Builds the record saved at stores/{storeId}/products/<newId> when a vendor
// adds a product that is not in the master catalogue. Never touches the master
// catalogue. `masterProductId` is null so the record is unambiguous.
export function buildCustomProductRecord({
  storeId,
  productId,
  nameEnglish,
  nameSwahili,
  price,
  unit,
  isAvailable = true,
  image = null,
  now = new Date(),
}) {
  if (!storeId || !productId) {
    throw new Error('buildCustomProductRecord: storeId and productId are required');
  }
  if (!nameEnglish) {
    throw new Error('buildCustomProductRecord: nameEnglish is required');
  }
  if (typeof price !== 'number' || price < 0) {
    throw new Error('buildCustomProductRecord: price must be a non-negative number');
  }
  if (unit != null && !isAllowedSellingUnit(unit)) {
    throw new Error(
      `buildCustomProductRecord: unit "${unit}" is not an allowed selling unit`
    );
  }
  const resolvedUnit = unit ?? 'kg';
  return {
    productId,
    masterProductId: null,
    storeId,
    nameEnglish,
    nameSwahili: nameSwahili || '',
    displayName: nameSwahili ? `${nameEnglish} (${nameSwahili})` : nameEnglish,
    image,
    price,
    unit: resolvedUnit,
    unitLabel: getUnitLabel(resolvedUnit),
    isAvailable,
    isCustom: true,
    createdAt: now,
    updatedAt: now,
  };
}