import { useMemo, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { MASTER_PRODUCTS } from '../../services/masterProducts';
import { getActiveCategories, getUnitLabel, resolveProductImage } from '../../utils/productCatalogue';
import { getStoreById } from '../../services/mockData';
import { vendorCanManageStore } from '../../utils/testMode';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';
import { formatKES } from '../../utils/format';

// The vendor store management screen. The full master product catalogue is
// ALWAYS visible to every authenticated vendor (browsing does not require a
// subscription). Adding a catalogue product to the vendor's own store IS a
// subscription-protected action: unsubscribed vendors are routed to the
// existing Subscription screen when they tap Add.
export default function VendorProductsScreen({ navigation }) {
  const { userProfile } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const canManageStore = vendorCanManageStore(userProfile);

  const store = canManageStore ? getStoreById('store-1') : null;
  const storeProducts = store?.products || [];

  const categories = getActiveCategories();

  const filteredCatalogue = useMemo(() => {
    const term = search.trim().toLowerCase();
    return MASTER_PRODUCTS.filter((product) => {
      if (!product.isActive) return false;
      if (activeCategory && product.categoryId !== activeCategory) return false;
      if (!term) return true;
      return (
        product.nameEnglish.toLowerCase().includes(term) ||
        product.nameSwahili.toLowerCase().includes(term) ||
        product.displayName.toLowerCase().includes(term) ||
        product.slug.includes(term)
      );
    });
  }, [search, activeCategory]);

  const requireSubscription = () => {
    Alert.alert(
      'Subscription Required',
      'An active vendor subscription is required to add products to your store.',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'View Subscription', onPress: () => navigation.navigate('Subscription') },
      ]
    );
  };

  const handleAddProduct = (masterProduct) => {
    if (canManageStore) {
      navigation.navigate('AddProduct', { masterProductId: masterProduct.productId });
    } else {
      requireSubscription();
    }
  };

  const handleAddCustomProduct = () => {
    if (canManageStore) {
      navigation.navigate('AddProduct');
    } else {
      requireSubscription();
    }
  };

  const renderStoreProduct = (item) => {
    const status = item.available ? 'Available' : 'Unavailable';
    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.85}
        style={styles.card}
        onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
      >
        <ImagePlaceholder icon="basket-outline" iconSize={28} style={styles.image} />
        <View style={styles.body}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.price}>{formatKES(item.pricePerKg)} / kg</Text>
        </View>
        <View style={styles.right}>
          <StatusBadge label={status} />
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={styles.chevron} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderCatalogueProduct = ({ item }) => {
    const image = resolveProductImage(item);
    return (
      <View style={styles.catalogueCard}>
        {image ? (
          <Image source={image} style={styles.catalogueImage} resizeMode="cover" />
        ) : (
          <ImagePlaceholder icon="basket-outline" iconSize={26} style={styles.catalogueImage} />
        )}
        <View style={styles.catalogueBody}>
          <Text style={styles.name}>{item.displayName}</Text>
          <Text style={styles.category}>{item.categoryName}</Text>
          <Text style={styles.unit}>{getUnitLabel(item.defaultUnit)}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addButton}
            onPress={() => handleAddProduct(item)}
          >
            <Ionicons name="add" size={16} color={colors.white} />
            <Text style={styles.addButtonText}>Add to Store</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredCatalogue}
        keyExtractor={(item) => item.productId}
        renderItem={renderCatalogueProduct}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {canManageStore ? (
              <View style={styles.section}>
                <Text style={styles.headerText}>
                  My Store Products ({storeProducts.length})
                </Text>
                {storeProducts.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No products yet. Add products from the catalogue below.
                  </Text>
                ) : (
                  storeProducts.map(renderStoreProduct)
                )}
              </View>
            ) : null}

            <Text style={styles.headerText}>Master Catalogue</Text>
            <Text style={styles.hintText}>
              Browse the full SokoHapa master product catalogue. Add products to
              your store with an active subscription.
            </Text>

            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search product catalogue"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
              />
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(item) => item.categoryId}
              contentContainerStyle={styles.chipRow}
              renderItem={({ item }) => {
                const active = activeCategory === item.categoryId;
                return (
                  <TouchableOpacity
                    onPress={() => setActiveCategory(active ? null : item.categoryId)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {item.categoryName}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            <Text style={styles.resultCount}>
              {filteredCatalogue.length} product{filteredCatalogue.length === 1 ? '' : 's'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No catalogue products match your search.</Text>
        }
      />
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.footerButton}
          onPress={handleAddCustomProduct}
        >
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.addText}>Add Product</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.md,
  },
  headerText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  hintText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  chipRow: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
  },
  resultCount: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.md,
    ...shadow,
  },
  catalogueCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.md,
    ...shadow,
  },
  image: {
    width: 72,
    height: 72,
  },
  catalogueImage: {
    width: 84,
    height: 84,
  },
  body: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  catalogueBody: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  category: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
    marginTop: 4,
  },
  unit: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  chevron: {
    marginTop: spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: spacing.sm,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  addText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
});