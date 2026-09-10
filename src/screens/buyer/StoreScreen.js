import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import ProductCard from '../../components/ProductCard';
import StatusBadge from '../../components/StatusBadge';
import { useCart } from '../../context/CartContext';
import { getStoreById } from '../../services/mockData';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

export default function StoreScreen({ navigation, route }) {
  const storeId = route?.params?.storeId;
  const store = getStoreById(storeId);
  const { addItem } = useCart();

  if (!store) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Store not found</Text>
      </View>
    );
  }

  const handleAddToCart = (product, quantity) => {
    addItem(product, quantity);
    Alert.alert(
      'Added to Cart',
      `${quantity} kg of ${product.name} added to your cart.`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <ImagePlaceholder icon="storefront-outline" iconSize={52} style={styles.storeImage} />

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.vendorName}>by {store.vendorName}</Text>
          </View>
          <StatusBadge label={store.status} />
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={16} color={colors.textMuted} />
          <Text style={styles.meta}>{store.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={16} color={colors.accent} />
          <Text style={styles.meta}>{store.rating} rating</Text>
        </View>

        <Text style={styles.description}>{store.description}</Text>
      </View>

      <View style={styles.products}>
        <Text style={styles.sectionTitle}>Products</Text>
        {store.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={(quantity) => handleAddToCart(product, quantity)}
          />
        ))}
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  products: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});