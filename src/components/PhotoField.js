import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../utils/theme';
import ImagePlaceholder from './ImagePlaceholder';

export default function PhotoField({ label, value, icon = 'person-outline', onPress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity activeOpacity={0.8} style={styles.row} onPress={onPress}>
        {value ? (
          <ImagePlaceholder icon="checkmark" iconSize={22} backgroundColor={colors.successLight} iconColor={colors.success} style={styles.thumb} />
        ) : (
          <ImagePlaceholder icon={icon} iconSize={26} style={styles.thumb} />
        )}
        <View style={styles.textWrap}>
          <Text style={styles.title}>{value ? 'Photo selected' : 'Add a photo'}</Text>
          <Text style={styles.hint}>Uploads are not connected yet — placeholder only</Text>
        </View>
        <Ionicons name="camera-outline" size={22} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: radius.round,
  },
  textWrap: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});