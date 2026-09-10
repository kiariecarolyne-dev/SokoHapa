import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import StoreCard from '../../components/StoreCard';
import { useCart } from '../../context/CartContext';
import { categories, featuredStoreIds, stores } from '../../services/mockData';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

export default function BuyerHomeScreen({ navigation }) {
  const { items } = useCart();
  const featuredStores = stores.filter((store) => featuredStoreIds.includes(store.id));

  return (
    <View style={styles.container}>
      <AppHeader
        title="SokoHapa"
        subtitle="The Market Is Here"
        right={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.headerIcon}
            >
              <Ionicons name="person-circle-outline" size={26} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartIcon}>
              <Ionicons name="cart-outline" size={24} color={colors.text} />
              {items.length > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{items.length}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.searchBar}
          onPress={() => navigation.navigate('Stores')}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <Text style={styles.searchText}>Search stores or products</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              activeOpacity={0.8}
              style={styles.categoryChip}
              onPress={() => navigation.navigate('Stores', { category })}
            >
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.storesHeader}>
          <Text style={styles.sectionTitle}>Featured Stores</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Stores')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {featuredStores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            onPress={() => navigation.navigate('Store', { storeId: store.id })}
          />
        ))}

        <View style={styles.helperCard}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.helperText}>
            Placeholder data — stores and products are not live yet.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  cartIcon: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.lg,
  },
  searchText: {
    color: colors.textMuted,
    marginLeft: spacing.sm,
    fontSize: 14,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  categoriesRow: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.round,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  storesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAll: {
    color: colors.primary,
    fontWeight: '600',
  },
  helperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    ...shadow,
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});