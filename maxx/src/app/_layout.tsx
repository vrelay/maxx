import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../context/AuthContext";
import revenueCatService from "../services/revenueCatService";
import { ToastService } from "../services/ToastService";
import ErrorBoundary from "../componants/atoms/ErrorBoundary";
import "./index.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Plush-Trial": require("../assets/fonts/Plush-Trial-MediumItalic-BF654c40146661a.otf"),
  });
  // Initialize RevenueCat when app starts
  React.useEffect(() => {
    revenueCatService.initialize().catch(console.error);
  }, []);
  
  if (!fontsLoaded) {
    return null; // or a loading screen
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <ToastService />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
          <Toast />
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
