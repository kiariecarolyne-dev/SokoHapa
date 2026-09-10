import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

const roles = [
  {
    key: 'buyer',
    title: 'I am a Buyer',
    subtitle: 'Browse stores and order fresh market products.',
    icon: 'cart-outline',
    navigate: 'BuyerRegister',
  },
  {
    key: 'vendor',
    title: 'I am a Vendor',
    subtitle: 'Open a store and sell your produce to buyers.',
    icon: 'storefront-outline',
    navigate: 'VendorRegister',
  },
  {
    key: 'delivery',
    title: 'I am a Delivery Person',
    subtitle: 'Deliver orders and earn per trip.',
    icon: 'motorbike',
    navigate: 'DeliveryRegister',
  },
];

export default function RegisterRoleScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>How would you like to use SokoHapa?</Text>
      </View>

      <View style={styles.list}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.key}
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate(role.navigate)}
          >
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name={role.icon} size={26} color={colors.primary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{role.title}</Text>
              <Text style={styles.cardSubtitle}>{role.subtitle}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.bodySmall,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  cardTitle: {
    ...typography.subtitle,
  },
  cardSubtitle: {
    ...typography.bodySmall,
    marginTop: 2,
  },
});