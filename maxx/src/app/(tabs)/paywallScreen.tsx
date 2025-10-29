import Paywall from "@/src/componants/molecules/Paywall";
import { useAuth } from "@/src/context/AuthContext";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PaywallScreen: React.FC = () => {
  const { refreshCustomerInfo, isPremium } = useAuth();

  useEffect(() => {
    // If user is already premium, redirect them away from paywall
    if (isPremium) {
      router.replace("/(tabs)/mainScreen");
    }
  }, [isPremium]);

  const handlePurchaseSuccess = () => {
    refreshCustomerInfo();
    // Navigate to the unlocked dashboard with AI analysis
    router.replace("/(tabs)/mainScreen");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Paywall onPurchaseSuccess={handlePurchaseSuccess} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PaywallScreen;

