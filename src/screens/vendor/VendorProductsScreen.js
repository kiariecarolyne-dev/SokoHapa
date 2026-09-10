import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import StatusBadge from '../../components/StatusBadge';
import { getStoreById } from '../../services/mockData';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';
import { formatKES } from '../../utils/format';

export default function VendorProductsScreen({ navigation }) {
  const store = getStoreById('store-1');
  const products = store?.products || [];

  const renderProduct = ({ item }) => {
    const status = item.available ? 'Available' : 'Unavailable';
    return (
      <TouchableOpacity
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

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.headerText}>
            My Products ({products.length})
          </Text>
        }
      />
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProduct')}
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
  headerText: {
    ...typography.caption,
    color: colors.textSecondary,
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
  image: {
    width: 72,
    height: 72,
  },
  body: {
    flex: 1,
    marginHorizontal: spacing.md,
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
  right: {
    alignItems: 'flex-end',
  },
  chevron: {
    marginTop: spacing.sm,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  addText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
});