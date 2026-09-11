import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import { useCart } from '../../context/CartContext';
import { currentUserProfile } from '../../services/mockData';
import { TEST_MODE, placeTestOrder } from '../../utils/testMode';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';
import { formatKES } from '../../utils/format';

const PACKAGING_OPTIONS = [
  { id: 'small-bag', name: 'Small Carrier Bag', price: 20 },
  { id: 'large-bag', name: 'Large Carrier Bag', price: 50 },
];

export default function CheckoutScreen({ navigation }) {
  const { items, subtotal, clearCart } = useCart();
  const [packaging, setPackaging] = useState(null);

  const packagingFee = packaging ? packaging.price : 0;
  const orderTotal = subtotal + packagingFee;

  const handlePlaceOrder = () => {
    if (!packaging) {
      Alert.alert(
        'Carrier Bag Required',
        'Please choose a carrier bag before placing your order.'
      );
      return;
    }

    if (TEST_MODE) {
      const order = placeTestOrder({
        cartItems: items,
        subtotal,
        packaging,
        packagingFee,
        total: orderTotal,
        buyerName: currentUserProfile.fullName,
        buyerPhone: currentUserProfile.phone,
      });
      if (order) {
        clearCart();
        Alert.alert(
          'Test Order Placed',
          `Order ${order.orderNumber} placed in TEST MODE with ${packaging.name}. Payments are not implemented yet, and the delivery fee is paid separately in cash to the delivery person.`,
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

    // Fallback placeholder when TEST_MODE is off / production.
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

        {TEST_MODE ? (
          <View style={styles.testModeCard}>
            <Ionicons name="flask-outline" size={18} color={colors.warning} />
            <Text style={styles.testModeText}>
              TEST MODE: placing this order creates an in-memory test order shared
              with the vendor and delivery screens. No payment is taken and the
              delivery fee is not included in the total.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Order Total</Text>
          <Text style={styles.footerValue}>{formatKES(orderTotal)}</Text>
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