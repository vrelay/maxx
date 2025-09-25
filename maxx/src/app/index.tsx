import { Redirect } from "expo-router";
import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

const index = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const imagesGenerated = true;
  const isSubscriptionActive = true;
  
  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.container]}>
          <LinearGradient
            colors={["#171840", "#6D37D4"]}
            style={styles.gradient}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
              }}
            >
              <ActivityIndicator size="large" color="#FFFFFF" style={styles.spinner} />
              <Text style={styles.loadingText}>
                Loading your potential...
              </Text>
            </View>
          </LinearGradient>
        </View>
      </GestureHandlerRootView>
    );
  }
  
  if (isAuthenticated) {
    if (isSubscriptionActive) {
      return <Redirect href="/(tabs)/generateOtherThreeImgs" />;
    } else if (imagesGenerated) {
      return <Redirect href="/(tabs)/aiResult" />;
    } else if (user?.emailVerified) {
      return <Redirect href="/(tabs)" />;
    }
  } else {
    return <Redirect href="/(auth)" />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Matter",
    fontWeight: "400",
    textAlign: "center",
  },
});

export default index;
