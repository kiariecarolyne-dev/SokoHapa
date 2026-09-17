import { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { currentVendor } from '../../services/mockData';
import { getProfilePhotoUrl } from '../../services/profilePhotoService';
import { ensureVendorStore } from '../../services/storeService';
import { TEST_MODE, isVendorSubscribed, subscriptionExpiryMs } from '../../utils/testMode';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

const menu = [
  { key: 'Store', icon: 'storefront-outline', navigate: 'Store' },
  { key: 'Products', icon: 'basket-outline', navigate: 'Products' },
  { key: 'Orders', icon: 'receipt-outline', navigate: 'Orders' },
  { key: 'Delivery', icon: 'motorbike', navigate: 'ChooseDelivery' },
  { key: 'Subscription', icon: 'shield-check-outline', navigate: 'Subscription' },
  { key: 'Profile', icon: 'account-outline', navigate: 'Profile' },
];

export default function VendorDashboardScreen({ navigation }) {
  const { userRole, userProfile, currentUser, logout } = useAuth();
  const profilePhoto = getProfilePhotoUrl(userProfile?.profilePhoto);
  const vendorDisplay = TEST_MODE
    ? currentVendor
    : {
        fullName: userProfile?.fullName || 'Vendor',
        storeName: userProfile?.storeName || 'My Store',
      };

  const subscribed = isVendorSubscribed(userProfile);
  const expiryMs = subscriptionExpiryMs(userProfile);
  const expired = !subscribed && expiryMs != null;
  const expiryDate = expired
    ? new Date(expiryMs).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  useEffect(() => {
    if (TEST_MODE || !userProfile) return;
    const storeId = currentUser?.uid;
    if (!storeId) return;
    ensureVendorStore({
      ownerUid: storeId,
      vendorName: userProfile.fullName || '',
      name: userProfile.storeName || '',
      phone: userProfile.phone || '',
      location: userProfile.storeLocation || '',
      description: userProfile.storeDescription || '',
      profilePhoto: userProfile.profilePhoto || null,
    }).catch((error) => {
      console.warn('[store] ensureVendorStore failed on VendorDashboardScreen', {
        role: 'vendor',
        operation: 'ensureVendorStore',
        collection: 'stores',
        path: `stores/${storeId}`,
        code: error?.code,
        message: error?.message,
      });
    });
  }, [userProfile, currentUser]);

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
        {TEST_MODE ? (
          <View style={styles.testModeBanner}>
            <Ionicons name="flask-outline" size={18} color={colors.primaryDark} />
            <Text style={styles.testModeText}>
              TEST MODE — subscription gates are bypassed for development
              testing. Real subscription rules re-enable for production.
            </Text>
          </View>
        ) : null}
        <View style={styles.welcomeCard}>
          <View style={styles.avatar}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person-outline" size={26} color={colors.white} />
            )}
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Karibu, {vendorDisplay.fullName.split(' ')[0]}</Text>
            <Text style={styles.welcomeStore}>{vendorDisplay.storeName}</Text>
          </View>
          <StatusBadge label={subscribed ? 'Active' : expired ? 'Expired' : 'Inactive'} />
        </View>

        {subscribed ? (
          <View style={styles.activeStatusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.activeStatusLabel}>Subscription: Active</Text>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
            </View>
            <Text style={styles.activeStatusHint}>
              Your store is active. You can add products and receive orders.
            </Text>
          </View>
        ) : (
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>
                Subscription: {expired ? 'Expired' : 'Inactive'}
              </Text>
              <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
            </View>
            {expired ? (
              <>
                <Text style={styles.statusHint}>
                  Your subscription expired on {expiryDate}. Your store stays
                  visible to customers but is temporarily unavailable for new
                  orders. Renew to start receiving orders again.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.renewButton}
                  onPress={() => navigation.navigate('Subscription')}
                >
                  <Ionicons name="phone-portrait-outline" size={16} color={colors.white} />
                  <Text style={styles.renewButtonText}>Renew with M-Pesa</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.statusHint}>
                Subscribe to start selling products and receiving orders.
              </Text>
            )}
          </View>
        )}

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
  testModeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  testModeText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.primaryDark,
    marginLeft: spacing.sm,
    lineHeight: 18,
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
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
  renewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.warning,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  renewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  activeStatusCard: {
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  activeStatusLabel: {
    ...typography.subtitle,
    fontSize: 14,
    color: colors.success,
    marginRight: spacing.sm,
  },
  activeStatusHint: {
    ...typography.bodySmall,
    color: colors.success,
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