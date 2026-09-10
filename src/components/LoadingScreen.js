import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BrandHeader from './BrandHeader';
import { colors } from '../utils/theme';

export default function LoadingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <BrandHeader size="large" />
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loader: {
    marginTop: 40,
  },
});