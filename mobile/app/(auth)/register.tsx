import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/api/client';
import { colors, spacing } from '@/theme';

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError('');
    if (name.length < 2 || phone.length < 7 || password.length < 6) {
      setError('Ism, telefon va kamida 6 belgili parol kiriting');
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), phone.trim(), password);
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
          <Text style={styles.title}>Ro‘yxatdan o‘tish</Text>
          <Text style={styles.subtitle}>Keshbek yig‘ishni bugun boshlang</Text>

          <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
            <Input label="Ismingiz" placeholder="Ism Familiya" value={name} onChangeText={setName} />
            <Input
              label="Telefon raqami"
              placeholder="+998901234567"
              autoCapitalize="none"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <Input
              label="Parol"
              placeholder="Kamida 6 belgi"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Ro‘yxatdan o‘tish" onPress={onSubmit} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={{ color: colors.muted }}>Hisobingiz bormi? </Text>
            <Link href="/(auth)/login" style={styles.link}>
              Kirish
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
  title: { fontSize: 32, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { textAlign: 'center', color: colors.muted, fontSize: 16, marginTop: spacing.xs },
  error: { color: colors.danger, fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  link: { color: colors.primary, fontWeight: '700' },
});
