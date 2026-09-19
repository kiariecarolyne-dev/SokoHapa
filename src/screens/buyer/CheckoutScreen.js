import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import { fetchUserProfile, useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { currentUserProfile, getStoreById as getMockStoreById } from '../../services/mockData';
import { getStoreById as getRealStoreById, isStoreTemporarilyUnavailable } from '../../services/storeService';
import { createOrder, generateOrderNumber } from '../../services/orderService';
import { formatUnitQuantity } from '../../utils/productCatalogue';
import { TEST_MODE, placeTestOrder } from '../../utils/testMode';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';
import { formatKES } from '../../utils/format';
import {
  buildOrderPaymentVendorSnapshot,
  buildPaymentMethodRows,
  normalizeVendorPaymentMethods,
} from '../../utils/paymentMethods';

export const PACKAGING_OPTIONS = [
  { id: 'small-bag', name: 'Small Carrier Bag', price: 20 },
  { id: 'large-bag', name: 'Large Carrier Bag', price: 50 },
];

export default function CheckoutScreen({ navigation }) {
  const { items, subtotal, clearCart } = useCart();
  const { currentUser, userProfile } = useAuth();
  const [packaging, setPackaging] = useState(null);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [copied, setCopied] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDirections, setDeliveryDirections] = useState('');
  const [placing, setPlacing] = useState(false);

  const packagingFee = packaging ? packaging.price : 0;
  const orderTotal = subtotal + packagingFee;

  // Resolves the vendor's M-PESA payment details (Send Money number and/or
  // Buy Goods Till number) for the pay-vendor card so the buyer sees the same
  // numbers that get snapshotted onto the order (paymentVendor) via
  // createOrder. When the vendor has configured nothing, the store phone is
  // used as the Send Money number so existing vendors keep a working method.
  const firstItem = items[0];
  useEffect(() => {
    if (!firstItem) {
      setVendorInfo(null);
      return;
    }
    let cancelled = false;
    const storeId = firstItem.storeId;
    const storeName = firstItem.storeName || null;
    const vendorName = firstItem.vendorName || null;
    const mockStore = getMockStoreById(storeId);
    let fallbackPhone = mockStore?.phone || null;
    let methodsConfig = mockStore?.mpesaPaymentMethods || null;
    (async () => {
      try {
        const real = await getRealStoreById(storeId);
        if (real) {
          fallbackPhone = real.phone || fallbackPhone;
          let profile = null;
          if (real.vendorUid) {
            try {
              profile = await fetchUserProfile(real.vendorUid);
            } catch (error) {
              profile = null;
            }
          }
          methodsConfig = profile?.mpesaPaymentMethods || null;
          fallbackPhone = profile?.phone || fallbackPhone;
        }
      } catch (error) {
        // Fall back to the cart snapshot / mock store data.
      }
      if (!cancelled) {
        setVendorInfo({
          storeName: storeName || mockStore?.name || null,
          vendorName: vendorName || mockStore?.vendorName || null,
          phone: fallbackPhone,
          methods: normalizeVendorPaymentMethods(methodsConfig, fallbackPhone),
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [firstItem?.storeId, firstItem?.storeName, firstItem?.vendorName]);

  const copyMethod = async (method) => {
    if (!method?.copyValue) {
      return;
    }
    try {
      await Clipboard.setStringAsync(method.copyValue);
      setCopied(method.id);
      setTimeout(() => setCopied(null), 2000);
      const isTill = method.id === 'till';
      Alert.alert(
        isTill ? 'Till Number Copied' : 'Number Copied',
        isTill
          ? `Till ${method.displayValue} copied. Open M-PESA, select Buy Goods Till / Lipa na M-PESA (Till), enter the till number and amount, and pay ${formatKES(orderTotal)} directly to the vendor.`
          : `${method.displayValue} copied. Open M-PESA, select Send Money / Lipa na M-PESA, and pay ${formatKES(orderTotal)} directly to the vendor.`
      );
    } catch (error) {
      Alert.alert(
        'Copy Failed',
        'Could not copy the number. Please copy it manually.'
      );
    }
  };

  const methodRows = buildPaymentMethodRows(
    vendorInfo?.methods,
    vendorInfo?.phone
  );

  // Resolves the real vendor profile from Firestore when the first cart item
  // belongs to a store linked to a real vendor UID. Returns null otherwise so
  // prototype stores keep their existing static vendor identity.
  const resolveVendorProfile = async (cartItems) => {
    const firstItem = cartItems[0];
    const store = firstItem?.storeId ? getMockStoreById(firstItem.storeId) : null;
    if (!store?.vendorUid) return null;
    try {
      const profile = await fetchUserProfile(store.vendorUid);
      return profile && profile.role === 'vendor' ? profile : null;
    } catch (error) {
      return null;
    }
  };

  const placeOrderBody = async () => {
    if (!packaging) {
      Alert.alert(
        'Carrier Bag Required',
        'Please choose a carrier bag before placing your order.'
      );
      return;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert(
        'Delivery Location Required',
        'Please enter where you want this order delivered.'
      );
      return;
    }

    if (TEST_MODE) {
      const vendorProfile = await resolveVendorProfile(items);
      const order = placeTestOrder({
        cartItems: items,
        subtotal,
        packaging,
        packagingFee,
        total: orderTotal,
        buyerName: userProfile?.fullName || currentUserProfile.fullName,
        buyerPhone: userProfile?.phone || currentUserProfile.phone,
        buyer: {
          uid: userProfile?.uid ?? currentUser?.uid ?? null,
          fullName: userProfile?.fullName || currentUserProfile.fullName,
          phone: userProfile?.phone || currentUserProfile.phone,
          profilePhoto: userProfile?.profilePhoto ?? null,
        },
        vendorProfile,
        deliveryLocation: {
          address: deliveryAddress.trim(),
          directions: deliveryDirections.trim() || null,
        },
      });
      if (order) {
        clearCart();
        Alert.alert(
          'Test Order Placed',
          `Order ${order.orderNumber} placed in TEST MODE with ${packaging.name}. Pay the vendor directly via M-PESA using one of the methods shown on the screen, then report the payment on the order. The delivery fee is paid separately in cash to the delivery person.`,
          [
            {
              text: 'View My Orders',
              onPress: () => {
                navigation.popToTop();
                navigation.navigate('Orders');
              },
            },
            { text: 'Keep Shopping', style: 'cancel', onPress: () => {} },
          ]
        );
        return;
      }
    }

    // NORMAL (non-test) mode: create a real Firestore order for the actual
    // authenticated buyer, using the vendor/store UIDs snapshotted on the cart.
    const buyerUid = userProfile?.uid || currentUser?.uid;
    if (!buyerUid) {
      Alert.alert('Sign In Required', 'Please sign in to place an order.');
      return;
    }

    const firstItem = items[0];
    const storeId = firstItem?.storeId;
    const vendorUid = firstItem?.vendorUid;
    if (!storeId || !vendorUid) {
      Alert.alert(
        'Checkout Error',
        'This cart is not linked to a vendor store. Remove the item and add it again from the store.'
      );
      return;
    }

    const distinctStores = new Set(
      items.map((item) => item.storeId).filter(Boolean)
    );
    if (distinctStores.size > 1) {
      Alert.alert(
        'One Store at a Time',
        'Your cart contains items from more than one store. Please check out one store at a time.'
      );
      return;
    }

    let store = null;
    let sellerProfile = null;
    try {
      store = await getRealStoreById(storeId);
    } catch (error) {
      store = null;
    }
    const resolvedVendorUid = store?.vendorUid || vendorUid;
    const storeName = store?.name || firstItem.storeName;

    if (resolvedVendorUid) {
      try {
        sellerProfile = await fetchUserProfile(resolvedVendorUid);
      } catch (error) {
        sellerProfile = null;
      }
    }

    // Snapshot the vendor's current M-PESA payment methods onto the order.
    // Always a fixed { sendMoneyNumber, tillNumber } map (never null) using the
    // vendor's configured values verbatim, falling back to the store phone as
    // the Send Money number. The display card still renders normalized numbers
    // via buildPaymentMethodRows.
    const paymentVendor = buildOrderPaymentVendorSnapshot(
      sellerProfile?.mpesaPaymentMethods || null,
      store?.phone || sellerProfile?.phone || ''
    );

    // The rules gate NEW orders on the vendor being entitled (active, unexpired
    // subscription). Mirror that server-side check here so the buyer sees a
    // clear message instead of the cryptic Firestore permission denial.
    if (!TEST_MODE && isStoreTemporarilyUnavailable(store, sellerProfile)) {
      Alert.alert(
        'Vendor Unavailable',
        'This store is not accepting new orders right now because the vendor subscription is not active. Please try again later or order from another store.'
      );
      return;
    }

    const orderItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      pricePerKg: item.pricePerKg,
      quantity: item.quantity,
      unit: item.unit || 'kg',
      masterProductId: item.masterProductId ?? null,
      subtotal: item.pricePerKg * item.quantity,
    }));

    try {
      const order = await createOrder({
        buyerUid,
        vendorUid: resolvedVendorUid,
        storeId,
        orderNumber: generateOrderNumber(),
        items: orderItems,
        subtotal,
        packaging,
        packagingFee,
        total: orderTotal,
        buyer: {
          uid: buyerUid,
          fullName: userProfile?.fullName || '',
          phone: userProfile?.phone || '',
          profilePhoto: userProfile?.profilePhoto ?? null,
        },
        vendor: {
          uid: resolvedVendorUid,
          fullName: store?.vendorName || firstItem.vendorName || '',
          storeName,
          location: store?.location || '',
          phone: store?.phone || '',
          profilePhoto: store?.profilePhoto ?? null,
        },
        deliveryLocation: {
          address: deliveryAddress.trim(),
          directions: deliveryDirections.trim() || null,
        },
        paymentVendor,
      });
      if (!order) {
        Alert.alert('Order Failed', 'Could not create the order. Please try again.');
        return;
      }
      clearCart();
      Alert.alert(
        'Order Placed',
        `Order ${order.orderNumber} placed. Pay the vendor directly via M-PESA using one of the methods shown on the order, then report the payment. The delivery fee is paid separately in cash to the delivery person when your order is delivered.`,
        [
          {
            text: 'View My Orders',
            onPress: () => {
              navigation.popToTop();
              navigation.navigate('Orders');
            },
          },
          { text: 'Keep Shopping', style: 'cancel', onPress: () => {} },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Order Failed',
        error?.message || 'Could not place the order. Please try again.'
      );
    }
  };

  // Guards against double-taps creating the same order twice. All of the
  // order-creation work lives in placeOrderBody; this wrapper serializes it.
  const handlePlaceOrder = async () => {
    if (placing) return;
    setPlacing(true);
    try {
      await placeOrderBody();
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>Nothing to check out</Text>
        <PrimaryButton
          title="Continue Shopping"
          onPress={() => navigation.navigate('Home')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.card}>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemMeta}>
                  {formatUnitQuantity(item.quantity, item.unit)} × {formatKES(item.pricePerKg)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>{formatKES(item.pricePerKg * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <SummaryRow label="Products" value={formatKES(subtotal)} />
          <SummaryRow label="Packaging" value={formatKES(packagingFee)} />
          <View style={styles.divider} />
          <SummaryRow label="Order Total" value={formatKES(orderTotal)} bold />
        </View>

        <Text style={styles.sectionTitle}>Choose Carrier Bag</Text>
        {PACKAGING_OPTIONS.map((option) => {
          const selected = packaging?.id === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.85}
              style={[styles.packagingRow, selected && styles.packagingRowSelected]}
              onPress={() => setPackaging(option)}
            >
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selected ? colors.primary : colors.textMuted}
              />
              <Text style={styles.packagingName}>{option.name}</Text>
              <Text style={styles.packagingPrice}>{formatKES(option.price)}</Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.sectionTitle}>Delivery Fee</Text>
        <View style={styles.placeholderCard}>
          <Ionicons name="cash-outline" size={20} color={colors.primary} />
          <Text style={styles.placeholderText}>
            Delivery fee is paid separately in cash directly to the delivery
            person. The delivery fee depends on the delivery distance.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Delivery Location</Text>
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Where should we deliver this order?</Text>
          <TextInput
            style={styles.textInput}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            placeholder="Enter the exact place where you want this order delivered"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={300}
          />
          <Text style={styles.inputLabel}>Additional directions (optional)</Text>
          <TextInput
            style={styles.textInput}
            value={deliveryDirections}
            onChangeText={setDeliveryDirections}
            placeholder="e.g. Blue Gate, 2nd floor, Room 12, near the supermarket"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
          />
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.payVendorCard}>
          <View style={styles.payVendorHeader}>
            <View style={styles.payVendorIconWrap}>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.payVendorTitle}>Pay Vendor Directly via M-PESA</Text>
          </View>
          <Text style={styles.payVendorName}>
            {vendorInfo?.vendorName || vendorInfo?.storeName || 'Vendor'}
          </Text>
          {methodRows.length > 0 ? (
            <View>
              {methodRows.map((method, index) => (
                <View key={method.id} style={styles.payNumberRow}>
                  <View style={styles.payNumberWrap}>
                    <Text style={styles.payMethodLabel}>{method.label}</Text>
                    <Text style={styles.payNumber}>{method.displayValue}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyMethod(method)}
                  >
                    <Ionicons
                      name={copied === method.id ? 'checkmark-circle' : 'copy-outline'}
                      size={18}
                      color={colors.primaryDark}
                    />
                    <Text style={styles.copyText}>
                      {copied === method.id ? 'Copied' : 'Copy Number'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
              {methodRows.length > 1 ? (
                <Text style={styles.payOrSeparator}>
                  Use either method to pay - both reach the same vendor.
                </Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.payVendorNoNumber}>
              The vendor has not added M-PESA payment details yet. Contact them
              before paying.
            </Text>
          )}
          <View style={styles.payAmountRow}>
            <Text style={styles.payAmountLabel}>Amount to pay</Text>
            <Text style={styles.payAmountValue}>{formatKES(orderTotal)}</Text>
          </View>
          <View style={styles.payNotice}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.success} />
            <Text style={styles.payNoticeText}>
              Pay this order amount directly to the vendor using one of the
              methods above. SokoHapa does NOT receive your money — this is a
              direct payment to the vendor.
            </Text>
          </View>
          <View style={styles.payStepsCard}>
            <Text style={styles.payStepsText}>
              {'1. Open M-PESA\n2. Send Money (to the number) or Buy Goods Till (enter the till number)\n3. Enter the amount\n4. Confirm with your PIN'}
            </Text>
          </View>
          <View style={styles.cashReminder}>
            <Ionicons name="cash-outline" size={18} color={colors.warning} />
            <Text style={styles.cashReminderText}>
              The delivery fee is paid separately in cash directly to the
              delivery person.
            </Text>
          </View>
        </View>

        {TEST_MODE ? (
          <View style={styles.testModeCard}>
            <Ionicons name="flask-outline" size={18} color={colors.warning} />
            <Text style={styles.testModeText}>
              TEST MODE: placing this order creates an in-memory test order shared
              with the vendor and delivery screens. SokoHapa takes no payment -
              pay the vendor directly via M-PESA, and the delivery fee is paid
              separately in cash.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Order Total</Text>
          <Text style={styles.footerValue}>{formatKES(orderTotal)}</Text>
        </View>
        <PrimaryButton
          title={placing ? 'Placing Order…' : 'Place Order'}
          onPress={handlePlaceOrder}
          icon="checkmark"
          disabled={placing}
        />
      </View>
    </View>
  );
}

function SummaryRow({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.rowLabelBold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  emptyTitle: {
    ...typography.title,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  itemName: {
    fontSize: 14,
    color: colors.text,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  rowLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  rowLabelBold: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  rowValueBold: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  packagingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  packagingRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  packagingName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  packagingPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  placeholderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  placeholderText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  payVendorCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    padding: spacing.md,
    ...shadow,
  },
  payVendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  payVendorIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.round,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  payVendorTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  payVendorName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  payVendorNoNumber: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  payNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  payNumberWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  payMethodLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  payNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  payOrSeparator: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  copyText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
    marginLeft: 4,
  },
  payAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  payAmountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  payAmountValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  payNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  payNoticeText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.success,
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
  payStepsCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  payStepsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cashReminder: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  cashReminderText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.warning,
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
  testModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  testModeText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.warning,
    marginLeft: spacing.sm,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.md,
    ...shadow,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  footerLabel: {
    ...typography.subtitle,
  },
  footerValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryDark,
  },
});