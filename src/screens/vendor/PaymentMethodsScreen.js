import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { currentVendor, updateVendorPaymentMethodsMock } from '../../services/mockData';
import { updateVendorPaymentMethods } from '../../services/userService';
import { normalizeKenyanPhoneDisplay, normalizeKenyanPhoneE164 } from '../../utils/format';
import { TEST_MODE } from '../../utils/testMode';
import { colors, radius, spacing, typography } from '../../utils/theme';

const TILL_PATTERN = /^\d{5,10}$/;

export default function PaymentMethodsScreen({ navigation }) {
  const { currentUser, userProfile } = useAuth();

  const initial = TEST_MODE
    ? currentVendor?.mpesaPaymentMethods || {}
    : userProfile?.mpesaPaymentMethods || {};

  const [sendMoneyInput, setSendMoneyInput] = useState(
    initial.sendMoneyNumber || ''
  );
  const [tillInput, setTillInput] = useState(initial.tillNumber || '');
  const [saving, setSaving] = useState(false);

  const cleanedTill = tillInput.replace(/[\s\-()]/g, '').trim();
  const sendMoneyDisplay = normalizeKenyanPhoneDisplay(sendMoneyInput);
  const sendMoneyValid = !sendMoneyInput.trim() || Boolean(sendMoneyDisplay);
  const tillValid = !tillInput.trim() || TILL_PATTERN.test(cleanedTill);

  const handleSave = async () => {
    if (saving) return;
    if (!sendMoneyValid) {
      Alert.alert(
        'Invalid Send Money Number',
        'Enter a valid Kenyan M-Pesa number, for example 0712345678.'
      );
      return;
    }
    if (!tillValid) {
      Alert.alert(
        'Invalid Till Number',
        'Buy Goods Till numbers are 5-10 digits and are not phone numbers, for example 5123456.'
      );
      return;
    }
    if (!sendMoneyInput.trim() && !tillInput.trim()) {
      Alert.alert(
        'No Payment Details',
        'Add at least one method so buyers know how to pay you. If you leave both empty, buyers will fall back to your store phone number.'
      );
      return;
    }

    setSaving(true);
    try {
      if (TEST_MODE) {
        updateVendorPaymentMethodsMock({
          sendMoneyNumber: sendMoneyInput.trim() || null,
          tillNumber: cleanedTill || null,
        });
        Alert.alert('Payment Details Saved', 'TEST MODE: updated for the prototype vendor.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }
      if (!currentUser?.uid) {
        Alert.alert('Signed out', 'Sign in again to save your payment details.');
        return;
      }
      await updateVendorPaymentMethods(currentUser.uid, {
        sendMoneyNumber: sendMoneyInput.trim() || null,
        tillNumber: cleanedTill || null,
      });
      Alert.alert('Payment Details Saved', 'Your M-PESA payment details have been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Save Failed', error?.message || 'Could not save your payment details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How buyers pay you</Text>
            <Text style={styles.infoText}>
              Buyers pay you directly via M-PESA using these details:
              Send Money (to your phone number) and/or Buy Goods Till number.
              The numbers shown to the buyer are locked onto each order at
              checkout, so they never change for that order even if you update
              them later. SokoHapa never receives or handles this money.
            </Text>
          </View>

          <TextField
            label="M-Pesa Send Money Number"
            value={sendMoneyInput}
            onChangeText={setSendMoneyInput}
            placeholder="07XXXXXXXX"
            keyboardType="phone-pad"
            autoComplete="tel"
            maxLength={20}
          />
          {sendMoneyValid ? (
            <Text style={styles.inputHint}>
              Phone number buyers use for Send Money / Lipa na M-PESA.
            </Text>
          ) : (
            <Text style={styles.inputHintError}>
              Must be a valid Kenyan M-Pesa number.
            </Text>
          )}
          {sendMoneyDisplay ? (
            <Text style={styles.preview}>Will be shown as {sendMoneyDisplay}</Text>
          ) : null}

          <TextField
            label="Buy Goods Till Number"
            value={tillInput}
            onChangeText={setTillInput}
            placeholder="e.g. 5123456"
            keyboardType="number-pad"
            maxLength={12}
          />
          {tillInput ? (
            <Text style={styles.preview}>Will be shown as {cleanedTill}</Text>
          ) : null}

          <View style={styles.hintCard}>
            <Text style={styles.hintText}>
              You can set one or both methods. If neither is set, buyers fall
              back to your store phone number as a Send Money number.
            </Text>
          </View>

          <PrimaryButton
            title={saving ? 'Saving…' : 'Save Payment Details'}
            onPress={handleSave}
            icon="checkmark"
            disabled={saving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  infoCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    ...typography.subtitle,
    fontSize: 15,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    lineHeight: 18,
  },
  preview: {
    ...typography.bodySmall,
    color: colors.success,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  inputHint: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  inputHintError: {
    ...typography.bodySmall,
    color: colors.danger,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  hintCard: {
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  hintText: {
    ...typography.bodySmall,
    color: colors.warning,
    lineHeight: 18,
  },
});