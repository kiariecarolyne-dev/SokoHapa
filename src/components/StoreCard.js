import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, typography } from '../utils/theme';
import ImagePlaceholder from './ImagePlaceholder';

export default function StoreCard({ store, onPress, imageWidth }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      <ImagePlaceholder
        icon="storefront-outline"
        iconSize={34}
        style={[styles.image, imageWidth ? { width: imageWidth } : null]}
      />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{store.name}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={colors.textMuted} />
          <Text style={styles.meta} numberOfLines={1}>{store.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={13} color={colors.accent} />
          <Text style={styles.meta}>{store.rating} rating</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={[styles.meta, { color: store.status === 'Open' ? colors.success : colors.danger }]}>
            {store.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow,
  },
  image: {
    width: '100%',
    height: 110,
    borderRadius: 0,
  },
  body: {
    padding: spacing.md,
  },
  name: {
    ...typography.subtitle,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  dot: {
    color: colors.textMuted,
    marginHorizontal: 6,
  },
});