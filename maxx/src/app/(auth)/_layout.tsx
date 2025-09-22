import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="socialproof" />
      <Stack.Screen name="referralScreen" />
      <Stack.Screen name="authScreen" />
      <Stack.Screen name="verifyEmailScreen" />
    </Stack>
  );
}
