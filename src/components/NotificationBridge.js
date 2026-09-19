import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';

import { useAuth } from '../context/AuthContext';
import { navigationRef } from '../utils/navigationRef';
import {
  getOrCreateDeviceId,
  getExpoPushToken,
  IS_EXPO_GO,
  removePushTokenForUser,
  savePushTokenForUser,
} from '../services/pushNotifications';

// Maps a notification payload to the target screen of the role-specific
// navigator. role is included in every payload so a notification can never
// open another user type's dashboard.
const ROUTES = {
  new_order: {
    role: 'vendor',
    screen: 'OrderDetails',
    params: (data) => ({ orderId: data.orderId }),
  },
  delivery_request: {
    role: 'delivery',
    screen: 'Requests',
    params: () => ({}),
  },
  order_picked_up: {
    role: 'buyer',
    screen: 'OrderDetails',
    params: (data) => ({ orderId: data.orderId }),
  },
};

function extractNotificationData(response) {
  return response?.notification?.request?.content?.data ?? null;
}

// Returns true when the payload was processed (navigated or intentionally
// dropped), false when it should be retried once auth/navigation is ready.
function routeNotificationData(data, roleRef) {
  if (!data || typeof data !== 'object') return true;
  const route = ROUTES[data.type];
  if (!route || !data.orderId) return true;

  const role = roleRef.current;
  if (!role) return false;
  if (route.role !== role) return true;

  if (!navigationRef.isReady()) return false;
  navigationRef.navigate(route.screen, route.params(data));
  return true;
}

// Handles everything notification-related that must live inside the app but
// outside any single screen: registering this device's push token for the
// signed-in user, reacting to token rotation, and deep-linking when the user
// taps a notification (app open, backgrounded, or cold-started).
export default function NotificationBridge() {
  const { currentUser, userRole, loading } = useAuth();

  const roleRef = useRef(userRole);
  const lastUidRef = useRef(null);
  const pendingRef = useRef(null);

  useEffect(() => {
    roleRef.current = userRole;
  }, [userRole]);

  const flushPending = () => {
    const pending = pendingRef.current;
    if (!pending) return;
    if (routeNotificationData(pending, roleRef)) {
      pendingRef.current = null;
    }
  };

  // Register (or unregister) this device's push token when the signed-in user
  // changes. Runs after auth has settled so `currentUser` is reliable.
  useEffect(() => {
    if (loading) return;

    const uid = currentUser?.uid ?? null;
    if (IS_EXPO_GO) {
      // Expo Go has no remote push on SDK 53+: nothing to register or remove.
      // Keep lastUidRef in sync so a later dev-build session behaves itself.
      lastUidRef.current = uid;
      flushPending();
      return;
    }

    if (uid) {
      lastUidRef.current = uid;
      (async () => {
        const deviceId = await getOrCreateDeviceId();
        const token = await getExpoPushToken();
        if (token) {
          await savePushTokenForUser(uid, token, deviceId);
        }
      })();
    } else {
      const previousUid = lastUidRef.current;
      lastUidRef.current = null;
      if (previousUid) {
        (async () => {
          const deviceId = await getOrCreateDeviceId();
          await removePushTokenForUser(previousUid, deviceId);
        })();
      }
    }

    flushPending();
  }, [loading, currentUser?.uid]);

  // React to push token rotation (e.g. after a re-install / token refresh).
  // Skipped entirely inside Expo Go where the native token emitter is removed.
  useEffect(() => {
    if (IS_EXPO_GO) return undefined;
    try {
      return Notifications.addPushTokenListener(({ data }) => {
        const uid = lastUidRef.current;
        if (!uid || typeof data !== 'string') return;
        getOrCreateDeviceId().then((deviceId) =>
          savePushTokenForUser(uid, data, deviceId)
        );
      }).remove;
    } catch (error) {
      console.warn('[push] token listener unavailable', error?.message);
      return undefined;
    }
  }, []);

  // Foreground / background tap: navigate immediately when we can, otherwise
  // keep the payload until auth and the navigator are ready.
  useEffect(() => {
    if (IS_EXPO_GO) return undefined;
    try {
      return Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data = extractNotificationData(response);
          if (!data) return;
          if (!routeNotificationData(data, roleRef)) {
            pendingRef.current = data;
          }
        }
      ).remove;
    } catch (error) {
      console.warn('[push] response listener unavailable', error?.message);
      return undefined;
    }
  }, []);

  // Cold start: the user tapped a notification that launched the app while it
  // was fully closed. Route it once auth has resolved.
  useEffect(() => {
    if (IS_EXPO_GO) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const response = await Notifications.getLastNotificationResponseAsync();
        if (cancelled || !response) return;
        const data = extractNotificationData(response);
        if (!data) return;
        if (!routeNotificationData(data, roleRef)) {
          pendingRef.current = data;
        }
      } catch (error) {
        console.warn('[push] cold start response unavailable', error?.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}