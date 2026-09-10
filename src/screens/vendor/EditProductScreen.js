import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextField from '../../components/TextField';
import PhotoField from '../../components/PhotoField';
import PrimaryButton from '../../components/PrimaryButton';
import { categories, getProductById } from '../../services/mockData';
import { colors, radius, spacing, typography } from '../../utils/theme';

export default function EditProductScreen({ navigation, route }) {
  const productId = route?.params?.productId;
  const existing = getProductById(productId);

  const [name, setName] = useState(existing?.product.name || '');
  const [category, setCategory] = useState(existing?.product.category || categories[0]);
  const [imageSelected, setImageSelected] = useState(Boolean(existing));
  const [price, setPrice] = useState(existing ? String(existing.product.pricePerKg) : '');
  const [quantity, setQuantity] = useState(existing ? String(existing.product.availableQuantity) : '');
  const [available, setAvailable] = useState(existing?.product.available ?? true);

  const handleSave = () => {
    if (!name.trim() || !price.trim() || !quantity.trim()) {
      Alert.alert('Missing details', 'Please fill Product Name, Price and Quantity.');
      return;
    }
    Alert.alert('Changes Saved', 'Editing products is not connected to a database yet. This is a placeholder.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TextField
            label="Product Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Tomatoes"
            autoCapitalize="words"
            icon="leaf"
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {categories.map((cat) => {
              const active = category === cat;
              return (
                <View key={cat}>
                  <Text
                    onPress={() => setCategory(cat)}
                    style={[styles.chip, active && styles.chipActive, { color: active ? colors.white : colors.textSecondary }]}
                  >
                    {cat}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.spacer} />

          <PhotoField
            label="Product Image"
            value={imageSelected}
            icon="basket-outline"
            onPress={() => {
              setImageSelected(true);
              Alert.alert('Image upload', 'Product image uploads will be available in a later phase.');
            }}
          />

          <TextField
            label="Price per Kg (KES)"
            value={price}
            onChangeText={setPrice}
            placeholder="e.g. 100"
            keyboardType="number-pad"
            icon="pricetag"
          />
          <TextField
            label="Available Quantity (kg)"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="e.g. 50"
            keyboardType="number-pad"
            icon="cube"
          />

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>Available</Text>
              <Text style={styles.switchHint}>Buyers can only order available products.</Text>
            </View>
            <Switch
              value={available}
              onValueChange={setAvailable}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>

          <PrimaryButton title="Save Changes" onPress={handleSave} icon="checkmark" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 13,
    fontWeight: '600',
    overflow: 'hidden',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  spacer: {
    height: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  switchHint: {
    ...typography.bodySmall,
    marginTop: 2,
  },
});