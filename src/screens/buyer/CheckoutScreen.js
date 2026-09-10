import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import { useCart } from '../../context/CartContext';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';
import { formatKES } from '../../utils/format';

export default function CheckoutScreen({ navigation }) {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();

  const handlePlaceOrder = () => {
    Alert.alert(
      'Order Placed',
      'This is a placeholder order. Payments are not implemented yet.',
      [
        {
          text: 'View My Orders',
          onPress: () => {
            clearCart();
            navigation.popToTop();
            navigation.navigate('Orders');
          },
        },
        { text: 'Keep Shopping', style: 'cancel', onPress: () => {} },
      ]
    );
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
              <Text style={styles.itemName} numberOfLines={1}>
                {item.quantity} kg × {item.name}
              </Text>
              <Text style={styles.itemTotal}>{formatKES(item.pricePerKg * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <SummaryRow label="Subtotal" value={formatKES(subtotal)} />
          <SummaryRow label="Delivery Fee (placeholder)" value={formatKES(deliveryFee)} />
          <View style={styles.divider} />
          <SummaryRow label="Total Amount" value={formatKES(total)} bold />
        </View>

        <Text style={styles.sectionTitle}>Delivery Information</Text>
        <View style={styles.placeholderCard}>
          <Ionicons name="location-outline" size={20} color={colors.primary} />
          <Text style={styles.placeholderText}>
            Delivery address will be captured here in a later phase.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.placeholderCard}>
          <Ionicons name="card-outline" size={20} color={colors.primary} />
          <Text style={styles.placeholderText}>
            Payment (e.g. M-Pesa) will be added in a later phase.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerValue}>{formatKES(total)}</Text>
        </View>
        <PrimaryButton title="Place Order" onPress={handlePlaceOrder} icon="checkmark" />
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