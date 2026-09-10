import { ScrollView, StyleSheet, Text, View } from 'react-native';
import OrderCard from '../../components/OrderCard';
import { buyerOrders } from '../../services/mockData';
import { colors, spacing, typography } from '../../utils/theme';

export default function OrdersScreen({ navigation }) {
  const active = buyerOrders.filter((order) => order.status !== 'Completed');
  const completed = buyerOrders.filter((order) => order.status === 'Completed');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.sectionTitle}>Active Orders ({active.length})</Text>
      {active.length === 0 ? (
        <Text style={styles.empty}>No active orders</Text>
      ) : (
        active.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
          />
        ))
      )}

      <Text style={styles.sectionTitle}>Completed Orders ({completed.length})</Text>
      {completed.length === 0 ? (
        <Text style={styles.empty}>No completed orders</Text>
      ) : (
        completed.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
          />
        ))
      )}
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
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
});