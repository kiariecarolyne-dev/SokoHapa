import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfileAvatar from './ProfileAvatar';
import { colors, radius, shadow, spacing, typography } from '../utils/theme';

// Reusable marketplace identity section used across the Buyer <-> Vendor <->
// Delivery network. Renders a circular profile photo, the person's name, a
// small role label (Vendor / Buyer / Delivery Partner) and only the relevant
// details that are already part of the app's profile model.
export default function IdentityCard({
  roleLabel,
  name,
  profilePhoto,
  fallbackIcon = 'person-outline',
  details = [],
  style,
}) {
  const visibleDetails = details.filter((detail) => detail && detail.value);

  return (
    <View style={[styles.card, style]}>
      <ProfileAvatar profilePhoto={profilePhoto} size={56} fallbackIcon={fallbackIcon} />
      <View style={styles.body}>
        {name ? (
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            {roleLabel ? (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{roleLabel}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
        {visibleDetails.map((detail, index) => (
          <View key={index} style={styles.detailRow}>
            <Ionicons name={detail.icon} size={13} color={colors.textMuted} />
            <Text
              style={styles.detailText}
              numberOfLines={detail.numberOfLines ?? 1}
            >
              {detail.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  body: {
    flex: 1,
    marginLeft: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  roleBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.round,
    backgroundColor: colors.primaryLight,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  detailText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
  },
});