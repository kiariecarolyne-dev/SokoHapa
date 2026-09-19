import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import IdentityCard from '../../components/IdentityCard';
import PrimaryButton from '../../components/PrimaryButton';
import StatusBadge from '../../components/StatusBadge';
import { getBuyerOrderById } from '../../services/mockData';
import { normalizeDeliveryLocation } from '../../services/deliveryService';
import { cancelOrder, onOrder, reportPayment } from '../../services/orderService';
import { formatUnitQuantity } from '../../utils/productCatalogue';
import { TEST_MODE, cancelOrderTest } from '../../utils/testMode';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';
import {
  formatKES,
  formatOrderTime,
} from '../../utils/format';
import { buildPaymentMethodRows } from '../../utils/paymentMethods';
import { getVehicleLabel } from '../../utils/vehicleTypes';

export default function BuyerOrderDetailsScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [mpesaMessage, setMpesaMessage] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const vendorCancelledNotifiedRef = useRef(false);

  useEffect(() => {
    if (TEST_MODE) {
      setOrder(getBuyerOrderById(orderId));
      setLoading(false);
      return;
    }
    const unsubscribe = onOrder(orderId, (next) => {
      setOrder(next);
      setLoading(false);
    });
    return unsubscribe;
  }, [orderId]);

  // In-app notification for the buyer when the vendor rejects/cancels the
  // order because the payment could not be confirmed. SokoHapa does not
  // verify payments itself; the vendor made that decision.
  useEffect(() => {
    if (
      order &&
      order.cancelledBy === 'vendor' &&
      !vendorCancelledNotifiedRef.current
    ) {
      vendorCancelledNotifiedRef.current = true;
      const reason =
        order.cancelReason || 'the payment could not be confirmed';
      Alert.alert(
        'Order Cancelled',
        `Your order ${order.orderNumber} was cancelled by the vendor because ${reason}. You can place a new order.`
      );
    }
  }, [order]);

  if (loading) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Loading order...</Text>
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

  const vendor = order.identity?.vendor || {};
  const delivery = order.assignedDelivery || null;
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

  const methodRows = buildPaymentMethodRows(order.paymentVendor, vendor.phone);
  const isNew = order.status === 'New';
  const paymentStatus = order.paymentStatus || 'Pending';
  const paymentReported =
    order.paymentReported === true || paymentStatus === 'Reported';
  const paymentVerified = paymentStatus === 'Verified';
  const paymentRejected = paymentStatus === 'Rejected';
  const vendorCancelled = order.cancelledBy === 'vendor';
  const deliveryDest = normalizeDeliveryLocation(order.deliveryLocation);

  const copyMethod = async (method) => {
    if (!method?.copyValue) {
      return;
    }
    try {
      await Clipboard.setStringAsync(method.copyValue);
      setCopied(method.id);
      setTimeout(() => setCopied(null), 2000);
      if (Platform.OS === 'android') {
        ToastAndroid.show(method.displayValue + ' copied', ToastAndroid.SHORT);
      }
      const isTill = method.id === 'till';
      Alert.alert(
        isTill ? 'Till Number Copied' : 'Number Copied',
        isTill
          ? `Till ${method.displayValue} copied. Open M-PESA, select Buy Goods Till / Lipa na M-PESA (Till), enter the number and amount, and pay ${formatKES(order.total)} directly to the vendor.`
          : `${method.displayValue} copied. Open M-PESA, select Send Money / Lipa na M-PESA, and pay ${formatKES(order.total)} directly to the vendor.`
      );
    } catch (error) {
      Alert.alert(
        'Copy Failed',
        'Could not copy the number. Please copy it manually.'
      );
    }
  };

  const openCancel = () => {
    if (!isNew) return;
    setCancelReason('');
    setCancelVisible(true);
  };

  const openReport = () => {
    if (!isNew || paymentReported) return;
    setMpesaMessage('');
    setReportVisible(true);
  };

  const confirmReportPayment = async () => {
    if (!order || submittingPayment) return;
    const message = mpesaMessage.trim();
    if (!message) {
      Alert.alert(
        'Confirmation Message Required',
        'Please paste the M-PESA confirmation message you received.'
      );
      return;
    }
    setSubmittingPayment(true);
    try {
      await reportPayment(order.id, { mpesaConfirmationMessage: message });
      setReportVisible(false);
      Alert.alert(
        'Payment Reported',
        'Your payment report has been sent to the vendor. The vendor will compare your message with their actual M-PESA transaction before accepting the order.'
      );
    } catch (error) {
      const code = error?.code || '';
      Alert.alert(
        code === 'payment-not-editable' ? 'Cannot Report' : 'Report Failed',
        error?.message || 'Could not report the payment. Please try again.'
      );
    } finally {
      setSubmittingPayment(false);
    }
  };

  const confirmCancel = async () => {
    if (!order || cancelling) return;
    setCancelling(true);
    try {
      if (TEST_MODE) {
        const updated = cancelOrderTest(order.id, cancelReason);
        if (!updated) {
          Alert.alert(
            'Cannot Cancel',
            'This order is no longer cancellable.'
          );
        } else {
          setOrder({ ...updated });
          Alert.alert(
            'Order Cancelled',
            'Order ' + order.orderNumber + ' has been cancelled.'
          );
        }
        setCancelVisible(false);
        return;
      }
      await cancelOrder(order.id, { reason: cancelReason });
      setCancelVisible(false);
      Alert.alert(
        'Order Cancelled',
        'Order ' + order.orderNumber + ' has been cancelled.'
      );
    } catch (error) {
      const isPermission = error?.code === 'permission-denied';
      Alert.alert(
        isPermission ? 'Cannot Cancel' : 'Cancel Failed',
        isPermission
          ? 'This order can no longer be cancelled because it is no longer New.'
          : error?.message || 'Could not cancel the order. Please try again.'
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleEditOrder = () => {
    if (!isNew) return;
    navigation.navigate('EditOrder', { orderId: order.id });
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <IdentityCard
          roleLabel="Vendor"
          name={vendor.fullName || order.vendorName}
          profilePhoto={vendor.profilePhoto}
          fallbackIcon="storefront-outline"
          details={[
            vendor.storeName
              ? { icon: 'storefront-outline', value: vendor.storeName }
              : null,
            vendor.phone
              ? { icon: 'call-outline', value: vendor.phone }
              : null,
            vendor.location
              ? { icon: 'location-outline', value: vendor.location }
              : null,
          ].filter(Boolean)}
        />

        <View style={styles.payVendorCard}>
          <View style={styles.payVendorHeader}>
            <View style={styles.payVendorIconWrap}>
              <Ionicons
                name="phone-portrait-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <Text style={styles.payVendorTitle}>
              Pay Vendor Directly via M-PESA
            </Text>
          </View>
          {methodRows.length > 0 ? (
            <View>
              {methodRows.map((method) => (
                <View key={method.id} style={styles.payNumberRow}>
                  <View style={styles.payNumberWrap}>
                    <Text style={styles.payMethodLabel}>{method.label}</Text>
                    <Text style={styles.payNumber}>{method.displayValue}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={() => copyMethod(method)}
                  >
                    <Ionicons
                      name={copied === method.id ? 'checkmark-circle' : 'copy-outline'}
                      size={18}
                      color={colors.primaryDark}
                    />
                    <Text style={styles.copyBtnText}>
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
          <View style={styles.payNotice}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={colors.success}
            />
            <Text style={styles.payNoticeText}>
              Pay this order amount directly to the vendor. SokoHapa does NOT
              receive your money - this is a direct payment to the vendor.
            </Text>
          </View>
        </View>

        {isNew && !paymentReported ? (
          <View style={styles.reportCard}>
            <Text style={styles.reportTitle}>Report Your M-PESA Payment</Text>
            <Text style={styles.reportText}>
              You paid {formatKES(order.total)} directly to the vendor via
              M-PESA. Paste the M-PESA confirmation message you received so the
              vendor can compare it with their actual M-PESA transaction before
              accepting your order.
            </Text>
            <PrimaryButton
              title="I Have Paid - Report Payment"
              icon="cash-outline"
              onPress={openReport}
            />
          </View>
        ) : (
          <View style={styles.payStatusCard}>
            <Text style={styles.payStatusTitle}>M-PESA Payment</Text>
            <View style={styles.payStatusRow}>
              <Text style={styles.payStatusLabel}>Payment Method</Text>
              <Text style={styles.payStatusValue}>M-PESA Direct</Text>
            </View>
            <View style={styles.payStatusRow}>
              <Text style={styles.payStatusLabel}>Payment Status</Text>
              <StatusBadge label={paymentStatus} />
            </View>
            {paymentReported && order.paymentReportedAt ? (
              <View style={styles.payStatusRow}>
                <Text style={styles.payStatusLabel}>Reported</Text>
                <Text style={styles.payStatusValue}>
                  {formatOrderTime(order.paymentReportedAt)}
                </Text>
              </View>
            ) : null}
            {order.mpesaConfirmationMessage ? (
              <View style={styles.confirmationBlock}>
                <Text style={styles.payStatusLabel}>
                  Your M-PESA Confirmation
                </Text>
                <Text style={styles.confirmationText}>
                  {order.mpesaConfirmationMessage}
                </Text>
              </View>
            ) : null}
            {paymentVerified ? (
              <View style={styles.verifiedNote}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={colors.success}
                />
                <Text style={styles.verifiedNoteText}>
                  Verified by Vendor
                  {order.paymentVerifiedAt
                    ? ` on ${formatOrderTime(order.paymentVerifiedAt)}`
                    : ''}
                  . Your payment was manually confirmed by the vendor.
                </Text>
              </View>
            ) : null}
            {paymentRejected || vendorCancelled ? (
              <View style={styles.rejectedNote}>
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={colors.danger}
                />
                <Text style={styles.rejectedNoteText}>
                  Payment rejected by the vendor and the order was cancelled.
                </Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.orderNo}>Order {order.orderNumber}</Text>
          <Text style={styles.vendor}>
            Vendor: {vendor.storeName || order.vendorName}
          </Text>
          <Text style={styles.date}>{formatOrderTime(order.createdAt)}</Text>

          {order.editedAt ? (
            <View style={styles.editedRow}>
              <Ionicons
                name="create-outline"
                size={14}
                color={colors.textMuted}
              />
              <Text style={styles.editedText}>
                Edited {order.editCount || 1} time(s)
              </Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Products</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {formatUnitQuantity(item.quantity, item.unit)} × {formatKES(item.pricePerKg)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                {formatKES(item.quantity * item.pricePerKg)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          {order.packaging ? (
            <View style={styles.statusBlock}>
              <Text style={styles.sectionTitle}>Packaging</Text>
              <Text style={styles.itemName}>
                {order.packaging.name} - {formatKES(order.packaging.price)}
              </Text>
            </View>
          ) : null}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Order Total</Text>
            <Text style={styles.totalValue}>{formatKES(order.total)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Location</Text>
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
          <Text style={styles.lockedNote}>
            Set when you placed this order and can't be changed.
          </Text>
        </View>

        <View style={styles.card}>
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
                      value:
                        getVehicleLabel(delivery.vehicleType) +
                        ': ' +
                        delivery.plateNumber,
                    }
                  : null,
                delivery.availability
                  ? { icon: 'radio-button-on', value: delivery.availability }
                  : null,
              ].filter(Boolean)}
            />
          ) : (
            <View style={styles.pendingDelivery}>
              <MaterialCommunityIcons
                name="motorbike"
                size={18}
                color={colors.textMuted}
              />
              <Text style={styles.pendingDeliveryText}>
                Waiting for the vendor to assign a delivery person.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Fee</Text>
          <Text style={styles.itemMeta}>
            Paid separately in cash directly to the delivery person. The fee
            depends on the delivery distance.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <StatusBadge label={order.status} />

          {order.cancelReason ? (
            <View style={styles.statusBlock}>
              <Text style={styles.sectionTitle}>Cancellation Reason</Text>
              <Text style={styles.itemMeta}>{order.cancelReason}</Text>
            </View>
          ) : null}

          {isNew ? (
            <View style={styles.actionsRow}>
              <PrimaryButton
                title="Edit Order"
                variant="outline"
                icon="create-outline"
                onPress={handleEditOrder}
                block={false}
                style={styles.actionBtn}
              />
              <PrimaryButton
                title="Cancel Order"
                variant="danger"
                icon="close-circle-outline"
                onPress={openCancel}
                block={false}
                style={styles.actionBtn}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Modal
        visible={reportVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReportVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Report M-PESA Payment</Text>
            <Text style={styles.modalDesc}>
              Paste the full M-PESA confirmation message you received after
              paying {formatKES(order.total)} to the vendor. The vendor will
              compare this message with their actual M-PESA transaction before
              accepting your order.
            </Text>
            <TextInput
              style={[styles.modalInput, styles.messageInput]}
              placeholder="Paste your M-PESA confirmation message here"
              placeholderTextColor={colors.placeholder}
              value={mpesaMessage}
              onChangeText={setMpesaMessage}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
            <View style={styles.modalActions}>
              <PrimaryButton
                title="Go Back"
                variant="outline"
                onPress={() => setReportVisible(false)}
                block={false}
                style={styles.modalBtn}
              />
              <PrimaryButton
                title={submittingPayment ? 'Submitting...' : 'I Have Paid'}
                onPress={confirmReportPayment}
                disabled={submittingPayment}
                block={false}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={cancelVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel Order</Text>
            <Text style={styles.modalDesc}>
              Are you sure you want to cancel order {order.orderNumber}? This
              cannot be undone.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Optional reason (e.g. changed my mind)"
              placeholderTextColor={colors.placeholder}
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline={false}
              maxLength={120}
              returnKeyType="done"
            />
            <View style={styles.modalActions}>
              <PrimaryButton
                title="Keep Order"
                variant="outline"
                onPress={() => setCancelVisible(false)}
                block={false}
                style={styles.modalBtn}
              />
              <PrimaryButton
                title={cancelling ? 'Cancelling...' : 'Cancel Order'}
                variant="danger"
                onPress={confirmCancel}
                disabled={cancelling}
                block={false}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  payVendorCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  payVendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  payVendorIconWrap: {
    width: 30,
    height: 30,
    borderRadius: radius.round,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  payVendorTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
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
  },
  payOrSeparator: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
    marginLeft: 4,
  },
  payNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  payNoticeText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.success,
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
  reportCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...shadow,
  },
  reportTitle: {
    ...typography.subtitle,
    fontSize: 16,
    color: colors.primaryDark,
  },
  reportText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  payStatusCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  payStatusTitle: {
    ...typography.subtitle,
    fontSize: 16,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  payStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  payStatusLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  payStatusValue: {
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
  verifiedNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  verifiedNoteText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.success,
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
  rejectedNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rejectedNoteText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.danger,
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
  messageInput: {
    minHeight: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  orderNo: {
    ...typography.subtitle,
    fontSize: 18,
  },
  vendor: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  editedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  editedText: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
    fontStyle: 'italic',
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
  spacer: {
    height: spacing.md,
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
  lockedNote: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  pendingDelivery: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  pendingDeliveryText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
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
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalBtn: {
    flex: 1,
  },
});