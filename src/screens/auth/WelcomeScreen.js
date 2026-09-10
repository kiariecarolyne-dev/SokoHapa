import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BrandHeader from '../../components/BrandHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, spacing, typography } from '../../utils/theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <BrandHeader size="large" />
        <Text style={styles.description}>
          Connect with local vendors, buy fresh products and get them delivered.
        </Text>

        <View style={styles.features}>
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="storefront-outline" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Shop from trusted local vendors</Text>
          </View>
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="leaf" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Fresh market produce every day</Text>
          </View>
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="motorbike" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Orders delivered to your door</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          title="Login"
          onPress={() => navigation.navigate('Login')}
        />
        <PrimaryButton
          title="Create Account"
          variant="outline"
          onPress={() => navigation.navigate('RegisterRole')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  features: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  featureText: {
    ...typography.body,
    marginLeft: spacing.md,
    color: colors.text,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
});