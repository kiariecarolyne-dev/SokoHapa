import { createNativeStackNavigator } from '@react-navigation/native-stack';

import VendorSubscriptionScreen from '../screens/vendor/VendorSubscriptionScreen';
import VendorDashboardScreen from '../screens/vendor/VendorDashboardScreen';
import VendorStoreScreen from '../screens/vendor/VendorStoreScreen';
import EditVendorStoreScreen from '../screens/vendor/EditVendorStoreScreen';
import VendorProductsScreen from '../screens/vendor/VendorProductsScreen';
import AddProductScreen from '../screens/vendor/AddProductScreen';
import EditProductScreen from '../screens/vendor/EditProductScreen';
import VendorOrdersScreen from '../screens/vendor/VendorOrdersScreen';
import VendorOrderDetailsScreen from '../screens/vendor/VendorOrderDetailsScreen';
import ChooseDeliveryScreen from '../screens/vendor/ChooseDeliveryScreen';
import VendorProfileScreen from '../screens/vendor/VendorProfileScreen';

import { colors } from '../utils/theme';

const Stack = createNativeStackNavigator();

export default function VendorNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Subscription"
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Subscription"
        component={VendorSubscriptionScreen}
        options={{ title: 'Vendor Subscription' }}
      />
      <Stack.Screen
        name="Dashboard"
        component={VendorDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Store"
        component={VendorStoreScreen}
        options={{ title: 'My Store' }}
      />
      <Stack.Screen
        name="EditStore"
        component={EditVendorStoreScreen}
        options={{ title: 'Edit Store' }}
      />
      <Stack.Screen
        name="Products"
        component={VendorProductsScreen}
        options={{ title: 'My Products' }}
      />
      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ title: 'Add Product' }}
      />
      <Stack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{ title: 'Edit Product' }}
      />
      <Stack.Screen
        name="Orders"
        component={VendorOrdersScreen}
        options={{ title: 'Orders' }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={VendorOrderDetailsScreen}
        options={{ title: 'Order Details' }}
      />
      <Stack.Screen
        name="ChooseDelivery"
        component={ChooseDeliveryScreen}
        options={{ title: 'Choose Delivery Person' }}
      />
      <Stack.Screen
        name="Profile"
        component={VendorProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}