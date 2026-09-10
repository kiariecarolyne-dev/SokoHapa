import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import PrimaryButton from '../../components/PrimaryButton';
import StatusBadge from '../../components/StatusBadge';
import { currentVendor } from '../../services/mockData';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

export default function VendorStoreScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <ImagePlaceholder
        icon="storefront-outline"
        iconSize={52}
        style={styles.storeImage}
      />

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.name}>{currentVendor.storeName}</Text>
            <Text style={styles.vendor}>{currentVendor.fullName}</Text>
          </View>
          <StatusBadge label="Open" />
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={16} color={colors.textMuted} />
          <Text style={styles.meta}>{currentVendor.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={16} color={colors.accent} />
          <Text style={styles.meta}>4.8 rating (placeholder)</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="basket-outline" size={16} color={colors.textMuted} />
          <Text style={styles.meta}>5 products</Text>
        </View>

        <PrimaryButton
          title="Edit Store"
          variant="outline"
          icon="create-outline"
          onPress={() => navigation.navigate('EditStore')}
        />
        <View style={styles.buttonSpacing} />
        <PrimaryButton
          title="Manage Products"
          icon="basket-outline"
          onPress={() => navigation.navigate('Products')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  storeImage: {
    height: 160,
    borderRadius: 0,
  },
  body: {
    padding: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.title,
    fontSize: 22,
  },
  vendor: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  meta: {
    ...typography.bodySmall,
    marginLeft: spacing.sm,
  },
  buttonSpacing: {
    height: spacing.md,
  },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    ...shadow,
  },
});