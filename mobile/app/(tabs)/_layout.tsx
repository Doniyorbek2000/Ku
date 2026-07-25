import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { borderTopColor: colors.border, height: 60, paddingBottom: 8, paddingTop: 6 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Hamyon', tabBarIcon: ({ focused }) => <TabIcon emoji="💰" focused={focused} /> }}
      />
      <Tabs.Screen
        name="scan"
        options={{ title: 'Skaner', tabBarIcon: ({ focused }) => <TabIcon emoji="📷" focused={focused} /> }}
      />
      <Tabs.Screen
        name="bonus"
        options={{ title: 'Bonus', tabBarIcon: ({ focused }) => <TabIcon emoji="🎁" focused={focused} /> }}
      />
      <Tabs.Screen
        name="stores"
        options={{ title: 'Do‘konlar', tabBarIcon: ({ focused }) => <TabIcon emoji="🏪" focused={focused} /> }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'Tarix', tabBarIcon: ({ focused }) => <TabIcon emoji="📜" focused={focused} /> }}
      />
    </Tabs>
  );
}
