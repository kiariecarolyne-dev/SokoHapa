import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import { getBuyerOrderById, getStoreById } from '../../services/mockData';
import { editOrder, onOrder } from '../../services/orderService';
import { getStoreProducts } from '../../services/productService';
import { formatUnitQuantity, getUnitShortLabel } from '../../utils/productCatalogue';
import { TEST_MODE, editOrderTest } from '../../utils/testMode';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';
import { formatKES } from '../../utils/format';
import { PACKAGING_OPTIONS } from './CheckoutScreen';

export default function EditOrderScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [packaging, setPackaging] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [liveStatus, setLiveStatus] = useState(null);
  const formInitializedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;

    const buildOrderItems = (items) =>
      (items || []).map((item) => ({
        id: item.id,
        name: item.name,
        pricePerKg: item.pricePerKg,
        quantity: item.quantity,
        unit: item.unit || 'kg',
        masterProductId: item.masterProductId ?? null,
      }));

    const handleSnapshot = (next) => {
      if (cancelled) return;
      if (!next) {
        setLoadError('Order not found. It may have been removed.');
        setLoading(false);
        return;
      }
      // Always mirror the live order status so the screen locks the moment the
      // order stops being editable, even while the buyer is editing.
      setLiveStatus(next.status);

      // Seed the edit form only from the first snapshot. Later snapshots must
      // never overwrite the quantities/packaging the buyer is currently
      // adjusting, so those states are deliberately left untouched here.
      if (formInitializedRef.current) return;
      formInitializedRef.current = true;
      (async () => {
        if (next?.storeId) {
          try {
            const loadedProducts = await getStoreProducts(next.storeId);
            if (cancelled) return;
            setProducts(loadedProducts);
          } catch (error) {
            // Product availability is auxiliary; the order can still be edited.
          }
        }
        if (cancelled) return;
        setOrder(next);
        setOrderItems(buildOrderItems(next.items));
        setPackaging(next.packaging || null);
        setLoading(false);
      })();
    };

    if (TEST_MODE) {
      (async () => {
        try {
          const loadedOrder = getBuyerOrderById(orderId);
          const store = getStoreById(loadedOrder?.storeId);
          const loadedProducts = store
            ? store.products.map((p) => ({
                id: p.id,
                name: p.name,
                pricePerKg: p.pricePerKg,
                availableQuantity: p.availableQuantity,
                unit: p.unit || 'kg',
                available: p.available,
              }))
            : [];
          if (cancelled) return;
          if (!loadedOrder) {
            setLoadError('Order not found. It may have been removed.');
            setLoading(false);
            return;
          }
          setOrder(loadedOrder);
          setProducts(loadedProducts);
          setOrderItems(buildOrderItems(loadedOrder.items));
          setPackaging(loadedOrder.packaging || null);
          setLiveStatus(loadedOrder.status);
          setLoading(false);
        } catch (error) {
          if (cancelled) return;
          setLoadError(error?.message || 'Could not load the order.');
          setLoading(false);
        }
      })();
    } else {
      unsubscribe = onOrder(
        orderId,
        handleSnapshot,
        {
          onError: (error) => {
            if (cancelled) return;
            setLoadError(error?.message || 'Could not load the order.');
            setLoading(false);
          },
        }
      );
    }

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [orderId]);

  const availById = useMemo(() => {
    const map = {};
    for (const product of products) {
      map[product.id] = product;
    }
    return map;
  }, [products]);

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.pricePerKg * item.quantity,
    0
  );
  const packagingFee = packaging ? packaging.price : 0;
  const total = subtotal + packagingFee;

  const increase = (itemId) => {
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const product = availById[item.id];
        if (
          product &&
          typeof product.availableQuantity === 'number' &&
          item.quantity >= product.availableQuantity
        ) {
          return item;
        }
        return { ...item, quantity: item.quantity + 1 };
      })
    );
  };

  const decrease = (itemId) => {
    setOrderItems((prev) =>
      prev
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const remove = (itemId) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const addProduct = (product) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          pricePerKg: product.pricePerKg,
          quantity: 1,
          unit: product.unit || 'kg',
          masterProductId: product.masterProductId ?? null,
        },
      ];
    });
  };

  const handleSave = async () => {
    if (orderItems.length === 0) {
      Alert.alert(
        'Empty Order',
        'Add at least one product before saving your changes.'
      );
      return;
    }
    if (saving) return;
    setSaving(true);
    const items = orderItems.map((item) => ({
      id: item.id,
      name: item.name,
      pricePerKg: item.pricePerKg,
      quantity: item.quantity,
      unit: item.unit || 'kg',
      masterProductId: item.masterProductId ?? null,
      subtotal: item.pricePerKg * item.quantity,
    }));
    try {
      if (TEST_MODE) {
        const updated = editOrderTest(orderId, {
          items,
          subtotal,
          packaging,
          packagingFee,
          total,
        });
        if (!updated) {
          Alert.alert(
            'Not Editable',
            'This order can no longer be edited because it is no longer New.'
          );
          return;
        }
      } else {
        await editOrder(orderId, {
          items,
          subtotal,
          packaging,
          packagingFee,
          total,
        });
      }
      Alert.alert(
        'Order Updated',
        'Your order has been updated. The vendor will see the changed items.'
      );
      navigation.goBack();
    } catch (error) {
      const code = error?.code || '';
      console.log(
        `[EditOrder] Save failed with code: "${code}" (message: ${
          error?.message || 'unknown'
        })`
      );
      if (code === 'order-not-editable') {
        Alert.alert(
          'Cannot Edit Order',
          'The vendor has already started processing this order, so it can no longer be edited.'
        );
        navigation.goBack();
      } else if (code === 'permission-denied') {
        Alert.alert(
          'Unable to Edit Order',
          'Your order could not be updated. Please try again.'
        );
      } else if (code === 'edit-empty-items') {
        Alert.alert('Empty Order', error.message);
      } else {
        Alert.alert(
          'Save Failed',
          error?.message || 'Could not save the changes. Please try again.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Loading order for editing…</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.fallback}>
        <Ionicons name="alert-circle-outline" size={32} color={colors.warning} />
        <Text style={styles.fallbackText}>{loadError}</Text>
      </View>
    );
  }

  if (liveStatus && liveStatus !== 'New') {
    return (
      <View style={styles.fallback}>
        <Ionicons name="lock-closed-outline" size={32} color={colors.warning} />
        <Text style={styles.fallbackText}>
          This order can no longer be edited because it is no longer New.
        </Text>
      </View>
    );
  }

  const addable = products.filter(
    (product) =>
      product.available !== false && !orderItems.some((item) => item.id === product.id)
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.hint}>
          Editing Order {order.orderNumber}. You can adjust quantities, remove
          items, add more products from {order.vendorName || 'the vendor'}, and
          change the carrier bag. These edits are only possible while the order
          is still New.
        </Text>

        <Text style={styles.sectionTitle}>Order Items ({orderItems.length})</Text>
        {orderItems.length === 0 ? (
          <Text style={styles.emptyText}>No items yet.</Text>
        ) : (
          orderItems.map((item) => {
            const product = availById[item.id];
            const capped =
              product &&
              typeof product.availableQuantity === 'number' &&
              item.quantity >= product.availableQuantity;
            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemTopRow}>
                  <View style={styles.itemTitleWrap}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {formatKES(item.pricePerKg)} / {getUnitShortLabel(item.unit || 'kg')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => remove(item.id)}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={17} color={colors.danger} />
                  </TouchableOpacity>
                </View>
                <View style={styles.itemBottomRow}>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => decrease(item.id)}
                      style={styles.stepBtn}
                    >
                      <Ionicons name="remove" size={14} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.stepValue}>
                      {formatUnitQuantity(item.quantity, item.unit || 'kg')}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => increase(item.id)}
                      style={styles.stepBtn}
                    >
                      <Ionicons name="add" size={14} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.itemTotal}>
                    {formatKES(item.pricePerKg * item.quantity)}
                  </Text>
                </View>
                {capped ? (
                  <Text style={styles.capHint}>
                    Only {formatUnitQuantity(product.availableQuantity, product.unit || 'kg')} available.
                  </Text>
                ) : null}
              </View>
            );
          })
        )}

        {addable.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Add More Products</Text>
            {addable.map((product) => (
              <TouchableOpacity
                key={product.id}
                activeOpacity={0.85}
                style={styles.addRow}
                onPress={() => addProduct(product)}
              >
                <View style={styles.addBody}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {formatKES(product.pricePerKg)} / {getUnitShortLabel(product.unit || 'kg')}
                  </Text>
                </View>
                <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Carrier Bag</Text>
        {PACKAGING_OPTIONS.map((option) => {
          const selected = packaging?.id === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.85}
              style={[styles.packagingRow, selected && styles.packagingRowSelected]}
              onPress={() => setPackaging(option)}
            >
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selected ? colors.primary : colors.textMuted}
              />
              <Text style={styles.packagingName}>{option.name}</Text>
              <Text style={styles.packagingPrice}>{formatKES(option.price)}</Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.summaryCard}>
          <SummaryRow label="Subtotal" value={formatKES(subtotal)} />
          <SummaryRow label="Packaging" value={formatKES(packagingFee)} />
          <View style={styles.divider} />
          <SummaryRow label="Order Total" value={formatKES(total)} bold />
          <Text style={styles.deliveryNote}>
            The delivery fee is paid separately in cash to the delivery person
            and is not part of this total.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title={saving ? 'Saving…' : 'Save Changes'}
          icon="checkmark"
          onPress={handleSave}
          disabled={saving}
        />
      </View>
    </View>
  );
}

function SummaryRow({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.rowLabelBold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold]}>{value}</Text>
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
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md,
  },
  fallbackText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitleWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  itemBottomRow: {
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
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  capHint: {
    fontSize: 11,
    color: colors.warning,
    marginTop: 4,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  addBody: {
    flex: 1,
    marginRight: spacing.sm,
  },
  packagingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  packagingRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  packagingName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  packagingPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    ...shadow,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  rowLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  rowLabelBold: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  rowValueBold: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  deliveryNote: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.md,
    ...shadow,
  },
});