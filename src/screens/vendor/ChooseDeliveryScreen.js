import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import DeliveryCard from '../../components/DeliveryCard';
import { deliveryPersons, getVendorOrderById } from '../../services/mockData';
import { getOrderById } from '../../services/orderService';
import {
  createDeliveryRequest,
  onDeliveryPeople,
} from '../../services/deliveryService';
import { TEST_MODE, assignTestDeliveryPerson } from '../../utils/testMode';
import { colors, spacing, typography } from '../../utils/theme';

export default function ChooseDeliveryScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (TEST_MODE) {
      setPeople(deliveryPersons);
      setLoading(false);
      return;
    }
    const unsubscribe = onDeliveryPeople((list) => {
      setPeople(list.filter((person) => person.availability === 'Available'));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSelect = async (person) => {
    if (!orderId) {
      Alert.alert('No Order', 'No order ID was provided.');
      return;
    }

    if (TEST_MODE) {
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
      }
      return;
    }

    try {
      const order = await getOrderById(orderId);
      if (!order) {
        Alert.alert('Order Not Found', 'This order is no longer available.');
        return;
      }
      await createDeliveryRequest({ order, deliveryUid: person.uid });
      Alert.alert(
        'Delivery Request Sent',
        `A delivery request was sent to ${person.fullName} for order ${order.orderNumber}. The delivery person will see it in their Delivery Requests and can accept or decline it.`,
        [{ text: 'Back to Order', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Request Failed',
        error?.message || 'Could not send the delivery request. Please try again.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        Select an available delivery person for this order.
      </Text>
      {loading ? (
        <Text style={styles.empty}>Loading delivery people…</Text>
      ) : people.length === 0 ? (
        <Text style={styles.empty}>
          No available delivery people right now. Ask a delivery partner to go
          online (Available) in their dashboard.
        </Text>
      ) : (
        <FlatList
          data={people}
          keyExtractor={(item) => String(item.uid ?? item.id)}
          renderItem={({ item }) => (
            <DeliveryCard person={item} onSelect={handleSelect} />
          )}
          contentContainerStyle={styles.list}
        />
      )}
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
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
});