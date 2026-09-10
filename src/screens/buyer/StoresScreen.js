import { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StoreCard from '../../components/StoreCard';
import { categories, stores } from '../../services/mockData';
import { colors, radius, spacing, typography } from '../../utils/theme';

export default function StoresScreen({ navigation, route }) {
  const initialCategory = route?.params?.category || null;
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const filtered = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch =
        !search ||
        store.name.toLowerCase().includes(search.toLowerCase()) ||
        store.location.toLowerCase().includes(search.toLowerCase()) ||
        store.products.some((p) => p.name.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        !activeCategory ||
        store.products.some((p) => p.category === activeCategory);

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

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
        data={categories}
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