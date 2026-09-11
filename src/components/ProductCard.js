import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, typography } from '../utils/theme';
import ImagePlaceholder from './ImagePlaceholder';
import { getMasterProductById, resolveProductImage } from '../utils/productCatalogue';
import { formatKES } from '../utils/format';

export default function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  const unavailable = !product.available || product.availableQuantity <= 0;

  const masterProduct = product.masterProductId ? getMasterProductById(product.masterProductId) : null;
  const image = masterProduct ? resolveProductImage(masterProduct) : null;

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(product.availableQuantity || 1, q + 1));

  return (
    <View style={styles.card}>
      {image ? (
        <Image source={image} style={styles.image} resizeMode="cover" />
      ) : (
        <ImagePlaceholder icon="basket-outline" iconSize={34} style={styles.image} />
      )}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.category}>{product.category}</Text>
            <Text style={styles.price}>{formatKES(product.pricePerKg)} / kg</Text>
            <Text style={styles.availability}>
              {unavailable ? 'Currently unavailable' : `${product.availableQuantity} kg available`}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.stepper}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={decrement}
              disabled={unavailable}
              style={[styles.stepBtn, unavailable && styles.stepDisabled]}
            >
              <Ionicons name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.stepValue}>{quantity} kg</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={increment}
              disabled={unavailable}
              style={[styles.stepBtn, unavailable && styles.stepDisabled]}
            >
              <Ionicons name="add" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={unavailable}
            onPress={() => onAddToCart?.(quantity)}
            style={[styles.addBtn, unavailable && styles.addBtnDisabled]}
          >
            <Ionicons name="cart-outline" size={16} color={colors.white} />
            <Text style={styles.addText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadow,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 0,
  },
  body: {
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
  },
  name: {
    ...typography.subtitle,
    fontSize: 17,
  },
  category: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    marginTop: spacing.sm,
  },
  availability: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  stepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  stepDisabled: {
    opacity: 0.4,
  },
  stepValue: {
    minWidth: 52,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginLeft: spacing.sm,
  },
  addBtnDisabled: {
    backgroundColor: colors.textMuted,
  },
  addText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
});