import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing } from '../utils/theme';
import { getVehicleIcon, getVehicleLabel } from '../utils/vehicleTypes';
import ImagePlaceholder from './ImagePlaceholder';
import StatusBadge from './StatusBadge';
import PrimaryButton from './PrimaryButton';

export default function DeliveryCard({ person, onSelect }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <ImagePlaceholder icon="person-outline" iconSize={30} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{person.fullName}</Text>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons
              name={getVehicleIcon(person.vehicleType)}
              size={15}
              color={colors.textMuted}
            />
            <Text style={styles.meta}>
              {getVehicleLabel(person.vehicleType)}: {person.plateNumber}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={14} color={colors.accent} />
            <Text style={styles.meta}>{person.rating} rating</Text>
          </View>
        </View>
        <StatusBadge label={person.availability} />
      </View>
      <PrimaryButton
        title="Select Delivery Person"
        variant={person.availability === 'Available' ? 'primary' : 'outline'}
        icon="person-add-outline"
        disabled={person.availability !== 'Available'}
        onPress={() => onSelect?.(person)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: radius.round,
  },
  info: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6,
  },
});