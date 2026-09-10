import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import DeliveryCard from '../../components/DeliveryCard';
import { deliveryPersons } from '../../services/mockData';
import { colors, spacing, typography } from '../../utils/theme';

export default function ChooseDeliveryScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;

  const handleSelect = (person) => {
    Alert.alert(
      'Delivery Person Selected',
      `${person.fullName} (${person.plateNumber}) selected for order ${orderId || ''}.` +
        '\n\nAssigning is not connected to a backend yet. This is a placeholder.'
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        Select an available delivery person for this order.
      </Text>
      <FlatList
        data={deliveryPersons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DeliveryCard person={item} onSelect={handleSelect} />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  list: {
    padding: spacing.md,
  },
});