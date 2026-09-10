import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/auth/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterRoleScreen from '../screens/auth/RegisterRoleScreen';
import BuyerRegisterScreen from '../screens/auth/BuyerRegisterScreen';
import VendorRegisterScreen from '../screens/auth/VendorRegisterScreen';
import DeliveryRegisterScreen from '../screens/auth/DeliveryRegisterScreen';

import { colors } from '../utils/theme';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Login' }}
      />
      <Stack.Screen
        name="RegisterRole"
        component={RegisterRoleScreen}
        options={{ title: 'Create Account' }}
      />
      <Stack.Screen
        name="BuyerRegister"
        component={BuyerRegisterScreen}
        options={{ title: 'Create Buyer Account' }}
      />
      <Stack.Screen
        name="VendorRegister"
        component={VendorRegisterScreen}
        options={{ title: 'Create Vendor Account' }}
      />
      <Stack.Screen
        name="DeliveryRegister"
        component={DeliveryRegisterScreen}
        options={{ title: 'Create Delivery Account' }}
      />
    </Stack.Navigator>
  );
}