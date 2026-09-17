import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth, db } from '../services/firebase';
import { setRuntimeRole } from '../services/listenerLogging';

const VALID_ROLES = ['buyer', 'vendor', 'delivery'];

const PROFILE_RETRY_ATTEMPTS = 5;
const PROFILE_RETRY_DELAY_MS = 400;

const AuthContext = createContext({
  currentUser: null,
  userRole: null,
  userProfile: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
});

export async function fetchUserProfile(uid) {
  const docRef = doc(db, 'users', uid);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? snapshot.data() : null;
}

// A freshly created account may not have its profile document readable yet.
// Retry a few times before concluding the profile is genuinely missing.
async function fetchUserProfileWithRetry(uid) {
  for (let attempt = 0; attempt < PROFILE_RETRY_ATTEMPTS; attempt++) {
    const profile = await fetchUserProfile(uid);
    if (profile) return profile;
    await new Promise((resolve) => setTimeout(resolve, PROFILE_RETRY_DELAY_MS));
  }
  return null;
}

export function AuthProvider({ children }) {
  const [authInitialized, setAuthInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // `loading` stays true until the auth state is known AND, when signed in,
  // the Firestore profile (and therefore role) has been resolved. This avoids
  // flashing the wrong dashboard before the role is known.
  const loading = !authInitialized || (currentUser && profileLoading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        setProfileLoading(true);
        try {
          const profile = await fetchUserProfileWithRetry(user.uid);
          const role = profile?.role;
          if (profile && VALID_ROLES.includes(role)) {
            setUserProfile(profile);
            setUserRole(role);
            setRuntimeRole(role);
          } else {
            // No profile document or invalid role: there is no valid
            // dashboard to show, so end the session cleanly.
            setRuntimeRole(null);
            setUserProfile(null);
            setUserRole(null);
            await signOut(auth);
          }
        } catch (error) {
          setRuntimeRole(null);
          setUserProfile(null);
          setUserRole(null);
        } finally {
          setProfileLoading(false);
          setAuthInitialized(true);
        }
      } else {
        setRuntimeRole(null);
        setUserProfile(null);
        setUserRole(null);
        setProfileLoading(false);
        setAuthInitialized(true);
      }
    });

    return unsubscribe;
  }, []);

  // Keep the Firestore profile live so subscription changes made by the
  // backend (M-Pesa callback / dev test endpoints) propagate to every screen
  // (e.g. the Product gates) without a login/logout cycle.
  useEffect(() => {
    if (!currentUser?.uid) return undefined;
    const unsub = onSnapshot(
      doc(db, 'users', currentUser.uid),
      (snapshot) => {
        if (!snapshot.exists()) return;
        const next = snapshot.data();
        setUserProfile((prev) =>
          next && prev && prev.uid === next.uid ? { ...prev, ...next } : next
        );
        const role = next.role;
        if (role && VALID_ROLES.includes(role)) {
          setUserRole(role);
          setRuntimeRole(role);
        }
      },
      (error) => {
        console.warn('[auth] user profile snapshot error', {
          operation: 'onSnapshot',
          collection: 'users',
          path: `users/${currentUser.uid}`,
          code: error?.code,
          message: error?.message,
        });
      }
    );
    return unsub;
  }, [currentUser?.uid]);

  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);

    const profile = await fetchUserProfile(credential.user.uid);
    if (!profile) {
      await signOut(auth);
      const error = new Error('No profile found for this account.');
      error.code = 'no-profile';
      throw error;
    }
    if (!VALID_ROLES.includes(profile.role)) {
      await signOut(auth);
      const error = new Error('This account has an invalid role.');
      error.code = 'invalid-role';
      throw error;
    }

    setRuntimeRole(profile.role);
    console.log(
      `[FIREBASE AUTH] ${JSON.stringify({
        uid: credential.user.uid,
        email: credential.user.email,
        role: profile.role,
      })}`
    );

    return { user: credential.user, profile, role: profile.role };
  };

  const register = async (email, password, profileData = {}) => {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const uid = credential.user.uid;

    const now = serverTimestamp();
    const profile = {
      uid,
      email: email.trim(),
      role: profileData.role || 'buyer',
      fullName: profileData.fullName || '',
      phone: profileData.phone || '',
      profilePhoto: null,
      createdAt: now,
      updatedAt: now,
    };

    if (profile.role === 'vendor') {
      profile.storeName = profileData.storeName || '';
      profile.subscriptionStatus = 'inactive';
      profile.subscriptionStartDate = null;
      profile.subscriptionExpiryDate = null;
    }

    if (profile.role === 'delivery') {
      profile.nationalId = profileData.nationalId || '';
      profile.vehicleType = profileData.vehicleType || '';
      profile.vehiclePlateNumber = profileData.vehiclePlateNumber || '';
    }

    try {
      await setDoc(doc(db, 'users', uid), profile);
    } catch (error) {
      // Clean up the auth account so the user can retry registration.
      await deleteUser(credential.user).catch(() => {});
      throw error;
    }

    return { user: credential.user, role: profile.role };
  };

  const logout = async () => {
    try {
      // Best-effort Firebase sign-out. If the server-side token revocation
      // fails (e.g. no network), the local session is still cleared below so
      // the user is never stuck on the dashboard.
      await signOut(auth);
    } finally {
      // Clear any persisted Firebase auth tokens so that a later app restart
      // cannot restore a session after a partial sign-out.
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const firebaseKeys = allKeys.filter((key) => key.startsWith('firebase:authUser:'));
        if (firebaseKeys.length > 0) {
          await AsyncStorage.multiRemove(firebaseKeys);
        }
      } catch (error) {
        // Ignore storage errors; the in-memory session is already cleared.
      }

      setCurrentUser(null);
      setUserProfile(null);
      setUserRole(null);
      setRuntimeRole(null);
      setProfileLoading(false);
      setAuthInitialized(true);
    }
  };

  const resetPassword = async (email) => {
    if (!email?.trim()) {
      const error = new Error('Please enter your email address.');
      error.code = 'auth/invalid-email';
      throw error;
    }
    await sendPasswordResetEmail(auth, email.trim());
  };

  const value = {
    currentUser,
    userRole,
    userProfile,
    loading,
    login,
    register,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}