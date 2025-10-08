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
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import * as AppleAuthentication from 'expo-apple-authentication';

const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(false);

  const {
    signIn,
    signUp,
    user,
    isLoading,
    error,
    clearError,
    sendEmailVerificationForEmailSignup,
  } = useAuth();

  useEffect(() => {
    clearError();
  }, []);

  const handleAppleSignUp = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Extract user info from Apple credential
      let appleEmail = credential.email;
      
      // If Apple doesn't provide email, generate one using the user ID
      if (!appleEmail) {
        appleEmail = `apple_${credential.user}@privaterelay.appleid.com`;
        console.log("Apple didn't provide email, using generated email:", appleEmail);
      }

      const appleFullName = credential.fullName;
      const appleDisplayName = appleFullName
        ? `${appleFullName.givenName || ''} ${appleFullName.familyName || ''}`.trim()
        : displayName || `Apple User ${credential.user.slice(-4)}`;

      // Validate email is not empty
      if (!appleEmail || appleEmail.trim() === '') {
        Alert.alert("Error", "Unable to get email from Apple. Please try again or use email sign-up.");
        return;
      }

      // Set the email and display name for API compatibility
      setEmail(appleEmail);
      setDisplayName(appleDisplayName);

      // Generate a secure password for Apple users (they won't need to know this)
      const generatedPassword = `apple_${credential.user}_${Date.now()}`;
      setPassword(generatedPassword);

      // Use the existing signUp flow with Apple credentials
      const success = await signUp({
        email: appleEmail,
        password: generatedPassword,
        displayName: appleDisplayName
      });

      if (success) {
        // Apple users should also go through social proof and referral screens
        router.push("/(auth)/socialproof");
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // User canceled the sign-in flow
        return;
      }
      console.error('Apple Sign-Up Error:', error);
      Alert.alert("Error", "Apple Sign-Up failed. Please try again or use email sign-up.");
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Extract user info from Apple credential
      let appleEmail = credential.email;
      
      // If Apple doesn't provide email, generate one using the user ID
      if (!appleEmail) {
        appleEmail = `apple_${credential.user}@privaterelay.appleid.com`;
        console.log("Apple didn't provide email, using generated email:", appleEmail);
      }

      const appleFullName = credential.fullName;
      const appleDisplayName = appleFullName
        ? `${appleFullName.givenName || ''} ${appleFullName.familyName || ''}`.trim()
        : displayName || `Apple User ${credential.user.slice(-4)}`;

      // Validate email is not empty
      if (!appleEmail || appleEmail.trim() === '') {
        Alert.alert("Error", "Unable to get email from Apple. Please try again or use email sign-up.");
        return;
      }

      // For Apple login, we'll create a new account if one doesn't exist
      // Apple handles the authentication, so we just need to ensure the user exists
      const generatedPassword = `apple_${credential.user}_${Date.now()}`;
      
      try {
        // Try to create account (this will succeed if new, or fail if exists)
        const success = await signUp({
          email: appleEmail,
          password: generatedPassword,
          displayName: appleDisplayName
        });

        if (success) {
          // New user - go through onboarding
          router.push("/(auth)/socialproof");
        }
      } catch (signUpError: any) {
        // If signup fails because user already exists, treat as successful login
        if (signUpError.message?.includes('email-already-in-use') || 
            signUpError.message?.includes('auth/email-already-in-use')) {
          console.log("User already exists, treating as successful login...");
          
          // Since Apple authenticated them, treat as successful login
          router.push("/(tabs)");
        } else {
          console.error('Apple Sign-Up Error:', signUpError);
          Alert.alert("Error", "Apple Login failed. Please try again or use email sign-up.");
        }
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      console.error('Apple Login Error:', error);
      Alert.alert("Error", "Apple Login failed. Please try again or use email sign-up.");
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password cannot be empty.");
      return;
    }

    if (isLoginMode) {
      // Handle email login
      const success = await signIn({ email, password });
      if (success) {
        router.push("/(tabs)");
      }
    } else {
      // Handle email sign-up
      if (!displayName) {
        Alert.alert("Error", "Display name cannot be empty.");
        return;
      }

      const success = await signUp({ email, password, displayName });
      if (success) {
        await sendEmailVerificationForEmailSignup();
        if (user && !user.emailVerified) {
          router.push("/(auth)/verifyEmailScreen");
          return;
        }
        router.push("/(auth)/socialproof");
      }
    }
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
                  {isLoginMode ? "Welcome Back" : "Welcome to Maxx"}
                </Text>
                <Text style={styles.subtitle}>
                  {isLoginMode 
                    ? "Sign in to continue your journey." 
                    : "Join us to unlock your potential and discover your peak self."
                  }
                </Text>

                {/* Apple Buttons */}
                {Platform.OS === 'ios' && (
                  <View style={styles.appleButtonsContainer}>
                    <TouchableOpacity
                      style={styles.appleButton}
                      onPress={isLoginMode ? handleAppleLogin : handleAppleSignUp}
                    >
                      <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={styles.appleIcon} />
                      <Text style={styles.appleButtonText}>
                        {isLoginMode ? "Login with Apple" : "Sign in with Apple"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.inputContainer}>
                  {!isLoginMode && (
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
                  onPress={handleEmailAuth}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {isLoginMode ? "Sign In" : "Create Account"}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => {
                    setIsLoginMode(!isLoginMode);
                    clearError();
                  }}
                >
                  <Text style={styles.toggleButtonText}>
                    {isLoginMode 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </Text>
                </TouchableOpacity>
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
    fontSize: moderateScale(40),
    fontWeight: "500",
    fontStyle: "italic",
    lineHeight: moderateScale(46), // 114.99% of 40px
    letterSpacing: moderateScale(-0.4), // -1% of 40px
    textAlign: "center",
    marginBottom: verticalScale(10),
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(16),
    fontWeight: "400",
    lineHeight: moderateScale(22.4), // 140% of 16px
    letterSpacing: moderateScale(-0.16), // -1% of 16px
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
  appleButtonsContainer: {
    marginBottom: verticalScale(20),
  },
  appleButton: {
    width: "100%",
    height: verticalScale(50),
    backgroundColor: "#000000",
    borderRadius: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
  },
  appleIcon: {
    marginRight: scale(8),
  },
  appleButtonText: {
    color: "#FFFFFF",
    fontFamily: "Matter",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: verticalScale(20),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  dividerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(14),
    marginHorizontal: scale(15),
  },
  toggleButton: {
    marginTop: verticalScale(20),
    alignItems: "center",
  },
  toggleButtonText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "Matter",
    fontSize: moderateScale(14),
    textDecorationLine: "underline",
  },
});

export default AuthScreen;
