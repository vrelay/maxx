import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading your potential..." 
}) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <LinearGradient
          colors={["#171840", "#6D37D4"]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <ActivityIndicator size="large" color="#FFFFFF" style={styles.spinner} />
            <Text style={styles.loadingText}>
              {message}
            </Text>
          </View>
        </LinearGradient>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
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

export default LoadingScreen;
