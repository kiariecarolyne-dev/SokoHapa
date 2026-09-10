import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

export default function VendorSubscriptionScreen({ navigation }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleSubscribe = () => {
    Alert.alert(
      'M-Pesa Coming Soon',
      'Subscription payments are not implemented yet. This screen is a placeholder for the future subscription system.'
    );
  };

  const handleContinue = () => {
    navigation.replace('Dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Ionicons name="shield-checkmark-outline" size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>Vendor Subscription</Text>
          <Text style={styles.price}>KES 100 / month</Text>
          <Text style={styles.description}>
            Subscribe to start selling on SokoHapa.
          </Text>
          <StatusBadge label="Inactive" />
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.infoText}>
            Vendors need an active subscription to sell products and receive
            marketplace orders. A vendor with an inactive or expired
            subscription cannot sell or receive orders.
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          title="Subscribe with M-Pesa"
          icon="logo-bitcoin"
          onPress={handleSubscribe}
        />
        <PrimaryButton
          title="Continue if Active"
          variant="outline"
          onPress={handleContinue}
        />
        <PrimaryButton
          title="Logout"
          variant="danger"
          icon="log-out-outline"
          onPress={handleLogout}
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
    padding: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
  },
  price: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow,
  },
  infoText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
});