import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DeliveryDashboardScreen from '../screens/delivery/DeliveryDashboardScreen';
import DeliveryRequestsScreen from '../screens/delivery/DeliveryRequestsScreen';
import ActiveDeliveryScreen from '../screens/delivery/ActiveDeliveryScreen';
import DeliveryHistoryScreen from '../screens/delivery/DeliveryHistoryScreen';
import DeliveryProfileScreen from '../screens/delivery/DeliveryProfileScreen';

import { colors } from '../utils/theme';

const Stack = createNativeStackNavigator();

export default function DeliveryNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DeliveryDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Requests"
        component={DeliveryRequestsScreen}
        options={{ title: 'Delivery Requests' }}
      />
      <Stack.Screen
        name="ActiveDelivery"
        component={ActiveDeliveryScreen}
        options={{ title: 'Active Delivery' }}
      />
      <Stack.Screen
        name="History"
        component={DeliveryHistoryScreen}
        options={{ title: 'Delivery History' }}
      />
      <Stack.Screen
        name="Profile"
        component={DeliveryProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}