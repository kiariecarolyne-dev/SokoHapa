import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { navigationRef } from '../utils/navigationRef';

import LoadingScreen from '../components/LoadingScreen';
import AuthNavigator from './AuthNavigator';
import BuyerNavigator from './BuyerNavigator';
import VendorNavigator from './VendorNavigator';
import DeliveryNavigator from './DeliveryNavigator';

// The navigator shown is selected based on the authenticated user's role
// (read from the Firestore users/{uid} profile). While the Firebase auth
// state or the role is still loading, an appropriate loading state is shown
// so the wrong dashboard is never flashed.
export default function AppNavigator() {
  const { currentUser, userRole, loading } = useAuth();

  return (
    <NavigationContainer ref={navigationRef}>
      {loading ? (
        <LoadingScreen />
      ) : !currentUser ? (
        <AuthNavigator />
      ) : userRole === 'buyer' ? (
        <BuyerNavigator />
      ) : userRole === 'vendor' ? (
        <VendorNavigator />
      ) : userRole === 'delivery' ? (
        <DeliveryNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}