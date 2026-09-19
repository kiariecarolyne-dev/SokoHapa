import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextField from '../../components/TextField';
import PhotoField from '../../components/PhotoField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import {
  VENDOR_UNIT_OPTIONS,
  getActiveCategories,
  getUnitLabel,
  getUnitShortLabel,
  isAllowedSellingUnit,
} from '../../utils/productCatalogue';
import {
  categories,
  getProductById as getMockProductById,
  removeVendorStoreProduct,
  updateVendorStoreProduct,
} from '../../services/mockData';
import {
  getProductById as getStoreProductById,
  removeVendorProduct,
  updateVendorProduct,
} from '../../services/productService';
import { ensureVendorStore } from '../../services/storeService';
import { TEST_MODE, vendorCanManageStore } from '../../utils/testMode';
import { colors, radius, spacing, typography } from '../../utils/theme';

// Edits one of the vendor's own store products. Editing is a
// subscription-protected action (see TEST_MODE gating). Changes apply only to
// the vendor's store copy and never to the master catalogue.
export default function EditProductScreen({ navigation, route }) {
  const { userProfile, currentUser } = useAuth();
  const productId = route?.params?.productId;
  const storeId = currentUser?.uid;

  const canManageStore = vendorCanManageStore(userProfile);

  const [product, setProduct] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const categoryOptions = TEST_MODE ? categories : getActiveCategories().map((c) => c.categoryName);
  const unitOptions = VENDOR_UNIT_OPTIONS.map((option) => option.code);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(categoryOptions[0] ?? 'Other');
  const [imageSelected, setImageSelected] = useState(false);
  const [priceText, setPriceText] = useState('');
  const [quantityText, setQuantityText] = useState('');
  const [available, setAvailable] = useState(true);
  const [unit, setUnit] = useState('kg');

  useEffect(() => {
    if (TEST_MODE) {
      const existing = getMockProductById(productId);
      const mockProduct = existing?.product ?? null;
      setProduct(mockProduct);
      if (mockProduct) {
        setName(mockProduct.name ?? '');
        setCategory(mockProduct.category ?? categoryOptions[0]);
        setImageSelected(true);
        setPriceText(mockProduct.pricePerKg != null ? String(mockProduct.pricePerKg) : '');
        setQuantityText(mockProduct.availableQuantity != null ? String(mockProduct.availableQuantity) : '');
        setAvailable(mockProduct.available ?? true);
        setUnit(isAllowedSellingUnit(mockProduct.unit) ? mockProduct.unit : 'kg');
      }
      setLoaded(true);
      return;
    }
    if (!storeId || !productId) {
      setLoaded(true);
      return;
    }
    let active = true;
    ensureVendorStore({
      ownerUid: storeId,
      vendorName: userProfile?.fullName || '',
      name: userProfile?.storeName || '',
      phone: userProfile?.phone || '',
      profilePhoto: userProfile?.profilePhoto || null,
    }).catch((error) => {
      console.warn('[store] ensureVendorStore failed on EditProductScreen', {
        role: 'vendor',
        operation: 'ensureVendorStore',
        collection: 'stores',
        path: `stores/${storeId}`,
        code: error?.code,
        message: error?.message,
      });
    });
    getStoreProductById(storeId, productId)
      .then((p) => {
        if (!active) return;
        setProduct(p);
        if (p) {
          setName(p.name ?? '');
          setCategory(p.category ?? categoryOptions[0]);
          setImageSelected(true);
          setPriceText(p.pricePerKg != null ? String(p.pricePerKg) : '');
          setQuantityText(p.availableQuantity != null ? String(p.availableQuantity) : '');
          setAvailable(p.available ?? true);
          setUnit(isAllowedSellingUnit(p.unit) ? p.unit : 'kg');
        }
        setLoaded(true);
      })
      .catch((error) => {
        console.warn('[product] getStoreProductById failed on EditProductScreen', {
          role: 'vendor',
          operation: 'getStoreProductById',
          collection: 'stores/{storeId}/products',
          path: `stores/${storeId}/products/${productId}`,
          code: error?.code,
          message: error?.message,
        });
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [productId, storeId]);

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

  if (!loaded) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Loading…</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Product not found</Text>
      </View>
    );
  }

  const handleUnitSelect = (nextUnit) => {
    if (nextUnit === unit) return;
    Alert.alert(
      'Change Selling Unit?',
      `Changing the selling unit from ${getUnitLabel(unit)} to ${getUnitLabel(nextUnit)} changes what the listed price means.\n\nThe price is for ONE ${getUnitLabel(nextUnit)} and will NOT be adjusted automatically (e.g. KES 80 → KES 80 / ${getUnitShortLabel(nextUnit)}).`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Change Unit', onPress: () => setUnit(nextUnit) },
      ]
    );
  };

  const handleSave = async () => {
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

    if (!isAllowedSellingUnit(unit)) {
      Alert.alert('Choose a unit', 'Please select a valid selling unit (Piece, Kg or Bunch).');
      return;
    }

    if (TEST_MODE) {
      updateVendorStoreProduct('store-1', product.id, {
        name: name.trim(),
        category: category.trim(),
        pricePerKg: price,
        availableQuantity: quantity,
        available,
        unit,
      });
      Alert.alert('Changes Saved', 'Your store product has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    if (!storeId) {
      Alert.alert('Signed out', 'Please sign in again to save product changes.');
      return;
    }

    try {
      await updateVendorProduct(storeId, product.id, {
        name: name.trim(),
        category: category.trim(),
        price,
        availableQuantity: quantity,
        available,
        unit,
      });
      Alert.alert('Changes Saved', 'Your store product has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Save failed', 'Could not save your product changes. Please try again.');
    }
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
            if (TEST_MODE) {
              removeVendorStoreProduct('store-1', product.id);
              Alert.alert('Product Removed', 'The product was removed from your store.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
              return;
            }
            if (!storeId) {
              Alert.alert('Signed out', 'Please sign in again to remove the product.');
              return;
            }
            removeVendorProduct(storeId, product.id)
              .then(() => {
                Alert.alert('Product Removed', 'The product was removed from your store.', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              })
              .catch(() => {
                Alert.alert('Remove failed', 'Could not remove the product. Please try again.');
              });
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
            {categoryOptions.map((cat) => {
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

          <Text style={styles.label}>Selling Unit</Text>
          <View style={styles.chipRow}>
            {unitOptions.map((option) => {
              const active = unit === option;
              return (
                <View key={option}>
                  <Text
                    onPress={() => handleUnitSelect(option)}
                    style={[styles.chip, active && styles.chipActive, { color: active ? colors.white : colors.textSecondary }]}
                  >
                    {getUnitLabel(option)}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.unitHint}>
            The price above is for ONE {getUnitLabel(unit)} (e.g. KES 80 / {getUnitShortLabel(unit)}).
          </Text>

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
  unitHint: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
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