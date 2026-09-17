import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { currentVendor } from '../../services/mockData';
import { getProfilePhotoUrl, uploadProfilePhoto } from '../../services/profilePhotoService';
import { TEST_MODE } from '../../utils/testMode';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

export default function VendorProfileScreen({ navigation }) {
  const { currentUser, userProfile, logout } = useAuth();
  const [photoPath, setPhotoPath] = useState(userProfile?.profilePhoto ?? null);
  const [uploading, setUploading] = useState(false);

  const vendorDisplay = TEST_MODE
    ? currentVendor
    : {
        fullName: userProfile?.fullName || 'Vendor',
        storeName: userProfile?.storeName || '',
        phone: userProfile?.phone || '',
        email: userProfile?.email || '',
      };

  const handleChangePhoto = async () => {
    if (uploading) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo access to choose a profile picture.');
      return;
    }

    let result;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });
    } catch (error) {
      console.error('[profilePhoto] Image picker failed', error?.message ?? error);
      Alert.alert('Error', 'Could not open the photo library.');
      return;
    }

    if (result.canceled) return;

    if (!currentUser) {
      Alert.alert('Signed out', 'Sign in again to change your profile photo.');
      return;
    }

    const asset = result.assets[0];
    if (!asset?.base64) {
      console.error('[profilePhoto] Picker did not return base64 image data');
      Alert.alert('Upload failed', 'Could not read the selected image. Please try another photo.');
      return;
    }

    console.info('[profilePhoto] Image selected', {
      size: asset.fileSize,
      mimeType: asset.mimeType,
    });

    setUploading(true);
    try {
      const path = await uploadProfilePhoto(currentUser.uid, asset.base64);
      setPhotoPath(path);
    } catch (error) {
      console.error('[profilePhoto] Upload failed with error', error?.message ?? error);
      Alert.alert(
        'Upload failed',
        'Your previous photo is still in place. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.85}>
            {photoPath ? (
              <Image source={{ uri: getProfilePhotoUrl(photoPath) }} style={styles.avatar} />
            ) : (
              <ImagePlaceholder icon="person-outline" iconSize={52} style={styles.avatar} />
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color={colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{vendorDisplay.fullName}</Text>
          <Text style={styles.store}>{vendorDisplay.storeName}</Text>
          <Text style={styles.hint}>
            {uploading ? 'Uploading photo…' : 'Tap the camera to change your photo'}
          </Text>
        </View>

        <View style={styles.card}>
          <ProfileRow icon="call-outline" label="Phone" value={vendorDisplay.phone} />
          <View style={styles.divider} />
          <ProfileRow icon="mail-outline" label="Email" value={vendorDisplay.email} />
          <View style={styles.divider} />
          <ProfileRow icon="storefront-outline" label="Store" value={vendorDisplay.storeName} />
        </View>

        <PrimaryButton
          title="Edit Profile"
          variant="outline"
          icon="create-outline"
          onPress={() => Alert.alert('Edit Profile', 'Profile editing will be available in a later phase.')}
          style={styles.button}
        />
        <PrimaryButton
          title="Subscription"
          variant="outline"
          icon="shield-checkmark-outline"
          onPress={() => navigation.navigate('Subscription')}
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
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: spacing.md,
    width: 28,
    height: 28,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  name: {
    ...typography.title,
    fontSize: 22,
  },
  store: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 4,
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