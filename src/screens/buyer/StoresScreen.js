import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StoreCard from '../../components/StoreCard';
import { getStoreProducts } from '../../services/productService';
import { categories as mockCategories, stores as mockStores } from '../../services/mockData';
import { onActiveStores, resolveStoreAvailability } from '../../services/storeService';
import { getActiveCategories } from '../../utils/productCatalogue';
import { TEST_MODE } from '../../utils/testMode';
import { colors, radius, spacing, typography } from '../../utils/theme';

export default function StoresScreen({ navigation, route }) {
  const initialCategory = route?.params?.category || null;
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const [allStores, setAllStores] = useState([]);
  const [storeProductInfo, setStoreProductInfo] = useState({});
  const [unavailableIds, setUnavailableIds] = useState({});

  const categoryOptions = TEST_MODE
    ? mockCategories
    : getActiveCategories().map((category) => category.categoryName);

  useEffect(() => {
    if (TEST_MODE) {
      setAllStores([]);
      return () => {};
    }
    let active = true;
    const unsubscribe = onActiveStores((list) => {
      if (!active) return;
      setAllStores(list);
      resolveStoreAvailability(list).then((rows) => {
        if (!active) return;
        const map = {};
        rows.forEach((row) => {
          map[row.store.id] = row.unavailable;
        });
        setUnavailableIds(map);
      });
      Promise.all(
        list.map(async (store) => {
          let products = [];
          try {
            products = await getStoreProducts(store.id);
          } catch (error) {
            console.warn('[store] getStoreProducts failed on StoresScreen', {
              role: 'buyer',
              operation: 'getStoreProducts',
              collection: 'stores/{storeId}/products',
              path: `stores/${store.id}/products`,
              code: error?.code,
              message: error?.message,
            });
            products = [];
          }
          return {
            storeId: store.id,
            names: products.map((p) => (p.name || '').toLowerCase()),
            categories: [...new Set(products.map((p) => p.category))],
          };
        })
      )
        .then((rows) => {
          if (!active) return;
          const map = {};
          rows.forEach((row) => {
            map[row.storeId] = row;
          });
          setStoreProductInfo(map);
        })
        .catch((error) => {
          console.warn('[store] failed to aggregate store product info on StoresScreen', {
            role: 'buyer',
            operation: 'getStoreProducts.map',
            collection: 'stores/{storeId}/products',
            code: error?.code,
            message: error?.message,
          });
        });
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (TEST_MODE) {
      return mockStores.filter((store) => {
        const matchesSearch =
          !term ||
          store.name.toLowerCase().includes(term) ||
          store.location.toLowerCase().includes(term) ||
          store.products.some((p) => p.name.toLowerCase().includes(term));
        const matchesCategory =
          !activeCategory ||
          store.products.some((p) => p.category === activeCategory);
        return matchesSearch && matchesCategory;
      });
    }
    return allStores.filter((store) => {
      const info = storeProductInfo[store.id];
      const storeText = (store.name || '').toLowerCase();
      const locationText = (store.location || '').toLowerCase();
      const productHits = info ? info.names.some((name) => name.includes(term)) : false;
      const matchesSearch =
        !term || storeText.includes(term) || locationText.includes(term) || productHits;
      const matchesCategory =
        !activeCategory || (info ? info.categories.includes(activeCategory) : false);
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, allStores, storeProductInfo]);

  const cycleFilter = () => {
    Alert.alert(
      'Category Filter',
      'Filters are a placeholder for now. You can tap a category chip below.'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search stores or products"
          placeholderTextColor={colors.placeholder}
        />
        <TouchableOpacity onPress={cycleFilter} style={styles.filterBtn}>
          <Ionicons name="options-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categoryOptions}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.chipRow}
        ListHeaderComponent={
          <TouchableOpacity
            onPress={() => setActiveCategory(null)}
            style={[styles.chip, activeCategory === null && styles.chipActive]}
          >
            <Text style={[styles.chipText, activeCategory === null && styles.chipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => {
          const active = activeCategory === item;
          return (
            <TouchableOpacity
              onPress={() => setActiveCategory(active ? null : item)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <StoreCard
            store={item}
            unavailable={unavailableIds[item.id] === true}
            onPress={() => navigation.navigate('Store', { storeId: item.id })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No stores match your search.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    margin: spacing.md,
    marginBottom: 0,
    paddingHorizontal: spacing.md,
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
  filterBtn: {
    padding: 4,
  },
  chipRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
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
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});