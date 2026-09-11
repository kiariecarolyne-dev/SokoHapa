import { FlatList, StyleSheet, Text, View } from 'react-native';
import CartItem from '../../components/CartItem';
import PrimaryButton from '../../components/PrimaryButton';
import { useCart } from '../../context/CartContext';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';
import { formatKES } from '../../utils/format';

export default function CartScreen({ navigation }) {
  const {
    items,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    subtotal,
    total,
  } = useCart();

  if (items.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyHint}>Browse stores and add fresh products.</Text>
        <PrimaryButton
          title="Browse Stores"
          onPress={() => navigation.navigate('Home')}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onIncrease={() => increaseQuantity(item.id)}
            onDecrease={() => decreaseQuantity(item.id)}
            onRemove={() => removeItem(item.id)}
          />
        )}
      />

      <View style={styles.summary}>
        <SummaryRow label="Subtotal" value={formatKES(subtotal)} />
        <View style={styles.divider} />
        <SummaryRow label="Total" value={formatKES(total)} bold />
        <Text style={styles.deliveryNote}>
          Delivery fee is paid separately in cash to the delivery person and
          depends on the delivery distance. Carrier bag is chosen at checkout.
        </Text>
        <PrimaryButton
          title="Proceed to Checkout"
          onPress={() => navigation.navigate('Checkout')}
          style={styles.checkoutButton}
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
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    ...typography.title,
    marginTop: spacing.md,
  },
  emptyHint: {
    ...typography.bodySmall,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
  list: {
    padding: spacing.md,
  },
  summary: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    ...shadow,
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
  checkoutButton: {
    marginTop: spacing.md,
  },
  deliveryNote: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});