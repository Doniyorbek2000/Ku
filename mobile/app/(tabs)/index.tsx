import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api/client';
import type { WalletResponse } from '@/api/types';
import { sum } from '@/utils/format';
import { colors, spacing } from '@/theme';

export default function WalletHome() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<WalletResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get<WalletResponse>('/api/wallet');
      setData(res);
    } catch {
      /* jimgina o'tkazamiz */
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
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Salom,</Text>
          <Text style={styles.name}>{user?.name ?? 'Xaridor'}</Text>
        </View>
        <Pressable onPress={logout} hitSlop={10}>
          <Text style={styles.logout}>Chiqish</Text>
        </Pressable>
      </View>

      <Card style={styles.totalCard}>
        <Text style={styles.totalLabel}>Umumiy keshbek balansi</Text>
        <Text style={styles.totalValue}>{sum(data?.totalBalance ?? 0)}</Text>
      </Card>

      <Text style={styles.sectionTitle}>Do‘konlar bo‘yicha</Text>
      <FlatList
        data={data?.wallets ?? []}
        keyExtractor={(w) => w.organization.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <Card>
            <Text style={{ color: colors.muted, textAlign: 'center' }}>
              Hali keshbek yo‘q. Do‘konda xarid qilib QR ni skanerlang.
            </Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 20 }}>🏪</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.orgName}>{item.organization.name}</Text>
              {item.organization.category ? (
                <Text style={styles.orgCat}>{item.organization.category}</Text>
              ) : null}
            </View>
            <Text style={styles.balance}>{sum(item.balance)}</Text>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  hello: { color: colors.muted, fontSize: 14 },
  name: { color: colors.text, fontSize: 22, fontWeight: '800' },
  logout: { color: colors.danger, fontWeight: '600' },
  totalCard: { margin: spacing.md, backgroundColor: colors.primary, borderColor: colors.primary },
  totalLabel: { color: '#D1FAE5', fontSize: 14 },
  totalValue: { color: colors.white, fontSize: 34, fontWeight: '800', marginTop: 6 },
  sectionTitle: {
    marginHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orgName: { fontSize: 16, fontWeight: '700', color: colors.text },
  orgCat: { fontSize: 13, color: colors.muted },
  balance: { fontSize: 16, fontWeight: '800', color: colors.primary },
});
