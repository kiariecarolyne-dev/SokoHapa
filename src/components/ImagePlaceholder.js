import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../utils/theme';

export default function ImagePlaceholder({
  style,
  icon = 'image-outline',
  iconSize = 36,
  iconColor = colors.primary,
  backgroundColor,
}) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: backgroundColor || colors.primaryLight },
        style,
      ]}
    >
      <Ionicons name={icon} size={iconSize} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radius.md,
  },
});