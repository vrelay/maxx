import { Stack } from "expo-router";

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="loadingAiProcessing" />
      <Stack.Screen name="aiResult" />
      <Stack.Screen name="lockedDashboard" />
      <Stack.Screen name="looksmaxxingPlan" />
      <Stack.Screen name="unlockedLook" />
      <Stack.Screen name="mainScreen" />
    </Stack>
  );
}
