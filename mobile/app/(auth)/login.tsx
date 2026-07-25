import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/api/client';
import { colors, spacing } from '@/theme';

export default function Login() {
  const { login } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError('');
    if (!loginId || !password) {
      setError('Telefon va parolni kiriting');
      return;
    }
    setLoading(true);
    try {
      await login(loginId.trim(), password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>Ku</Text>
          <Text style={styles.subtitle}>Keshbek hisobingizga kiring</Text>

          <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
            <Input
              label="Telefon raqami"
              placeholder="+998901234567"
              autoCapitalize="none"
              keyboardType="phone-pad"
              value={loginId}
              onChangeText={setLoginId}
            />
            <Input
              label="Parol"
              placeholder="Parolingiz"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Kirish" onPress={onSubmit} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={{ color: colors.muted }}>Hisobingiz yo‘qmi? </Text>
            <Link href="/(auth)/register" style={styles.link}>
              Ro‘yxatdan o‘tish
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  logo: { fontSize: 56, fontWeight: '800', color: colors.primary, textAlign: 'center' },
  subtitle: { textAlign: 'center', color: colors.muted, fontSize: 16, marginTop: spacing.xs },
  error: { color: colors.danger, fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  link: { color: colors.primary, fontWeight: '700' },
});
