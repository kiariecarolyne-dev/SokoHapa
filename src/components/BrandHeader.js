import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../utils/theme';

export default function BrandHeader({ size = 'large', tagline = true }) {
  const isLarge = size === 'large';
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, isLarge && styles.iconWrapLarge]}>
        <Ionicons
          name="basket"
          size={isLarge ? 44 : 30}
          color={colors.white}
        />
      </View>
      <Text style={[styles.title, isLarge && styles.titleLarge]}>SokoHapa</Text>
      {tagline ? (
        <Text style={[styles.tagline, isLarge && styles.taglineLarge]}>
          The Market Is Here
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconWrapLarge: {
    width: 84,
    height: 84,
    borderRadius: 26,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
  },
  titleLarge: {
    fontSize: 36,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  taglineLarge: {
    fontSize: 16,
  },
});