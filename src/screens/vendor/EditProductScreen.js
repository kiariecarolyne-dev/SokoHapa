import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextField from '../../components/TextField';
import PhotoField from '../../components/PhotoField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import {
  categories,
  getProductById,
  removeVendorStoreProduct,
  updateVendorStoreProduct,
} from '../../services/mockData';
import { vendorCanManageStore } from '../../utils/testMode';
import { colors, radius, spacing, typography } from '../../utils/theme';

// Edits one of the vendor's own store products. Editing is a
// subscription-protected action (see TEST_MODE gating). Changes apply only to
// the vendor's store copy and never to the master catalogue.
export default function EditProductScreen({ navigation, route }) {
  const { userProfile } = useAuth();
  const productId = route?.params?.productId;
  const existing = getProductById(productId);

  const canManageStore = vendorCanManageStore(userProfile);
  const product = existing?.product;
  const store = existing?.store;

  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || categories[0]);
  const [imageSelected, setImageSelected] = useState(Boolean(product));
  const [priceText, setPriceText] = useState(product ? String(product.pricePerKg) : '');
  const [quantityText, setQuantityText] = useState(product ? String(product.availableQuantity) : '');
  const [available, setAvailable] = useState(product?.available ?? true);

  const requireSubscription = () => {
    Alert.alert(
      'Subscription Required',
      'An active vendor subscription is required to manage your store products.',
      [
        { text: 'Back', style: 'cancel', onPress: () => navigation.goBack() },
        { text: 'View Subscription', onPress: () => navigation.replace('Subscription') },
      ]
    );
  };

  useEffect(() => {
    if (!canManageStore) {
      requireSubscription();
    }
  }, []);

  if (!product || !store) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Product not found</Text>
      </View>
    );
  }

  const handleSave = () => {
    if (!canManageStore) {
      requireSubscription();
      return;
    }
    const price = Number(priceText);
    const quantity = Number(quantityText);
    if (
      !name.trim() ||
      !priceText.trim() ||
      !quantityText.trim() ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      Alert.alert('Missing details', 'Please enter a valid Product Name, Price and Quantity.');
      return;
    }
    updateVendorStoreProduct(store.id, product.id, {
      name: name.trim(),
      category: category.trim(),
      pricePerKg: price,
      availableQuantity: quantity,
      available,
    });
    Alert.alert('Changes Saved', 'Your store product has been updated.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Product',
      `Remove "${product.name}" from your store?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeVendorStoreProduct(store.id, product.id);
            Alert.alert('Product Removed', 'The product was removed from your store.', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TextField
            label="Product Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Tomatoes"
            autoCapitalize="words"
            icon="leaf"
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {categories.map((cat) => {
              const active = category === cat;
              return (
                <View key={cat}>
                  <Text
                    onPress={() => setCategory(cat)}
                    style={[styles.chip, active && styles.chipActive, { color: active ? colors.white : colors.textSecondary }]}
                  >
                    {cat}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.spacer} />

          <PhotoField
            label="Product Image"
            value={imageSelected}
            icon="basket-outline"
            onPress={() => {
              setImageSelected(true);
              Alert.alert('Image upload', 'Product image uploads will be available in a later phase.');
            }}
          />

          <TextField
            label="Price (KES)"
            value={priceText}
            onChangeText={setPriceText}
            placeholder="e.g. 100"
            keyboardType="number-pad"
            icon="pricetag"
          />
          <TextField
            label="Available Quantity"
            value={quantityText}
            onChangeText={setQuantityText}
            placeholder="e.g. 50"
            keyboardType="number-pad"
            icon="cube"
          />

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>Available</Text>
              <Text style={styles.switchHint}>Buyers can only order available products.</Text>
            </View>
            <Switch
              value={available}
              onValueChange={setAvailable}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>

          <PrimaryButton title="Save Changes" onPress={handleSave} icon="checkmark" />
          <View style={styles.spacer} />
          <PrimaryButton
            title="Remove from Store"
            variant="danger"
            icon="trash-outline"
            onPress={handleRemove}
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
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  fallbackText: {
    color: colors.textMuted,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 13,
    fontWeight: '600',
    overflow: 'hidden',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  spacer: {
    height: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  switchHint: {
    ...typography.bodySmall,
    marginTop: 2,
  },
});