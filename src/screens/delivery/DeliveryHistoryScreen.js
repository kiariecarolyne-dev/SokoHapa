import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { deliveryHistory } from '../../services/mockData';
import { onDeliveryHistory } from '../../services/deliveryService';
import { TEST_MODE } from '../../utils/testMode';
import { formatOrderTime } from '../../utils/format';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

export default function DeliveryHistoryScreen() {
  const { currentUser, userProfile } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (TEST_MODE) {
      setRecords(deliveryHistory);
      setLoading(false);
      return;
    }
    const unsubscribe = onDeliveryHistory(
      userProfile?.uid || currentUser?.uid,
      (list) => {
        setRecords(list);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [currentUser?.uid, userProfile?.uid]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.orderNo}>Order {item.orderNumber}</Text>
          <Text style={styles.vendor}>{item.vendorStore || 'Delivery completed'}</Text>
        </View>
        <StatusBadge label={item.status || 'Completed'} />
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="time-outline" size={14} color={colors.textMuted} />
        <Text style={styles.meta}>{formatOrderTime(item.completedAt ?? item.date)}</Text>
        <Text style={styles.dot}>•</Text>
        <Ionicons name="cash-outline" size={14} color={colors.textMuted} />
        <Text style={styles.meta}>Delivery fee paid separately in cash</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.empty}>Loading history…</Text>
      ) : records.length === 0 ? (
        <Text style={styles.empty}>No completed deliveries yet.</Text>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
    padding: spacing.lg,
  },
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
    color: colors.textSecondary,
    marginLeft: 4,
  },
  dot: {
    color: colors.textMuted,
    marginHorizontal: spacing.sm,
  },
});