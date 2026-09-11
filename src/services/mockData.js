export const categories = ['Vegetables', 'Cereals', 'Fruits', 'Grains', 'Other'];

export const stores = [
  {
    id: 'store-1',
    name: 'Mama Njeri Fresh Farm',
    vendorName: 'Mary Njeri',
    location: 'Kiambu Road, Nairobi',
    rating: 4.8,
    status: 'Open',
    description: 'Fresh vegetables and fruits straight from our family farm.',
    products: [
      {
        id: 'p-1',
        name: 'Tomatoes',
        category: 'Vegetables',
        pricePerKg: 100,
        availableQuantity: 50,
        available: true,
        description: 'Ripe, juicy tomatoes picked daily from the farm.',
      },
      {
        id: 'p-2',
        name: 'Sukuma Wiki (Kale)',
        category: 'Vegetables',
        pricePerKg: 60,
        availableQuantity: 30,
        available: true,
        description: 'Fresh organic kale, rich in iron and vitamins.',
      },
      {
        id: 'p-3',
        name: 'Onions',
        category: 'Vegetables',
        pricePerKg: 120,
        availableQuantity: 40,
        available: true,
        description: 'Clean, dry red onions with a strong flavour.',
      },
      {
        id: 'p-4',
        name: 'Avocados',
        category: 'Fruits',
        pricePerKg: 150,
        availableQuantity: 25,
        available: true,
        description: 'Butter-soft avocados, ideal for salads.',
      },
      {
        id: 'p-5',
        name: 'Green Peppers',
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
    description: 'Wholesale and retail cereals and grains in bulk.',
    products: [
      {
        id: 'p-6',
        name: 'Rice (Pishori)',
        category: 'Cereals',
        pricePerKg: 220,
        availableQuantity: 120,
        available: true,
        description: 'Long grain aromatic Pishori rice.',
      },
      {
        id: 'p-7',
        name: 'Maize Grains',
        category: 'Grains',
        pricePerKg: 80,
        availableQuantity: 200,
        available: true,
        description: 'Dry maize grains, perfect for ugali flour.',
      },
      {
        id: 'p-8',
        name: 'Beans (Nyayo)',
        category: 'Grains',
        pricePerKg: 160,
        availableQuantity: 90,
        available: true,
        description: 'Clean Nyayo beans for stews and githeri.',
      },
      {
        id: 'p-9',
        name: 'Millet',
        category: 'Cereals',
        pricePerKg: 180,
        availableQuantity: 45,
        available: true,
        description: 'Whole millet grains for porridge.',
      },
      {
        id: 'p-10',
        name: 'Green Grams',
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
    description: 'Premium fresh fruits sourced from the Rift Valley.',
    products: [
      {
        id: 'p-11',
        name: 'Oranges',
        category: 'Fruits',
        pricePerKg: 90,
        availableQuantity: 60,
        available: true,
        description: 'Sweet juicy oranges from Murang’a.',
      },
      {
        id: 'p-12',
        name: 'Bananas',
        category: 'Fruits',
        pricePerKg: 70,
        availableQuantity: 80,
        available: true,
        description: 'Ripe sweet bananas, source of potassium.',
      },
      {
        id: 'p-13',
        name: 'Mangoes',
        category: 'Fruits',
        pricePerKg: 130,
        availableQuantity: 55,
        available: true,
        description: 'Kent mangoes, sweet and fibre-free.',
      },
      {
        id: 'p-14',
        name: 'Pineapples',
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
    description: 'Daily groceries and fresh market produce.',
    products: [
      {
        id: 'p-15',
        name: 'Carrots',
        category: 'Vegetables',
        pricePerKg: 110,
        availableQuantity: 40,
        available: true,
        description: 'Crunchy carrots from Naivasha.',
      },
      {
        id: 'p-16',
        name: 'Cabbages',
        category: 'Vegetables',
        pricePerKg: 50,
        availableQuantity: 70,
        available: true,
        description: 'Heavy, compact cabbages for your kitchen.',
      },
      {
        id: 'p-17',
        name: 'Potatoes (Sherehe)',
        category: 'Vegetables',
        pricePerKg: 95,
        availableQuantity: 100,
        available: true,
        description: 'Floury potatoes for chips and stews.',
      },
      {
        id: 'p-18',
        name: 'Sweet Potatoes',
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
};

export const vendorOrders = [
  {
    id: 'vo-1',
    orderNumber: 'SH-1042',
    buyerName: 'Brian Mwangi',
    items: [
      { name: 'Tomatoes', quantity: 2, pricePerKg: 100 },
      { name: 'Sukuma Wiki (Kale)', quantity: 1, pricePerKg: 60 },
    ],
    total: 260,
    status: 'New',
    deliveryStatus: 'Awaiting Accept',
    createdAt: 'Today, 09:42',
  },
  {
    id: 'vo-2',
    orderNumber: 'SH-1041',
    buyerName: 'Grace Wanjiru',
    items: [
      { name: 'Avocados', quantity: 3, pricePerKg: 150 },
    ],
    total: 450,
    status: 'Preparing',
    deliveryStatus: 'Preparing Order',
    createdAt: 'Today, 08:10',
  },
  {
    id: 'vo-3',
    orderNumber: 'SH-1038',
    buyerName: 'Kevin Ochieng',
    items: [
      { name: 'Onions', quantity: 1, pricePerKg: 120 },
      { name: 'Tomatoes', quantity: 2, pricePerKg: 100 },
    ],
    total: 320,
    status: 'Ready for Pickup',
    deliveryStatus: 'Parcel Ready',
    createdAt: 'Yesterday, 16:33',
  },
  {
    id: 'vo-4',
    orderNumber: 'SH-1030',
    buyerName: 'Faith Muthoni',
    items: [
      { name: 'Tomatoes', quantity: 5, pricePerKg: 100 },
    ],
    total: 500,
    status: 'Out for Delivery',
    deliveryStatus: 'With Rider',
    createdAt: 'Yesterday, 11:05',
  },
  {
    id: 'vo-5',
    orderNumber: 'SH-1021',
    buyerName: 'Samuel Kiptoo',
    items: [
      { name: 'Sukuma Wiki (Kale)', quantity: 2, pricePerKg: 60 },
      { name: 'Avocados', quantity: 1, pricePerKg: 150 },
    ],
    total: 270,
    status: 'Completed',
    deliveryStatus: 'Delivered',
    createdAt: 'Mon, 14:20',
  },
];

export function getVendorOrderById(id) {
  return vendorOrders.find((order) => order.id === id) || null;
}

export const deliveryPersons = [
  {
    id: 'dp-1',
    fullName: 'Collins Otieno',
    vehicleType: 'motorcycle',
    plateNumber: 'KDK 123A',
    phone: '+254 700 111 222',
    availability: 'Available',
    rating: 4.9,
  },
  {
    id: 'dp-2',
    fullName: 'Joyce Wanjala',
    vehicleType: 'motor_vehicle',
    plateNumber: 'KDP 456B',
    phone: '+254 700 333 444',
    availability: 'Available',
    rating: 4.7,
  },
  {
    id: 'dp-3',
    fullName: 'Dennis Karanja',
    vehicleType: 'motorcycle',
    plateNumber: 'KDH 789C',
    phone: '+254 700 555 666',
    availability: 'Busy',
    rating: 4.5,
  },
  {
    id: 'dp-4',
    fullName: 'Salim Abdalla',
    vehicleType: 'motor_vehicle',
    plateNumber: 'KDN 321D',
    phone: '+254 700 777 888',
    availability: 'Available',
    rating: 4.8,
  },
];

export const buyerOrders = [
  {
    id: 'bo-1',
    orderNumber: 'SH-1042',
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
  },
  {
    id: 'bo-2',
    orderNumber: 'SH-1021',
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
  },
  {
    id: 'bo-3',
    orderNumber: 'SH-0988',
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
    deliveryLocation: 'South B Estate, Nairobi',
    distanceKm: 12,
    deliveryFee: 150,
  },
  {
    id: 'dr-2',
    orderNumber: 'SH-1051',
    vendorStore: 'Ukulima Cereals Depot',
    pickupLocation: 'Gikomba, Nairobi',
    deliveryLocation: 'Kasarani, Nairobi',
    distanceKm: 18,
    deliveryFee: 220,
  },
  {
    id: 'dr-3',
    orderNumber: 'SH-1052',
    vendorStore: 'Fruits of the Valley',
    pickupLocation: 'Karen, Nairobi',
    deliveryLocation: 'Kilimani, Nairobi',
    distanceKm: 9,
    deliveryFee: 130,
  },
];

export const activeDelivery = {
  orderNumber: 'SH-1045',
  vendorStore: 'Shamba Bora Groceries',
  pickupLocation: 'Westlands, Nairobi',
  deliveryLocation: 'Lavington, Nairobi',
  buyerPhone: '+254 722 000 111',
  parcelStatus: 'Pending Pickup',
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
  deliveryFee,
  total,
  buyerName = currentUserProfile.fullName,
  buyerPhone = currentUserProfile.phone,
}) {
  testOrderSeq += 1;
  const orderNumber = `SH-${1100 + testOrderSeq}`;
  const firstCartItem = cartItems[0] || {};
  const firstLookup = getProductById(firstCartItem.id);
  const store = firstLookup ? firstLookup.store : getStoreById('store-1');
  const vendorStoreName = store ? store.name : currentVendor.storeName;
  const pickupLocation = store ? store.location : currentVendor.location;

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
    vendorName: vendorStoreName,
    items,
    subtotal,
    deliveryFee,
    total,
    status: 'New',
    paymentStatus: 'Test (No Payment)',
    deliveryStatus: 'Awaiting Accept',
    isTestOrder: true,
    createdAt: `Now, ${hh}:${mm}`,
    delivery: {
      pickupLocation,
      deliveryLocation: 'Buyer delivery address (placeholder)',
      distanceKm: 8,
      deliveryFee,
    },
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
  deliveryRequests.unshift({
    id: `dr-test-${order.orderNumber}`,
    orderNumber: order.orderNumber,
    vendorStore: order.vendorName,
    pickupLocation: order.delivery.pickupLocation,
    deliveryLocation: order.delivery.deliveryLocation,
    distanceKm: order.delivery.distanceKm,
    deliveryFee: order.delivery.deliveryFee,
  });
}

function setActiveDeliveryFromOrder(order) {
  Object.assign(activeDelivery, {
    orderNumber: order.orderNumber,
    vendorStore: order.vendorName,
    pickupLocation: order.delivery.pickupLocation,
    deliveryLocation: order.delivery.deliveryLocation,
    buyerPhone: order.buyerPhone,
    parcelStatus: 'Pending Pickup',
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
    deliveryFee: order.delivery.deliveryFee,
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