import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import PrimaryButton from '../../components/PrimaryButton';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://10.0.2.2:3000';
const SUBSCRIPTION_AMOUNT = 100;
const isDevBuild = typeof __DEV__ === 'boolean' && __DEV__;

function normalizeKenyanPhone(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let cleaned = raw.replace(/[\s\-()]/g, '').trim();
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
  if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);
  if (cleaned.startsWith('7') && cleaned.length === 9) cleaned = '254' + cleaned;
  if (cleaned.startsWith('1') && cleaned.length === 9) cleaned = '254' + cleaned;
  if (/^254(1|7)\d{8}$/.test(cleaned)) return cleaned;
  return null;
}

function formatDate(dateVal) {
  if (!dateVal) return '';
  const ms =
    typeof dateVal?.toMillis === 'function'
      ? dateVal.toMillis()
      : new Date(dateVal).getTime();
  if (!Number.isFinite(ms)) return '';
  return new Date(ms).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function VendorSubscriptionScreen({ navigation }) {
  const { currentUser, userProfile, logout } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [devLoading, setDevLoading] = useState(false);
  const [liveProfile, setLiveProfile] = useState(userProfile);

  const subscription = liveProfile || userProfile;

  const expiryMs = (() => {
    const expiry = subscription?.subscriptionExpiryDate;
    if (!expiry) return null;
    return typeof expiry?.toMillis === 'function'
      ? expiry.toMillis()
      : new Date(expiry).getTime();
  })();

  const isSubscribed =
    subscription?.subscriptionStatus === 'active' &&
    (expiryMs === null || (Number.isFinite(expiryMs) && expiryMs > Date.now()));

  const expiredPreviously =
    !isSubscribed && expiryMs !== null && Number.isFinite(expiryMs);

  const expiryDate = formatDate(subscription?.subscriptionExpiryDate);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      setLiveProfile((prev) => ({ ...(prev || {}), ...data }));
      if (data.subscriptionStatus === 'active') {
        const expiry = data.subscriptionExpiryDate;
        const expiryMsVal =
          typeof expiry?.toMillis === 'function'
            ? expiry.toMillis()
            : expiry
              ? new Date(expiry).getTime()
              : null;
        const valid = !expiryMsVal || expiryMsVal > Date.now();
        if (valid) {
          setStatusMessage('');
        }
      }
    });
    return unsubscribe;
  }, [currentUser?.uid]);

  const handleSubscribe = async () => {
    if (loading) return;

    const normalized = normalizeKenyanPhone(phoneNumber);
    if (!normalized) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid Kenyan M-Pesa number.\nExamples: 07XXXXXXXX, 2547XXXXXXXX'
      );
      return;
    }

    setLoading(true);
    setStatusMessage('Sending M-Pesa payment prompt…');

    try {
      const token = await currentUser.getIdToken(false);
      const response = await fetch(`${BACKEND_URL}/api/payments/mpesa/stkpush`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phoneNumber: normalized,
          amount: SUBSCRIPTION_AMOUNT,
          // Renewal hint: when the vendor already has a (possibly expired)
          // subscription, pass the current entitlement deadline so the backend
          // can extend from it by one calendar month instead of accidentally
          // shortening the vendor's coverage. Sent only when a deadline exists.
          ...(Number.isFinite(expiryMs)
            ? { previousExpiry: Math.round(expiryMs) }
            : {}),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.log('[FIRESTORE/PAYMENT FAILURE]', {
          operation: 'STK Push',
          httpStatus: response.status,
          message: result.error || result.detail || 'Unknown error',
        });
        setStatusMessage('');
        Alert.alert(
          'Payment Failed',
          result.error || 'Could not initiate M-Pesa payment. Please try again.'
        );
        return;
      }

      setStatusMessage(
        'M-Pesa payment prompt sent. Check your phone and enter your M-Pesa PIN.'
      );
    } catch (error) {
      console.log('[FIRESTORE/PAYMENT FAILURE]', {
        operation: 'STK Push',
        httpStatus: 0,
        message: error?.message || 'Network error',
      });
      setStatusMessage('');
      Alert.alert(
        'Network Error',
        'Could not reach the payment server. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigation.replace('Dashboard');
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleDevActivate = async () => {
    if (devLoading) return;
    setDevLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/test/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorUid: currentUser.uid }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        Alert.alert('Test Failed', result.error || 'Could not activate test subscription.');
      } else {
        Alert.alert('Test Active', 'Test subscription activated. The UI will update automatically.');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Could not reach the backend server.');
    } finally {
      setDevLoading(false);
    }
  };

  const handleDevReset = async () => {
    if (devLoading) return;
    setDevLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/test/subscription/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorUid: currentUser.uid }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        Alert.alert('Reset Failed', result.error || 'Could not reset test subscription.');
      } else {
        Alert.alert('Subscription Reset', 'Subscription set to inactive. The UI will update automatically.');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Could not reach the backend server.');
    } finally {
      setDevLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Ionicons name="shield-checkmark-outline" size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>SokoHapa Vendor Subscription</Text>
          {isSubscribed ? (
            <>
              <StatusBadge label="Active" />
              <Text style={styles.expiryText}>
                Subscription active until {expiryDate}
              </Text>
            </>
          ) : expiredPreviously ? (
            <>
              <StatusBadge label="Expired" />
              <View style={styles.expiredCard}>
                <Ionicons name="alert-circle-outline" size={22} color={colors.warning} />
                <Text style={styles.expiredText}>
                  Your subscription expired on {expiryDate}. Your store stays
                  visible to customers but is temporarily unavailable for new
                  orders. Renew below to start receiving orders again.
                </Text>
              </View>
            </>
          ) : (
            <>
              <StatusBadge label="Inactive" />
            </>
          )}
        </View>

        <View style={styles.planCard}>
          <Text style={styles.planLabel}>Monthly Subscription</Text>
          <Text style={styles.planPrice}>KES {SUBSCRIPTION_AMOUNT} / month</Text>
        </View>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Benefits</Text>
          {[
            'Add and manage products',
            'Keep your store active',
            'Receive customer orders',
            'Manage your vendor store',
          ].map((item) => (
            <View key={item} style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.benefitText}>{item}</Text>
            </View>
          ))}
        </View>

        {!isSubscribed && (
          <>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>M-Pesa Phone Number</Text>
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="07XXXXXXXX"
                placeholderTextColor={colors.placeholder}
                keyboardType="phone-pad"
                autoComplete="tel"
                maxLength={13}
              />
              <Text style={styles.inputHint}>
                Enter the number linked to your M-Pesa account
              </Text>
            </View>

            {statusMessage ? (
              <View style={styles.statusCard}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.statusText}>{statusMessage}</Text>
              </View>
            ) : null}

            <View style={styles.actions}>
              <PrimaryButton
                title={
                  loading
                    ? 'Processing…'
                    : expiredPreviously
                      ? 'Renew with M-Pesa'
                      : 'Subscribe with M-Pesa'
                }
                icon={loading ? undefined : 'phone-portrait-outline'}
                onPress={handleSubscribe}
                disabled={loading}
              />
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.spinner}
                />
              ) : null}
            </View>
          </>
        )}

        {isSubscribed && (
          <View style={styles.actions}>
            <PrimaryButton
              title="Continue to Dashboard"
              icon="arrow-forward-outline"
              onPress={handleContinue}
            />
          </View>
        )}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.infoText}>
            Vendors need an active subscription to sell products and receive
            marketplace orders. A vendor with an inactive or expired
            subscription cannot sell or receive orders.
          </Text>
        </View>

        {isDevBuild && (
          <View style={styles.devSection}>
            <Text style={styles.devTitle}>DEV Controls</Text>
            <Text style={styles.devHint}>
              Development only — not visible in production builds.
            </Text>
            <View style={styles.devButtons}>
              <PrimaryButton
                title="DEV: Activate Test Subscription"
                variant="outline"
                onPress={handleDevActivate}
                disabled={devLoading}
              />
              <PrimaryButton
                title="DEV: Reset Subscription"
                variant="danger"
                onPress={handleDevReset}
                disabled={devLoading}
              />
            </View>
            {devLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
            ) : null}
          </View>
        )}

        <PrimaryButton
          title="Logout"
          variant="danger"
          icon="log-out-outline"
          onPress={handleLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
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
    fontSize: 22,
  },
  expiryText: {
    ...typography.bodySmall,
    color: colors.success,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  expiredCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  expiredText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.warning,
    marginLeft: spacing.sm,
    lineHeight: 20,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadow,
  },
  planLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: spacing.xs,
  },
  benefitsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  benefitsTitle: {
    ...typography.subtitle,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitText: {
    ...typography.body,
    marginLeft: spacing.sm,
    flex: 1,
  },
  inputSection: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  phoneInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  inputHint: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statusText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.primaryDark,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
  actions: {
    marginBottom: spacing.md,
  },
  spinner: {
    marginTop: spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  infoText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
  devSection: {
    backgroundColor: colors.warningLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  devTitle: {
    ...typography.subtitle,
    fontSize: 14,
    color: colors.warning,
  },
  devHint: {
    ...typography.bodySmall,
    color: colors.warning,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  devButtons: {
    gap: spacing.sm,
  },
});
