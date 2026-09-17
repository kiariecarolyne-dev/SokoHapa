import { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextField from '../../components/TextField';
import PhotoField from '../../components/PhotoField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { addCustomProductToStore, addMasterProductToStore } from '../../services/productService';
import {
  PRODUCT_UNIT_OPTIONS,
  getActiveCategories,
  getMasterProductById,
  getUnitLabel,
  resolveProductImage,
} from '../../utils/productCatalogue';
import { categories, addProductToVendorStore } from '../../services/mockData';
import { ensureVendorStore } from '../../services/storeService';
import { TEST_MODE, vendorCanManageStore } from '../../utils/testMode';
import { colors, radius, spacing, typography } from '../../utils/theme';

// Adds a product to the vendor's own store. When opened with a master product
// (route param masterProductId) the product is linked to the master catalogue
// via masterProductId; the master catalogue itself is never modified. Adding
// products is a subscription-protected action (see TEST_MODE gating below).
export default function AddProductScreen({ navigation, route }) {
  const { userProfile, currentUser } = useAuth();
  const storeId = currentUser?.uid;

  const masterProductId = route?.params?.masterProductId;
  const master = masterProductId ? getMasterProductById(masterProductId) : null;

  const categoryOptions = TEST_MODE ? categories : getActiveCategories().map((c) => c.categoryName);
  const unitOptions = master
    ? master.availableUnits
    : PRODUCT_UNIT_OPTIONS.map((option) => option.code);

  const [name, setName] = useState(master ? master.displayName : '');
  const [category, setCategory] = useState(master ? master.categoryName : (categoryOptions[0] ?? 'Other'));
  const [priceText, setPriceText] = useState('');
  const [quantityText, setQuantityText] = useState('');
  const [unit, setUnit] = useState(master ? master.defaultUnit : 'kg');
  const [available, setAvailable] = useState(true);
  const [imageSelected, setImageSelected] = useState(false);

  const canManageStore = vendorCanManageStore(userProfile);
  const masterImage = master ? resolveProductImage(master) : null;

  const requireSubscription = () => {
    Alert.alert(
      'Subscription Required',
      'An active vendor subscription is required to add products to your store.',
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

  const handleAdd = async () => {
    if (!canManageStore) {
      requireSubscription();
      return;
    }
    const price = Number(priceText);
    const quantity = Number(quantityText);
    if (
      !priceText.trim() ||
      !quantityText.trim() ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      Alert.alert('Missing details', 'Please enter a valid price and available quantity.');
      return;
    }

    if (TEST_MODE) {
      const record = master
        ? {
            id: master.productId,
            name: master.displayName,
            category: master.categoryName,
            pricePerKg: price,
            availableQuantity: quantity,
            available,
            description: `${master.nameEnglish} (${master.nameSwahili})`,
            masterProductId: master.productId,
            unit,
            isAvailable: available,
          }
        : {
            id: `custom-${Date.now()}`,
            name: name.trim(),
            category,
            pricePerKg: price,
            availableQuantity: quantity,
            available,
            description: name.trim(),
            masterProductId: null,
            unit,
            isAvailable: available,
          };

      const added = addProductToVendorStore('store-1', record);
      Alert.alert(
        added ? 'Product Added' : 'Already in Store',
        added
          ? `${record.name} has been added to your store.`
          : `${record.name} is already in your store.`,
        added ? [{ text: 'OK', onPress: () => navigation.goBack() }] : [{ text: 'OK' }]
      );
      return;
    }

    if (!storeId) {
      Alert.alert('Signed out', 'Please sign in to add products to your store.');
      return;
    }

    const displayName = master?.displayName ?? name.trim();
    try {
      await ensureVendorStore({
        ownerUid: storeId,
        vendorName: userProfile?.fullName || '',
        name: userProfile?.storeName || '',
        phone: userProfile?.phone || '',
        profilePhoto: userProfile?.profilePhoto || null,
      });
      const result = master
        ? await addMasterProductToStore({
            storeId,
            masterProductId: master.productId,
            price,
            unit,
            availableQuantity: quantity,
            isAvailable: available,
          })
        : await addCustomProductToStore({
            storeId,
            nameEnglish: name.trim(),
            price,
            unit,
            availableQuantity: quantity,
            isAvailable: available,
          });
      const added = result !== null;
      Alert.alert(
        added ? 'Product Added' : 'Already in Store',
        added
          ? `${displayName} has been added to your store.`
          : `${displayName} is already in your store.`,
        added ? [{ text: 'OK', onPress: () => navigation.goBack() }] : [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Add Failed', 'Could not add the product. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {master ? (
            <View style={styles.infoCard}>
              {masterImage ? (
                <Image source={masterImage} style={styles.preview} resizeMode="cover" />
              ) : null}
              <View style={styles.infoBody}>
                <Text style={styles.infoTitle}>{master.displayName}</Text>
                <Text style={styles.infoMeta}>{master.categoryName}</Text>
              </View>
            </View>
          ) : (
            <>
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
            </>
          )}

          <TextField
            label="Price (KES)"
            value={priceText}
            onChangeText={setPriceText}
            placeholder="e.g. 100"
            keyboardType="number-pad"
            icon="pricetag"
          />

          <Text style={styles.label}>Unit</Text>
          <View style={styles.chipRow}>
            {unitOptions.map((option) => {
              const active = unit === option;
              return (
                <View key={option}>
                  <Text
                    onPress={() => setUnit(option)}
                    style={[styles.chip, active && styles.chipActive, { color: active ? colors.white : colors.textSecondary }]}
                  >
                    {getUnitLabel(option)}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.spacer} />

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

          <PrimaryButton title="Add to Store" onPress={handleAdd} icon="add" />
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
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  preview: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
  },
  infoBody: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  infoTitle: {
    ...typography.subtitle,
    fontSize: 17,
  },
  infoMeta: {
    ...typography.bodySmall,
    marginTop: 2,
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