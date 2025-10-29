import { Stack } from "expo-router";
import ErrorBoundary from "../../componants/atoms/ErrorBoundary";

export default function TabsLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="loadingAiProcessing" />
        <Stack.Screen name="aiResult" />
        <Stack.Screen name="lockedDashboard" />
        <Stack.Screen name="paywallScreen" />
        <Stack.Screen name="managePlan" />
        <Stack.Screen name="support" />
        <Stack.Screen name="subscriptionInfo" />
        <Stack.Screen name="looksmaxxingPlan" />
        <Stack.Screen name="paymentSuccess" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="analysis" />
        <Stack.Screen name="privacyPolicy" />
        <Stack.Screen name="termsOfService" />
        <Stack.Screen 
          name="mainScreen" 
          options={{
            gestureEnabled: false,
            headerBackVisible: false,
          }}
        />
      </Stack>
    </ErrorBoundary>
  );
}
