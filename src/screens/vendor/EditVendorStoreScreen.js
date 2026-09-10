import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextField from '../../components/TextField';
import PhotoField from '../../components/PhotoField';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, spacing } from '../../utils/theme';

export default function EditVendorStoreScreen({ navigation }) {
  const [storeName, setStoreName] = useState('Mama Njeri Fresh Farm');
  const [storeDescription, setStoreDescription] = useState(
    'Fresh vegetables and fruits from our family farm.'
  );
  const [storeLocation, setStoreLocation] = useState('Kiambu Road, Nairobi');
  const [storeImage, setStoreImage] = useState(false);

  const handleSave = () => {
    Alert.alert('Store Saved', 'Saving is not connected to a database yet. This is a placeholder.');
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
            placeholder="e.g. Kiambu Road, Nairobi"
            autoCapitalize="words"
            icon="location"
          />
          <PhotoField
            label="Store Image"
            value={storeImage}
            icon="storefront-outline"
            onPress={() => {
              setStoreImage(true);
              Alert.alert('Image upload', 'Store image uploads will be available in a later phase.');
            }}
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