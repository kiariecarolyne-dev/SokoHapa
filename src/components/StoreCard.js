import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, typography } from '../utils/theme';
import { getProfilePhotoUrl } from '../services/profilePhotoService';
import ImagePlaceholder from './ImagePlaceholder';

export default function StoreCard({ store, onPress, unavailable = false }) {
  const [photoError, setPhotoError] = useState(false);
  const photoUri = getProfilePhotoUrl(store.profilePhoto);
  const statusLabel = unavailable ? 'Temporarily Unavailable' : store.status || 'Open';
  const statusColor = unavailable
    ? colors.warning
    : store.status === 'Open'
      ? colors.success
      : colors.danger;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      {photoUri && !photoError ? (
        <Image
          source={{ uri: photoUri }}
          style={styles.image}
          onError={() => setPhotoError(true)}
        />
      ) : (
        <ImagePlaceholder
          icon="storefront-outline"
          iconSize={26}
          style={styles.image}
        />
      )}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{store.name}</Text>
          <Text style={[styles.status, { color: statusColor }]} numberOfLines={1}>
            {statusLabel}
          </Text>
        </View>
        {store.vendorName ? (
          <Text style={styles.vendor} numberOfLines={1}>by {store.vendorName}</Text>
        ) : null}
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
          <Text style={styles.meta} numberOfLines={1}>
            {store.location || 'Location not provided'}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={12} color={colors.accent} />
          <Text style={styles.meta}>{store.rating} rating</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    marginRight: spacing.md,
  },
  body: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    ...typography.subtitle,
    flex: 1,
    marginRight: spacing.sm,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  vendor: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  meta: {
    ...typography.bodySmall,
    marginLeft: 4,
    flex: 1,
  },
});