import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import DeliveryCard from '../../components/DeliveryCard';
import { deliveryPersons, getVendorOrderById } from '../../services/mockData';
import { assignTestDeliveryPerson } from '../../utils/testMode';
import { colors, spacing, typography } from '../../utils/theme';

export default function ChooseDeliveryScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;

  const handleSelect = (person) => {
    if (!orderId) {
      Alert.alert('No Order', 'No order ID was provided.');
      return;
    }
    const order = getVendorOrderById(orderId);
    if (!order) {
      Alert.alert('Order Not Found', 'This order is no longer available.');
      return;
    }
    const updated = assignTestDeliveryPerson(orderId, person);
    if (updated) {
      Alert.alert(
        'Delivery Person Assigned',
        `${person.fullName} (${person.plateNumber}) assigned to order ${updated.orderNumber}. The order has moved to Out for Delivery.`,
        [{ text: 'Back to Order', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert(
        'Not Available',
        'Delivery assignment is only available in TEST MODE (development).'
      );
    }
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