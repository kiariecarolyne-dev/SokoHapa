import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../utils/theme';

// Official SokoHapa logo (squared, full-bleed). Rendered with `contain` inside
// the rounded wrapper so the logo's light canvas blends seamlessly.
const LOGO_SOURCE = require('../../assets/sokohapa-logo.png');

export default function BrandHeader({ size = 'large', tagline = true }) {
  const isLarge = size === 'large';
  return (
    <View style={styles.container}>
      <View style={[styles.logoWrap, isLarge && styles.logoWrapLarge]}>
        <Image
          source={LOGO_SOURCE}
          style={[styles.logo, isLarge && styles.logoLarge]}
          resizeMode="contain"
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
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.logoBackground,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  logoWrapLarge: {
    width: 84,
    height: 84,
    borderRadius: 26,
  },
  logo: {
    width: 52,
    height: 52,
  },
  logoLarge: {
    width: 84,
    height: 84,
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