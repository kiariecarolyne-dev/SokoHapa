import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import { getVendorOrderById } from '../../services/mockData';
import { updateVendorOrderStatus } from '../../utils/testMode';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';
import { formatKES } from '../../utils/format';

export default function VendorOrderDetailsScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const [, forceRender] = useState(0);
  const order = getVendorOrderById(orderId);

  if (!order) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Order not found</Text>
      </View>
    );
  }

  const applyStatus = (updates, message) => {
    const updated = updateVendorOrderStatus(order.id, updates);
    if (!updated) {
      Alert.alert(
        'Not Available',
        'Updating order status is only available in TEST MODE (development).'
      );
      return;
    }
    forceRender((n) => n + 1);
    Alert.alert('Order Updated', message);
  };

  const handleAccept = () =>
    applyStatus(
      { status: 'Preparing', deliveryStatus: 'Preparing Order' },
      `Order ${order.orderNumber} accepted and set to preparing.`
    );

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

  const canPrepare = order.status === 'New' || order.status === 'Preparing';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNo}>Order {order.orderNumber}</Text>
            <Text style={styles.buyer}>Buyer: {order.buyerName}</Text>
            <Text style={styles.date}>{order.createdAt}</Text>
          </View>
          <StatusBadge label={order.status} />
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Products</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>{item.quantity} kg × {formatKES(item.pricePerKg)}</Text>
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
        {order.assignedDeliveryPerson ? (
          <View style={styles.statusBlock}>
            <Text style={styles.sectionTitle}>Delivery Person</Text>
            <Text style={styles.itemName}>{order.assignedDeliveryPerson}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        {order.status === 'New' ? (
          <PrimaryButtonTile
            icon="checkmark-circle"
            title="Accept Order"
            onPress={handleAccept}
          />
        ) : null}
        {canPrepare ? (
          <PrimaryButtonTile
            icon="time-outline"
            title="Mark Preparing"
            onPress={handleMarkPreparing}
          />
        ) : null}
        {canPrepare ? (
          <PrimaryButtonTile
            icon="cube-outline"
            title="Mark Ready for Pickup"
            onPress={handleMarkReady}
          />
        ) : null}
        {order.status === 'Ready for Pickup' ? (
          <PrimaryButtonTile
            icon="car-sport-outline"
            title="Choose Delivery Person"
            onPress={() => navigation.navigate('ChooseDelivery', { orderId: order.id })}
          />
        ) : null}
      </View>
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