import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OrderCard from '../../components/OrderCard';
import { buyerOrders } from '../../services/mockData';
import { onBuyerOrders } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import { TEST_MODE } from '../../utils/testMode';
import { colors, radius, spacing, typography } from '../../utils/theme';

export default function OrdersScreen({ navigation }) {
  const { currentUser, userProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const seenOrderIdsRef = useRef(null);

  useEffect(() => {
    if (TEST_MODE) {
      setOrders(buyerOrders);
      setLoading(false);
      return;
    }
    const unsubscribe = onBuyerOrders(userProfile?.uid || currentUser?.uid, (list) => {
      setOrders(list);
      setLoading(false);
      // First snapshot only seeds the "seen" set so already-cancelled orders
      // are not notified again. Every later snapshot detects orders that have
      // just been cancelled by the vendor and shows an in-app notification.
      if (seenOrderIdsRef.current === null) {
        seenOrderIdsRef.current = new Set(list.map((order) => order.id));
        return;
      }
      const fresh = [];
      for (const order of list) {
        if (
          order.status === 'Cancelled' &&
          order.cancelledBy === 'vendor' &&
          !seenOrderIdsRef.current.has(order.id)
        ) {
          seenOrderIdsRef.current.add(order.id);
          fresh.push(order);
        }
      }
      if (fresh.length > 0) {
        setNotices((prev) => [...fresh, ...prev]);
      }
    });
    return unsubscribe;
  }, [currentUser?.uid, userProfile?.uid]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.empty}>Loading your orders…</Text>
      </View>
    );
  }

  const active = orders.filter(
    (order) => order.status !== 'Completed' && order.status !== 'Cancelled'
  );
  const completed = orders.filter((order) => order.status === 'Completed');
  const cancelled = orders.filter((order) => order.status === 'Cancelled');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {notices.map((notice) => (
        <View key={notice.id} style={styles.notice}>
          <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
          <View style={styles.noticeBody}>
            <Text style={styles.noticeTitle}>Order Cancelled</Text>
            <Text style={styles.noticeText}>
              Your order {notice.orderNumber} was cancelled by the vendor
              because the payment could not be confirmed
              {notice.cancelReason ? `: ${notice.cancelReason}` : ''}. You can
              place a new order.
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              setNotices((prev) => prev.filter((item) => item.id !== notice.id))
            }
            style={styles.noticeClose}
          >
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      ))}

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

      <Text style={styles.sectionTitle}>Cancelled Orders ({cancelled.length})</Text>
      {cancelled.length === 0 ? (
        <Text style={styles.empty}>No cancelled orders</Text>
      ) : (
        cancelled.map((order) => (
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
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noticeBody: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  noticeText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  noticeClose: {
    padding: spacing.xs,
  },
});