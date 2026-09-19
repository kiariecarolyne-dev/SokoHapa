import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, typography } from '../utils/theme';
import ImagePlaceholder from './ImagePlaceholder';
import { getMasterProductById, formatUnitQuantity, getUnitShortLabel, resolveProductImage } from '../utils/productCatalogue';
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
        <ImagePlaceholder icon="basket-outline" iconSize={26} style={styles.image} />
      )}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.price}>{formatKES(product.pricePerKg)} / {getUnitShortLabel(product.unit)}</Text>
        </View>
        {masterProduct ? (
          <Text style={styles.swahili} numberOfLines={1}>{masterProduct.nameSwahili}</Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={styles.category} numberOfLines={1}>{product.category}</Text>
          <Text style={[styles.availability, unavailable && styles.availabilityOff]} numberOfLines={1}>
            {unavailable ? 'Currently unavailable' : `${formatUnitQuantity(product.availableQuantity, product.unit)} available`}
          </Text>
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
            <Text style={styles.stepValue}>{formatUnitQuantity(quantity, product.unit)}</Text>
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
            <Text style={styles.addText} numberOfLines={1}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: radius.md,
  },
  body: {
    flex: 1,
    marginLeft: spacing.sm,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    ...typography.subtitle,
    fontSize: 15,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
    flexShrink: 0,
  },
  swahili: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  category: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  availability: {
    ...typography.bodySmall,
    flexShrink: 0,
  },
  availabilityOff: {
    color: colors.danger,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  stepBtn: {
    minWidth: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  stepDisabled: {
    opacity: 0.4,
  },
  stepValue: {
    minWidth: 44,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginLeft: spacing.sm,
  },
  addBtnDisabled: {
    backgroundColor: colors.textMuted,
  },
  addText: {
    flexShrink: 1,
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
});