import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../utils/theme';
import ImagePlaceholder from './ImagePlaceholder';
import { getMasterProductById, resolveProductImage } from '../utils/productCatalogue';
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
        <ImagePlaceholder icon="basket-outline" iconSize={26} style={styles.image} />
      )}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.price}>{formatKES(item.pricePerKg)} / kg</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={onRemove} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.stepper}>
            <TouchableOpacity activeOpacity={0.7} onPress={onDecrease} style={styles.stepBtn}>
              <Ionicons name="remove" size={15} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.stepValue}>{item.quantity} kg</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={onIncrease} style={styles.stepBtn}>
              <Ionicons name="add" size={15} color={colors.text} />
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
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  image: {
    width: 88,
    alignSelf: 'stretch',
    borderRadius: 0,
  },
  body: {
    flex: 1,
    padding: spacing.md,
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
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  price: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepValue: {
    minWidth: 44,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  total: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
  },
});