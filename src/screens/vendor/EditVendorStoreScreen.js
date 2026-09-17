import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import TextField from '../../components/TextField';
import PhotoField from '../../components/PhotoField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { ensureVendorStore, onStore, updateVendorStore } from '../../services/storeService';
import { getProfilePhotoUrl, uploadProfilePhoto } from '../../services/profilePhotoService';
import { TEST_MODE } from '../../utils/testMode';
import { colors, spacing } from '../../utils/theme';

export default function EditVendorStoreScreen({ navigation }) {
  const { currentUser, userProfile } = useAuth();
  const storeId = currentUser?.uid;

  const [storeName, setStoreName] = useState(TEST_MODE ? 'Mama Njeri Fresh Farm' : '');
  const [storeDescription, setStoreDescription] = useState(
    TEST_MODE ? 'Fresh vegetables and fruits from our family farm.' : ''
  );
  const [storeLocation, setStoreLocation] = useState(TEST_MODE ? 'Kiambu Road, Nairobi' : '');
  const [storePhotoPath, setStorePhotoPath] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (TEST_MODE || !storeId) return undefined;
    let active = true;
    ensureVendorStore({
      ownerUid: storeId,
      vendorName: userProfile?.fullName || '',
      name: userProfile?.storeName || '',
      phone: userProfile?.phone || '',
      profilePhoto: userProfile?.profilePhoto || null,
    }).catch((error) => {
      console.warn('[store] ensureVendorStore failed on EditVendorStoreScreen', {
        role: 'vendor',
        operation: 'ensureVendorStore',
        collection: 'stores',
        path: `stores/${storeId}`,
        code: error?.code,
        message: error?.message,
      });
    });
    const unsubscribe = onStore(storeId, (storeDoc) => {
      if (!active) return;
      if (storeDoc) {
        setStoreName(storeDoc.name ?? '');
        setStoreDescription(storeDoc.description ?? '');
        setStoreLocation(storeDoc.location ?? '');
        setStorePhotoPath(storeDoc.profilePhoto ?? userProfile?.profilePhoto ?? null);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [storeId]);

  const handleChangePhoto = async () => {
    if (uploading) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo access to choose a store image.');
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
      console.error('[store] Image picker failed', error?.message ?? error);
      Alert.alert('Error', 'Could not open the photo library.');
      return;
    }

    if (result.canceled) return;

    if (!storeId) {
      Alert.alert('Signed out', 'Sign in again to edit your store.');
      return;
    }

    const asset = result.assets[0];
    if (!asset?.base64) {
      Alert.alert('Upload failed', 'Could not read the selected image. Please try another photo.');
      return;
    }

    setUploading(true);
    try {
      const path = await uploadProfilePhoto(storeId, asset.base64);
      setStorePhotoPath(path);
    } catch (error) {
      console.error('[store] Photo upload failed', error?.message ?? error);
      Alert.alert('Upload failed', 'Could not save the photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (TEST_MODE) {
      Alert.alert('Store Saved', 'Saving is not connected to a database yet. This is a placeholder.');
      return;
    }
    if (!storeId) {
      Alert.alert('Signed out', 'Sign in again to edit your store.');
      return;
    }
    if (!storeName.trim()) {
      Alert.alert('Missing details', 'Please enter a store name.');
      return;
    }
    try {
      await updateVendorStore(storeId, {
        name: storeName.trim(),
        description: storeDescription.trim(),
        location: storeLocation.trim(),
        profilePhoto: storePhotoPath,
      });
      Alert.alert('Store Saved', 'Your store details have been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Save failed', 'Could not save your store details. Please try again.');
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
          <TextField
            label="Store Name"
            value={storeName}
            onChangeText={setStoreName}
            placeholder="e.g. Mama Njeri Fresh Farm"
            autoCapitalize="words"
            icon="storefront"
          />
          <TextField
            label="Store Description"
            value={storeDescription}
            onChangeText={setStoreDescription}
            placeholder="Describe your store"
            multiline
            icon="document-text"
          />
          <TextField
            label="Store Location"
            value={storeLocation}
            onChangeText={setStoreLocation}
            placeholder="e.g. Stage ya Zamani, Malindi"
            autoCapitalize="words"
            icon="location"
          />
          <PhotoField
            label="Store Image"
            value={storePhotoPath ? getProfilePhotoUrl(storePhotoPath) : null}
            icon="storefront-outline"
            hint={uploading ? 'Uploading photo…' : 'Tap to choose a store photo'}
            onPress={handleChangePhoto}
          />
          <PrimaryButton title="Save Store" onPress={handleSave} icon="checkmark" />
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
});
