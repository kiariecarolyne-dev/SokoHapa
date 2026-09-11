import { ScrollView, StyleSheet, Text, View } from 'react-native';
import StatusBadge from '../../components/StatusBadge';
import { getBuyerOrderById } from '../../services/mockData';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';
import { formatKES } from '../../utils/format';

export default function BuyerOrderDetailsScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const order = getBuyerOrderById(orderId);

  if (!order) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Order not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <Text style={styles.orderNo}>Order {order.orderNumber}</Text>
        <Text style={styles.vendor}>Vendor: {order.vendorName}</Text>
        <Text style={styles.date}>{order.createdAt}</Text>

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
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Delivery Fee</Text>
        <Text style={styles.itemMeta}>
          Paid separately in cash directly to the delivery person. The fee
          depends on the delivery distance.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Payment Status</Text>
        <StatusBadge label={order.paymentStatus} />
        <View style={styles.spacer} />
        <Text style={styles.sectionTitle}>Order Status</Text>
        <StatusBadge label={order.status} />
        <View style={styles.spacer} />
        <Text style={styles.sectionTitle}>Delivery Status</Text>
        <StatusBadge label={order.deliveryStatus} />
      </View>
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
});