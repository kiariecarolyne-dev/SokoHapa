import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
const TRANSACTION_DESC = 'SokoHapa monthly vendor subscription';

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
  const [pending, setPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
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
          setPending(false);
        }
      }
    });
    return unsubscribe;
  }, [currentUser?.uid]);

  const handleSubscribe = async () => {
    if (loading || pending) return;

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
          transactionDesc: TRANSACTION_DESC,
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

      // Safaricom accepted the STK Push: a prompt is on the vendor's phone.
      // The subscription is NOT active yet — the backend activates it only
      // after the Daraja callback verifies the payment. Keep this screen in a
      // pending state until the Firestore subscription listener sees the
      // backend write subscriptionStatus 'active'.
      setPending(true);
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
      setPending(false);
      Alert.alert(
        'Network Error',
        'Could not reach the payment server. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPending = () => {
    if (loading) return;
    setPending(false);
    setStatusMessage('');
  };

  const handleContinue = () => {
    navigation.replace('Dashboard');
  };

  const handleLogout = async () => {
    await logout();
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
                    : pending
                      ? 'Waiting for Payment…'
                      : expiredPreviously
                        ? 'Renew with M-Pesa'
                        : 'Subscribe with M-Pesa'
                }
                icon={loading || pending ? undefined : 'phone-portrait-outline'}
                onPress={handleSubscribe}
                disabled={loading || pending}
              />
              {loading || pending ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.spinner}
                />
              ) : null}
              {pending ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCancelPending}
                  style={styles.pendingCancel}
                >
                  <Text style={styles.pendingCancelText}>
                    Haven't received the prompt? Dismiss this and try again.
                  </Text>
                </TouchableOpacity>
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
  pendingCancel: {
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  pendingCancelText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
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
});
