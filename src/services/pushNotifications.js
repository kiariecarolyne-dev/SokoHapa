import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { db } from './firebase';

// Remote push notifications (device push tokens, Expo push tokens and the
// token/push events) were removed from Expo Go on Android with SDK 53. The
// native expo-notifications calls below THROW inside Expo Go, so every native
// call is gated on the execution environment. Inside Expo Go the app skips
// push registration/listeners entirely and continues working normally; use a
// development build or standalone APK to test real push notifications.
export const IS_EXPO_GO =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Shows a heads-up banner and plays the default sound while the app is in the
// foreground. Required on Android 7+ and iOS before notifications render.
// Skipped (and harmless) inside Expo Go, where remote push is unavailable.
if (IS_EXPO_GO) {
  console.warn(
    '[Push] Remote push notifications are disabled in Expo Go on SDK 53+. Use a development build or APK.'
  );
} else {
  Notifications.setNotificationHandler({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  });
}

const DEVICE_ID_STORAGE_KEY = 'sokohapa:notificationDeviceId';

let configurePromise = null;

// Idempotent one-time configuration: creates the Android notification channel
// used for order updates. Returns true once configuration succeeded, and false
// (without touching the native module) inside Expo Go.
function ensureConfigured() {
  if (IS_EXPO_GO) {
    return Promise.resolve(false);
  }
  if (!configurePromise) {
    configurePromise = (async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Order updates',
          importance: Notifications.AndroidImportance.HIGH,
          lightColor: '#16A34A',
          vibrationPattern: [0, 250, 250, 250],
        });
      }
      return true;
    })();
  }
  return configurePromise;
}

// Stable per-install identifier for this app's token document, so the same
// physical device always updates one Firestore record across logins.
export async function getOrCreateDeviceId() {
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (!deviceId) {
    deviceId = `sh-dev-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    await AsyncStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
  }
  return deviceId;
}

// Reads the `extra.eas.projectId` the app was built with. This is what the
// Expo Push service binds tokens to; keep it aligned with the EAS build.
export function getExpoProjectId() {
  return Constants.expoConfig?.extra?.eas?.projectId ?? null;
}

// Prompts for notification permission if not already granted and requests an
// Expo push token for this device. Returns the token string, or null when the
// app runs in Expo Go (remote push unavailable), the user denied permission,
// or the platform cannot produce a token. Callers must handle null gracefully
// and keep working.
export async function getExpoPushToken() {
  if (IS_EXPO_GO) {
    return null;
  }
  try {
    await ensureConfigured();

    const existing = await Notifications.getPermissionsAsync();
    const settings =
      existing.status === 'granted' || existing.status === 'provisional'
        ? existing
        : await Notifications.requestPermissionsAsync();
    if (settings.status !== 'granted' && settings.status !== 'provisional') {
      // Permission denied: the app keeps working, just without push.
      return null;
    }

    const projectId = getExpoProjectId();
    if (!projectId) {
      console.warn('[push] expo projectId not found; push tokens unavailable');
      return null;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return typeof token === 'string' && token.length > 0 ? token : null;
  } catch (error) {
    console.warn('[push] could not obtain Expo push token', {
      code: error?.code,
      message: error?.message,
    });
    return null;
  }
}

// Saves (or refreshes) this device's token under pushTokens/{uid}/tokens/
// {deviceId}. The security rules only allow the owner of the uid chain to
// write here, and the server sends only to these stored tokens.
export async function savePushTokenForUser(uid, token, deviceId) {
  if (!uid || !token || !deviceId) return;
  try {
    const ref = doc(db, 'pushTokens', uid, 'tokens', deviceId);
    await setDoc(
      ref,
      {
        uid,
        token,
        platform: Platform.OS,
        enabled: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('[push] failed to save push token', {
      code: error?.code,
      message: error?.message,
      uid,
    });
  }
}

// Removes this device's token record (used on logout so the server never
// pings a device that no longer belongs to the account).
export async function removePushTokenForUser(uid, deviceId) {
  if (!uid || !deviceId) return;
  try {
    await deleteDoc(doc(db, 'pushTokens', uid, 'tokens', deviceId));
  } catch (error) {
    console.warn('[push] failed to remove push token', {
      code: error?.code,
      message: error?.message,
      uid,
    });
  }
}