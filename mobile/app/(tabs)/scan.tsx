import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@/components/ui';
import { api, ApiError } from '@/api/client';
import type { ClaimResult, PurchasePreview } from '@/api/types';
import { sum } from '@/utils/format';
import { colors, spacing } from '@/theme';

type Phase =
  | { step: 'scanning' }
  | { step: 'loading' }
  | { step: 'preview'; data: PurchasePreview; token: string }
  | { step: 'done'; result: ClaimResult; org: string }
  | { step: 'error'; message: string };

export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>({ step: 'scanning' });
  const [claiming, setClaiming] = useState(false);

  // Har safar ekranga kelganda skanerni tiklaymiz
  useFocusEffect(
    useCallback(() => {
      setPhase({ step: 'scanning' });
    }, []),
  );

  async function onScanned(token: string) {
    setPhase({ step: 'loading' });
    try {
      const data = await api.get<PurchasePreview>(`/api/purchases/${token}`);
      if (data.status !== 'PENDING') {
        setPhase({ step: 'error', message: 'Bu QR allaqachon ishlatilgan yoki muddati o‘tgan' });
        return;
      }
      setPhase({ step: 'preview', data, token });
    } catch (e) {
      setPhase({ step: 'error', message: e instanceof ApiError ? e.message : 'QR o‘qishda xatolik' });
    }
  }

  async function confirm(token: string, org: string) {
    setClaiming(true);
    try {
      const result = await api.post<ClaimResult>('/api/purchases/claim', { qrToken: token });
      setPhase({ step: 'done', result, org });
    } catch (e) {
      setPhase({ step: 'error', message: e instanceof ApiError ? e.message : 'Keshbek olishda xatolik' });
    } finally {
      setClaiming(false);
    }
  }

  // Kamera ruxsati
  if (!permission) return <View style={styles.safe} />;
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>Kamera ruxsati kerak</Text>
        <Text style={styles.muted}>QR kodni skanerlash uchun kameraga ruxsat bering.</Text>
        <View style={{ height: spacing.md }} />
        <Button title="Ruxsat berish" onPress={requestPermission} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.header}>QR kodni skanerlang</Text>

      {phase.step === 'scanning' && (
        <View style={styles.cameraWrap}>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => onScanned(data)}
          />
          <View style={styles.frame} />
          <Text style={styles.hint}>Kassadagi QR kodni ramka ichiga tutib turing</Text>
        </View>
      )}

      {phase.step === 'loading' && (
        <View style={styles.center}>
          <Text style={styles.muted}>Yuklanmoqda…</Text>
        </View>
      )}

      {phase.step === 'preview' && (
        <View style={styles.resultWrap}>
          <Card>
            <Text style={styles.muted}>{phase.data.organization.name}</Text>
            <Text style={styles.rowLine}>
              Xarid summasi: <Text style={styles.bold}>{sum(phase.data.amount)}</Text>
            </Text>
            <Text style={styles.rowLine}>
              Sizga keshbek: <Text style={[styles.bold, { color: colors.success }]}>+{sum(phase.data.cashback)}</Text>
            </Text>
            {phase.data.redeemRequested > 0 ? (
              <Text style={styles.rowLine}>
                Ishlatiladi: <Text style={styles.bold}>-{sum(phase.data.redeemRequested)}</Text>
              </Text>
            ) : null}
          </Card>
          <View style={{ height: spacing.md }} />
          <Button
            title="Tasdiqlash"
            loading={claiming}
            onPress={() => confirm(phase.token, phase.data.organization.name)}
          />
          <View style={{ height: spacing.sm }} />
          <Button title="Bekor qilish" variant="ghost" onPress={() => setPhase({ step: 'scanning' })} />
        </View>
      )}

      {phase.step === 'done' && (
        <View style={styles.resultWrap}>
          <Card style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 48 }}>🎉</Text>
            <Text style={styles.successTitle}>Keshbek qo‘shildi!</Text>
            <Text style={[styles.bold, { fontSize: 28, color: colors.success, marginVertical: 6 }]}>
              +{sum(phase.result.earned)}
            </Text>
            {phase.result.redeemed > 0 ? (
              <Text style={styles.muted}>Ishlatildi: {sum(phase.result.redeemed)}</Text>
            ) : null}
            <Text style={styles.muted}>{phase.org}</Text>
            <Text style={[styles.rowLine, { marginTop: spacing.sm }]}>
              Yangi balans: <Text style={styles.bold}>{sum(phase.result.newBalance)}</Text>
            </Text>
          </Card>
          <View style={{ height: spacing.md }} />
          <Button title="Yana skanerlash" onPress={() => setPhase({ step: 'scanning' })} />
        </View>
      )}

      {phase.step === 'error' && (
        <View style={styles.resultWrap}>
          <Card style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 44 }}>⚠️</Text>
            <Text style={[styles.successTitle, { color: colors.danger }]}>{phase.message}</Text>
          </Card>
          <View style={{ height: spacing.md }} />
          <Button title="Qayta urinish" onPress={() => setPhase({ step: 'scanning' })} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, padding: spacing.lg },
  header: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center', paddingVertical: spacing.md },
  cameraWrap: {
    flex: 1,
    margin: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 20,
    opacity: 0.9,
  },
  hint: { position: 'absolute', bottom: 24, color: colors.white, textAlign: 'center', paddingHorizontal: 20 },
  resultWrap: { padding: spacing.lg, justifyContent: 'center', flex: 1 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
  muted: { color: colors.muted, textAlign: 'center' },
  rowLine: { fontSize: 15, color: colors.text, marginTop: 6 },
  bold: { fontWeight: '800', color: colors.text },
  successTitle: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: 6 },
});
