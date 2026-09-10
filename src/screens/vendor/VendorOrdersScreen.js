import { ScrollView, StyleSheet, Text, View } from 'react-native';
import OrderCard from '../../components/OrderCard';
import { vendorOrders } from '../../services/mockData';
import { colors, spacing, typography } from '../../utils/theme';

const sections = [
  { title: 'New Orders', status: 'New' },
  { title: 'Preparing', status: 'Preparing' },
  { title: 'Ready for Pickup', status: 'Ready for Pickup' },
  { title: 'Out for Delivery', status: 'Out for Delivery' },
  { title: 'Completed', status: 'Completed' },
];

export default function VendorOrdersScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {sections.map((section) => {
        const orders = vendorOrders.filter((order) => order.status === section.status);
        return (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {section.title} ({orders.length})
            </Text>
            {orders.length === 0 ? (
              <Text style={styles.empty}>No orders yet</Text>
            ) : (
              orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                />
              ))
            )}
          </View>
        );
      })}
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
});