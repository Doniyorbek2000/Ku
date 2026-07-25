import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui';
import { api } from '@/api/client';
import type { Organization } from '@/api/types';
import { cashbackLabel } from '@/utils/format';
import { colors, spacing } from '@/theme';

export default function Stores() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get<{ organizations: Organization[] }>('/api/catalog');
      setOrgs(res.organizations);
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
      <Text style={styles.header}>Hamkor do‘konlar</Text>
      <FlatList
        data={orgs}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <Card>
            <Text style={{ color: colors.muted, textAlign: 'center' }}>Hozircha do‘konlar yo‘q.</Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 20 }}>🏪</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.orgName}>{item.name}</Text>
              {item.category ? <Text style={styles.orgCat}>{item.category}</Text> : null}
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cashbackLabel(item.cashbackType, item.cashbackValue)}</Text>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center', paddingVertical: spacing.md },
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
  badge: { backgroundColor: '#CCFBF1', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
});
