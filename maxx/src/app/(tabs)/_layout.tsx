import { Stack } from "expo-router";

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="loadingAiProcessing" />
      <Stack.Screen name="aiResult" />
      <Stack.Screen name="lockedDashboard" />
      <Stack.Screen name="looksmaxxingPlan" />
      <Stack.Screen name="paymentSuccess" />
      <Stack.Screen 
        name="generateOtherThreeImgs" 
        options={{
          gestureEnabled: false,
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
