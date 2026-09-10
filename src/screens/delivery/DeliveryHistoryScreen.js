import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import { deliveryHistory } from '../../services/mockData';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';
import { formatKES } from '../../utils/format';

export default function DeliveryHistoryScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.orderNo}>Order {item.orderNumber}</Text>
          <Text style={styles.vendor}>{item.vendorStore}</Text>
        </View>
        <StatusBadge label={item.status} />
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="time-outline" size={14} color={colors.textMuted} />
        <Text style={styles.meta}>{item.date}</Text>
        <Text style={styles.dot}>•</Text>
        <Ionicons name="cash-outline" size={14} color={colors.textMuted} />
        <Text style={styles.meta}>{formatKES(item.deliveryFee)} fee (placeholder)</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={deliveryHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
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