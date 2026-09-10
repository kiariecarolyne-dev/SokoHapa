import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BrandHeader from '../../components/BrandHeader';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { getAuthErrorMessage } from '../../utils/firebaseErrors';
import { colors, spacing, typography } from '../../utils/theme';

export default function LoginScreen({ navigation }) {
  const { login, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }
    setSubmitting(true);
    try {
      // The auth-state listener resolves the user's role and AppNavigator
      // switches to the correct role navigator.
      await login(email, password);
    } catch (error) {
      Alert.alert('Login failed', getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Email required', 'Please enter your email to receive a reset link.');
      return;
    }
    try {
      await resetPassword(email);
      Alert.alert(
        'Check your email',
        'A password reset link has been sent. Follow it to reset your password.'
      );
    } catch (error) {
      Alert.alert('Reset failed', getAuthErrorMessage(error));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <BrandHeader size="medium" />

          <Text style={styles.welcome}>Welcome back</Text>
          <Text style={styles.hint}>Log in to continue shopping on SokoHapa.</Text>

          <View style={styles.form}>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              icon="mail"
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              icon="lock-closed"
            />

            <PrimaryButton
              title="Login"
              onPress={handleLogin}
              disabled={submitting}
            />

            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotWrap}>
              <Text style={styles.forgot}>Forgot Password</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don’t have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RegisterRole')}>
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  welcome: {
    ...typography.title,
    marginTop: spacing.xl,
  },
  hint: {
    ...typography.bodySmall,
    marginTop: 4,
  },
  form: {
    marginTop: spacing.lg,
  },
  forgotWrap: {
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  forgot: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.textSecondary,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '700',
    marginLeft: 4,
  },
});