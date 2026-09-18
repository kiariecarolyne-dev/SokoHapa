import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BrandHeader from '../../components/BrandHeader';
import TextField from '../../components/TextField';
import PhotoField from '../../components/PhotoField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { getAuthErrorMessage } from '../../utils/firebaseErrors';
import { colors, spacing, typography } from '../../utils/theme';

export default function VendorRegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoSelected, setPhotoSelected] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !storeName.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Please fill in all the fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      // The auth-state listener resolves the new role and AppNavigator
      // switches to the vendor dashboard (subscription screen first).
      await register(email.trim(), password, {
        role: 'vendor',
        fullName: fullName.trim(),
        phone: phone.trim(),
        storeName: storeName.trim(),
      });
    } catch (error) {
      Alert.alert('Registration failed', getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
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
          <BrandHeader size="medium" tagline={false} />

          <Text style={styles.title}>Vendor Account</Text>
          <Text style={styles.subtitle}>
            Create a vendor account to start selling on SokoHapa. After
            registering you will reach the subscription screen.
          </Text>

          <TextField
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Mary Njeri"
            autoCapitalize="words"
            icon="person"
          />
          <TextField
            label="Store/Shop Name"
            value={storeName}
            onChangeText={setStoreName}
            placeholder="e.g. Mama Njeri Fresh Farm"
            autoCapitalize="words"
            icon="storefront"
          />
          <TextField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+254 7xx xxx xxx"
            keyboardType="phone-pad"
            icon="call"
          />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            icon="mail"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 6 characters"
            secureTextEntry
            icon="lock-closed"
          />
          <TextField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            secureTextEntry
            icon="lock-closed"
          />

          <PhotoField
            label="Profile Photo"
            value={photoSelected}
            icon="person-outline"
            onPress={() => {
              setPhotoSelected(true);
              Alert.alert('Photo upload', 'Photo uploads will be available in a later phase.');
            }}
          />

          <PrimaryButton
            title="Create Vendor Account"
            onPress={handleRegister}
            disabled={submitting}
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
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.bodySmall,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
});