import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import img from "@/src/constants/img";
import { useAuth } from "@/src/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Image, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const HomeScreen: React.FC = () => {
  const { setProcessImgsGenrationForNextStep } = useAuth();

  const handlePaymentSuccess = () => {
    setProcessImgsGenrationForNextStep("next3");
    // Clear entire navigation stack and go to mainScreen
    router.dismissAll();
    router.replace("/(tabs)/mainScreen");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2D1B69" />
      <GridBackgroundImg top={true} />
      <LinearGradient
        colors={["#171840", "#6D37D4"]}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.contentContainer}>
            <View style={styles.iconContainer}>
              <Image
                source={img.payment_success}
                style={styles.image}
                resizeMode="contain"
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.successTitle}>Payment Successful!</Text>

              <Text style={styles.successDescription}>
                Continue to view your Lookmaxing Plan and start your transformation journey.
              </Text>
            </View>
          </View>

          <ButtonStart
            text="Begin My Scan"
            handlepress={handlePaymentSuccess}
          />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(20),
    fontFamily: "Plush-Trial",
    zIndex: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  iconContainer: {
    marginBottom: verticalScale(30),
  },
  image: {
    width: scale(200),
    height: scale(200),
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: scale(20),
  },
  successTitle: {
    color: "#FFFFFF",
    fontFamily: "Plush-Trial",
    fontSize: moderateScale(32),
    fontWeight: "600",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: verticalScale(16),
    lineHeight: moderateScale(38),
  },
  successSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Matter",
    fontSize: moderateScale(18),
    fontWeight: "500",
    textAlign: "center",
    marginBottom: verticalScale(12),
    lineHeight: moderateScale(24),
  },
  successDescription: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(15),
    fontWeight: "400",
    textAlign: "center",
    lineHeight: moderateScale(22),
  },
});

export default HomeScreen;
