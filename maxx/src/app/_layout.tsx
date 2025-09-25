import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../context/AuthContext";
import revenueCatService from "../services/revenueCatService";
import { ToastService } from "../services/ToastService";
import "./index.css";

export default function RootLayout() {
  // Initialize RevenueCat when app starts
  React.useEffect(() => {
    revenueCatService.initialize().catch(console.error);
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastService />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
