import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui';
import { api } from '@/api/client';
import type { Transaction } from '@/api/types';
import { shortDate, sum } from '@/utils/format';
import { colors, spacing } from '@/theme';

const LABEL: Record<Transaction['type'], string> = {
  EARN: 'Keshbek olindi',
  REDEEM: 'Keshbek ishlatildi',
  ADJUST: 'Tuzatish',
};

export default function History() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get<{ transactions: Transaction[] }>('/api/wallet/transactions?limit=50');
      setTxns(res.transactions);
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.header}>Tranzaksiyalar tarixi</Text>
      <FlatList
        data={txns}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <Card>
            <Text style={{ color: colors.muted, textAlign: 'center' }}>Hali tranzaksiyalar yo‘q.</Text>
          </Card>
        }
        renderItem={({ item }) => {
          const positive = item.amount >= 0;
          return (
            <Card style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.org}>{item.organization.name}</Text>
                <Text style={styles.meta}>
                  {LABEL[item.type]} · {shortDate(item.createdAt)}
                </Text>
              </View>
              <Text style={[styles.amount, { color: positive ? colors.success : colors.danger }]}>
                {positive ? '+' : ''}
                {sum(item.amount)}
              </Text>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center', paddingVertical: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  org: { fontSize: 15, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '800' },
});
