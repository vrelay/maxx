import { useAuth } from "@/src/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const VerifyEmailScreen = () => {
  const {
    user,
    checkEmailIsEmailVerified,
    sendEmailVerificationForEmailSignup,
    signOut,
  } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    const isVerified = await checkEmailIsEmailVerified();
    if (!isVerified) {
      Alert.alert(
        "Not Verified",
        "Your email is still not verified. Please check your inbox (and spam folder) for the verification link."
      );
      setIsChecking(false);
      return;
    }
    // If verified, the root layout will automatically navigate the user.
    setIsChecking(false);
    router.replace("/(auth)/socialproof");
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    const sent = await sendEmailVerificationForEmailSignup();
    if (sent) {
      Alert.alert(
        "Email Sent",
        "A new verification email has been sent to your address."
      );
    } else {
      Alert.alert(
        "Error",
        "Could not send verification email. Please try again later."
      );
    }
    setIsResending(false);
  };

  return (
    <LinearGradient
      colors={["#171840", "#6D37D4"]}
      locations={[0, 1]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification link to{" "}
            <Text style={styles.emailText}>{user?.email}</Text>. Please click
            the link to continue.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCheckStatus}
            disabled={isChecking}
          >
            {isChecking ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>I've Verified My Email</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleResendEmail}
            disabled={isResending}
          >
            {isResending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Resend Verification Email</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Use a different account</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: scale(20),
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "Plush-Trial",
    fontSize: moderateScale(36),
    textAlign: "center",
    marginBottom: verticalScale(16),
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "Matter",
    fontSize: moderateScale(16),
    textAlign: "center",
    lineHeight: verticalScale(24),
    marginBottom: verticalScale(40),
  },
  emailText: {
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  primaryButton: {
    backgroundColor: "#8A5CFF",
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: verticalScale(16),
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: "Matter",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  signOutButton: {
    padding: scale(10),
  },
  signOutText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(14),
  },
});

export default VerifyEmailScreen;
