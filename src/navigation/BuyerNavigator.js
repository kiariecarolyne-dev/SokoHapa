import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BuyerHomeScreen from '../screens/buyer/BuyerHomeScreen';
import StoresScreen from '../screens/buyer/StoresScreen';
import StoreScreen from '../screens/buyer/StoreScreen';
import ProductDetailsScreen from '../screens/buyer/ProductDetailsScreen';
import CartScreen from '../screens/buyer/CartScreen';
import CheckoutScreen from '../screens/buyer/CheckoutScreen';
import EditOrderScreen from '../screens/buyer/EditOrderScreen';
import OrdersScreen from '../screens/buyer/OrdersScreen';
import BuyerOrderDetailsScreen from '../screens/buyer/BuyerOrderDetailsScreen';
import BuyerProfileScreen from '../screens/buyer/BuyerProfileScreen';

import { colors } from '../utils/theme';

const Stack = createNativeStackNavigator();

export default function BuyerNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Home"
        component={BuyerHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Stores"
        component={StoresScreen}
        options={{ title: 'Stores' }}
      />
      <Stack.Screen
        name="Store"
        component={StoreScreen}
        options={{ title: 'Store' }}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{ title: 'Product Details' }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'My Cart' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: 'My Orders' }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={BuyerOrderDetailsScreen}
        options={{ title: 'Order Details' }}
      />
      <Stack.Screen
        name="EditOrder"
        component={EditOrderScreen}
        options={{ title: 'Edit Order' }}
      />
      <Stack.Screen
        name="Profile"
        component={BuyerProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}