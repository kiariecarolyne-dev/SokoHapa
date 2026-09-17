import { doc, updateDoc } from 'firebase/firestore';
import { supabase } from './supabase';
import { db } from './firebase';

const BUCKET = 'profile-photos';

// Decode a base64 string into a Uint8Array. supabase-js Storage uploads do not
// work reliably in React Native when given a Blob/File/FormData body (it wraps
// Blobs into FormData). The supported React Native path is a raw binary body
// (ArrayBuffer/ArrayBufferView), which React Native's fetch handles natively.
function base64ToUint8Array(base64) {
  if (typeof atob !== 'function') {
    throw new Error('base64 decoding is not available in this runtime.');
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function uploadProfilePhoto(uid, base64Data) {
  const path = `${uid}/profile.jpg`;

  const body = base64ToUint8Array(base64Data);

  console.info('[profilePhoto] Uploading to Supabase Storage', { path });

  const { data, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, body, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('[profilePhoto] Supabase upload failed', {
      statusCode: uploadError.statusCode,
      message: uploadError.message,
      details: uploadError.details,
      hint: uploadError.hint,
      cause: uploadError.cause,
    });
    throw uploadError;
  }

  console.info('[profilePhoto] Supabase upload succeeded', { path, id: data?.id });

  try {
    await updateDoc(doc(db, 'users', uid), {
      profilePhoto: path,
    });
  } catch (error) {
    console.error('[profilePhoto] Firestore profile update failed', {
      message: error?.message,
      code: error?.code,
    });
    throw error;
  }

  // The vendor's profile photo is also the store's profile photo (single
  // upload system). Best-effort sync: the store may not exist yet if the
  // vendor uploads before their store is created.
  try {
    await updateDoc(doc(db, 'stores', uid), {
      profilePhoto: path,
    });
    console.info('[profilePhoto] Synced store photo', { storeId: uid, path });
  } catch (error) {
    console.warn('[profilePhoto] Store photo sync skipped (store may not exist)', {
      storeId: uid,
      message: error?.message,
    });
  }

  return path;
}

export async function removeProfilePhoto(uid) {
  const path = `${uid}/profile.jpg`;

  const { error: removeError } = await supabase.storage.from(BUCKET).remove([path]);
  if (removeError) {
    console.error('[profilePhoto] Supabase remove failed', {
      statusCode: removeError.statusCode,
      message: removeError.message,
      details: removeError.details,
      hint: removeError.hint,
      cause: removeError.cause,
    });
    throw removeError;
  }

  await updateDoc(doc(db, 'users', uid), {
    profilePhoto: null,
  });

  // Best-effort sync with the store photo.
  try {
    await updateDoc(doc(db, 'stores', uid), {
      profilePhoto: null,
    });
    console.info('[profilePhoto] Cleared store photo', { storeId: uid });
  } catch (error) {
    console.warn('[profilePhoto] Store photo clear skipped (store may not exist)', {
      storeId: uid,
      message: error?.message,
    });
  }
}

export function getProfilePhotoUrl(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}