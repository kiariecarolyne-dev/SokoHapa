import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import PrimaryButton from '../../components/PrimaryButton';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { currentVendor, getStoreById } from '../../services/mockData';
import { onStoreProducts } from '../../services/productService';
import { ensureVendorStore, onStore } from '../../services/storeService';
import { formatVendorLocation } from '../../utils/format';
import { TEST_MODE } from '../../utils/testMode';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

export default function VendorStoreScreen({ navigation }) {
  const { currentUser, userProfile } = useAuth();
  const storeId = currentUser?.uid;
  const [store, setStore] = useState(null);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    if (TEST_MODE) {
      const mockStore = getStoreById('store-1');
      setStore({
        name: currentVendor.storeName,
        vendorName: currentVendor.fullName,
        location: currentVendor.location,
        phone: currentVendor.phone,
        description: currentVendor.storeDescription,
        rating: 4.8,
        status: 'Open',
      });
      setProductCount(mockStore ? mockStore.products.length : 0);
      return () => {};
    }
    if (!storeId) return () => {};
    ensureVendorStore({
      ownerUid: storeId,
      vendorName: userProfile?.fullName || '',
      name: userProfile?.storeName || '',
      phone: userProfile?.phone || '',
      location: userProfile?.storeLocation || '',
      description: userProfile?.storeDescription || '',
      profilePhoto: userProfile?.profilePhoto || null,
    }).catch((error) => {
      console.warn('[store] ensureVendorStore failed on VendorStoreScreen', {
        role: 'vendor',
        operation: 'ensureVendorStore',
        collection: 'stores',
        path: `stores/${storeId}`,
        code: error?.code,
        message: error?.message,
      });
    });
    const unsubscribeStore = onStore(storeId, setStore);
    const unsubscribeProducts = onStoreProducts(storeId, (products) => {
      setProductCount(products.length);
    });
    return () => {
      unsubscribeStore();
      unsubscribeProducts();
    };
  }, [storeId]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <ImagePlaceholder
        icon="storefront-outline"
        iconSize={52}
        style={styles.storeImage}
      />

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.name}>{store?.name || 'My Store'}</Text>
            <Text style={styles.vendor}>{store?.vendorName || 'Your Store'}</Text>
          </View>
          <StatusBadge label={store?.status || 'Open'} />
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={16} color={colors.textMuted} />
          <Text style={styles.meta}>
            {formatVendorLocation(store) || 'Add your store location'}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={16} color={colors.accent} />
          <Text style={styles.meta}>{store?.rating ?? 5}.0 rating</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="basket-outline" size={16} color={colors.textMuted} />
          <Text style={styles.meta}>{productCount} product{productCount === 1 ? '' : 's'}</Text>
        </View>

        <PrimaryButton
          title="Edit Store"
          variant="outline"
          icon="create-outline"
          onPress={() => navigation.navigate('EditStore')}
        />
        <View style={styles.buttonSpacing} />
        <PrimaryButton
          title="Manage Products"
          icon="basket-outline"
          onPress={() => navigation.navigate('Products')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  storeImage: {
    height: 160,
    borderRadius: 0,
  },
  body: {
    padding: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.title,
    fontSize: 22,
  },
  vendor: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  meta: {
    ...typography.bodySmall,
    marginLeft: spacing.sm,
  },
  buttonSpacing: {
    height: spacing.md,
  },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    ...shadow,
  },
});