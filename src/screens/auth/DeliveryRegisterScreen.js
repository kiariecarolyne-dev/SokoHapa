import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BrandHeader from '../../components/BrandHeader';
import TextField from '../../components/TextField';
import PhotoField from '../../components/PhotoField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { getAuthErrorMessage } from '../../utils/firebaseErrors';
import { VEHICLE_TYPES } from '../../utils/vehicleTypes';
import { colors, radius, spacing, typography } from '../../utils/theme';

export default function DeliveryRegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoSelected, setPhotoSelected] = useState(false);
  const [vehicleType, setVehicleType] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (
      !fullName.trim() ||
      !nationalId.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !password.trim() ||
      !vehicleType ||
      !plateNumber.trim()
    ) {
      Alert.alert('Missing details', 'Please fill in all the fields and choose a vehicle type.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      // The auth-state listener resolves the new role and AppNavigator
      // switches to the delivery dashboard.
      await register(email.trim(), password, {
        role: 'delivery',
        fullName: fullName.trim(),
        phone: phone.trim(),
        nationalId: nationalId.trim(),
        vehicleType,
        vehiclePlateNumber: plateNumber.trim().toUpperCase(),
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

          <Text style={styles.title}>Delivery Account</Text>
          <Text style={styles.subtitle}>
            Create a delivery account to start delivering on SokoHapa. Your
            National ID is collected for verification and will never be shown
            publicly.
          </Text>

          <TextField
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Collins Otieno"
            autoCapitalize="words"
            icon="person"
          />
          <TextField
            label="National ID"
            value={nationalId}
            onChangeText={setNationalId}
            placeholder="e.g. 34567890"
            keyboardType="number-pad"
            secureTextEntry
            icon="card"
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

          <Text style={styles.inputLabel}>Vehicle Type</Text>
          <View style={styles.vehicleRow}>
            {VEHICLE_TYPES.map((type) => {
              const selected = vehicleType === type.value;
              return (
                <TouchableOpacity
                  key={type.value}
                  activeOpacity={0.8}
                  onPress={() => setVehicleType(type.value)}
                  style={[styles.vehicleChip, selected && styles.vehicleChipSelected]}
                >
                  <MaterialCommunityIcons
                    name={type.icon}
                    size={20}
                    color={selected ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.vehicleChipText, selected && styles.vehicleChipTextSelected]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextField
            label="Vehicle Number Plate"
            value={plateNumber}
            onChangeText={setPlateNumber}
            placeholder="e.g. KDK 123A"
            autoCapitalize="characters"
            icon="car-outline"
          />

          <PrimaryButton
            title="Create Delivery Account"
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
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  vehicleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  vehicleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
  },
  vehicleChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  vehicleChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  vehicleChipTextSelected: {
    color: colors.primaryDark,
  },
});