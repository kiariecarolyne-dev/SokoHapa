import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import StatusBadge from '../../components/StatusBadge';
import { activeDelivery } from '../../services/mockData';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

export default function ActiveDeliveryScreen({ navigation, route }) {
  const [parcelStatus, setParcelStatus] = useState(activeDelivery.parcelStatus);

  const handlePickedUp = () => {
    setParcelStatus('Picked Up');
    Alert.alert('Picked Up', 'Parcel marked as picked up.');
  };

  const handleDelivered = () => {
    setParcelStatus('Delivered');
    Alert.alert('Delivered', 'Parcel marked as delivered.');
  };

  const delivery = { ...activeDelivery, parcelStatus };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <Text style={styles.orderNo}>Order {delivery.orderNumber}</Text>
          <StatusBadge label={delivery.parcelStatus} />
        </View>
        <Text style={styles.vendor}>{delivery.vendorStore}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pickup</Text>
        <View style={styles.infoRow}>
          <Ionicons name="storefront-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>{delivery.pickupLocation}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Delivery to Buyer</Text>
        <View style={styles.infoRow}>
          <Ionicons name="navigate-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>{delivery.deliveryLocation}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Buyer Phone</Text>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>{delivery.buyerPhone} (placeholder)</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Parcel Status</Text>
        <StatusBadge label={delivery.parcelStatus} />
      </View>

      <PrimaryButton
        title="Mark Picked Up"
        icon="cube-outline"
        variant={delivery.parcelStatus === 'Picked Up' ? 'outline' : 'primary'}
        disabled={delivery.parcelStatus === 'Picked Up' || delivery.parcelStatus === 'Delivered'}
        onPress={handlePickedUp}
      />
      <View style={styles.buttonSpacing} />
      <PrimaryButton
        title="Mark Delivered"
        icon="checkmark-circle"
        onPress={handleDelivered}
        disabled={delivery.parcelStatus === 'Delivered'}
      />
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
    ...typography.subtitle,
    fontSize: 18,
  },
  vendor: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  buttonSpacing: {
    height: spacing.md,
  },
});