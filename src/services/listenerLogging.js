import { onSnapshot } from 'firebase/firestore';
import { auth } from './firebase';

let cachedRole = null;

export function setRuntimeRole(role) {
  cachedRole = role ?? null;
}

// Used by every Firestore snapshot listener so that a rejected subscription
// (permission rules, missing index, offline auth, etc.) is logged with enough
// detail to identify the exact operation instead of crashing the app with an
// "Uncaught error in snapshot listener".
export function safeOnSnapshot(queryRef, { source, path, query, onData, onError }) {
  const base = {
    role: cachedRole,
    uid: auth.currentUser?.uid ?? null,
    source,
    path,
    query,
  };

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log(`[FIRESTORE START] ${JSON.stringify(base)}`);
  }

  return onSnapshot(
    queryRef,
    (snapshot) => onData(snapshot),
    (error) => {
      console.error(
        `[FIRESTORE FAILURE] ${JSON.stringify({
          ...base,
          code: error?.code ?? 'unknown',
          message: error?.message ?? String(error),
        })}`
      );
      if (typeof onError === 'function') {
        onError(error);
      }
    }
  );
}