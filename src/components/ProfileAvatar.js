import { useState } from 'react';
import { Image } from 'react-native';
import ImagePlaceholder from './ImagePlaceholder';
import { getProfilePhotoUrl } from '../services/profilePhotoService';

// Circular profile photo that follows the existing SokoHapa profile-photo
// system: given the stored profile-photo path (e.g. "{uid}/profile.jpg") it
// resolves the public URL via getProfilePhotoUrl() and renders <Image />.
// When no path exists (or the image cannot be loaded) it falls back to the
// same ImagePlaceholder used by the profile screens. Works for Buyer, Vendor
// and Delivery identities alike and never crashes when profilePhoto is missing.
export default function ProfileAvatar({ profilePhoto, size = 56, fallbackIcon = 'person-outline', style }) {
  const [hasError, setHasError] = useState(false);
  const uri = getProfilePhotoUrl(profilePhoto);
  const avatarStyle = { width: size, height: size, borderRadius: size / 2 };

  if (uri && !hasError) {
    return (
      <Image
        source={{ uri }}
        style={[avatarStyle, style]}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <ImagePlaceholder
      icon={fallbackIcon}
      iconSize={Math.round(size * 0.5)}
      style={[avatarStyle, style]}
    />
  );
}