// SokoHapa Master Catalogue: Categories
//
// Extensible architecture. Categories are defined ONCE here and referenced by
// master products via `categoryId`. Additional categories can be appended
// later without touching the products file, as long as every product keeps a
// valid `categoryId`.

export const PRODUCT_CATEGORIES = [
  {
    categoryId: 'vegetables',
    categoryName: 'Vegetables & Leafy Vegetables',
    slug: 'vegetables',
    imageDir: 'vegetables',
    icon: 'leaf',
    sortOrder: 1,
  },
  {
    categoryId: 'fruits',
    categoryName: 'Fruits',
    slug: 'fruits',
    imageDir: 'fruits',
    icon: 'fruit-cherries',
    sortOrder: 2,
  },
  {
    categoryId: 'cerealGrains',
    categoryName: 'Cereals & Grains',
    slug: 'cereals-grains',
    imageDir: 'cereals',
    icon: 'corn',
    sortOrder: 3,
  },
  {
    categoryId: 'pulsesLegumes',
    categoryName: 'Beans, Pulses & Legumes',
    slug: 'beans-pulses-legumes',
    imageDir: 'legumes',
    icon: 'seed',
    sortOrder: 4,
  },
  {
    categoryId: 'rootsTubers',
    categoryName: 'Roots & Tubers',
    slug: 'roots-tubers',
    imageDir: 'roots',
    icon: 'carrot',
    sortOrder: 5,
  },
  {
    categoryId: 'meat',
    categoryName: 'Meat & Butchery',
    slug: 'meat-butchery',
    imageDir: 'meat',
    icon: 'food-drumstick',
    sortOrder: 6,
  },
  {
    categoryId: 'dairy',
    categoryName: 'Dairy',
    slug: 'dairy',
    imageDir: 'dairy',
    icon: 'cow',
    sortOrder: 7,
  },
  {
    categoryId: 'eggs',
    categoryName: 'Eggs',
    slug: 'eggs',
    imageDir: 'eggs',
    icon: 'egg',
    sortOrder: 8,
  },
  {
    categoryId: 'fish',
    categoryName: 'Fish & Seafood',
    slug: 'fish-seafood',
    imageDir: 'fish',
    icon: 'fish',
    sortOrder: 9,
  },
  {
    categoryId: 'spices',
    categoryName: 'Spices & Herbs',
    slug: 'spices-herbs',
    imageDir: 'spices',
    icon: 'shaker-outline',
    sortOrder: 10,
  },
  {
    categoryId: 'nuts',
    categoryName: 'Nuts & Seeds',
    slug: 'nuts-seeds',
    imageDir: 'nuts',
    icon: 'nut',
    sortOrder: 11,
  },
  {
    categoryId: 'other',
    categoryName: 'Other Market Products',
    slug: 'other-market-products',
    imageDir: 'other',
    icon: 'basket-outline',
    sortOrder: 12,
  },
];

const CATEGORY_INDEX = Object.fromEntries(
  PRODUCT_CATEGORIES.map((category) => [category.categoryId, category])
);

export function getCategoryById(categoryId) {
  return CATEGORY_INDEX[categoryId] || null;
}

export function getCategoryNameById(categoryId) {
  const category = getCategoryById(categoryId);
  return category ? category.categoryName : '';
}

// Runtime self-check: category ids must be unique.
const ids = new Set();
for (const category of PRODUCT_CATEGORIES) {
  if (ids.has(category.categoryId)) {
    throw new Error(`Duplicate categoryId in master categories: ${category.categoryId}`);
  }
  ids.add(category.categoryId);
}