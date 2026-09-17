export const categories = ['Vegetables', 'Cereals', 'Fruits', 'Grains', 'Other'];

// Builds the paymentVendor snapshot the same way production checkout does, so
// the TEST_MODE order mirrors the real order shape.
import { normalizeVendorPaymentMethods } from '../utils/paymentMethods';

export const stores = [
  {
    id: 'store-1',
    name: 'Mama Njeri Fresh Farm',
    vendorName: 'Mary Njeri',
    location: 'Kiambu Road, Nairobi',
    rating: 4.8,
    status: 'Open',
    uid: null,
    vendorUid: null,
    phone: '+254 712 345 678',
    mpesaPaymentMethods: {
      sendMoneyNumber: '+254 712 345 678',
      tillNumber: '5123456',
    },
    profilePhoto: null,
    description: 'Fresh vegetables and fruits straight from our family farm.',
    products: [
      {
        id: 'p-1',
        name: 'Tomatoes',
        masterProductId: 'tomato',
        category: 'Vegetables',
        pricePerKg: 100,
        availableQuantity: 50,
        available: true,
        description: 'Ripe, juicy tomatoes picked daily from the farm.',
      },
      {
        id: 'p-2',
        name: 'Sukuma Wiki (Kale)',
        masterProductId: 'kale',
        category: 'Vegetables',
        pricePerKg: 60,
        availableQuantity: 30,
        available: true,
        description: 'Fresh organic kale, rich in iron and vitamins.',
      },
      {
        id: 'p-3',
        name: 'Onions',
        masterProductId: 'onion',
        category: 'Vegetables',
        pricePerKg: 120,
        availableQuantity: 40,
        available: true,
        description: 'Clean, dry red onions with a strong flavour.',
      },
      {
        id: 'p-4',
        name: 'Avocados',
        masterProductId: 'avocado',
        category: 'Fruits',
        pricePerKg: 150,
        availableQuantity: 25,
        available: true,
        description: 'Butter-soft avocados, ideal for salads.',
      },
      {
        id: 'p-5',
        name: 'Green Peppers',
        masterProductId: 'green-pepper',
        category: 'Vegetables',
        pricePerKg: 140,
        availableQuantity: 0,
        available: false,
        description: 'Crunchy green peppers for cooking.',
      },
    ],
  },
  {
    id: 'store-2',
    name: 'Ukulima Cereals Depot',
    vendorName: 'John Kamau',
    location: 'Gikomba, Nairobi',
    rating: 4.5,
    status: 'Open',
    uid: null,
    vendorUid: null,
    phone: '+254 720 111 222',
    mpesaPaymentMethods: {
      tillNumber: '8123456',
    },
    profilePhoto: null,
    description: 'Wholesale and retail cereals and grains in bulk.',
    products: [
      {
        id: 'p-6',
        name: 'Rice (Pishori)',
        masterProductId: 'rice',
        category: 'Cereals',
        pricePerKg: 220,
        availableQuantity: 120,
        available: true,
        description: 'Long grain aromatic Pishori rice.',
      },
      {
        id: 'p-7',
        name: 'Maize Grains',
        masterProductId: 'maize-grain',
        category: 'Grains',
        pricePerKg: 80,
        availableQuantity: 200,
        available: true,
        description: 'Dry maize grains, perfect for ugali flour.',
      },
      {
        id: 'p-8',
        name: 'Beans (Nyayo)',
        masterProductId: 'common-beans',
        category: 'Grains',
        pricePerKg: 160,
        availableQuantity: 90,
        available: true,
        description: 'Clean Nyayo beans for stews and githeri.',
      },
      {
        id: 'p-9',
        name: 'Millet',
        masterProductId: 'pearl-millet',
        category: 'Cereals',
        pricePerKg: 180,
        availableQuantity: 45,
        available: true,
        description: 'Whole millet grains for porridge.',
      },
      {
        id: 'p-10',
        name: 'Green Grams',
        masterProductId: 'green-grams',
        category: 'Grains',
        pricePerKg: 170,
        availableQuantity: 35,
        available: true,
        description: 'Ndugu, selected for uniform size.',
      },
    ],
  },
  {
    id: 'store-3',
    name: 'Fruits of the Valley',
    vendorName: 'Amina Hassan',
    location: 'Karen, Nairobi',
    rating: 4.9,
    status: 'Open',
    uid: null,
    vendorUid: null,
    phone: '+254 733 555 666',
    mpesaPaymentMethods: {
      sendMoneyNumber: '+254 733 555 666',
    },
    profilePhoto: null,
    description: 'Premium fresh fruits sourced from the Rift Valley.',
    products: [
      {
        id: 'p-11',
        name: 'Oranges',
        masterProductId: 'orange',
        category: 'Fruits',
        pricePerKg: 90,
        availableQuantity: 60,
        available: true,
        description: 'Sweet juicy oranges from Murang’a.',
      },
      {
        id: 'p-12',
        name: 'Bananas',
        masterProductId: 'banana',
        category: 'Fruits',
        pricePerKg: 70,
        availableQuantity: 80,
        available: true,
        description: 'Ripe sweet bananas, source of potassium.',
      },
      {
        id: 'p-13',
        name: 'Mangoes',
        masterProductId: 'mango',
        category: 'Fruits',
        pricePerKg: 130,
        availableQuantity: 55,
        available: true,
        description: 'Kent mangoes, sweet and fibre-free.',
      },
      {
        id: 'p-14',
        name: 'Pineapples',
        masterProductId: 'pineapple',
        category: 'Fruits',
        pricePerKg: 110,
        availableQuantity: 20,
        available: false,
        description: 'Smooth cayenne pineapples, snacking sweet.',
      },
    ],
  },
  {
    id: 'store-4',
    name: 'Shamba Bora Groceries',
    vendorName: 'Peter Otieno',
    location: 'Westlands, Nairobi',
    rating: 4.3,
    status: 'Open',
    uid: null,
    vendorUid: null,
    phone: '+254 711 000 111',
    profilePhoto: null,
    description: 'Daily groceries and fresh market produce.',
    products: [
      {
        id: 'p-15',
        name: 'Carrots',
        masterProductId: 'carrot',
        category: 'Vegetables',
        pricePerKg: 110,
        availableQuantity: 40,
        available: true,
        description: 'Crunchy carrots from Naivasha.',
      },
      {
        id: 'p-16',
        name: 'Cabbages',
        masterProductId: 'cabbage',
        category: 'Vegetables',
        pricePerKg: 50,
        availableQuantity: 70,
        available: true,
        description: 'Heavy, compact cabbages for your kitchen.',
      },
      {
        id: 'p-17',
        name: 'Potatoes (Sherehe)',
        masterProductId: 'irish-potato',
        category: 'Vegetables',
        pricePerKg: 95,
        availableQuantity: 100,
        available: true,
        description: 'Floury potatoes for chips and stews.',
      },
      {
        id: 'p-18',
        name: 'Sweet Potatoes',
        masterProductId: 'sweet-potato',
        category: 'Other',
        pricePerKg: 85,
        availableQuantity: 30,
        available: true,
        description: 'Naturally sweet tubers, boiled or roasted.',
      },
    ],
  },
];

export const featuredStoreIds = ['store-1', 'store-2', 'store-3'];

export function getStoreById(id) {
  return stores.find((store) => store.id === id) || null;
}

export function getProductById(id) {
  for (const store of stores) {
    const product = store.products.find((p) => p.id === id);
    if (product) {
      return { product, store };
    }
  }
  return null;
}

// ---- Prototype vendor-store product helpers (TEST_MODE / dev testing) ----
// These mutate the in-memory prototype `stores` data so the whole
// Buyer -> Vendor -> Delivery workflow can be exercised in development before
// real Firestore persistence is wired up. The master catalogue
// (services/masterProducts.js) is NEVER touched by these helpers.

export function addProductToVendorStore(storeId, productRecord) {
  const store = getStoreById(storeId);
  if (!store) return false;
  if (store.products.some((p) => p.id === productRecord.id)) {
    return false;
  }
  store.products.push(productRecord);
  return true;
}

export function updateVendorStoreProduct(storeId, productId, updates) {
  const store = getStoreById(storeId);
  if (!store) return false;
  const product = store.products.find((p) => p.id === productId);
  if (!product) return false;
  Object.assign(product, updates);
  return true;
}

export function removeVendorStoreProduct(storeId, productId) {
  const store = getStoreById(storeId);
  if (!store) return false;
  const before = store.products.length;
  store.products = store.products.filter((p) => p.id !== productId);
  return store.products.length < before;
}

export const currentVendor = {
  id: 'vendor-1',
  fullName: 'Mary Njeri',
  storeName: 'Mama Njeri Fresh Farm',
  storeDescription: 'Fresh vegetables and fruits from our family farm.',
  location: 'Kiambu Road, Nairobi',
  phone: '+254 712 345 678',
  email: 'vendor@sokohapa.co.ke',
  subscriptionActive: false,
  subscriptionPlan: 'Ksh 100 / month',
  mpesaPaymentMethods: {
    sendMoneyNumber: '+254 712 345 678',
    tillNumber: '5123456',
  },
};

// TEST_MODE helper: updates the prototype vendor's M-PESA payment methods so
// the vendor Payment Settings screen, the buyer checkout display and the
// in-memory test-order snapshot all agree. Never touches Firestore. The
// prototype vendor (currentVendor) corresponds to store-1.
export function updateVendorPaymentMethodsMock(methods) {
  const clean = normalizeVendorPaymentMethods(methods, null);
  const next = { sendMoneyNumber: null, tillNumber: null, ...(clean || {}) };
  if (currentVendor) currentVendor.mpesaPaymentMethods = { ...next };
  const store = getStoreById('store-1');
  if (store) store.mpesaPaymentMethods = { ...next };
  return next;
}

export const vendorOrders = [
  {
    id: 'vo-1',
    orderNumber: 'SH-1042',
    deliveryLocation: { address: 'South B Estate, Nairobi', directions: 'House 14, near the blue gate' },
    buyerName: 'Brian Mwangi',
    items: [
      { name: 'Tomatoes', quantity: 2, pricePerKg: 100 },
      { name: 'Sukuma Wiki (Kale)', quantity: 1, pricePerKg: 60 },
    ],
    total: 260,
    status: 'New',
    deliveryStatus: 'Awaiting Accept',
    createdAt: 'Today, 09:42',
    identity: {
      buyer: {
        uid: null,
        fullName: 'Brian Mwangi',
        phone: '+254 722 123 456',
        profilePhoto: null,
      },
      vendor: {
        uid: null,
        vendorId: 'store-1',
        fullName: 'Mary Njeri',
        storeName: 'Mama Njeri Fresh Farm',
        location: 'Kiambu Road, Nairobi',
        phone: '+254 712 345 678',
        profilePhoto: null,
      },
    },
  },
  {
    id: 'vo-2',
    orderNumber: 'SH-1041',
    deliveryLocation: { address: 'Kasarani, Nairobi', directions: 'Room 12, Kasarani Business Park' },
    buyerName: 'Grace Wanjiru',
    items: [
      { name: 'Avocados', quantity: 3, pricePerKg: 150 },
    ],
    total: 450,
    status: 'Preparing',
    deliveryStatus: 'Preparing Order',
    createdAt: 'Today, 08:10',
    identity: {
      buyer: {
        uid: null,
        fullName: 'Grace Wanjiru',
        phone: '+254 722 333 444',
        profilePhoto: null,
      },
      vendor: {
        uid: null,
        vendorId: 'store-1',
        fullName: 'Mary Njeri',
        storeName: 'Mama Njeri Fresh Farm',
        location: 'Kiambu Road, Nairobi',
        phone: '+254 712 345 678',
        profilePhoto: null,
      },
    },
  },
  {
    id: 'vo-3',
    orderNumber: 'SH-1038',
    deliveryLocation: { address: 'Kilimani, Nairobi', directions: '' },
    buyerName: 'Kevin Ochieng',
    items: [
      { name: 'Onions', quantity: 1, pricePerKg: 120 },
      { name: 'Tomatoes', quantity: 2, pricePerKg: 100 },
    ],
    total: 320,
    status: 'Ready for Pickup',
    deliveryStatus: 'Parcel Ready',
    createdAt: 'Yesterday, 16:33',
    identity: {
      buyer: {
        uid: null,
        fullName: 'Kevin Ochieng',
        phone: '+254 722 777 888',
        profilePhoto: null,
      },
      vendor: {
        uid: null,
        vendorId: 'store-1',
        fullName: 'Mary Njeri',
        storeName: 'Mama Njeri Fresh Farm',
        location: 'Kiambu Road, Nairobi',
        phone: '+254 712 345 678',
        profilePhoto: null,
      },
    },
  },
  {
    id: 'vo-4',
    orderNumber: 'SH-1030',
    deliveryLocation: { address: 'Ngara, Nairobi', directions: '2nd floor, near the bus stop' },
    buyerName: 'Faith Muthoni',
    items: [
      { name: 'Tomatoes', quantity: 5, pricePerKg: 100 },
    ],
    total: 500,
    status: 'Out for Delivery',
    deliveryStatus: 'With Rider',
    createdAt: 'Yesterday, 11:05',
    identity: {
      buyer: {
        uid: null,
        fullName: 'Faith Muthoni',
        phone: '+254 722 999 000',
        profilePhoto: null,
      },
      vendor: {
        uid: null,
        vendorId: 'store-1',
        fullName: 'Mary Njeri',
        storeName: 'Mama Njeri Fresh Farm',
        location: 'Kiambu Road, Nairobi',
        phone: '+254 712 345 678',
        profilePhoto: null,
      },
    },
    assignedDeliveryPerson: 'Collins Otieno',
    assignedDelivery: {
      uid: null,
      id: 'dp-1',
      fullName: 'Collins Otieno',
      phone: '+254 700 111 222',
      vehicleType: 'motorcycle',
      plateNumber: 'KDK 123A',
      profilePhoto: null,
      availability: 'Available',
    },
    deliveryAccepted: true,
  },
  {
    id: 'vo-5',
    orderNumber: 'SH-1021',
    deliveryLocation: { address: 'Lavington, Nairobi', directions: '' },
    buyerName: 'Samuel Kiptoo',
    items: [
      { name: 'Sukuma Wiki (Kale)', quantity: 2, pricePerKg: 60 },
      { name: 'Avocados', quantity: 1, pricePerKg: 150 },
    ],
    total: 270,
    status: 'Completed',
    deliveryStatus: 'Delivered',
    createdAt: 'Mon, 14:20',
    identity: {
      buyer: {
        uid: null,
        fullName: 'Samuel Kiptoo',
        phone: '+254 722 555 666',
        profilePhoto: null,
      },
      vendor: {
        uid: null,
        vendorId: 'store-1',
        fullName: 'Mary Njeri',
        storeName: 'Mama Njeri Fresh Farm',
        location: 'Kiambu Road, Nairobi',
        phone: '+254 712 345 678',
        profilePhoto: null,
      },
    },
    assignedDeliveryPerson: 'Collins Otieno',
    assignedDelivery: {
      uid: null,
      id: 'dp-1',
      fullName: 'Collins Otieno',
      phone: '+254 700 111 222',
      vehicleType: 'motorcycle',
      plateNumber: 'KDK 123A',
      profilePhoto: null,
      availability: 'Available',
    },
  },
];

export function getVendorOrderById(id) {
  return vendorOrders.find((order) => order.id === id) || null;
}

export const deliveryPersons = [
  {
    id: 'dp-1',
    uid: null,
    fullName: 'Collins Otieno',
    vehicleType: 'motorcycle',
    plateNumber: 'KDK 123A',
    phone: '+254 700 111 222',
    availability: 'Available',
    rating: 4.9,
    profilePhoto: null,
  },
  {
    id: 'dp-2',
    uid: null,
    fullName: 'Joyce Wanjala',
    vehicleType: 'motor_vehicle',
    plateNumber: 'KDP 456B',
    phone: '+254 700 333 444',
    availability: 'Available',
    rating: 4.7,
    profilePhoto: null,
  },
  {
    id: 'dp-3',
    uid: null,
    fullName: 'Dennis Karanja',
    vehicleType: 'motorcycle',
    plateNumber: 'KDH 789C',
    phone: '+254 700 555 666',
    availability: 'Busy',
    rating: 4.5,
    profilePhoto: null,
  },
  {
    id: 'dp-4',
    uid: null,
    fullName: 'Salim Abdalla',
    vehicleType: 'motor_vehicle',
    plateNumber: 'KDN 321D',
    phone: '+254 700 777 888',
    availability: 'Available',
    rating: 4.8,
    profilePhoto: null,
  },
];

export const buyerOrders = [
  {
    id: 'bo-1',
    orderNumber: 'SH-1042',
    deliveryLocation: { address: 'South B Estate, Nairobi', directions: 'House 14, near the blue gate' },
    vendorName: 'Mama Njeri Fresh Farm',
    items: [
      { name: 'Tomatoes', quantity: 2, pricePerKg: 100 },
      { name: 'Sukuma Wiki (Kale)', quantity: 1, pricePerKg: 60 },
    ],
    total: 260,
    status: 'Processing',
    paymentStatus: 'Pending',
    deliveryStatus: 'Awaiting Accept',
    createdAt: 'Today, 09:42',
    identity: {
      buyer: {
        uid: null,
        fullName: 'Brian Mwangi',
        phone: '+254 722 123 456',
        profilePhoto: null,
      },
      vendor: {
        uid: null,
        vendorId: 'store-1',
        fullName: 'Mary Njeri',
        storeName: 'Mama Njeri Fresh Farm',
        location: 'Kiambu Road, Nairobi',
        phone: '+254 712 345 678',
        profilePhoto: null,
      },
    },
  },
  {
    id: 'bo-2',
    orderNumber: 'SH-1021',
    deliveryLocation: { address: 'Lavington, Nairobi', directions: '' },
    vendorName: 'Mama Njeri Fresh Farm',
    items: [
      { name: 'Sukuma Wiki (Kale)', quantity: 2, pricePerKg: 60 },
      { name: 'Avocados', quantity: 1, pricePerKg: 150 },
    ],
    total: 270,
    status: 'Completed',
    paymentStatus: 'Paid',
    deliveryStatus: 'Delivered',
    createdAt: 'Mon, 14:20',
    identity: {
      buyer: {
        uid: null,
        fullName: 'Brian Mwangi',
        phone: '+254 722 123 456',
        profilePhoto: null,
      },
      vendor: {
        uid: null,
        vendorId: 'store-1',
        fullName: 'Mary Njeri',
        storeName: 'Mama Njeri Fresh Farm',
        location: 'Kiambu Road, Nairobi',
        phone: '+254 712 345 678',
        profilePhoto: null,
      },
    },
    assignedDeliveryPerson: 'Collins Otieno',
    assignedDelivery: {
      uid: null,
      id: 'dp-1',
      fullName: 'Collins Otieno',
      phone: '+254 700 111 222',
      vehicleType: 'motorcycle',
      plateNumber: 'KDK 123A',
      profilePhoto: null,
      availability: 'Available',
    },
  },
  {
    id: 'bo-3',
    orderNumber: 'SH-0988',
    deliveryLocation: { address: 'Kilimani, Nairobi', directions: '' },
    vendorName: 'Fruits of the Valley',
    items: [
      { name: 'Oranges', quantity: 3, pricePerKg: 90 },
      { name: 'Mangoes', quantity: 2, pricePerKg: 130 },
    ],
    total: 530,
    status: 'Completed',
    paymentStatus: 'Paid',
    deliveryStatus: 'Delivered',
    createdAt: 'Sun, 10:15',
    identity: {
      buyer: {
        uid: null,
        fullName: 'Kevin Ochieng',
        phone: '+254 722 777 888',
        profilePhoto: null,
      },
      vendor: {
        uid: null,
        vendorId: 'store-3',
        fullName: 'Amina Hassan',
        storeName: 'Fruits of the Valley',
        location: 'Karen, Nairobi',
        phone: '+254 733 555 666',
        profilePhoto: null,
      },
    },
    assignedDeliveryPerson: 'Joyce Wanjala',
    assignedDelivery: {
      uid: null,
      id: 'dp-2',
      fullName: 'Joyce Wanjala',
      phone: '+254 700 333 444',
      vehicleType: 'motor_vehicle',
      plateNumber: 'KDP 456B',
      profilePhoto: null,
      availability: 'Available',
    },
  },
];

export function getBuyerOrderById(id) {
  return buyerOrders.find((order) => order.id === id) || null;
}

export const currentUserProfile = {
  fullName: 'Jane Wambui',
  phone: '+254 722 123 456',
  email: 'jane@sokohapa.co.ke',
  role: 'buyer',
};

export const deliveryRequests = [
  {
    id: 'dr-1',
    orderNumber: 'SH-1050',
    vendorStore: 'Mama Njeri Fresh Farm',
    pickupLocation: 'Kiambu Road, Nairobi',
    deliveryLocation: { address: 'South B Estate, Nairobi', directions: 'House 14, near the blue gate' },
    distanceKm: 12,
    deliveryFee: 150,
    items: [
      { name: 'Tomatoes', quantity: 2, pricePerKg: 100, unit: 'kg' },
      { name: 'Sukuma Wiki (Kale)', quantity: 1, pricePerKg: 60, unit: 'kg' },
    ],
    packaging: { name: 'Small Carrier Bag', price: 20 },
    packagingFee: 20,
    subtotal: 260,
    total: 280,
    deliveryStatus: 'Awaiting Accept',
    deliveryAccepted: false,
    vendor: {
      uid: null,
      vendorId: 'store-1',
      fullName: 'Mary Njeri',
      storeName: 'Mama Njeri Fresh Farm',
      location: 'Kiambu Road, Nairobi',
      phone: '+254 712 345 678',
      profilePhoto: null,
    },
    buyer: {
      uid: null,
      fullName: 'Brian Mwangi',
      phone: '+254 722 123 456',
      profilePhoto: null,
    },
  },
  {
    id: 'dr-2',
    orderNumber: 'SH-1051',
    vendorStore: 'Ukulima Cereals Depot',
    pickupLocation: 'Gikomba, Nairobi',
    deliveryLocation: { address: 'Kasarani, Nairobi', directions: 'Room 12, near the mall' },
    distanceKm: 18,
    deliveryFee: 220,
    items: [
      { name: 'Rice (Pishori)', quantity: 3, pricePerKg: 220, unit: 'kg' },
      { name: 'Beans (Nyayo)', quantity: 2, pricePerKg: 160, unit: 'kg' },
    ],
    packaging: { name: 'Large Carrier Bag', price: 50 },
    packagingFee: 50,
    subtotal: 980,
    total: 1030,
    deliveryStatus: 'Awaiting Accept',
    deliveryAccepted: false,
    vendor: {
      uid: null,
      vendorId: 'store-2',
      fullName: 'John Kamau',
      storeName: 'Ukulima Cereals Depot',
      location: 'Gikomba, Nairobi',
      phone: '+254 720 111 222',
      profilePhoto: null,
    },
    buyer: {
      uid: null,
      fullName: 'Grace Wanjiru',
      phone: '+254 722 333 444',
      profilePhoto: null,
    },
  },
  {
    id: 'dr-3',
    orderNumber: 'SH-1052',
    vendorStore: 'Fruits of the Valley',
    pickupLocation: 'Karen, Nairobi',
    deliveryLocation: { address: 'Kilimani, Nairobi', directions: '' },
    distanceKm: 9,
    deliveryFee: 130,
    items: [
      { name: 'Oranges', quantity: 3, pricePerKg: 90, unit: 'kg' },
      { name: 'Mangoes', quantity: 2, pricePerKg: 130, unit: 'kg' },
    ],
    packaging: { name: 'Small Carrier Bag', price: 20 },
    packagingFee: 20,
    subtotal: 530,
    total: 550,
    deliveryStatus: 'Awaiting Accept',
    deliveryAccepted: false,
    vendor: {
      uid: null,
      vendorId: 'store-3',
      fullName: 'Amina Hassan',
      storeName: 'Fruits of the Valley',
      location: 'Karen, Nairobi',
      phone: '+254 733 555 666',
      profilePhoto: null,
    },
    buyer: {
      uid: null,
      fullName: 'Kevin Ochieng',
      phone: '+254 722 777 888',
      profilePhoto: null,
    },
  },
];

export const activeDelivery = {
  orderNumber: 'SH-1045',
  vendorStore: 'Shamba Bora Groceries',
  pickupLocation: 'Westlands, Nairobi',
  deliveryLocation: { address: 'Lavington, Nairobi', directions: 'Gate B, 3rd floor, near the green supermarket' },
  buyerPhone: '+254 722 000 111',
  parcelStatus: 'Pending Pickup',
  items: [
    { name: 'Tomatoes', quantity: 4, pricePerKg: 100, unit: 'kg' },
    { name: 'Cabbages', quantity: 2, pricePerKg: 50, unit: 'kg' },
  ],
  packaging: { name: 'Large Carrier Bag', price: 50 },
  packagingFee: 50,
  subtotal: 500,
  total: 550,
  deliveryStatus: 'Out for Delivery',
  deliveryAccepted: true,
  vendor: {
    uid: null,
    vendorId: 'store-4',
    fullName: 'Peter Otieno',
    storeName: 'Shamba Bora Groceries',
    location: 'Westlands, Nairobi',
    phone: '+254 711 000 111',
    profilePhoto: null,
  },
  buyer: {
    uid: null,
    fullName: 'Jane Wambui',
    phone: '+254 722 000 111',
    profilePhoto: null,
  },
};

export const deliveryHistory = [
  {
    id: 'dh-1',
    orderNumber: 'SH-1020',
    vendorStore: 'Ukulima Cereals Depot',
    date: 'Mon, 14:20',
    status: 'Delivered',
    deliveryFee: 200,
  },
  {
    id: 'dh-2',
    orderNumber: 'SH-1012',
    vendorStore: 'Mama Njeri Fresh Farm',
    date: 'Sun, 11:45',
    status: 'Delivered',
    deliveryFee: 150,
  },
  {
    id: 'dh-3',
    orderNumber: 'SH-1005',
    vendorStore: 'Fruits of the Valley',
    date: 'Sat, 16:05',
    status: 'Delivered',
    deliveryFee: 180,
  },
];

export const currentDeliveryProfile = {
  fullName: 'Collins Otieno',
  phone: '+254 700 111 222',
  email: 'collins@sokohapa.co.ke',
  vehicleType: 'motorcycle',
  plateNumber: 'KDK 123A',
  availability: 'Available',
};

// ---- Prototype TEST_MODE order/delivery helpers (dev testing) ----
// These mutate the in-memory prototype `buyerOrders` / `vendorOrders`
// collections so the whole Buyer -> Cart -> Checkout -> Vendor -> Delivery
// workflow can be exercised in development. They are only called from
// src/utils/testMode.js and never write to Firestore or the master catalogue.

let testOrderSeq = 0;

function buildTestOrderFromCart({
  cartItems,
  subtotal,
  packaging = null,
  packagingFee = 0,
  total,
  buyer = null,
  buyerName = currentUserProfile.fullName,
  buyerPhone = currentUserProfile.phone,
  vendorProfile = null,
  deliveryLocation = null,
}) {
  testOrderSeq += 1;
  const orderNumber = `SH-${1100 + testOrderSeq}`;
  const firstCartItem = cartItems[0] || {};
  // Prefer the store the buyer actually added the item from (snapshotted onto
  // the cart item by CartContext), falling back to the product -> store lookup
  // for legacy cart shapes. Never silently substitute a hardcoded store.
  const store =
    getStoreById(firstCartItem.storeId) ??
    (getProductById(firstCartItem.id)?.store ?? null);
  const vendorStoreName = store ? store.name : currentVendor.storeName;
  const pickupLocation = store ? store.location : currentVendor.location;

  // When a real vendor profile is provided (fetched from Firestore via the
  // store's vendorUid), use it for the vendor identity. Fall back to the
  // static store data for prototype stores with no linked real vendor.
  const v = vendorProfile;
  const vendorIdentity = {
    uid: v?.uid || store?.uid || null,
    vendorId: store?.id ?? null,
    fullName: v?.fullName || store?.vendorName || currentVendor.fullName,
    storeName: v?.storeName || vendorStoreName,
    location: store?.location || currentVendor.location,
    phone: v?.phone || store?.phone || null,
    profilePhoto: v?.profilePhoto || store?.profilePhoto || null,
  };

  const buyerIdentity = {
    uid: buyer?.uid ?? null,
    fullName: buyerName || buyer?.fullName || currentUserProfile.fullName,
    phone: buyerPhone || buyer?.phone || currentUserProfile.phone,
    profilePhoto: buyer?.profilePhoto ?? null,
  };

  // Snapshot the vendor's configured M-PESA payment methods the same way
  // production checkout does: prefer the real vendor profile when one is
  // linked, then the prototype store's configured methods, and finally fall
  // back to the store phone as the Send Money number.
  const paymentVendor = normalizeVendorPaymentMethods(
    v?.mpesaPaymentMethods ?? store?.mpesaPaymentMethods ?? null,
    v?.phone ?? store?.phone ?? null
  );

  const items = cartItems.map((cartItem) => {
    const resolved = getProductById(cartItem.id);
    const referencedMasterId =
      resolved ? (resolved.product.masterProductId ?? null) : null;
    return {
      id: cartItem.id,
      name: cartItem.name,
      quantity: cartItem.quantity,
      pricePerKg: cartItem.pricePerKg,
      subtotal: cartItem.pricePerKg * cartItem.quantity,
      masterProductId: cartItem.masterProductId ?? referencedMasterId,
      unit: cartItem.unit || 'kg',
    };
  });

  const now = new Date();
  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');

  return {
    id: `test-order-${now.getTime()}-${testOrderSeq}`,
    orderNumber,
    buyerName,
    buyerPhone,
    vendorName: vendorIdentity.storeName,
    items,
    subtotal,
    packaging: packaging || null,
    packagingFee: packagingFee || 0,
    total,
    status: 'New',
    paymentStatus: 'Test (No Payment)',
    deliveryStatus: 'Awaiting Accept',
    isTestOrder: true,
    createdAt: `Now, ${hh}:${mm}`,
    identity: {
      buyer: buyerIdentity,
      vendor: vendorIdentity,
    },
    delivery: {
      pickupLocation,
      deliveryLocation:
        deliveryLocation?.address ?? 'Buyer delivery address (placeholder)',
      distanceKm: 8,
    },
    deliveryLocation: deliveryLocation || null,
    paymentVendor: paymentVendor || null,
  };
}

function submitTestOrder(order) {
  buyerOrders.unshift(order);
  vendorOrders.unshift(order);
  return order;
}

function updateOrderRecord(orderId, updates) {
  const order = getBuyerOrderById(orderId) || getVendorOrderById(orderId);
  if (order) {
    Object.assign(order, updates);
  }
  return order;
}

function addTestDeliveryRequest(order) {
  const existingIndex = deliveryRequests.findIndex(
    (request) => request.orderId === order.id
  );
  if (existingIndex >= 0) {
    deliveryRequests.splice(existingIndex, 1);
  }
  deliveryRequests.unshift({
    id: `dr-test-${order.orderNumber}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    vendorStore: order.vendorName,
    pickupLocation: order.delivery?.pickupLocation,
    deliveryLocation: order.deliveryLocation ?? order.delivery?.deliveryLocation ?? null,
    distanceKm: order.delivery?.distanceKm,
    items: order.items ?? [],
    packaging: order.packaging ?? null,
    packagingFee: order.packagingFee ?? 0,
    subtotal: order.subtotal ?? 0,
    total: order.total ?? 0,
    deliveryStatus: order.deliveryStatus ?? 'Awaiting Accept',
    deliveryAccepted: order.deliveryAccepted ?? false,
    vendor:
      order.identity?.vendor || {
        uid: null,
        vendorId: null,
        fullName: order.vendorName,
        storeName: order.vendorName,
        location: order.delivery.pickupLocation,
        phone: null,
        profilePhoto: null,
      },
    buyer:
      order.identity?.buyer || {
        uid: null,
        fullName: order.buyerName,
        phone: order.buyerPhone,
        profilePhoto: null,
      },
    assignedDelivery: order.assignedDelivery ?? null,
  });
}

function setActiveDeliveryFromOrder(order) {
  Object.assign(activeDelivery, {
    orderNumber: order.orderNumber,
    vendorStore: order.vendorName,
    pickupLocation: order.delivery?.pickupLocation ?? order.vendorName,
    deliveryLocation: order.deliveryLocation ?? order.delivery?.deliveryLocation ?? 'Buyer delivery address (placeholder)',
    buyerPhone: order.buyerPhone,
    parcelStatus: 'Pending Pickup',
    items: order.items ?? [],
    packaging: order.packaging ?? null,
    packagingFee: order.packagingFee ?? 0,
    subtotal: order.subtotal ?? 0,
    total: order.total ?? 0,
    deliveryStatus: order.deliveryStatus ?? 'Out for Delivery',
    deliveryAccepted: order.deliveryAccepted ?? false,
    vendor:
      order.identity?.vendor || {
        uid: null,
        vendorId: null,
        fullName: order.vendorName,
        storeName: order.vendorName,
        location: order.delivery?.pickupLocation ?? order.vendorName,
        phone: null,
        profilePhoto: null,
      },
    buyer:
      order.identity?.buyer || {
        uid: null,
        fullName: order.buyerName,
        phone: order.buyerPhone,
        profilePhoto: null,
      },
    assignedDelivery: order.assignedDelivery ?? null,
  });
  return activeDelivery;
}

function addDeliveryHistoryRecord(order) {
  deliveryHistory.unshift({
    id: `dh-test-${order.orderNumber}`,
    orderNumber: order.orderNumber,
    vendorStore: order.vendorName,
    date: 'Now',
    status: 'Delivered',
    vendor: order.identity?.vendor ?? null,
    buyer: order.identity?.buyer ?? null,
    assignedDelivery: order.assignedDelivery ?? null,
  });
}

function getOrderByOrderNumber(orderNumber) {
  return (
    buyerOrders.find((order) => order.orderNumber === orderNumber) ||
    vendorOrders.find((order) => order.orderNumber === orderNumber) ||
    null
  );
}

export {
  buildTestOrderFromCart,
  submitTestOrder,
  updateOrderRecord,
  addTestDeliveryRequest,
  setActiveDeliveryFromOrder,
  addDeliveryHistoryRecord,
  getOrderByOrderNumber,
};