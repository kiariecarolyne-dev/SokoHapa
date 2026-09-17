import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../utils/theme';

const statusColors = {
  New: { bg: colors.dangerLight, fg: colors.danger },
  Preparing: { bg: colors.warningLight, fg: colors.warning },
  'Ready for Pickup': { bg: colors.primaryLight, fg: colors.primary },
  'Out for Delivery': { bg: '#DBEAFE', fg: '#2563EB' },
  Completed: { bg: colors.successLight, fg: colors.success },
  Cancelled: { bg: colors.dangerLight, fg: colors.danger },
  Processing: { bg: colors.warningLight, fg: colors.warning },
  Active: { bg: colors.primaryLight, fg: colors.primary },
  'Awaiting Accept': { bg: colors.warningLight, fg: colors.warning },
  Assigned: { bg: colors.primaryLight, fg: colors.primary },
  'With Rider': { bg: '#DBEAFE', fg: '#2563EB' },
  'Picked Up': { bg: colors.successLight, fg: colors.success },
  Delivered: { bg: colors.successLight, fg: colors.success },
  Pending: { bg: colors.warningLight, fg: colors.warning },
  Paid: { bg: colors.successLight, fg: colors.success },
  Reported: { bg: '#DBEAFE', fg: '#2563EB' },
  Verified: { bg: colors.successLight, fg: colors.success },
  Rejected: { bg: colors.dangerLight, fg: colors.danger },
  Available: { bg: colors.successLight, fg: colors.success },
  Busy: { bg: colors.warningLight, fg: colors.warning },
  Open: { bg: colors.successLight, fg: colors.success },
  Closed: { bg: colors.dangerLight, fg: colors.danger },
};

export default function StatusBadge({ label }) {
  const palette = statusColors[label] || { bg: colors.border, fg: colors.textSecondary };
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.round,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});