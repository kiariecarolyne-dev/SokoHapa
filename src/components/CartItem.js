import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../utils/theme';
import ImagePlaceholder from './ImagePlaceholder';
import { getMasterProductById, formatUnitQuantity, getUnitShortLabel, resolveProductImage } from '../utils/productCatalogue';
import { formatKES } from '../utils/format';

export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  const itemTotal = item.pricePerKg * item.quantity;

  const masterProduct = item.masterProductId ? getMasterProductById(item.masterProductId) : null;
  const image = masterProduct ? resolveProductImage(masterProduct) : null;

  return (
    <View style={styles.card}>
      {image ? (
        <Image source={image} style={styles.image} resizeMode="cover" />
      ) : (
        <ImagePlaceholder icon="basket-outline" iconSize={20} style={styles.image} />
      )}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.price}>{formatKES(item.pricePerKg)} / {getUnitShortLabel(item.unit || 'kg')}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={onRemove} hitSlop={8}>
            <Ionicons name="trash-outline" size={17} color={colors.danger} />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.stepper}>
            <TouchableOpacity activeOpacity={0.7} onPress={onDecrease} style={styles.stepBtn}>
              <Ionicons name="remove" size={14} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.stepValue}>{formatUnitQuantity(item.quantity, item.unit || 'kg')}</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={onIncrease} style={styles.stepBtn}>
              <Ionicons name="add" size={14} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.total}>{formatKES(itemTotal)}</Text>
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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
  },
  body: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  price: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  stepBtn: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  stepValue: {
    minWidth: 42,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  total: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
});