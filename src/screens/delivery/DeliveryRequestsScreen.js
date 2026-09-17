import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import IdentityCard from '../../components/IdentityCard';
import PrimaryButton from '../../components/PrimaryButton';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { deliveryRequests } from '../../services/mockData';
import {
  acceptDeliveryRequest,
  declineDeliveryRequest,
  normalizeDeliveryLocation,
  onPendingDeliveryRequests,
} from '../../services/deliveryService';
import { getUnitLabel } from '../../utils/productCatalogue';
import { TEST_MODE, acceptTestDeliveryRequest } from '../../utils/testMode';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';
import { formatKES } from '../../utils/format';

export default function DeliveryRequestsScreen({ navigation }) {
  const { currentUser, userProfile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingOrderId, setAcceptingOrderId] = useState(null);

  useEffect(() => {
    if (TEST_MODE) {
      setRequests(deliveryRequests);
      setLoading(false);
      return;
    }
    const unsubscribe = onPendingDeliveryRequests(
      userProfile?.uid || currentUser?.uid,
      (list) => {
        setRequests(list);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [currentUser?.uid, userProfile?.uid]);

  const handleAccept = async (request) => {
    if (TEST_MODE) {
      const accepted = acceptTestDeliveryRequest(request.id);
      if (!accepted) {
        Alert.alert(
          'Not Accepted',
          'Accepting delivery requests is only available in TEST MODE (development).'
        );
        return;
      }
      Alert.alert(
        'Request Accepted',
        `Delivery for order ${request.orderNumber} accepted and added to your active delivery.`,
        [
          { text: 'View Delivery', onPress: () => navigation.navigate('ActiveDelivery', { requestId: request.id }) },
          { text: 'OK' },
        ]
      );
      return;
    }

    const deliveryUid = userProfile?.uid || currentUser?.uid;
    if (!deliveryUid) {
      Alert.alert('Sign In Required', 'Please sign in to accept delivery requests.');
      return;
    }
    if (acceptingOrderId === request.id) {
      return;
    }
    setAcceptingOrderId(request.id);
    try {
      await acceptDeliveryRequest(request.id, {
        deliveryUid,
        deliveryPerson: {
          uid: deliveryUid,
          fullName: userProfile?.fullName || '',
          phone: userProfile?.phone || '',
          vehicleType: userProfile?.vehicleType || '',
          plateNumber: userProfile?.vehiclePlateNumber || null,
          profilePhoto: userProfile?.profilePhoto ?? null,
        },
      });
      Alert.alert(
        'Request Accepted',
        `Delivery for order ${request.orderNumber} accepted and added to your active delivery.`,
        [
          { text: 'View Delivery', onPress: () => navigation.navigate('ActiveDelivery') },
          { text: 'OK' },
        ]
      );
    } catch (error) {
      console.error(
        '[FIRESTORE/DELIVERY FAILURE]',
        'Operation: handleAccept (screen)',
        `Role: delivery`,
        `UID: ${deliveryUid}`,
        `RequestId: ${request.id}`,
        `OrderId: ${request.orderId ?? 'unknown'}`,
        `Code: ${error?.code ?? 'unknown'}`,
        `Message: ${error?.message ?? 'unknown'}`
      );
      Alert.alert(
        'Accept Failed',
        error?.message || 'Could not accept the request. Please try again.'
      );
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const handleDecline = async (request) => {
    if (TEST_MODE) {
      Alert.alert(
        'Request Declined',
        `Delivery for order ${request.orderNumber} declined.`
      );
      return;
    }
    try {
      await declineDeliveryRequest(request.id);
      Alert.alert(
        'Request Declined',
        `Delivery for order ${request.orderNumber} declined.`
      );
    } catch (error) {
      Alert.alert(
        'Decline Failed',
        error?.message || 'Could not decline the request. Please try again.'
      );
    }
  };

  const renderItem = ({ item }) => {
    const vendor = item.vendor || {};
    const buyer = item.buyer || {};
    const dest = normalizeDeliveryLocation(item.deliveryLocation);
    const statusLabel = item.deliveryAccepted
      ? 'Out for Delivery'
      : item.deliveryStatus === 'Delivered'
        ? 'Delivered'
        : 'Awaiting Accept';

    return (
      <View style={styles.card}>
        <IdentityCard
          roleLabel="Vendor"
          name={vendor.fullName || vendor.storeName}
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

        {buyer.fullName ? (
          <IdentityCard
            roleLabel="Buyer"
            name={buyer.fullName}
            profilePhoto={buyer.profilePhoto}
            fallbackIcon="person-outline"
            details={[
              buyer.phone
                ? { icon: 'call-outline', value: buyer.phone }
                : null,
            ].filter(Boolean)}
          />
        ) : null}

        <View style={styles.topRow}>
          <Text style={styles.orderNo}>Order {item.orderNumber}</Text>
          <StatusBadge label={statusLabel} />
        </View>

        <View style={styles.locationRow}>
          <View style={styles.stepDot} />
          <View style={styles.locationBody}>
            <Text style={styles.locationLabel}>Pickup</Text>
            <Text style={styles.locationText}>{item.pickupLocation}</Text>
          </View>
        </View>
        <View style={styles.locationRow}>
            <View style={[styles.stepDot, styles.stepDotEnd]} />
            <View style={styles.locationBody}>
              <Text style={styles.locationLabel}>Delivery</Text>
              <Text style={styles.locationText}>{dest.address || 'Not provided'}</Text>
              {dest.directions ? (
                <Text style={styles.locationText}>{dest.directions}</Text>
              ) : null}
            </View>
          </View>

        {Array.isArray(item.items) && item.items.length > 0 ? (
          <View style={styles.orderDetails}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {item.items.map((line, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {line.quantity} {getUnitLabel(line.unit || 'kg')} × {line.name}
                </Text>
                <Text style={styles.itemTotal}>
                  {formatKES(line.quantity * line.pricePerKg)}
                </Text>
              </View>
            ))}
            {item.packaging ? (
              <Text style={styles.itemMeta}>
                Packaging: {item.packaging.name} —{' '}
                {formatKES(item.packaging.price)}
              </Text>
            ) : null}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Order Total</Text>
              <Text style={styles.totalValue}>{formatKES(item.total)}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="navigation-outline" size={16} color={colors.textMuted} />
            <Text style={styles.metaText}>{item.distanceKm ? `${item.distanceKm} km` : null}</Text>
          </View>
        </View>

        <View style={styles.cashNotice}>
          <MaterialCommunityIcons name="cash-multiple" size={18} color={colors.warning} />
          <Text style={styles.cashNoticeText}>
            Delivery fee paid separately in cash by the buyer.
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title={acceptingOrderId === item.id ? 'Accepting…' : 'Accept'}
            icon="checkmark"
            onPress={() => handleAccept(item)}
            disabled={acceptingOrderId === item.id}
            style={styles.actionButton}
          />
          <PrimaryButton
            title="Decline"
            variant="outline"
            onPress={() => handleDecline(item)}
            style={styles.actionButton}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        Incoming delivery requests from vendors. Accept to start delivering.
      </Text>
      {loading ? (
        <Text style={styles.empty}>Loading requests…</Text>
      ) : requests.length === 0 ? (
        <Text style={styles.empty}>No pending delivery requests right now.</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  list: {
    padding: spacing.md,
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
    alignItems: 'center',
  },
  orderNo: {
    ...typography.subtitle,
    fontSize: 17,
  },
  locationRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    marginTop: 5,
    marginRight: spacing.sm,
  },
  stepDotEnd: {
    backgroundColor: colors.accent,
  },
  locationBody: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  orderDetails: {
    marginTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
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
  cashNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  cashNoticeText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.warning,
    marginLeft: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});