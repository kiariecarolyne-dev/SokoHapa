import { createNavigationContainerRef } from '@react-navigation/native';

// Module-level navigation reference so non-component code (e.g. push
// notification tap routing) can navigate the app's active stack. It is
// attached to the NavigationContainer in AppNavigator.
export const navigationRef = createNavigationContainerRef();