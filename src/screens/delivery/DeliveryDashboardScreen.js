import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import { useAuth } from '../../context/AuthContext';
import { currentDeliveryProfile } from '../../services/mockData';
import {
  onActiveDelivery,
  onDeliveryHistory,
  onPendingDeliveryRequests,
  setDeliveryAvailability,
} from '../../services/deliveryService';
import { TEST_MODE } from '../../utils/testMode';
import { getProfilePhotoUrl } from '../../services/profilePhotoService';
import { getVehicleIcon, getVehicleLabel } from '../../utils/vehicleTypes';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

export default function DeliveryDashboardScreen({ navigation }) {
  const { currentUser, userRole, userProfile, logout } = useAuth();
  const [available, setAvailable] = useState(true);
  const [requestsCount, setRequestsCount] = useState(0);
  const [hasActive, setHasActive] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState('No active delivery');
  const [historyCount, setHistoryCount] = useState(0);
  const profilePhoto = getProfilePhotoUrl(userProfile?.profilePhoto);

  useEffect(() => {
    if (userProfile?.availability === 'Unavailable' || userProfile?.availability === 'Busy') {
      setAvailable(false);
    } else if (userProfile?.availability === 'Available') {
      setAvailable(true);
    }
  }, [userProfile?.availability]);

  useEffect(() => {
    if (TEST_MODE) return undefined;
    const uid = userProfile?.uid || currentUser?.uid;
    if (!uid) return undefined;

    const offRequests = onPendingDeliveryRequests(uid, (list) => {
      setRequestsCount(list.length);
    });
    const offActive = onActiveDelivery(uid, (next) => {
      setHasActive(Boolean(next));
      setActiveSubtitle(next?.orderNumber ? `Order ${next.orderNumber}` : 'Active');
    });
    const offHistory = onDeliveryHistory(uid, (list) => {
      setHistoryCount(list.length);
    });

    return () => {
      offRequests();
      offActive();
      offHistory();
    };
  }, [currentUser?.uid, userProfile?.uid]);

  const toggleAvailability = async () => {
    const next = !available;
    setAvailable(next);
    if (TEST_MODE) return;
    const uid = userProfile?.uid || currentUser?.uid;
    if (!uid) return;
    try {
      await setDeliveryAvailability(uid, next ? 'Available' : 'Unavailable');
    } catch (error) {
      console.warn('[auth] setDeliveryAvailability failed on DeliveryDashboardScreen', {
        role: 'delivery',
        operation: 'setDeliveryAvailability',
        collection: 'users',
        path: `users/${uid}`,
        targetAvailability: next ? 'Available' : 'Unavailable',
        code: error?.code,
        message: error?.message,
      });
      setAvailable(!next);
    }
  };

  const vehicleType = TEST_MODE
    ? currentDeliveryProfile.vehicleType
    : userProfile?.vehicleType || 'motorcycle';

  const plateNumber = TEST_MODE
    ? currentDeliveryProfile.plateNumber
    : userProfile?.vehiclePlateNumber || '';

  const cards = TEST_MODE
    ? [
        {
          key: 'Requests',
          title: 'New Requests',
          subtitle: '3 waiting',
          icon: 'bell-outline',
          navigate: 'Requests',
          count: 3,
        },
        {
          key: 'Active',
          title: 'Active Delivery',
          subtitle: 'SH-1045',
          icon: 'motorbike',
          navigate: 'ActiveDelivery',
          count: 1,
        },
        {
          key: 'History',
          title: 'Completed Deliveries',
          subtitle: '3 trips so far',
          icon: 'check-circle-outline',
          navigate: 'History',
          count: 3,
        },
      ]
    : [
        {
          key: 'Requests',
          title: 'New Requests',
          subtitle: requestsCount === 0 ? 'Nothing waiting' : `${requestsCount} waiting`,
          icon: 'bell-outline',
          navigate: 'Requests',
          count: requestsCount,
        },
        {
          key: 'Active',
          title: 'Active Delivery',
          subtitle: activeSubtitle,
          icon: 'motorbike',
          navigate: 'ActiveDelivery',
          count: hasActive ? 1 : 0,
        },
        {
          key: 'History',
          title: 'Completed Deliveries',
          subtitle: `${historyCount} trip${historyCount === 1 ? '' : 's'} so far`,
          icon: 'check-circle-outline',
          navigate: 'History',
          count: historyCount,
        },
      ];

  return (
    <View style={styles.container}>
      <AppHeader
        title="Delivery Dashboard"
        subtitle={userRole}
        right={
          <Ionicons name="log-out-outline" size={22} color={colors.text} onPress={logout} />
        }
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.availabilityCard, { backgroundColor: available ? colors.successLight : colors.warningLight }]}>
          <View style={styles.availabilityRow}>
            <View style={[styles.statusDot, { backgroundColor: available ? colors.success : colors.warning }]} />
            <View style={styles.availabilityTextWrap}>
              <Text style={[styles.availabilityTitle, { color: available ? colors.success : colors.warning }]}>
                {available ? 'Available' : 'Unavailable'}
              </Text>
              <Text style={[styles.availabilityHint, { color: available ? colors.success : colors.warning }]}>
                {available ? 'You can receive delivery requests.' : 'You are not receiving requests.'}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleAvailability}
              style={[styles.toggle, { backgroundColor: available ? colors.success : colors.warning }]}
            >
              <Text style={styles.toggleText}>{available ? 'Unavailable' : 'Available'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today</Text>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.key}
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate(card.navigate)}
          >
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons name={card.icon} size={26} color={colors.primary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{card.count}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.card}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.cardIcon}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person-circle-outline" size={26} color={colors.primary} />
            )}
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Profile</Text>
            <Text style={styles.cardSubtitle}>Account details and sign out</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.vehicleCard}>
          <MaterialCommunityIcons
            name={getVehicleIcon(vehicleType)}
            size={20}
            color={colors.primary}
          />
          <Text style={styles.vehicleText}>
            {getVehicleLabel(vehicleType)}: {plateNumber}
          </Text>
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
  availabilityCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadow,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: radius.round,
    marginRight: spacing.sm,
  },
  availabilityTextWrap: {
    flex: 1,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  availabilityHint: {
    fontSize: 12,
    marginTop: 2,
  },
  toggle: {
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: spacing.sm,
  },
  toggleText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
  },
  cardBody: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: spacing.sm,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  vehicleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
});