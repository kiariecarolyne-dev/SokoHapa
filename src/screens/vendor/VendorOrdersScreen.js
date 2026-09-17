import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import OrderCard from '../../components/OrderCard';
import { vendorOrders } from '../../services/mockData';
import { onVendorOrders } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import { TEST_MODE } from '../../utils/testMode';
import { colors, spacing, typography } from '../../utils/theme';

const sections = [
  { title: 'New Orders', status: 'New' },
  { title: 'Preparing', status: 'Preparing' },
  { title: 'Ready for Pickup', status: 'Ready for Pickup' },
  { title: 'Out for Delivery', status: 'Out for Delivery' },
  { title: 'Completed', status: 'Completed' },
  { title: 'Cancelled', status: 'Cancelled' },
];

export default function VendorOrdersScreen({ navigation }) {
  const { currentUser, userProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (TEST_MODE) {
      setOrders(vendorOrders);
      setLoading(false);
      return;
    }
    const unsubscribe = onVendorOrders(
      userProfile?.uid || currentUser?.uid,
      (list) => {
        setOrders(list);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [currentUser?.uid, userProfile?.uid]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.empty}>Loading orders…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {sections.map((section) => {
        const filtered = orders.filter((order) => order.status === section.status);
        return (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {section.title} ({filtered.length})
            </Text>
            {filtered.length === 0 ? (
              <Text style={styles.empty}>No orders yet</Text>
            ) : (
              filtered.map((order) => (
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
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});