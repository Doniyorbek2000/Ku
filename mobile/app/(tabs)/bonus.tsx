import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@/components/ui';
import { api } from '@/api/client';
import type { RewardsResponse } from '@/api/types';
import { sum } from '@/utils/format';
import { colors, spacing } from '@/theme';

const TIER_LABEL: Record<string, string> = {
  REFERRAL_INVITER: 'Do‘st taklif bonusi',
  REFERRAL_INVITEE: 'Taklif bonusi',
  TIER: 'Daraja bonusi',
};

export default function Bonus() {
  const [data, setData] = useState<RewardsResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api.get<RewardsResponse>('/api/wallet/rewards'));
    } catch {
      /* jimgina */
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function shareCode() {
    if (!data?.referralCode) return;
    await Share.share({
      message: `Ku keshbek ilovasiga qo‘shil va bonus ol! Taklif kodim: ${data.referralCode}`,
    });
  }

  const progress =
    data && data.nextTier
      ? Math.min(1, data.lifetimeSpend / (data.lifetimeSpend + data.nextTier.remaining))
      : 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={styles.header}>Bonus va daraja</Text>

        {/* Ku bonus ballari */}
        <Card style={{ backgroundColor: colors.primary, borderColor: colors.primary }}>
          <Text style={{ color: '#D1FAE5' }}>Ku bonus ballari</Text>
          <Text style={styles.bonusValue}>{sum(data?.bonusPoints ?? 0)}</Text>
        </Card>

        {/* Daraja */}
        <Card>
          <View style={styles.rowBetween}>
            <Text style={styles.tierName}>{data?.tier.name ?? 'Bronza'} daraja</Text>
            <Text style={styles.badge}>+{Math.round((data?.tier.bonusRate ?? 0) * 100)}% bonus</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          {data?.nextTier ? (
            <Text style={styles.muted}>
              {data.nextTier.name} darajaga {sum(data.nextTier.remaining)} qoldi
            </Text>
          ) : (
            <Text style={styles.muted}>Eng yuqori darajadasiz 🏆</Text>
          )}
        </Card>

        {/* Referral */}
        <Card>
          <Text style={styles.sectionTitle}>Do‘st taklif qiling</Text>
          <Text style={styles.muted}>
            Do‘stingiz kodingiz bilan ro‘yxatdan o‘tib birinchi xaridini qilsa — ikkalangizga bonus.
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.code}>{data?.referralCode ?? '—'}</Text>
          </View>
          <Text style={styles.muted}>Siz taklif qilganlar: {data?.referralCount ?? 0} kishi</Text>
          <View style={{ height: spacing.sm }} />
          <Button title="Kodni ulashish" onPress={shareCode} />
        </Card>

        {/* Bonus tarixi */}
        <Card>
          <Text style={styles.sectionTitle}>Bonus tarixi</Text>
          {!data?.events.length && <Text style={styles.muted}>Hali bonus yo‘q.</Text>}
          {data?.events.map((e) => (
            <View key={e.id} style={styles.eventRow}>
              <Text style={{ color: colors.text }}>{TIER_LABEL[e.type] ?? e.type}</Text>
              <Text style={{ color: colors.success, fontWeight: '800' }}>+{sum(e.points)}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
  bonusValue: { color: colors.white, fontSize: 32, fontWeight: '800', marginTop: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierName: { fontSize: 18, fontWeight: '800', color: colors.text },
  badge: {
    backgroundColor: '#CCFBF1',
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressTrack: {
    height: 10,
    backgroundColor: colors.bg,
    borderRadius: 999,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 999 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  muted: { color: colors.muted, fontSize: 14 },
  codeBox: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 10,
  },
  code: { fontSize: 24, fontWeight: '800', letterSpacing: 3, color: colors.primaryDark },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
