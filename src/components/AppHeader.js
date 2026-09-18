import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../utils/theme';

export default function AppHeader({ title, subtitle, onBack, right, logo }) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.side}>
          {onBack ? (
            <Ionicons
              name="chevron-back"
              size={26}
              color={colors.text}
              onPress={onBack}
            />
          ) : null}
        </View>
        <View style={styles.center}>
          {logo ? (
            <Image
              source={logo}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
            </>
          )}
        </View>
        <View style={[styles.side, styles.sideRight]}>{right ?? null}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  side: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    width: 'auto',
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...typography.subtitle,
    fontSize: 17,
  },
  subtitle: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  logo: {
    width: 84,
    height: 30,
  },
});