import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import PrimaryButton from '../../components/PrimaryButton';
import { useCart } from '../../context/CartContext';
import { getProductById as getMockProductById } from '../../services/mockData';
import { getProductById as getStoreProductById } from '../../services/productService';
import { getStoreById as getRealStoreById } from '../../services/storeService';
import { TEST_MODE } from '../../utils/testMode';
import { getMasterProductById, formatUnitQuantity, getUnitShortLabel, resolveProductImage } from '../../utils/productCatalogue';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';
import { formatKES } from '../../utils/format';

export default function ProductDetailsScreen({ navigation, route }) {
  const productId = route?.params?.productId;
  const storeId = route?.params?.storeId;
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (TEST_MODE) {
      const result = getMockProductById(productId);
      setData(result);
      setLoaded(true);
      return () => {};
    }
    if (!storeId || !productId) {
      setData(null);
      setLoaded(true);
      return () => {};
    }
    let active = true;
    Promise.all([getRealStoreById(storeId), getStoreProductById(storeId, productId)])
      .then(([store, product]) => {
        if (!active) return;
        setData({ store, product });
        setLoaded(true);
      })
      .catch(() => {
        if (active) {
          setData(null);
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [storeId, productId]);

  if (!loaded) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Loading…</Text>
      </View>
    );
  }

  if (!data?.product || !data?.store) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Product not found</Text>
      </View>
    );
  }

  const { product, store } = data;
  const unavailable = !product.available || product.availableQuantity <= 0;

  const masterProduct = product.masterProductId ? getMasterProductById(product.masterProductId) : null;
  const productImage = masterProduct ? resolveProductImage(masterProduct) : null;

  const handleAdd = () => {
    if (unavailable) return;
    addItem(product, quantity, store);
    Alert.alert(
      'Added to Cart',
      `${formatUnitQuantity(quantity, product.unit)} of ${product.name} added to your cart.`
    );
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {productImage ? (
          <Image source={productImage} style={styles.image} resizeMode="cover" />
        ) : (
          <ImagePlaceholder icon="basket-outline" iconSize={52} style={styles.image} />
        )}

        <View style={styles.body}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.store} onPress={() => navigation.navigate('Store', { storeId: store.id })}>
            {store.name}
          </Text>
          <Text style={styles.price}>{formatKES(product.pricePerKg)} / {getUnitShortLabel(product.unit)}</Text>

          <View style={styles.availabilityCard}>
            <Ionicons
              name={unavailable ? 'close-circle-outline' : 'checkmark-circle'}
              size={20}
              color={unavailable ? colors.danger : colors.success}
            />
            <Text style={[styles.availabilityText, { color: unavailable ? colors.danger : colors.success }]}>
              {unavailable
                ? 'Currently unavailable'
                : `${formatUnitQuantity(product.availableQuantity, product.unit)} available`}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={unavailable}
              style={styles.stepBtn}
            >
              <Ionicons name="remove" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.stepValue}>{formatUnitQuantity(quantity, product.unit)}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setQuantity((q) => Math.min(product.availableQuantity || 1, q + 1))
              }
              disabled={unavailable}
              style={styles.stepBtn}
            >
              <Ionicons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Add to Cart"
          icon="cart-outline"
          disabled={unavailable}
          onPress={handleAdd}
        />
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
    paddingBottom: spacing.xl,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: colors.textMuted,
  },
  image: {
    height: 180,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.lg,
  },
  body: {
    padding: spacing.lg,
  },
  name: {
    ...typography.title,
    fontSize: 24,
  },
  store: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: spacing.sm,
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  stepBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  stepValue: {
    minWidth: 64,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.background,
    ...shadow,
  },
});