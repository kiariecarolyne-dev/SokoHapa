import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IdentityCard from '../../components/IdentityCard';
import StatusBadge from '../../components/StatusBadge';
import { getVendorOrderById } from '../../services/mockData';
import { normalizeDeliveryLocation } from '../../services/deliveryService';
import { onOrder, rejectVendorPayment, updateOrder, verifyVendorPayment } from '../../services/orderService';
import { getUnitLabel } from '../../utils/productCatalogue';
import { TEST_MODE, updateVendorOrderStatus, verifyVendorPaymentTest, rejectVendorPaymentTest } from '../../utils/testMode';
import { useAuth } from '../../context/AuthContext';
import { getVehicleLabel } from '../../utils/vehicleTypes';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';
import { formatKES, formatOrderTime } from '../../utils/format';
import { paymentVendorSummary } from '../../utils/paymentMethods';

export default function VendorOrderDetailsScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const { currentUser, userProfile } = useAuth();
  const vendorUid = userProfile?.uid || currentUser?.uid;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [rejectVisible, setRejectVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    if (TEST_MODE) {
      setOrder(getVendorOrderById(orderId));
      setLoading(false);
      return;
    }
    const unsubscribe = onOrder(orderId, (next) => {
      setOrder(next);
      setLoading(false);
    });
    return unsubscribe;
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Loading order…</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Order not found</Text>
      </View>
    );
  }

  const applyStatus = async (updates, message) => {
    if (TEST_MODE) {
      const updated = updateVendorOrderStatus(order.id, updates);
      if (!updated) return;
      setOrder({ ...updated });
      Alert.alert('Order Updated', message);
      return;
    }
    try {
      await updateOrder(order.id, updates);
      Alert.alert('Order Updated', message);
    } catch (error) {
      Alert.alert(
        'Update Failed',
        error?.message || 'Could not update the order. Please try again.'
      );
    }
  };

  const handleAcceptPayment = () => {
    if (accepting) return;
    Alert.alert(
      'Confirm Payment',
      "Please confirm that you have checked your actual M-PESA transaction and that the buyer's payment is genuine.",
      [
        { text: 'Go Back', style: 'cancel', onPress: () => {} },
        { text: 'Confirm & Accept', onPress: doAcceptPayment },
      ]
    );
  };

  const doAcceptPayment = async () => {
    if (accepting) return;
    setAccepting(true);
    try {
      let updated = null;
      if (TEST_MODE) {
        updated = verifyVendorPaymentTest(order.id, vendorUid);
      } else {
        updated = await verifyVendorPayment(order.id, { vendorUid });
      }
      if (!updated) {
        Alert.alert(
          'Cannot Accept',
          'This order can no longer be accepted for payment verification.'
        );
        return;
      }
      setOrder({ ...updated });
      Alert.alert(
        'Payment Verified & Order Accepted',
        `Order ${order.orderNumber} accepted. The payment was verified by the vendor and the order is now being prepared.`
      );
    } catch (error) {
      const code = error?.code || '';
      if (code === 'permission-denied') {
        Alert.alert(
          'Action Failed',
          'This order was already processed by another screen. The details will refresh.'
        );
      } else if (code === 'order-not-verifiable') {
        Alert.alert(
          'Cannot Accept',
          'This order is no longer New, so its payment can no longer be verified.'
        );
      } else if (code === 'payment-not-reported') {
        Alert.alert(
          'Cannot Accept',
          'This order has no buyer payment report to verify.'
        );
      } else {
        Alert.alert(
          'Accept Failed',
          error?.message || 'Could not verify the payment. Please try again.'
        );
      }
    } finally {
      setAccepting(false);
    }
  };

  const handleMarkPreparing = () =>
    applyStatus(
      { status: 'Preparing', deliveryStatus: 'Preparing Order' },
      `Order ${order.orderNumber} marked as preparing.`
    );

  const handleMarkReady = () =>
    applyStatus(
      { status: 'Ready for Pickup', deliveryStatus: 'Parcel Ready' },
      `Order ${order.orderNumber} marked ready for pickup.`
    );

  const openReject = () => {
    if (rejecting) return;
    setRejectReason('');
    setRejectVisible(true);
  };

  const doRejectPayment = async () => {
    if (rejecting) return;
    setRejecting(true);
    try {
      let updated = null;
      if (TEST_MODE) {
        updated = rejectVendorPaymentTest(order.id, vendorUid, rejectReason);
      } else {
        updated = await rejectVendorPayment(order.id, {
          vendorUid,
          reason: rejectReason,
        });
      }
      if (!updated) {
        Alert.alert(
          'Cannot Reject',
          'This order can no longer be rejected because it is no longer awaiting payment verification.'
        );
        return;
      }
      setOrder({ ...updated });
      setRejectVisible(false);
      Alert.alert(
        'Order Cancelled',
        `Order ${order.orderNumber} rejected and cancelled. The buyer has been notified: ${
          updated.cancelReason || 'Payment could not be confirmed'
        }.`
      );
    } catch (error) {
      const code = error?.code || '';
      if (code === 'permission-denied') {
        Alert.alert(
          'Action Failed',
          'This order was already processed by another screen. The details will refresh.'
        );
      } else if (code === 'order-not-rejectable') {
        Alert.alert(
          'Cannot Reject',
          'This order is no longer New, so its payment report can no longer be rejected.'
        );
      } else {
        Alert.alert(
          'Reject Failed',
          error?.message || 'Could not reject the payment. Please try again.'
        );
      }
    } finally {
      setRejecting(false);
    }
  };

  const paymentStatus = order.paymentStatus || 'Pending';
  const paymentReported =
    order.paymentReported === true || order.paymentStatus === 'Reported';
  const paymentVerified = order.paymentStatus === 'Verified';
  const paymentRejected = order.paymentStatus === 'Rejected';
  const pendingPayment = order.status === 'New' && !paymentReported;
  const canAcceptPayment = order.status === 'New' && paymentReported;
  const canProcess =
    paymentVerified && (order.status === 'New' || order.status === 'Preparing');
  const canChooseDelivery = order.status === 'Ready for Pickup';

  const buyer = order.identity?.buyer || {};
  const vendor = order.identity?.vendor || {};
  const delivery = order.assignedDelivery || null;
  const buyerPhone = buyer.phone || order.buyerPhone || null;
  const deliveryDest = normalizeDeliveryLocation(order.deliveryLocation);
  const destinationSummary = paymentVendorSummary(order.paymentVendor, vendor.phone);

  const delivered =
    order.deliveryStatus === 'Delivered' || order.status === 'Completed';
  let deliveryLabel = order.deliveryStatus || 'Awaiting Accept';
  if (delivered) {
    deliveryLabel = 'Delivered';
  } else if (order.deliveryAccepted) {
    deliveryLabel = 'Out for Delivery';
  } else if (delivery) {
    deliveryLabel = 'Assigned';
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <IdentityCard
        roleLabel="Buyer"
        name={buyer.fullName || order.buyerName}
        profilePhoto={buyer.profilePhoto}
        fallbackIcon="person-outline"
        details={[
          buyerPhone ? { icon: 'call-outline', value: buyerPhone } : null,
        ].filter(Boolean)}
      />

      <View style={styles.paymentCard}>
        <Text style={styles.paymentTitle}>M-PESA Payment</Text>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Payment Method</Text>
          <Text style={styles.paymentValue}>M-PESA Direct</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Payment Status</Text>
          <StatusBadge
            label={
              paymentRejected
                ? 'Rejected'
                : paymentVerified
                  ? 'Verified'
                  : paymentReported
                    ? 'Reported'
                    : 'Pending'
            }
          />
        </View>
        {order.mpesaConfirmationMessage ? (
          <View style={styles.confirmationBlock}>
            <Text style={styles.paymentLabel}>Buyer M-PESA Confirmation</Text>
            <Text style={styles.confirmationText}>
              {order.mpesaConfirmationMessage}
            </Text>
          </View>
        ) : null}
        {paymentReported && order.paymentReportedAt ? (
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Reported</Text>
            <Text style={styles.paymentValue}>
              {formatOrderTime(order.paymentReportedAt)}
            </Text>
          </View>
        ) : null}
        {destinationSummary ? (
          <View style={styles.destinationBlock}>
            <Text style={styles.paymentLabel}>Your Payment Destination</Text>
            <Text style={styles.destinationText}>{destinationSummary}</Text>
            <Text style={styles.destinationNote}>
              This is the M-PESA account the buyer was shown at checkout. Check
              the confirmation against a payment you actually received in this
              account - payments to any other number are NOT valid.
            </Text>
          </View>
        ) : null}
        {paymentVerified ? (
          <Text style={styles.verifiedLine}>
            Payment Verified by Vendor
            {order.paymentVerifiedAt
              ? ` on ${formatOrderTime(order.paymentVerifiedAt)}`
              : ''}
            . The vendor compared the buyer's message with the actual M-PESA
            transaction.
          </Text>
        ) : null}
        {paymentRejected ? (
          <Text style={styles.rejectedLine}>
            Payment Rejected by Vendor. Order cancelled:{' '}
            {order.cancelReason || 'Payment could not be confirmed'}.
          </Text>
        ) : null}
        {canAcceptPayment ? (
          <View style={styles.compareNote}>
            <Ionicons
              name="alert-circle-outline"
              size={16}
              color={colors.warning}
            />
            <Text style={styles.compareNoteText}>
              Buyer-reported payment. Compare the confirmation message with
              your actual M-PESA transaction before accepting.
            </Text>
          </View>
        ) : null}
        {pendingPayment ? (
          <View style={styles.waitingLine}>
            <Ionicons
              name="hourglass-outline"
              size={16}
              color={colors.warning}
            />
            <Text style={styles.waitingText}>
              Waiting for the buyer to report their M-PESA payment. The order
              cannot be processed until the payment report is verified.
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.deliveryLocationCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.deliveryLocationTitle}>Delivery Location</Text>
          <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
        </View>
        <View style={styles.deliveryLocationRow}>
          <Ionicons name="location" size={18} color={colors.primary} />
          <Text style={styles.deliveryLocationText}>
            {deliveryDest.address || 'Not provided'}
          </Text>
        </View>
        {deliveryDest.directions ? (
          <View style={styles.deliveryLocationRow}>
            <Ionicons name="footsteps-outline" size={18} color={colors.textMuted} />
            <Text style={styles.deliveryLocationText}>
              {deliveryDest.directions}
            </Text>
          </View>
        ) : null}
        <Text style={styles.deliveryLocationNote}>
          Set by the buyer when placing this order. The buyer cannot change the
          delivery address after checkout.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNo}>Order {order.orderNumber}</Text>
            <Text style={styles.buyer}>Buyer: {buyer.fullName || order.buyerName}</Text>
            <Text style={styles.date}>{formatOrderTime(order.createdAt)}</Text>
          </View>
          <StatusBadge label={order.status} />
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Products</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>{item.quantity} {getUnitLabel(item.unit || 'kg')} × {formatKES(item.pricePerKg)}</Text>
            </View>
            <Text style={styles.itemTotal}>{formatKES(item.quantity * item.pricePerKg)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        {order.packaging ? (
          <View style={styles.statusBlock}>
            <Text style={styles.sectionTitle}>Packaging</Text>
            <Text style={styles.itemName}>
              {order.packaging.name} — {formatKES(order.packaging.price)}
            </Text>
          </View>
        ) : null}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Order Total</Text>
          <Text style={styles.totalValue}>{formatKES(order.total)}</Text>
        </View>

        <View style={styles.statusBlock}>
          <Text style={styles.sectionTitle}>Delivery Fee</Text>
          <Text style={styles.itemMeta}>
            Paid separately in cash by the buyer to the delivery person.
          </Text>
        </View>

        <View style={styles.statusBlock}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <StatusBadge label={order.status} />
        </View>
        <View style={styles.statusBlock}>
          <Text style={styles.sectionTitle}>Delivery Status</Text>
          <StatusBadge label={order.deliveryStatus} />
        </View>
        <View style={styles.statusBlock}>
          <View style={styles.deliveryHeader}>
            <Text style={styles.sectionTitle}>Delivery Person</Text>
            <StatusBadge label={deliveryLabel} />
          </View>
          {delivery ? (
            <IdentityCard
              roleLabel="Delivery Partner"
              name={delivery.fullName || order.assignedDeliveryPerson}
              profilePhoto={delivery.profilePhoto}
              fallbackIcon="person-outline"
              details={[
                delivery.phone
                  ? { icon: 'call-outline', value: delivery.phone }
                  : null,
                delivery.plateNumber
                  ? {
                      icon: 'car-outline',
                      value: `${getVehicleLabel(delivery.vehicleType)}: ${delivery.plateNumber}`,
                    }
                  : null,
                delivery.availability
                  ? { icon: 'radio-button-on', value: delivery.availability }
                  : null,
              ].filter(Boolean)}
            />
          ) : (
            <Text style={styles.itemMeta}>
              No delivery person has been assigned to this order yet. Mark the
              order ready for pickup, then choose a delivery person.
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {canAcceptPayment ? (
          <>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.acceptTile}
              onPress={handleAcceptPayment}
            >
              <Ionicons name="shield-checkmark" size={22} color={colors.white} />
              <Text style={styles.acceptTileText}>Accept Payment & Order</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.actionGap} />
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.rejectTile}
              onPress={openReject}
            >
              <Ionicons name="close-circle" size={22} color={colors.white} />
              <Text style={styles.acceptTileText}>
                Reject Payment / Cancel Order
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.white} />
            </TouchableOpacity>
          </>
        ) : null}
        {pendingPayment ? (
          <View style={styles.waitingTile}>
            <Ionicons
              name="hourglass-outline"
              size={22}
              color={colors.warning}
            />
            <Text style={styles.waitingTileText}>
              Waiting for buyer payment confirmation
            </Text>
          </View>
        ) : null}
        {canProcess ? (
          <PrimaryButtonTile
            icon="time-outline"
            title="Mark Preparing"
            onPress={handleMarkPreparing}
          />
        ) : null}
        {canProcess ? (
          <PrimaryButtonTile
            icon="cube-outline"
            title="Mark Ready for Pickup"
            onPress={handleMarkReady}
          />
        ) : null}
        {canChooseDelivery ? (
          <PrimaryButtonTile
            icon="car-sport-outline"
            title="Choose Delivery Person"
            onPress={() => navigation.navigate('ChooseDelivery', { orderId: order.id })}
          />
        ) : null}
      </View>

      <Modal
        visible={rejectVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reject Payment?</Text>
            <Text style={styles.modalDesc}>
              Are you sure you want to reject this payment report and cancel the
              order? The buyer will be notified.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Optional reason (e.g. Payment could not be confirmed)"
              placeholderTextColor={colors.placeholder}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              maxLength={300}
              returnKeyType="done"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.goBackBtn}
                onPress={() => setRejectVisible(false)}
              >
                <Text style={styles.goBackText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.confirmRejectBtn}
                disabled={rejecting}
                onPress={doRejectPayment}
              >
                <Text style={styles.confirmRejectText}>
                  {rejecting ? 'Rejecting...' : 'Confirm Reject'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function PrimaryButtonTile({ icon, title, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.actionTile}
      onPress={onPress}
    >
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.actionText}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
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
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  fallbackText: {
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow,
  },
  deliveryLocationCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  deliveryLocationTitle: {
    ...typography.subtitle,
    fontSize: 16,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  deliveryLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  deliveryLocationText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  deliveryLocationNote: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  paymentCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  paymentTitle: {
    ...typography.subtitle,
    fontSize: 16,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  paymentLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  confirmationBlock: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  confirmationText: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  destinationBlock: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  destinationText: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  destinationNote: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  compareNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  compareNoteText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.warning,
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
  waitingLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  waitingText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.warning,
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
  verifiedLine: {
    ...typography.bodySmall,
    color: colors.success,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  rejectedLine: {
    ...typography.bodySmall,
    color: colors.danger,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  waitingTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  waitingTileText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.warning,
    marginHorizontal: spacing.sm,
  },
  acceptTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rejectTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  actionGap: {
    height: spacing.sm,
  },
  acceptTileText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    marginHorizontal: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    ...shadow,
  },
  modalTitle: {
    ...typography.subtitle,
    fontSize: 17,
    marginBottom: spacing.sm,
  },
  modalDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.md,
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  goBackBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goBackText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  confirmRejectBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmRejectText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNo: {
    ...typography.subtitle,
    fontSize: 18,
  },
  buyer: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...typography.subtitle,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  statusBlock: {
    marginTop: spacing.md,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: spacing.sm,
  },
});