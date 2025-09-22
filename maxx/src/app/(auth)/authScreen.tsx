import { useAuth } from "@/src/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const AuthScreen = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const {
    signIn,
    signUp,
    isLoading,
    error,
    clearError,
    sendEmailVerificationForEmailSignup,
  } = useAuth();

  useEffect(() => {
    clearError();
  }, [isLoginView]);

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setEmail("");
    setPassword("");
    setDisplayName("");
    clearError();
  };

  const handleAuthAction = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password cannot be empty.");
      return;
    }
    if (!isLoginView && !displayName) {
      Alert.alert("Error", "Display name cannot be empty.");
      return;
    }

    if (isLoginView) {
      const success = await signIn({ email, password });
      if (success) {
        // router.push("/(tabs)/aiResult");

        router.push("/(auth)");
      }
    } else {
      const success = await signUp({ email, password, displayName });
      if (success) {
        await sendEmailVerificationForEmailSignup();
        router.push("/(auth)/verifyEmailScreen");
      }
    }
    return;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2D1B69" />
        <LinearGradient
          colors={["#171840", "#6D37D4"]}
          locations={[0, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoidingView}
            >
              <View style={styles.formContainer}>
                <Text style={styles.title}>
                  {isLoginView ? "Welcome Back" : "Create Account"}
                </Text>
                <Text style={styles.subtitle}>
                  {isLoginView
                    ? "Log in to continue your journey."
                    : "Join us to unlock your potential."}
                </Text>

                <View style={styles.inputContainer}>
                  {!isLoginView && (
                    <TextInput
                      style={styles.input}
                      placeholder="Display Name"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={displayName}
                      onChangeText={setDisplayName}
                      autoCapitalize="words"
                    />
                  )}
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleAuthAction}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {isLoginView ? "Login" : "Sign Up"}
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleText}>
                    {isLoginView
                      ? "Don't have an account? "
                      : "Already have an account? "}
                  </Text>
                  <TouchableOpacity onPress={toggleView}>
                    <Text style={styles.toggleLink}>
                      {isLoginView ? "Sign Up" : "Login"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
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
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
  },
  formContainer: {
    paddingHorizontal: scale(25),
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "Plush-Trial",
    fontSize: moderateScale(38),
    fontWeight: "500",
    textAlign: "center",
    marginBottom: verticalScale(10),
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(16),
    textAlign: "center",
    marginBottom: verticalScale(30),
  },
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#FFFFFF",
    fontFamily: "Matter",
    fontSize: moderateScale(15),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(15),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  button: {
    backgroundColor: "#8A5CFF",
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(10),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: "Matter",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  errorText: {
    color: "#FF6B6B",
    fontFamily: "Matter",
    fontSize: moderateScale(14),
    textAlign: "center",
    marginBottom: verticalScale(10),
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(20),
  },
  toggleText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(14),
  },
  toggleLink: {
    color: "#FFFFFF",
    fontFamily: "Matter",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
});

export default AuthScreen;
