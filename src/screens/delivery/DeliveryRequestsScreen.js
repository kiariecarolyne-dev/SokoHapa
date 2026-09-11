import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import { deliveryRequests } from '../../services/mockData';
import { acceptTestDeliveryRequest } from '../../utils/testMode';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';
import { formatKES } from '../../utils/format';

export default function DeliveryRequestsScreen({ navigation }) {
  const handleAccept = (request) => {
    const accepted = acceptTestDeliveryRequest(request.id);
    if (!accepted) {
      Alert.alert(
        'Not Accepted',
        'Accepting delivery requests is only available in TEST MODE (development).'
      );
      return;
    }
    Alert.alert(
      'Request Accepted',
      `Delivery for order ${request.orderNumber} accepted and added to your active delivery.`,
      [
        { text: 'View Delivery', onPress: () => navigation.navigate('ActiveDelivery', { requestId: request.id }) },
        { text: 'OK' },
      ]
    );
  };

  const handleDecline = (request) => {
    Alert.alert(
      'Request Declined',
      `Delivery for order ${request.orderNumber} declined.`
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.orderNo}>Order {item.orderNumber}</Text>
        <MaterialCommunityIcons name="motorbike" size={22} color={colors.primary} />
      </View>
      <Text style={styles.vendor}>{item.vendorStore}</Text>

      <View style={styles.locationRow}>
        <View style={styles.stepDot} />
        <View style={styles.locationBody}>
          <Text style={styles.locationLabel}>Pickup</Text>
          <Text style={styles.locationText}>{item.pickupLocation}</Text>
        </View>
      </View>
      <View style={styles.locationRow}>
        <View style={[styles.stepDot, styles.stepDotEnd]} />
        <View style={styles.locationBody}>
          <Text style={styles.locationLabel}>Delivery</Text>
          <Text style={styles.locationText}>{item.deliveryLocation}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="navigation-outline" size={16} color={colors.textMuted} />
          <Text style={styles.metaText}>{item.distanceKm} km (placeholder)</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="cash-multiple" size={16} color={colors.textMuted} />
          <Text style={styles.metaText}>{formatKES(item.deliveryFee)} fee (placeholder)</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          title="Accept"
          icon="checkmark"
          onPress={() => handleAccept(item)}
          style={styles.actionButton}
        />
        <PrimaryButton
          title="Decline"
          variant="outline"
          onPress={() => handleDecline(item)}
          style={styles.actionButton}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        Incoming delivery requests from vendors. Accept to start delivering.
      </Text>
      <FlatList
        data={deliveryRequests}
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
  hint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
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
    alignItems: 'center',
  },
  orderNo: {
    ...typography.subtitle,
    fontSize: 17,
  },
  vendor: {
    ...typography.bodySmall,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    marginTop: 5,
    marginRight: spacing.sm,
  },
  stepDotEnd: {
    backgroundColor: colors.accent,
  },
  locationBody: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});