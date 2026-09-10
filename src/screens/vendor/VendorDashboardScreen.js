import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { currentVendor } from '../../services/mockData';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

const menu = [
  { key: 'Store', icon: 'storefront-outline', navigate: 'Store' },
  { key: 'Products', icon: 'basket-outline', navigate: 'Products' },
  { key: 'Orders', icon: 'receipt-outline', navigate: 'Orders' },
  { key: 'Delivery', icon: 'motorbike', navigate: 'ChooseDelivery' },
  { key: 'Subscription', icon: 'shield-checkmark-outline', navigate: 'Subscription' },
  { key: 'Profile', icon: 'person-outline', navigate: 'Profile' },
];

export default function VendorDashboardScreen({ navigation }) {
  const { userRole, logout } = useAuth();

  return (
    <View style={styles.container}>
      <AppHeader
        title="Vendor Dashboard"
        subtitle={userRole}
        right={
          <Ionicons name="log-out-outline" size={22} color={colors.text} onPress={logout} />
        }
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.welcomeCard}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={26} color={colors.white} />
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Karibu, {currentVendor.fullName.split(' ')[0]}</Text>
            <Text style={styles.welcomeStore}>{currentVendor.storeName}</Text>
          </View>
          <StatusBadge label="Inactive" />
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Subscription: Inactive</Text>
            <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
          </View>
          <Text style={styles.statusHint}>
            Subscribe to start selling products and receiving orders.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Manage</Text>
        <View style={styles.grid}>
          {menu.map((item) => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.85}
              style={styles.card}
              onPress={() => navigation.navigate(item.navigate)}
            >
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons name={item.icon} size={26} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>{item.key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  welcomeTitle: {
    ...typography.subtitle,
  },
  welcomeStore: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    ...typography.subtitle,
    fontSize: 14,
    color: colors.warning,
    marginRight: spacing.sm,
  },
  statusHint: {
    ...typography.bodySmall,
    color: colors.warning,
    marginTop: 4,
    lineHeight: 18,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
    ...shadow,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.subtitle,
    fontSize: 14,
  },
});