// SokoHapa Master Catalogue: helpers
//
// Reads for the master catalogue, allowed selling units, and the standard
// image resolution strategy.
//
// IMPORTANT (image architecture):
// The master product `image` field stores the standard asset path string
// (e.g. "assets/products/vegetables/tomato.jpg"). The actual file does not
// exist yet for most products (see assets/products/README.md). This module is
// the ONLY place that maps a master product to a renderable image source:
//
//   - When a real image file is added, register a static require() below and
//     `resolveProductImage()` will return it for every vendor automatically —
//     with NO database change and NO per-vendor images.
//   - Until then it returns null and the UI must render an ImagePlaceholder.

import { MASTER_PRODUCTS } from '../services/masterProducts';
import { PRODUCT_CATEGORIES, getCategoryById } from '../services/masterCategories';

// Selling units allowed across the master catalogue.
// Codes are the canonical values stored in master product `availableUnits`,
// vendor product `unit`, and (in future) cart/order line items.
export const PRODUCT_UNIT_OPTIONS = [
  { code: 'kg', label: 'Kg' },
  { code: 'piece', label: 'Piece' },
  { code: 'dozen', label: 'Dozen' },
  { code: 'bunch', label: 'Bunch' },
  { code: 'tray', label: 'Tray' },
  { code: 'litre', label: 'Litre' },
  { code: 'pack', label: 'Pack' },
  { code: 'bag', label: 'Bag' },
];

const PRODUCT_UNIT_INDEX = Object.fromEntries(
  PRODUCT_UNIT_OPTIONS.map((option) => [option.code, option])
);

export function getUnitLabel(unit) {
  return PRODUCT_UNIT_INDEX[unit] ? PRODUCT_UNIT_INDEX[unit].label : unit;
}

// Selling units a VENDOR may set on their store products. These are the only
// three supported across the app (catalogue browsing outside a vendor store
// may still show the wider master set above).
export const VENDOR_UNIT_OPTIONS = [
  { code: 'piece', label: 'Piece' },
  { code: 'kg', label: 'Kg' },
  { code: 'bunch', label: 'Bunch' },
];

export const VENDOR_SELLING_UNITS = VENDOR_UNIT_OPTIONS.map((option) => option.code);

export function isAllowedSellingUnit(unit) {
  return VENDOR_SELLING_UNITS.includes(unit);
}

// Short, lowercase suffix for price displays: "KES 80 / piece", "/ kg", "/ bunch".
const UNIT_SHORT_LABELS = {
  kg: 'kg',
  piece: 'piece',
  bunch: 'bunch',
};

export function getUnitShortLabel(unit) {
  return UNIT_SHORT_LABELS[unit] || (unit && String(unit).toLowerCase()) || 'kg';
}

// Quantity phrasing: "2 pieces", "1 bunch", "3 kg".
const UNIT_QUANTITY_FORMS = {
  kg: { singular: 'kg', plural: 'kg' },
  piece: { singular: 'piece', plural: 'pieces' },
  bunch: { singular: 'bunch', plural: 'bunches' },
};

export function formatUnitQuantity(quantity, unit) {
  const n = Number.isFinite(Number(quantity)) ? Number(quantity) : 1;
  const forms = UNIT_QUANTITY_FORMS[unit] || UNIT_QUANTITY_FORMS.kg;
  return `${n} ${n === 1 ? forms.singular : forms.plural}`;
}

const PRODUCT_INDEX = Object.fromEntries(
  MASTER_PRODUCTS.map((product) => [product.productId, product])
);

const PRODUCTS_BY_CATEGORY = MASTER_PRODUCTS.reduce((acc, product) => {
  if (!acc[product.categoryId]) {
    acc[product.categoryId] = [];
  }
  acc[product.categoryId].push(product);
  return acc;
}, {});

export function getMasterProductById(productId) {
  return PRODUCT_INDEX[productId] || null;
}

// Active master products for a category, in catalogue sort order.
export function getProductsByCategory(categoryId) {
  const category = getCategoryById(categoryId);
  if (!category) {
    return [];
  }
  return (PRODUCTS_BY_CATEGORY[categoryId] || []).filter((product) => product.isActive);
}

export function getActiveCategories() {
  return PRODUCT_CATEGORIES.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export const MASTER_PRODUCT_COUNT = MASTER_PRODUCTS.length;

// The image registry. Canonical mapping between a master product's slug
// (productId) and its single standard local image. Metro statically bundles
// every required asset. New categories follow the same pattern against
// assets/products/<categoryDir>/<slug>.jpg.
const registeredCatalogueImages = {
  tomato: require('../../assets/products/vegetables/tomato.jpg'),
  onion: require('../../assets/products/vegetables/onion.jpg'),
  'red-onion': require('../../assets/products/vegetables/red-onion.jpg'),
  'spring-onion': require('../../assets/products/vegetables/spring-onion.jpg'),
  cabbage: require('../../assets/products/vegetables/cabbage.jpg'),
  kale: require('../../assets/products/vegetables/kale.jpg'),
  spinach: require('../../assets/products/vegetables/spinach.jpg'),
  'amaranth-leaves': require('../../assets/products/vegetables/amaranth-leaves.jpg'),
  'cowpea-leaves': require('../../assets/products/vegetables/cowpea-leaves.jpg'),
  'pumpkin-leaves': require('../../assets/products/vegetables/pumpkin-leaves.jpg'),
  'african-nightshade': require('../../assets/products/vegetables/african-nightshade.jpg'),
  'spider-plant': require('../../assets/products/vegetables/spider-plant.jpg'),
  'coriander-cilantro': require('../../assets/products/vegetables/coriander-cilantro.jpg'),
  carrot: require('../../assets/products/vegetables/carrot.jpg'),
  'green-pepper': require('../../assets/products/vegetables/green-pepper.jpg'),
  'red-pepper': require('../../assets/products/vegetables/red-pepper.jpg'),
  'green-chilli': require('../../assets/products/vegetables/green-chilli.jpg'),
  cucumber: require('../../assets/products/vegetables/cucumber.jpg'),
  'courgette-zucchini': require('../../assets/products/vegetables/courgette-zucchini.jpg'),
  'eggplant-aubergine': require('../../assets/products/vegetables/eggplant-aubergine.jpg'),
  okra: require('../../assets/products/vegetables/okra.jpg'),
  broccoli: require('../../assets/products/vegetables/broccoli.jpg'),
  cauliflower: require('../../assets/products/vegetables/cauliflower.jpg'),
  lettuce: require('../../assets/products/vegetables/lettuce.jpg'),
  beetroot: require('../../assets/products/vegetables/beetroot.jpg'),
  'french-beans': require('../../assets/products/vegetables/french-beans.jpg'),
  'runner-beans': require('../../assets/products/vegetables/runner-beans.jpg'),
  'garden-peas': require('../../assets/products/vegetables/garden-peas.jpg'),
  'snow-peas': require('../../assets/products/vegetables/snow-peas.jpg'),
  turnip: require('../../assets/products/vegetables/turnip.jpg'),
  radish: require('../../assets/products/vegetables/radish.jpg'),
  leek: require('../../assets/products/vegetables/leek.jpg'),
  celery: require('../../assets/products/vegetables/celery.jpg'),
  'butternut-squash': require('../../assets/products/vegetables/butternut-squash.jpg'),
  pumpkin: require('../../assets/products/vegetables/pumpkin.jpg'),
  mushroom: require('../../assets/products/vegetables/mushroom.jpg'),
  'sweet-corn': require('../../assets/products/vegetables/sweet-corn.jpg'),
  'baby-corn': require('../../assets/products/vegetables/baby-corn.jpg'),

  // Fruits
  banana: require('../../assets/products/fruits/banana.jpg'),
  'cooking-banana': require('../../assets/products/fruits/cooking-banana.jpg'),
  'apple-banana': require('../../assets/products/fruits/apple-banana.jpg'),
  mango: require('../../assets/products/fruits/mango.jpg'),
  avocado: require('../../assets/products/fruits/avocado.jpg'),
  orange: require('../../assets/products/fruits/orange.jpg'),
  tangerine: require('../../assets/products/fruits/tangerine.jpg'),
  lemon: require('../../assets/products/fruits/lemon.jpg'),
  lime: require('../../assets/products/fruits/lime.jpg'),
  'passion-fruit': require('../../assets/products/fruits/passion-fruit.jpg'),
  watermelon: require('../../assets/products/fruits/watermelon.jpg'),
  'pawpaw-papaya': require('../../assets/products/fruits/pawpaw-papaya.jpg'),
  pineapple: require('../../assets/products/fruits/pineapple.jpg'),
  guava: require('../../assets/products/fruits/guava.jpg'),
  jackfruit: require('../../assets/products/fruits/jackfruit.jpg'),
  coconut: require('../../assets/products/fruits/coconut.jpg'),
  tamarind: require('../../assets/products/fruits/tamarind.jpg'),
  'tree-tomato': require('../../assets/products/fruits/tree-tomato.jpg'),
  grapes: require('../../assets/products/fruits/grapes.jpg'),
  strawberry: require('../../assets/products/fruits/strawberry.jpg'),
  pear: require('../../assets/products/fruits/pear.jpg'),
  peach: require('../../assets/products/fruits/peach.jpg'),
  plum: require('../../assets/products/fruits/plum.jpg'),
  melon: require('../../assets/products/fruits/melon.jpg'),
  dates: require('../../assets/products/fruits/dates.jpg'),
  'dragon-fruit': require('../../assets/products/fruits/dragon-fruit.jpg'),

  // Cereals & grains
  'maize-grain': require('../../assets/products/cereals/maize-grain.jpg'),
  'green-maize': require('../../assets/products/cereals/green-maize.jpg'),
  'maize-flour': require('../../assets/products/cereals/maize-flour.jpg'),
  rice: require('../../assets/products/cereals/rice.jpg'),
  wheat: require('../../assets/products/cereals/wheat.jpg'),
  'wheat-flour': require('../../assets/products/cereals/wheat-flour.jpg'),
  sorghum: require('../../assets/products/cereals/sorghum.jpg'),
  'finger-millet': require('../../assets/products/cereals/finger-millet.jpg'),
  'pearl-millet': require('../../assets/products/cereals/pearl-millet.jpg'),
  oats: require('../../assets/products/cereals/oats.jpg'),
  barley: require('../../assets/products/cereals/barley.jpg'),
  rye: require('../../assets/products/cereals/rye.jpg'),
  quinoa: require('../../assets/products/cereals/quinoa.jpg'),
  'amaranth-grain': require('../../assets/products/cereals/amaranth-grain.jpg'),
  popcorn: require('../../assets/products/cereals/popcorn.jpg'),

  // Beans, pulses & legumes
  'common-beans': require('../../assets/products/legumes/common-beans.jpg'),
  'red-kidney-beans': require('../../assets/products/legumes/red-kidney-beans.jpg'),
  'rosecoco-beans': require('../../assets/products/legumes/rosecoco-beans.jpg'),
  'yellow-beans': require('../../assets/products/legumes/yellow-beans.jpg'),
  'black-beans': require('../../assets/products/legumes/black-beans.jpg'),
  'green-grams': require('../../assets/products/legumes/green-grams.jpg'),
  cowpeas: require('../../assets/products/legumes/cowpeas.jpg'),
  'pigeon-peas': require('../../assets/products/legumes/pigeon-peas.jpg'),
  chickpeas: require('../../assets/products/legumes/chickpeas.jpg'),
  lentils: require('../../assets/products/legumes/lentils.jpg'),
  'green-peas': require('../../assets/products/legumes/green-peas.jpg'),
  'soya-beans': require('../../assets/products/legumes/soya-beans.jpg'),
  'dolichos-lablab': require('../../assets/products/legumes/dolichos-lablab.jpg'),
  'black-eyed-peas': require('../../assets/products/legumes/black-eyed-peas.jpg'),

  // Roots & tubers
  'irish-potato': require('../../assets/products/roots/irish-potato.jpg'),
  'sweet-potato': require('../../assets/products/roots/sweet-potato.jpg'),
  cassava: require('../../assets/products/roots/cassava.jpg'),
  arrowroot: require('../../assets/products/roots/arrowroot.jpg'),
  yam: require('../../assets/products/roots/yam.jpg'),
  cocoyam: require('../../assets/products/roots/cocoyam.jpg'),
  taro: require('../../assets/products/roots/taro.jpg'),
  ginger: require('../../assets/products/roots/ginger.jpg'),

  // Meat & butchery
  beef: require('../../assets/products/meat/beef.jpg'),
  'goat-meat': require('../../assets/products/meat/goat-meat.jpg'),
  mutton: require('../../assets/products/meat/mutton.jpg'),
  'chicken-meat': require('../../assets/products/meat/chicken-meat.jpg'),
  'indigenous-chicken': require('../../assets/products/meat/indigenous-chicken.jpg'),
  'duck-meat': require('../../assets/products/meat/duck-meat.jpg'),
  'turkey-meat': require('../../assets/products/meat/turkey-meat.jpg'),
  'beef-liver': require('../../assets/products/meat/beef-liver.jpg'),
  'goat-liver': require('../../assets/products/meat/goat-liver.jpg'),
  'chicken-liver': require('../../assets/products/meat/chicken-liver.jpg'),
  'beef-kidney': require('../../assets/products/meat/beef-kidney.jpg'),
  'beef-tripe': require('../../assets/products/meat/beef-tripe.jpg'),
  'goat-offal': require('../../assets/products/meat/goat-offal.jpg'),
  'beef-offal': require('../../assets/products/meat/beef-offal.jpg'),
  'beef-bones': require('../../assets/products/meat/beef-bones.jpg'),
  'minced-beef': require('../../assets/products/meat/minced-beef.jpg'),
  sausages: require('../../assets/products/meat/sausages.jpg'),
  'fresh-cow-milk': require('../../assets/products/dairy/fresh-cow-milk.jpg'),
  'fresh-goat-milk': require('../../assets/products/dairy/fresh-goat-milk.jpg'),
  'camel-milk': require('../../assets/products/dairy/camel-milk.jpg'),
  yoghurt: require('../../assets/products/dairy/yoghurt.jpg'),
  'mala-fermented-milk': require('../../assets/products/dairy/mala-fermented-milk.jpg'),
  'drinking-yoghurt': require('../../assets/products/dairy/drinking-yoghurt.jpg'),
  cream: require('../../assets/products/dairy/cream.jpg'),
  'sour-cream': require('../../assets/products/dairy/sour-cream.jpg'),
  butter: require('../../assets/products/dairy/butter.jpg'),
  cheese: require('../../assets/products/dairy/cheese.jpg'),
  'cheddar-cheese': require('../../assets/products/dairy/cheddar-cheese.jpg'),
  'milk-powder': require('../../assets/products/dairy/milk-powder.jpg'),
  'condensed-milk': require('../../assets/products/dairy/condensed-milk.jpg'),
  'chicken-eggs': require('../../assets/products/eggs/chicken-eggs.jpg'),
  'indigenous-chicken-eggs': require('../../assets/products/eggs/indigenous-chicken-eggs.jpg'),
  'duck-eggs': require('../../assets/products/eggs/duck-eggs.jpg'),
  'quail-eggs': require('../../assets/products/eggs/quail-eggs.jpg'),
  tilapia: require('../../assets/products/fish/tilapia.jpg'),
  'nile-perch': require('../../assets/products/fish/nile-perch.jpg'),
  'omena-silver-cyprinid': require('../../assets/products/fish/omena-silver-cyprinid.jpg'),
  tuna: require('../../assets/products/fish/tuna.jpg'),
  sardines: require('../../assets/products/fish/sardines.jpg'),
  'fresh-fish': require('../../assets/products/fish/fresh-fish.jpg'),
  'dried-fish': require('../../assets/products/fish/dried-fish.jpg'),
  'prawns-shrimp': require('../../assets/products/fish/prawns-shrimp.jpg'),
  crab: require('../../assets/products/fish/crab.jpg'),
  octopus: require('../../assets/products/fish/octopus.jpg'),
  'red-snapper': require('../../assets/products/fish/red-snapper.jpg'),
  mackerel: require('../../assets/products/fish/mackerel.jpg'),
  salmon: require('../../assets/products/fish/salmon.jpg'),
  trout: require('../../assets/products/fish/trout.jpg'),
  catfish: require('../../assets/products/fish/catfish.jpg'),
  kingfish: require('../../assets/products/fish/kingfish.jpg'),
  anchovies: require('../../assets/products/fish/anchovies.jpg'),
  herring: require('../../assets/products/fish/herring.jpg'),
  cod: require('../../assets/products/fish/cod.jpg'),
  swordfish: require('../../assets/products/fish/swordfish.jpg'),
  marlin: require('../../assets/products/fish/marlin.jpg'),
  garlic: require('../../assets/products/spices/garlic.jpg'),
  'ginger-spice': require('../../assets/products/spices/ginger-spice.jpg'),
  turmeric: require('../../assets/products/spices/turmeric.jpg'),
  'black-pepper': require('../../assets/products/spices/black-pepper.jpg'),
  chilli: require('../../assets/products/spices/chilli.jpg'),
  'coriander-seeds': require('../../assets/products/spices/coriander-seeds.jpg'),
  cumin: require('../../assets/products/spices/cumin.jpg'),
  cardamom: require('../../assets/products/spices/cardamom.jpg'),
  cinnamon: require('../../assets/products/spices/cinnamon.jpg'),
  cloves: require('../../assets/products/spices/cloves.jpg'),
  nutmeg: require('../../assets/products/spices/nutmeg.jpg'),
  fenugreek: require('../../assets/products/spices/fenugreek.jpg'),
  'curry-powder': require('../../assets/products/spices/curry-powder.jpg'),
  'bay-leaves': require('../../assets/products/spices/bay-leaves.jpg'),
  'fresh-coriander': require('../../assets/products/spices/fresh-coriander.jpg'),
  rosemary: require('../../assets/products/spices/rosemary.jpg'),
  mint: require('../../assets/products/spices/mint.jpg'),
  salt: require('../../assets/products/spices/salt.jpg'),
  paprika: require('../../assets/products/spices/paprika.jpg'),
  'chilli-powder': require('../../assets/products/spices/chilli-powder.jpg'),
  'cayenne-pepper': require('../../assets/products/spices/cayenne-pepper.jpg'),
  'mixed-spice': require('../../assets/products/spices/mixed-spice.jpg'),
  'star-anise': require('../../assets/products/spices/star-anise.jpg'),
  'fennel-seeds': require('../../assets/products/spices/fennel-seeds.jpg'),
  'mustard-seeds': require('../../assets/products/spices/mustard-seeds.jpg'),
  lemongrass: require('../../assets/products/spices/lemongrass.jpg'),
  basil: require('../../assets/products/spices/basil.jpg'),
  thyme: require('../../assets/products/spices/thyme.jpg'),
  parsley: require('../../assets/products/spices/parsley.jpg'),
  oregano: require('../../assets/products/spices/oregano.jpg'),
  'groundnuts-peanuts': require('../../assets/products/nuts/groundnuts-peanuts.jpg'),
  'cashew-nuts': require('../../assets/products/nuts/cashew-nuts.jpg'),
  'macadamia-nuts': require('../../assets/products/nuts/macadamia-nuts.jpg'),
  'sesame-seeds': require('../../assets/products/nuts/sesame-seeds.jpg'),
  'pumpkin-seeds': require('../../assets/products/nuts/pumpkin-seeds.jpg'),
  'sunflower-seeds': require('../../assets/products/nuts/sunflower-seeds.jpg'),
  'chia-seeds': require('../../assets/products/nuts/chia-seeds.jpg'),
  'flax-seeds': require('../../assets/products/nuts/flax-seeds.jpg'),
  'roasted-peanuts': require('../../assets/products/nuts/roasted-peanuts.jpg'),
  almonds: require('../../assets/products/nuts/almonds.jpg'),
  walnuts: require('../../assets/products/nuts/walnuts.jpg'),
  pistachios: require('../../assets/products/nuts/pistachios.jpg'),
  hazelnuts: require('../../assets/products/nuts/hazelnuts.jpg'),
  'brazil-nuts': require('../../assets/products/nuts/brazil-nuts.jpg'),
  'hemp-seeds': require('../../assets/products/nuts/hemp-seeds.jpg'),
  'poppy-seeds': require('../../assets/products/nuts/poppy-seeds.jpg'),
  'watermelon-seeds': require('../../assets/products/nuts/watermelon-seeds.jpg'),
  'tiger-nuts': require('../../assets/products/nuts/tiger-nuts.jpg'),

  // ---- Other Grocery & Market Products ----
  'tomato-sauce': require('../../assets/products/other/tomato-sauce.jpg'),
  'tomato-paste': require('../../assets/products/other/tomato-paste.jpg'),
  'ketchup': require('../../assets/products/other/ketchup.jpg'),
  'peanut-butter': require('../../assets/products/other/peanut-butter.jpg'),
  'fruit-jam': require('../../assets/products/other/fruit-jam.jpg'),
  'chocolate-spread': require('../../assets/products/other/chocolate-spread.jpg'),
  'margarine': require('../../assets/products/other/margarine.jpg'),
  'cooking-oil': require('../../assets/products/other/cooking-oil.jpg'),
  'sunflower-oil': require('../../assets/products/other/sunflower-oil.jpg'),
  'vegetable-oil': require('../../assets/products/other/vegetable-oil.jpg'),
  'sugar': require('../../assets/products/other/sugar.jpg'),
  'honey': require('../../assets/products/other/honey.jpg'),
  'tea-leaves': require('../../assets/products/other/tea-leaves.jpg'),
  'coffee': require('../../assets/products/other/coffee.jpg'),
  'bread': require('../../assets/products/other/bread.jpg'),
  'spaghetti': require('../../assets/products/other/spaghetti.jpg'),
  'macaroni': require('../../assets/products/other/macaroni.jpg'),
  'instant-noodles': require('../../assets/products/other/instant-noodles.jpg'),
  'biscuits': require('../../assets/products/other/biscuits.jpg'),
  'vinegar': require('../../assets/products/other/vinegar.jpg'),
  'mayonnaise': require('../../assets/products/other/mayonnaise.jpg'),
  'baking-powder': require('../../assets/products/other/baking-powder.jpg'),
  'baking-soda': require('../../assets/products/other/baking-soda.jpg'),
  'stock-cubes': require('../../assets/products/other/stock-cubes.jpg'),
  'coconut-milk': require('../../assets/products/other/coconut-milk.jpg'),
  'drinking-water': require('../../assets/products/other/drinking-water.jpg'),
  'fruit-juice': require('../../assets/products/other/fruit-juice.jpg'),
  'soft-drinks': require('../../assets/products/other/soft-drinks.jpg'),
  'canned-beans': require('../../assets/products/other/canned-beans.jpg'),
  'canned-tuna': require('../../assets/products/other/canned-tuna.jpg'),
  'canned-sardines': require('../../assets/products/other/canned-sardines.jpg'),
};

// Returns the standard image source for a master product.
// Returns null when the image file is not registered yet (UI must use a
// placeholder). Never throws for a valid master product.
export function resolveProductImage(product) {
  if (!product || !product.isActive) {
    return null;
  }
  return registeredCatalogueImages[product.productId] || null;
}