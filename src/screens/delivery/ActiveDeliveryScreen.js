import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import IdentityCard from '../../components/IdentityCard';
import PrimaryButton from '../../components/PrimaryButton';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { activeDelivery } from '../../services/mockData';
import { onOrder } from '../../services/orderService';
import {
  markDeliveryDelivered,
  markDeliveryPickedUp,
  normalizeDeliveryLocation,
  onActiveDelivery,
  toActiveDelivery,
} from '../../services/deliveryService';
import { formatUnitQuantity } from '../../utils/productCatalogue';
import { TEST_MODE, completeTestDelivery } from '../../utils/testMode';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';
import { formatKES } from '../../utils/format';

export default function ActiveDeliveryScreen({ navigation }) {
  const { currentUser, userProfile } = useAuth();
  const deliveryUid = userProfile?.uid || currentUser?.uid;
  const [parcelStatus, setParcelStatus] = useState(activeDelivery.parcelStatus);
  const [assignment, setAssignment] = useState(null);
  const [order, setOrder] = useState(null);
  // assignmentStatus: 'loading' | 'none' | 'active'
  const [assignmentStatus, setAssignmentStatus] = useState('loading');
  // orderStatus: 'idle' | 'loading' | 'ready' | 'missing' | 'error'
  const [orderStatus, setOrderStatus] = useState('idle');
  const [orderError, setOrderError] = useState(null);
  // orderCancelled tracks the defensive state where this delivery was assigned
  // but the order was later cancelled. In that case the action buttons should
  // be disabled and an explanatory notice shown.
  const [orderCancelled, setOrderCancelled] = useState(false);

  useEffect(() => {
    if (TEST_MODE) return;
    if (!deliveryUid) {
      setAssignment(null);
      setAssignmentStatus('none');
      return;
    }
    setAssignmentStatus('loading');
    const unsubscribe = onActiveDelivery(deliveryUid, (next) => {
      setAssignment(next);
      setAssignmentStatus(next ? 'active' : 'none');
    });
    return unsubscribe;
  }, [deliveryUid]);

  useEffect(() => {
    if (TEST_MODE) return;
    if (!assignment?.orderId) {
      setOrder(null);
      setOrderStatus('idle');
      setOrderError(null);
      return;
    }
    setOrder(null);
    setOrderStatus('loading');
    setOrderError(null);
    setOrderCancelled(false);
    const unsubscribe = onOrder(
      assignment.orderId,
      (next, meta = {}) => {
        if (next) {
          // Defensive check: a cancelled order must not show active delivery
          // actions. The Firestore rules mean this should not normally happen
          // (cancelled orders have no active assignment), but this guards
          // against stale or inconsistent data.
          const isCancelled = next.status === 'Cancelled' || next.status === 'CANCELLED';
          setOrder(next);
          setOrderStatus('ready');
          setOrderCancelled(isCancelled);
          setOrderError(null);
        } else if (meta.exists === false) {
          // Definitive not-found: the read succeeded but the order document
          // does not exist at orders/{orderId}.
          setOrder(null);
          setOrderStatus('missing');
          setOrderError(null);
          console.error(
            '[FIRESTORE/DELIVERY FAILURE]',
            'Operation: onOrder (active delivery order lookup)',
            `Role: delivery`,
            `DeliveryUID: ${deliveryUid ?? 'unknown'}`,
            `AssignmentID: ${assignment.id ?? 'unknown'}`,
            `OrderID: ${assignment.orderId}`,
            'Reason: not-found',
            'Message: order document exists() === false for this assignment'
          );
        }
        // next === null without a definitive meta => listener still pending.
      },
      {
        onError: (error) => {
          setOrder(null);
          setOrderStatus('error');
          setOrderError({
            code: error?.code ?? 'unknown',
            message: error?.message ?? String(error),
          });
          const isPermission =
            error?.code === 'permission-denied' || /permission/i.test(error?.message ?? '');
          console.error(
            '[FIRESTORE/DELIVERY FAILURE]',
            'Operation: onOrder (active delivery order lookup)',
            `Role: delivery`,
            `DeliveryUID: ${deliveryUid ?? 'unknown'}`,
            `AssignmentID: ${assignment.id ?? 'unknown'}`,
            `OrderID: ${assignment.orderId}`,
            `Reason: ${isPermission ? 'permission-denied' : 'firebase-error'}`,
            `Code: ${error?.code ?? 'unknown'}`,
            `Message: ${error?.message ?? String(error)}`
          );
        },
      }
    );
    return unsubscribe;
  }, [assignment?.orderId]);

  const handlePickedUp = async () => {
    if (TEST_MODE) {
      setParcelStatus('Picked Up');
      Alert.alert('Picked Up', 'Parcel marked as picked up.');
      return;
    }
    if (!assignment?.orderId) return;
    if (orderCancelled) {
      Alert.alert(
        'Order Cancelled',
        'This order was cancelled and cannot be updated.'
      );
      return;
    }
    try {
      await markDeliveryPickedUp(assignment.orderId);
    } catch (error) {
      Alert.alert(
        'Update Failed',
        error?.message || 'Could not mark the parcel as picked up.'
      );
    }
  };

  const handleDelivered = async () => {
    if (TEST_MODE) {
      const deliveryOrderNumber = activeDelivery.orderNumber;
      const completed = completeTestDelivery(deliveryOrderNumber);
      if (!completed) {
        Alert.alert(
          'Not Completed',
          'Completing a delivery is only available in TEST MODE (development).'
        );
        return;
      }
      setParcelStatus('Delivered');
      Alert.alert(
        'Delivered',
        `Parcel for order ${deliveryOrderNumber} marked as delivered. The order is now Completed for the buyer and vendor, and was added to your delivery history.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }
    if (!assignment?.orderId) return;
    if (orderCancelled) {
      Alert.alert(
        'Order Cancelled',
        'This order was cancelled and cannot be updated.'
      );
      return;
    }
    try {
      await markDeliveryDelivered(assignment.orderId);
      Alert.alert(
        'Delivered',
        `Parcel for order ${order?.orderNumber || assignment?.orderNumber} marked as delivered. The order is now Completed for the buyer and vendor, and was added to your delivery history.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Update Failed',
        error?.message || 'Could not mark the parcel as delivered.'
      );
    }
  };

  if (!TEST_MODE) {
    if (assignmentStatus === 'loading') {
      return (
        <View style={styles.fallbackWrap}>
          <Text style={styles.fallbackText}>Loading active delivery…</Text>
        </View>
      );
    }
    if (assignmentStatus === 'none') {
      return (
        <View style={styles.emptyWrap}>
          <MaterialCommunityIcons name="motorbike" size={34} color={colors.textMuted} />
          <Text style={styles.emptyText}>No active delivery right now.</Text>
        </View>
      );
    }
    if (orderStatus === 'loading') {
      return (
        <View style={styles.fallbackWrap}>
          <Text style={styles.fallbackText}>Loading delivery order details…</Text>
        </View>
      );
    }
    if (orderStatus === 'missing') {
      return (
        <View style={styles.fallbackWrap}>
          <Ionicons name="alert-circle-outline" size={34} color={colors.warning} />
          <Text style={styles.fallbackText}>
            The order for this delivery could not be found.
          </Text>
        </View>
      );
    }
    if (orderStatus === 'error') {
      return (
        <View style={styles.fallbackWrap}>
          <Ionicons name="cloud-offline-outline" size={34} color={colors.warning} />
          <Text style={styles.fallbackText}>
            Could not load the order details
            {orderError?.code ? ` (${orderError.code})` : ''}.
          </Text>
          <Text style={styles.fallbackDetail}>
            The failure has been logged. Pull back and try again.
          </Text>
        </View>
      );
    }
  }

  if (orderCancelled) {
    return (
      <View style={styles.fallbackWrap}>
        <Ionicons name="close-circle-outline" size={34} color={colors.danger} />
        <Text style={styles.fallbackText}>
          This order was cancelled. No delivery action is needed.
        </Text>
      </View>
    );
  }

  const delivery = TEST_MODE
    ? { ...activeDelivery, parcelStatus }
    : assignment
      ? toActiveDelivery(assignment, order)
      : null;

  const vendor = delivery.vendor || {};
  const buyer = delivery.buyer || {};
  const deliveryDest = normalizeDeliveryLocation(delivery.deliveryLocation);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <IdentityCard
        roleLabel="Vendor"
        name={vendor.fullName}
        profilePhoto={vendor.profilePhoto}
        fallbackIcon="storefront-outline"
        details={[
          vendor.storeName
            ? { icon: 'storefront-outline', value: vendor.storeName }
            : null,
          vendor.location
            ? { icon: 'location-outline', value: vendor.location }
            : null,
          vendor.phone
            ? { icon: 'call-outline', value: vendor.phone }
            : null,
        ].filter(Boolean)}
      />

      <IdentityCard
        roleLabel="Buyer"
        name={buyer.fullName || 'Delivery order'}
        profilePhoto={buyer.profilePhoto}
        fallbackIcon="person-outline"
        details={[
          buyer.phone
            ? { icon: 'call-outline', value: buyer.phone }
            : null,
        ].filter(Boolean)}
      />

      <View style={styles.card}>
        <View style={styles.topRow}>
          <Text style={styles.orderNo}>Order {delivery.orderNumber}</Text>
          <StatusBadge label={delivery.parcelStatus} />
        </View>
        <Text style={styles.vendor}>{delivery.vendorStore}</Text>
        {delivery.deliveryStatus ? (
          <View style={styles.deliveryStatusRow}>
            <Text style={styles.sectionTitle}>Delivery Status</Text>
            <StatusBadge label={delivery.deliveryStatus} />
          </View>
        ) : null}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Order Items</Text>
        {Array.isArray(delivery.items) && delivery.items.length > 0
          ? delivery.items.map((line, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {formatUnitQuantity(line.quantity, line.unit)} × {line.name}
                </Text>
                <Text style={styles.itemTotal}>
                  {formatKES(line.quantity * line.pricePerKg)}
                </Text>
              </View>
            ))
          : null}
        {delivery.packaging ? (
          <Text style={styles.itemMeta}>
            Packaging: {delivery.packaging.name} —{' '}
            {formatKES(delivery.packaging.price)}
          </Text>
        ) : null}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Order Total</Text>
          <Text style={styles.totalValue}>{formatKES(delivery.total)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pickup</Text>
        <View style={styles.infoRow}>
          <Ionicons name="storefront-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>{delivery.pickupLocation}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Deliver To</Text>
        <View style={styles.infoRow}>
          <Ionicons name="navigate" size={20} color={colors.primary} />
          <Text style={styles.infoText}>{deliveryDest.address || 'Not provided'}</Text>
        </View>
        {deliveryDest.directions ? (
          <View style={styles.infoRow}>
            <Ionicons name="footsteps-outline" size={20} color={colors.primary} />
            <Text style={styles.infoText}>{deliveryDest.directions}</Text>
          </View>
        ) : null}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Buyer Phone</Text>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>{delivery.buyerPhone}{TEST_MODE ? ' (placeholder)' : ''}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Delivery Fee</Text>
        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Paid separately in cash directly to you by the buyer.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Parcel Status</Text>
        <StatusBadge label={delivery.parcelStatus} />
      </View>

      <PrimaryButton
        title="Mark Picked Up"
        icon="cube-outline"
        variant={delivery.parcelStatus === 'Picked Up' ? 'outline' : 'primary'}
        disabled={delivery.parcelStatus === 'Picked Up' || delivery.parcelStatus === 'Delivered'}
        onPress={handlePickedUp}
      />
      <View style={styles.buttonSpacing} />
      <PrimaryButton
        title="Mark Delivered"
        icon="checkmark-circle"
        onPress={handleDelivered}
        disabled={delivery.parcelStatus === 'Delivered'}
      />
    </ScrollView>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNo: {
    ...typography.subtitle,
    fontSize: 18,
  },
  vendor: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  deliveryStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginRight: spacing.md,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  buttonSpacing: {
    height: spacing.md,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  fallbackWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md,
  },
  fallbackText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fallbackDetail: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});