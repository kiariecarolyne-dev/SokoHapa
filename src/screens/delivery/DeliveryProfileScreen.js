import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { currentDeliveryProfile } from '../../services/mockData';
import { getVehicleIcon, getVehicleLabel } from '../../utils/vehicleTypes';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

export default function DeliveryProfileScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <ImagePlaceholder icon="person-outline" iconSize={52} style={styles.avatar} />
          <Text style={styles.name}>{currentDeliveryProfile.fullName}</Text>
        </View>

        <View style={styles.card}>
          <ProfileRow icon="phone-outline" label="Phone" value={currentDeliveryProfile.phone} />
          <View style={styles.divider} />
          <ProfileRow icon="email-outline" label="Email" value={currentDeliveryProfile.email} />
          <View style={styles.divider} />
          <ProfileRow
            icon={getVehicleIcon(currentDeliveryProfile.vehicleType)}
            label="Vehicle Type"
            value={getVehicleLabel(currentDeliveryProfile.vehicleType)}
          />
          <View style={styles.divider} />
          <ProfileRow icon="car-outline" label="Number Plate" value={currentDeliveryProfile.plateNumber} />
        </View>

        <PrimaryButton
          title="Edit Profile"
          variant="outline"
          icon="create-outline"
          onPress={() => Alert.alert('Edit Profile', 'Profile editing will be available in a later phase.')}
          style={styles.button}
        />
        <PrimaryButton
          title="Logout"
          variant="danger"
          icon="log-out-outline"
          onPress={handleLogout}
          style={styles.button}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileRow({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: radius.round,
    marginBottom: spacing.md,
  },
  name: {
    ...typography.title,
    fontSize: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadow,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBody: {
    flex: 1,
    marginLeft: spacing.md,
  },
  rowLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  button: {
    marginBottom: spacing.md,
  },
});