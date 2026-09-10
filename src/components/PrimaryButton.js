import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../utils/theme';

export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  block = true,
  icon = null,
  style,
}) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  const backgroundColor = isPrimary
    ? colors.primary
    : isDanger
      ? colors.danger
      : 'transparent';

  const borderColor = isOutline ? colors.primary : colors.border;

  const textColor = isOutline ? colors.primary : colors.white;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        block && styles.wide,
        { backgroundColor, borderWidth: isOutline ? 1.5 : 0, borderColor },
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={18} color={isOutline ? colors.primary : colors.white} style={styles.icon} />
      ) : null}
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  wide: {
    alignSelf: 'stretch',
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
  },
  icon: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});