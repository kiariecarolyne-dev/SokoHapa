import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import ProductCard from '../../components/ProductCard';
import ProfileAvatar from '../../components/ProfileAvatar';
import StatusBadge from '../../components/StatusBadge';
import { fetchUserProfile } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { onStoreProducts } from '../../services/productService';
import { getStoreById as getMockStoreById } from '../../services/mockData';
import { isStoreTemporarilyUnavailable, onStore } from '../../services/storeService';
import { TEST_MODE } from '../../utils/testMode';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

export default function StoreScreen({ navigation, route }) {
  const storeId = route?.params?.storeId;
  const { addItem } = useCart();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [vendorProfile, setVendorProfile] = useState(null);

  useEffect(() => {
    if (TEST_MODE) {
      const mockStore = getMockStoreById(storeId);
      setStore(mockStore);
      setProducts(mockStore?.products || []);
      setLoaded(true);
      return () => {};
    }
    if (!storeId) {
      setLoaded(true);
      return () => {};
    }
    const unsubscribeStore = onStore(storeId, (snapshot) => {
      setStore(snapshot);
      setLoaded(true);
    });
    const unsubscribeProducts = onStoreProducts(storeId, setProducts);
    return () => {
      unsubscribeStore();
      unsubscribeProducts();
    };
  }, [storeId]);

  const storeVendorUid = store?.vendorUid ?? store?.ownerUid ?? null;

  useEffect(() => {
    let active = true;
    if (storeVendorUid) {
      fetchUserProfile(storeVendorUid)
        .then((profile) => {
          if (active && profile) setVendorProfile(profile);
        })
        .catch((error) => {
          console.warn('[auth] fetchUserProfile failed on StoreScreen', {
            role: 'buyer',
            operation: 'fetchUserProfile',
            collection: 'users',
            path: `users/${storeVendorUid}`,
            code: error?.code,
            message: error?.message,
          });
        });
    }
    return () => {
      active = false;
    };
  }, [storeVendorUid]);

  if (!loaded) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Loading…</Text>
      </View>
    );
  }

  if (!store) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Store not found</Text>
      </View>
    );
  }

  const unavailable = isStoreTemporarilyUnavailable(store, vendorProfile);

  const handleAddToCart = (product, quantity) => {
    if (unavailable) {
      Alert.alert(
        'Temporarily Unavailable',
        'This vendor has an inactive or expired subscription, so they cannot accept new orders right now. Come back after they renew.'
      );
      return;
    }
    addItem(product, quantity, store);
    Alert.alert(
      'Added to Cart',
      `${quantity} kg of ${product.name} added to your cart.`
    );
  };

  const vendor = {
    uid: vendorProfile?.uid ?? storeVendorUid ?? null,
    fullName: vendorProfile?.fullName || store.vendorName,
    storeName: vendorProfile?.storeName || store.name,
    phone: vendorProfile?.phone || store.phone || null,
    location: vendorProfile?.location || store.location,
    profilePhoto: vendorProfile?.profilePhoto ?? store.profilePhoto ?? null,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <ImagePlaceholder icon="storefront-outline" iconSize={52} style={styles.storeImage} />

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ProfileAvatar
            profilePhoto={vendor.profilePhoto}
            size={52}
            fallbackIcon="storefront-outline"
            style={styles.avatar}
          />
          <View style={styles.titleWrap}>
            <Text style={styles.storeName}>{vendor.storeName}</Text>
            <Text style={styles.vendorName}>by {vendor.fullName}</Text>
          </View>
          <StatusBadge label={store.status || 'Open'} />
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={16} color={colors.textMuted} />
          <Text style={styles.meta}>{vendor.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={16} color={colors.accent} />
          <Text style={styles.meta}>{store.rating} rating</Text>
        </View>
        {vendor.phone ? (
          <View style={styles.metaRow}>
            <Ionicons name="call-outline" size={16} color={colors.textMuted} />
            <Text style={styles.meta}>{vendor.phone}</Text>
          </View>
        ) : null}

        <Text style={styles.description}>{store.description}</Text>
      </View>

      {unavailable ? (
        <View style={styles.unavailableBanner}>
          <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
          <Text style={styles.unavailableText}>
            This store is temporarily unavailable. The vendor's subscription is
            inactive or expired, so this store cannot accept new orders.
          </Text>
        </View>
      ) : null}

      <View style={styles.products}>
        <Text style={styles.sectionTitle}>Products</Text>
        {products.length === 0 ? (
          <Text style={styles.emptyText}>No products available in this store yet.</Text>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(quantity) => handleAddToCart(product, quantity)}
            />
          ))
        )}
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
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  fallbackText: {
    color: colors.textMuted,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  storeImage: {
    height: 160,
    borderRadius: 0,
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadow,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    marginRight: spacing.md,
  },
  titleWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  storeName: {
    ...typography.title,
    fontSize: 20,
  },
  vendorName: {
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
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  unavailableBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  unavailableText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.warning,
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
  products: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});