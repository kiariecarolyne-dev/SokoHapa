import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing } from '../utils/theme';
import StatusBadge from './StatusBadge';
import { formatKES } from '../utils/format';

export default function OrderCard({ order, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.orderNo}>Order {order.orderNumber}</Text>
          <Text style={styles.vendor}>{order.vendorName || order.vendorStore || order.buyerName}</Text>
        </View>
        <StatusBadge label={order.status} />
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{order.items?.length ?? 0} item(s)</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.meta}>{order.createdAt || order.date}</Text>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.total}>{formatKES(order.total || order.deliveryFee)}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  vendor: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  dot: {
    color: colors.textMuted,
    marginHorizontal: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
});