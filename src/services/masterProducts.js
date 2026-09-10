// SokoHapa Master Catalogue: Products
//
// ONE central master catalogue. Vendors reference these products via
// `masterProductId`; the master list itself is never duplicated per vendor.
//
// Every record is built by the `p()` factory below to guarantee a consistent
// shape: productId, categoryId, categoryName, nameEnglish, nameSwahili,
// displayName (English (Swahili)), slug, defaultUnit, availableUnits, image,
// isActive, sortOrder.
//
// `image` is the predictable asset path `assets/products/<categoryDir>/<slug>.jpg`.
// Real image files are populated later (see assets/products/README.md) without
// changing this data structure. Until then the image reference documents the
// expected standard image and the UI renders a placeholder.

import { getCategoryById, getCategoryNameById } from './masterCategories';

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildDisplayName(nameEnglish, nameSwahili) {
  return `${nameEnglish} (${nameSwahili})`;
}

const UNITS_VALID = ['kg', 'piece', 'dozen', 'bunch', 'tray', 'litre', 'pack', 'bag'];

let sortCounter = 0;

function p(categoryId, nameEnglish, nameSwahili, defaultUnit, availableUnits, overrides = {}) {
  const category = getCategoryById(categoryId);
  if (!category) {
    throw new Error(`masterProducts: unknown categoryId "${categoryId}" for "${nameEnglish}"`);
  }
  const productId = overrides.productId || toSlug(nameEnglish);
  for (const unit of [defaultUnit, ...availableUnits]) {
    if (!UNITS_VALID.includes(unit)) {
      throw new Error(`masterProducts: invalid unit "${unit}" for "${nameEnglish}"`);
    }
  }
  return {
    productId,
    categoryId,
    categoryName: getCategoryNameById(categoryId),
    nameEnglish,
    nameSwahili,
    displayName: buildDisplayName(nameEnglish, nameSwahili),
    slug: productId,
    defaultUnit,
    availableUnits,
    image: `assets/products/${category.imageDir}/${productId}.jpg`,
    isActive: true,
    sortOrder: ++sortCounter,
  };
}

export const MASTER_PRODUCTS = [
  // ============ Vegetables & Leafy Vegetables ============
  p('vegetables', 'Tomato', 'Nyanya', 'kg', ['kg']),
  p('vegetables', 'Onion', 'Kitunguu', 'kg', ['kg']),
  p('vegetables', 'Red Onion', 'Kitunguu Chekundu', 'kg', ['kg']),
  p('vegetables', 'Spring Onion', 'Kitunguu Majani', 'bunch', ['bunch', 'kg']),
  p('vegetables', 'Cabbage', 'Kabichi', 'piece', ['piece', 'kg']),
  p('vegetables', 'Kale', 'Sukuma Wiki', 'kg', ['kg', 'bunch']),
  p('vegetables', 'Spinach', 'Spinachi', 'kg', ['kg', 'bunch']),
  p('vegetables', 'Amaranth Leaves', 'Mchicha', 'bunch', ['bunch', 'kg']),
  p('vegetables', 'Cowpea Leaves', 'Majani ya Kunde', 'bunch', ['bunch', 'kg']),
  p('vegetables', 'Pumpkin Leaves', 'Majani ya Malenge', 'bunch', ['bunch', 'kg']),
  p('vegetables', 'African Nightshade', 'Managu', 'bunch', ['bunch', 'kg']),
  p('vegetables', 'Spider Plant', 'Sagaa', 'bunch', ['bunch', 'kg']),
  p('vegetables', 'Coriander/Cilantro', 'Dhania', 'bunch', ['bunch', 'kg']),
  p('vegetables', 'Carrot', 'Karoti', 'kg', ['kg']),
  p('vegetables', 'Green Pepper', 'Hoho', 'kg', ['kg', 'piece']),
  p('vegetables', 'Red Pepper', 'Hoho Nyekundu', 'kg', ['kg', 'piece']),
  p('vegetables', 'Green Chilli', 'Pilipili', 'kg', ['kg']),
  p('vegetables', 'Cucumber', 'Tango', 'piece', ['piece', 'kg']),
  p('vegetables', 'Courgette/Zucchini', 'Zukini', 'kg', ['kg']),
  p('vegetables', 'Eggplant/Aubergine', 'Biringanya', 'kg', ['kg', 'piece']),
  p('vegetables', 'Okra', 'Bamia', 'kg', ['kg', 'bunch']),
  p('vegetables', 'Broccoli', 'Brokoli', 'piece', ['piece']),
  p('vegetables', 'Cauliflower', 'Koliflawa', 'piece', ['piece']),
  p('vegetables', 'Lettuce', 'Saladi', 'piece', ['piece']),
  p('vegetables', 'Beetroot', 'Beetroot', 'kg', ['kg']),
  p('vegetables', 'French Beans', 'Maharagwe ya Kifaransa', 'kg', ['kg']),
  p('vegetables', 'Runner Beans', 'Maharagwe ya Runner', 'kg', ['kg']),
  p('vegetables', 'Garden Peas', 'Njegere', 'kg', ['kg']),
  p('vegetables', 'Snow Peas', 'Njegere za Snow', 'kg', ['kg']),
  p('vegetables', 'Turnip', 'Turnipu', 'kg', ['kg']),
  p('vegetables', 'Radish', 'Figili', 'bunch', ['bunch', 'kg']),
  p('vegetables', 'Leek', 'Leeks', 'bunch', ['bunch', 'kg']),
  p('vegetables', 'Celery', 'Selery', 'bunch', ['bunch']),
  p('vegetables', 'Butternut Squash', 'Butternut', 'piece', ['piece', 'kg']),
  p('vegetables', 'Pumpkin', 'Malenge', 'piece', ['piece', 'kg']),
  p('vegetables', 'Mushroom', 'Uyoga', 'kg', ['kg', 'pack']),
  p('vegetables', 'Sweet Corn', 'Mahindi Matamu', 'piece', ['piece', 'dozen']),
  p('vegetables', 'Baby Corn', 'Mahindi Machanga', 'kg', ['kg', 'pack']),

  // ============ Fruits ============
  p('fruits', 'Banana', 'Ndizi', 'bunch', ['bunch', 'kg']),
  p('fruits', 'Cooking Banana', 'Ndizi za Kupika', 'bunch', ['bunch', 'kg']),
  p('fruits', 'Apple Banana', 'Ndizi za Apple', 'bunch', ['bunch', 'kg']),
  p('fruits', 'Mango', 'Embe', 'kg', ['kg', 'piece']),
  p('fruits', 'Avocado', 'Parachichi', 'piece', ['piece', 'kg']),
  p('fruits', 'Orange', 'Chungwa', 'kg', ['kg', 'piece', 'dozen']),
  p('fruits', 'Tangerine', 'Chungwa Doga', 'kg', ['kg', 'dozen']),
  p('fruits', 'Lemon', 'Limau', 'kg', ['kg', 'piece']),
  p('fruits', 'Lime', 'Ndimu', 'kg', ['kg', 'piece']),
  p('fruits', 'Passion Fruit', 'Passion', 'kg', ['kg', 'piece']),
  p('fruits', 'Watermelon', 'Tikiti Maji', 'piece', ['piece', 'kg']),
  p('fruits', 'Pawpaw/Papaya', 'Papai', 'piece', ['piece', 'kg']),
  p('fruits', 'Pineapple', 'Nanasi', 'piece', ['piece']),
  p('fruits', 'Guava', 'Pera', 'kg', ['kg', 'piece']),
  p('fruits', 'Jackfruit', 'Fenesi', 'piece', ['piece', 'kg']),
  p('fruits', 'Coconut', 'Nazi', 'piece', ['piece', 'dozen']),
  p('fruits', 'Tamarind', 'Ukwaju', 'kg', ['kg']),
  p('fruits', 'Tree Tomato', 'Nyanya Mti', 'kg', ['kg', 'bunch']),
  p('fruits', 'Grapes', 'Zabibu', 'kg', ['kg', 'bunch']),
  p('fruits', 'Strawberry', 'Stroberi', 'kg', ['kg', 'pack']),
  p('fruits', 'Pear', 'Pea', 'kg', ['kg', 'piece']),
  p('fruits', 'Peach', 'Pichi', 'kg', ['kg', 'piece']),
  p('fruits', 'Plum', 'Plum', 'kg', ['kg', 'piece']),
  p('fruits', 'Melon', 'Meloni', 'piece', ['piece', 'kg']),
  p('fruits', 'Dates', 'Tende', 'kg', ['kg', 'pack']),
  p('fruits', 'Dragon Fruit', 'Tunda la Joka', 'piece', ['piece', 'kg']),

  // ============ Cereals & Grains ============
  p('cerealGrains', 'Maize Grain', 'Mahindi', 'kg', ['kg', 'bag']),
  p('cerealGrains', 'Green Maize', 'Mahindi Mabichi', 'piece', ['piece', 'dozen']),
  p('cerealGrains', 'Maize Flour', 'Unga wa Mahindi', 'kg', ['kg', 'bag']),
  p('cerealGrains', 'Rice', 'Mchele', 'kg', ['kg', 'bag']),
  p('cerealGrains', 'Wheat', 'Ngano', 'kg', ['kg', 'bag']),
  p('cerealGrains', 'Wheat Flour', 'Unga wa Ngano', 'kg', ['kg', 'bag']),
  p('cerealGrains', 'Sorghum', 'Mtama', 'kg', ['kg', 'bag']),
  p('cerealGrains', 'Finger Millet', 'Uwele', 'kg', ['kg', 'bag']),
  p('cerealGrains', 'Pearl Millet', 'Uwele', 'kg', ['kg', 'bag']),
  p('cerealGrains', 'Oats', 'Oats', 'kg', ['kg', 'pack']),
  p('cerealGrains', 'Barley', 'Shayiri', 'kg', ['kg']),
  p('cerealGrains', 'Rye', 'Rye', 'kg', ['kg']),
  p('cerealGrains', 'Quinoa', 'Quinoa', 'kg', ['kg']),
  p('cerealGrains', 'Amaranth Grain', 'Mbegu za Mchicha', 'kg', ['kg']),
  p('cerealGrains', 'Popcorn', 'Mahindi ya Popcorn', 'kg', ['kg', 'pack']),

  // ============ Beans, Pulses & Legumes ============
  p('pulsesLegumes', 'Common Beans', 'Maharagwe', 'kg', ['kg', 'bag']),
  p('pulsesLegumes', 'Red Kidney Beans', 'Maharagwe Mekundu', 'kg', ['kg', 'bag']),
  p('pulsesLegumes', 'Rosecoco Beans', 'Maharagwe ya Rosecoco', 'kg', ['kg', 'bag']),
  p('pulsesLegumes', 'Yellow Beans', 'Maharagwe Manjano', 'kg', ['kg', 'bag']),
  p('pulsesLegumes', 'Black Beans', 'Maharagwe Meusi', 'kg', ['kg', 'bag']),
  p('pulsesLegumes', 'Green Grams', 'Ndengu', 'kg', ['kg', 'bag']),
  p('pulsesLegumes', 'Cowpeas', 'Kunde', 'kg', ['kg', 'bag']),
  p('pulsesLegumes', 'Pigeon Peas', 'Mbaazi', 'kg', ['kg', 'bag']),
  p('pulsesLegumes', 'Chickpeas', 'Njegere', 'kg', ['kg', 'bag']),
  p('pulsesLegumes', 'Lentils', 'Dengu', 'kg', ['kg', 'bag']),
  p('pulsesLegumes', 'Green Peas', 'Njegere', 'kg', ['kg', 'bag']),
  p('pulsesLegumes', 'Soya Beans', 'Soya', 'kg', ['kg', 'bag']),
  p('pulsesLegumes', 'Dolichos/Lablab', 'Njahi', 'kg', ['kg', 'bag']),
  p('pulsesLegumes', 'Black-Eyed Peas', 'Kunde', 'kg', ['kg', 'bag']),

  // ============ Roots & Tubers ============
  p('rootsTubers', 'Irish Potato', 'Viazi', 'kg', ['kg']),
  p('rootsTubers', 'Sweet Potato', 'Viazi Vitamu', 'kg', ['kg']),
  p('rootsTubers', 'Cassava', 'Muhogo', 'kg', ['kg', 'piece']),
  p('rootsTubers', 'Arrowroot', 'Nduma', 'kg', ['kg']),
  p('rootsTubers', 'Yam', 'Kiazi Kikuu', 'kg', ['kg', 'piece']),
  p('rootsTubers', 'Cocoyam', 'Magimbi', 'kg', ['kg']),
  p('rootsTubers', 'Taro', 'Nduma', 'kg', ['kg']),
  p('rootsTubers', 'Ginger', 'Tangawizi', 'kg', ['kg']),

  // ============ Meat & Butchery ============
  p('meat', 'Beef', 'Nyama ya Ng\'ombe', 'kg', ['kg']),
  p('meat', 'Goat Meat', 'Nyama ya Mbuzi', 'kg', ['kg']),
  p('meat', 'Mutton', 'Nyama ya Kondoo', 'kg', ['kg']),
  p('meat', 'Chicken Meat', 'Nyama ya Kuku', 'kg', ['kg']),
  p('meat', 'Indigenous Chicken', 'Kuku Kienyeji', 'piece', ['piece', 'kg']),
  p('meat', 'Duck Meat', 'Nyama ya Bata', 'piece', ['piece', 'kg']),
  p('meat', 'Turkey Meat', 'Nyama ya Uturuki', 'piece', ['piece', 'kg']),
  p('meat', 'Beef Liver', 'Ini ya Ng\'ombe', 'kg', ['kg']),
  p('meat', 'Goat Liver', 'Ini ya Mbuzi', 'kg', ['kg']),
  p('meat', 'Chicken Liver', 'Ini ya Kuku', 'kg', ['kg', 'pack']),
  p('meat', 'Beef Kidney', 'Figo ya Ng\'ombe', 'kg', ['kg']),
  p('meat', 'Beef Tripe', 'Matumbo ya Ng\'ombe', 'kg', ['kg']),
  p('meat', 'Goat Offal', 'Matumbo ya Mbuzi', 'kg', ['kg']),
  p('meat', 'Beef Offal', 'Machinjio ya Ng\'ombe', 'kg', ['kg']),
  p('meat', 'Beef Bones', 'Mifupa ya Ng\'ombe', 'kg', ['kg']),
  p('meat', 'Goat Bones', 'Mifupa ya Mbuzi', 'kg', ['kg']),
  p('meat', 'Minced Beef', 'Nyama ya Kusaga', 'kg', ['kg', 'pack']),
  p('meat', 'Sausages', 'Soseji', 'kg', ['kg', 'pack']),

  // ============ Eggs ============
  p('eggs', 'Chicken Eggs', 'Mayai ya Kuku', 'piece', ['piece', 'tray']),
  p('eggs', 'Indigenous Chicken Eggs', 'Mayai ya Kienyeji', 'piece', ['piece', 'tray']),
  p('eggs', 'Duck Eggs', 'Mayai ya Bata', 'piece', ['piece', 'tray', 'dozen']),
  p('eggs', 'Quail Eggs', 'Mayai ya Kware', 'piece', ['piece', 'tray']),

  // ============ Dairy ============
  p('dairy', 'Fresh Cow Milk', 'Maziwa ya Ng\'ombe', 'litre', ['litre', 'pack']),
  p('dairy', 'Fresh Goat Milk', 'Maziwa ya Mbuzi', 'litre', ['litre', 'pack']),
  p('dairy', 'Camel Milk', 'Maziwa ya Ngamia', 'litre', ['litre', 'pack']),
  p('dairy', 'Yoghurt', 'Mtindi', 'litre', ['litre', 'pack']),
  p('dairy', 'Mala/Fermented Milk', 'Mala', 'litre', ['litre', 'pack']),
  p('dairy', 'Drinking Yoghurt', 'Mtindi wa Kunywa', 'litre', ['litre', 'pack']),
  p('dairy', 'Cream', 'Krimu', 'litre', ['litre', 'pack']),
  p('dairy', 'Sour Cream', 'Krimu Chachu', 'litre', ['litre', 'pack']),
  p('dairy', 'Butter', 'Siagi', 'kg', ['kg', 'pack']),
  p('dairy', 'Cheese', 'Jibini', 'kg', ['kg', 'pack']),
  p('dairy', 'Cheddar Cheese', 'Jibini la Cheddar', 'kg', ['kg', 'pack']),
  p('dairy', 'Milk Powder', 'Maziwa ya Unga', 'kg', ['kg', 'pack']),
  p('dairy', 'Condensed Milk', 'Maziwa Mazito', 'pack', ['pack']),

  // ============ Fish & Seafood ============
  p('fish', 'Tilapia', 'Sato', 'piece', ['piece', 'kg']),
  p('fish', 'Nile Perch', 'Sangara', 'kg', ['kg', 'piece']),
  p('fish', 'Omena/Silver Cyprinid', 'Omena', 'kg', ['kg', 'pack']),
  p('fish', 'Tuna', 'Tuna', 'kg', ['kg', 'piece']),
  p('fish', 'Sardines', 'Sardini', 'kg', ['kg', 'pack']),
  p('fish', 'Fresh Fish', 'Samaki Mbichi', 'kg', ['kg']),
  p('fish', 'Dried Fish', 'Samaki Waliokaushwa', 'kg', ['kg', 'pack']),
  p('fish', 'Prawns/Shrimp', 'Kamba', 'kg', ['kg', 'pack']),
  p('fish', 'Crab', 'Kaa', 'piece', ['piece', 'kg']),
  p('fish', 'Octopus', 'Pweza', 'kg', ['kg']),
  p('fish', 'Red Snapper', 'Samaki wa Snapper', 'kg', ['kg', 'piece']),
  p('fish', 'Mackerel', 'Samaki wa Mackerel', 'kg', ['kg', 'piece']),
  p('fish', 'Salmon', 'Samaki wa Salmon', 'kg', ['kg', 'piece']),
  p('fish', 'Trout', 'Samaki wa Trout', 'kg', ['kg', 'piece']),
  p('fish', 'Catfish', 'Samaki wa Kambale', 'kg', ['kg', 'piece']),
  p('fish', 'Kingfish', 'Samaki wa Kingfish', 'kg', ['kg', 'piece']),
  p('fish', 'Anchovies', 'Anchovi', 'kg', ['kg', 'pack', 'bag']),
  p('fish', 'Herring', 'Herring', 'kg', ['kg', 'piece']),
  p('fish', 'Cod', 'Samaki wa Cod', 'kg', ['kg', 'piece']),
  p('fish', 'Swordfish', 'Samaki wa Upanga', 'kg', ['kg', 'piece']),
  p('fish', 'Marlin', 'Samaki wa Marlin', 'kg', ['kg', 'piece']),

  // ============ Spices & Herbs ============
  p('spices', 'Garlic', 'Kitunguu Saumu', 'kg', ['kg']),
  p('spices', 'Ginger', 'Tangawizi', 'kg', ['kg'], { productId: 'ginger-spice' }),
  p('spices', 'Turmeric', 'Manjano', 'kg', ['kg']),
  p('spices', 'Black Pepper', 'Pilipili Manga', 'kg', ['kg', 'pack']),
  p('spices', 'Chilli', 'Pilipili', 'kg', ['kg']),
  p('spices', 'Coriander Seeds', 'Mbegu za Dhania', 'kg', ['kg', 'pack']),
  p('spices', 'Cumin', 'Jira', 'kg', ['kg', 'pack']),
  p('spices', 'Cardamom', 'Iliki', 'kg', ['kg', 'pack']),
  p('spices', 'Cinnamon', 'Mdalasini', 'kg', ['kg', 'pack']),
  p('spices', 'Cloves', 'Karafuu', 'kg', ['kg', 'pack']),
  p('spices', 'Nutmeg', 'Kungumanga', 'kg', ['kg', 'pack']),
  p('spices', 'Fenugreek', 'Hilba', 'kg', ['kg', 'pack']),
  p('spices', 'Curry Powder', 'Poda ya Curry', 'kg', ['kg', 'pack']),
  p('spices', 'Bay Leaves', 'Majani ya Bay', 'kg', ['kg', 'pack']),
  p('spices', 'Fresh Coriander', 'Dhania', 'bunch', ['bunch', 'kg']),
  p('spices', 'Rosemary', 'Rosemary', 'bunch', ['bunch', 'kg']),
  p('spices', 'Mint', 'Mnanaa', 'bunch', ['bunch', 'kg']),
  p('spices', 'Salt', 'Chumvi', 'kg', ['kg', 'pack', 'bag']),
  p('spices', 'Paprika', 'Paprika', 'kg', ['kg', 'pack']),
  p('spices', 'Chilli Powder', 'Pilipili ya Kusaga', 'kg', ['kg', 'pack']),
  p('spices', 'Cayenne Pepper', 'Pilipili Kali', 'kg', ['kg', 'pack']),
  p('spices', 'Mixed Spice', 'Mchanganyiko wa Viungo', 'kg', ['kg', 'pack']),
  p('spices', 'Star Anise', 'Anisi Nyota', 'kg', ['kg', 'pack']),
  p('spices', 'Fennel Seeds', 'Mbegu za Fennel', 'kg', ['kg', 'pack']),
  p('spices', 'Mustard Seeds', 'Mbegu za Haradali', 'kg', ['kg', 'pack']),
  p('spices', 'Lemongrass', 'Mchaichai', 'bunch', ['bunch', 'kg']),
  p('spices', 'Basil', 'Basil', 'bunch', ['bunch', 'pack']),
  p('spices', 'Thyme', 'Thyme', 'bunch', ['bunch', 'pack']),
  p('spices', 'Parsley', 'Parsley', 'bunch', ['bunch', 'pack']),
  p('spices', 'Oregano', 'Oregano', 'bunch', ['bunch', 'pack']),

  // ============ Nuts & Seeds ============
  p('nuts', 'Groundnuts/Peanuts', 'Karanga', 'kg', ['kg', 'pack']),
  p('nuts', 'Cashew Nuts', 'Korosho', 'kg', ['kg', 'pack']),
  p('nuts', 'Macadamia Nuts', 'Macadamia', 'kg', ['kg', 'pack']),
  p('nuts', 'Sesame Seeds', 'Ufuta', 'kg', ['kg', 'pack']),
  p('nuts', 'Pumpkin Seeds', 'Mbegu za Malenge', 'kg', ['kg', 'pack']),
  p('nuts', 'Sunflower Seeds', 'Mbegu za Alizeti', 'kg', ['kg', 'pack']),
  p('nuts', 'Chia Seeds', 'Mbegu za Chia', 'kg', ['kg', 'pack']),
  p('nuts', 'Flax Seeds', 'Mbegu za Lin', 'kg', ['kg', 'pack']),
  p('nuts', 'Roasted Peanuts', 'Karanga Zilizooka', 'pack', ['pack', 'kg', 'bag']),
  p('nuts', 'Almonds', 'Lozi', 'kg', ['kg', 'pack', 'bag']),
  p('nuts', 'Walnuts', 'Karanga za Walnut', 'kg', ['kg', 'pack']),
  p('nuts', 'Pistachios', 'Pistachio', 'kg', ['kg', 'pack']),
  p('nuts', 'Hazelnuts', 'Korosho za Hazelnut', 'kg', ['kg', 'pack']),
  p('nuts', 'Brazil Nuts', 'Karanga za Brazil', 'kg', ['kg', 'pack']),
  p('nuts', 'Hemp Seeds', 'Mbegu za Katani', 'kg', ['kg', 'pack', 'bag']),
  p('nuts', 'Poppy Seeds', 'Mbegu za Poppy', 'kg', ['kg', 'pack']),
  p('nuts', 'Watermelon Seeds', 'Mbegu za Tikiti', 'kg', ['kg', 'pack', 'bag']),
  p('nuts', 'Tiger Nuts', 'Njugu Mawe', 'kg', ['kg', 'pack', 'bag']),

  // ============ Other Grocery ============
  p('other', 'Tomato Sauce', 'Mchuzi wa Nyanya', 'pack', ['pack', 'piece']),
  p('other', 'Tomato Paste', 'Kibandiko cha Nyanya', 'pack', ['pack']),
  p('other', 'Ketchup', 'Ketchup', 'pack', ['pack', 'piece']),
  p('other', 'Peanut Butter', 'Siagi ya Karanga', 'pack', ['pack']),
  p('other', 'Fruit Jam', 'Jamu ya Matunda', 'pack', ['pack']),
  p('other', 'Chocolate Spread', 'Siagi ya Chokoleti', 'pack', ['pack']),
  p('other', 'Margarine', 'Margarine', 'pack', ['pack', 'kg']),
  p('other', 'Cooking Oil', 'Mafuta ya Kupikia', 'litre', ['litre', 'pack']),
  p('other', 'Sunflower Oil', 'Mafuta ya Alizeti', 'litre', ['litre', 'pack']),
  p('other', 'Vegetable Oil', 'Mafuta ya Mboga', 'litre', ['litre', 'pack']),
  p('other', 'Sugar', 'Sukari', 'kg', ['kg', 'bag']),
  p('other', 'Honey', 'Asali', 'kg', ['kg', 'pack']),
  p('other', 'Tea Leaves', 'Majani ya Chai', 'kg', ['kg', 'pack']),
  p('other', 'Coffee', 'Kahawa', 'kg', ['kg', 'pack']),
  p('other', 'Bread', 'Mkate', 'piece', ['piece']),
  p('other', 'Spaghetti', 'Spaghetti', 'pack', ['pack', 'kg']),
  p('other', 'Macaroni', 'Macaroni', 'pack', ['pack', 'kg']),
  p('other', 'Instant Noodles', 'Tambi za Haraka', 'pack', ['pack']),
  p('other', 'Biscuits', 'Biskuti', 'pack', ['pack']),
  p('other', 'Vinegar', 'Siki', 'litre', ['litre', 'pack']),
  p('other', 'Mayonnaise', 'Mayonesi', 'pack', ['pack']),
  p('other', 'Baking Powder', 'Unga wa Kuokea', 'pack', ['pack']),
  p('other', 'Baking Soda', 'Soda ya Kuokea', 'pack', ['pack']),
  p('other', 'Stock Cubes', 'Mchuzi wa Cube', 'pack', ['pack']),
  p('other', 'Coconut Milk', 'Maziwa ya Nazi', 'pack', ['pack']),
  p('other', 'Drinking Water', 'Maji ya Kunywa', 'litre', ['litre', 'pack']),
  p('other', 'Fruit Juice', 'Juisi ya Matunda', 'litre', ['litre', 'pack']),
  p('other', 'Soft Drinks', 'Vinywaji Baridi', 'piece', ['piece', 'pack']),
  p('other', 'Canned Beans', 'Maharagwe ya Kopo', 'piece', ['piece', 'pack']),
  p('other', 'Canned Tuna', 'Tuna ya Kopo', 'piece', ['piece', 'pack']),
  p('other', 'Canned Sardines', 'Sardini za Kopo', 'piece', ['piece', 'pack']),
];

// ===== Runtime self-checks (fail loudly if the catalogue is inconsistent) =====
const seenIds = new Set();
const seenSlugs = new Set();
for (const product of MASTER_PRODUCTS) {
  if (!product.nameEnglish || !product.nameSwahili) {
    throw new Error(`masterProducts: missing English/Swahili name for ${product.productId}`);
  }
  if (product.displayName !== `${product.nameEnglish} (${product.nameSwahili})`) {
    throw new Error(`masterProducts: displayName mismatch for ${product.productId}`);
  }
  if (!getCategoryById(product.categoryId)) {
    throw new Error(`masterProducts: unknown categoryId for ${product.productId}`);
  }
  if (seenIds.has(product.productId)) {
    throw new Error(`masterProducts: duplicate productId "${product.productId}"`);
  }
  if (seenSlugs.has(product.slug)) {
    throw new Error(`masterProducts: duplicate slug "${product.slug}"`);
  }
  if (product.defaultUnit !== product.availableUnits[0]) {
    throw new Error(`masterProducts: defaultUnit not first in availableUnits for ${product.productId}`);
  }
  if (!product.image.startsWith('assets/products/') || !product.image.endsWith('.jpg')) {
    throw new Error(`masterProducts: bad image reference for ${product.productId}`);
  }
  if (product.isActive !== true) {
    throw new Error(`masterProducts: isActive must start true for ${product.productId}`);
  }
  seenIds.add(product.productId);
  seenSlugs.add(product.slug);
}