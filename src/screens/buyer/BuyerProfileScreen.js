import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { currentUserProfile } from '../../services/mockData';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

export default function BuyerProfileScreen({ navigation }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <ImagePlaceholder icon="person-outline" iconSize={52} style={styles.avatar} />
          <Text style={styles.name}>{currentUserProfile.fullName}</Text>
        </View>

        <View style={styles.card}>
          <ProfileRow icon="call-outline" label="Phone" value={currentUserProfile.phone} />
          <View style={styles.divider} />
          <ProfileRow icon="mail-outline" label="Email" value={currentUserProfile.email} />
        </View>

        <PrimaryButton
          title="Edit Profile"
          variant="outline"
          icon="create-outline"
          onPress={() => Alert.alert('Edit Profile', 'Profile editing will be available in a later phase.')}
          style={styles.button}
        />
        <PrimaryButton
          title="My Orders"
          variant="outline"
          icon="receipt-outline"
          onPress={() => navigation.navigate('Orders')}
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
      <Ionicons name={icon} size={20} color={colors.primary} />
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