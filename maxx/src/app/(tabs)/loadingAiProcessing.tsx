import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import { useAuth } from "@/src/context/AuthContext";
import looksmaxxingService from "@/src/services/looksmaxxingService";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const STEP_TEXTS = [
  [
    "Analysing your features",
    "Calculating looksmax potential",
    "Generating your transformation",
  ],
  [
    "Analysing your features",
    "Calculating looksmax potential",
    "Generating your transformation",
  ],
  [
    "Analysing your features",
    "Calculating looksmax potential",
    "Generating your transformation",
  ],
];

const LoadingScreen: React.FC = () => {
  const [step, setStep] = useState(0);
  const { frontPhoto, sidePhoto, fullBodyPhoto } = useLocalSearchParams();
  const { user } = useAuth();

  const callAllAPIs = async (
    frontPhoto: string,
    sidePhoto: string,
    fullBodyPhoto?: string
  ) => {
    try {
      // Test the connection first
      await looksmaxxingService.testConnection();
      const uploadResult = await looksmaxxingService.uploadUserPhotos(
        user?.uid as string,
        {
          frontPhoto: frontPhoto,
          sidePhoto: sidePhoto,
          fullBodyPhoto: fullBodyPhoto,
        }
      );
      if (!uploadResult.success) {
        const result = await looksmaxxingService.processLooksmaxxing(
          uploadResult.frontPhotoUrl,
          uploadResult.sidePhotoUrl,
          uploadResult.fullBodyPhotoUrl
        );
        if (result.success) {
          router.replace("/(tabs)/aiResult");
        } else {
          Alert.alert(
            "API Error",
            result.error || "Failed to call APIs. Check console for details.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.error("API call error:", error);
      Alert.alert(
        "API Error",
        "Failed to call APIs. Check console for details.",
        [{ text: "OK" }]
      );
    }
  };

  useEffect(() => {
    const call = async () =>
      await callAllAPIs(
        frontPhoto as string,
        sidePhoto as string,
        (fullBodyPhoto as string) || undefined
      );
    call();
  }, [frontPhoto, sidePhoto, fullBodyPhoto]);

  // Animate loading balls
  const ballAnim = [
    useState(new Animated.Value(0))[0],
    useState(new Animated.Value(0))[0],
    useState(new Animated.Value(0))[0],
  ];

  useEffect(() => {
    const animateBalls = () => {
      ballAnim.forEach((anim, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 120),
            Animated.timing(anim, {
              toValue: -12,
              duration: 320,
              useNativeDriver: true,
              easing: Easing.out(Easing.quad),
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 320,
              useNativeDriver: true,
              easing: Easing.in(Easing.quad),
            }),
          ])
        ).start();
      });
    };
    animateBalls();
  }, [ballAnim]);

  // Step auto advance
  useEffect(() => {
    if (step < STEP_TEXTS.length - 1) {
      const t = setTimeout(() => setStep((prev) => prev + 1), 1400);
      return () => clearTimeout(t);
    }
  }, [step]);

  // Button handler
  const handleContinue = () => {
    router.replace("/(tabs)/aiResult");
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
          <View style={styles.textContainer}>
            {STEP_TEXTS[step].map((line, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: verticalScale(8),
                }}
              >
                {step === i ? (
                  <Text style={styles.icon}>{"\u27F3"}</Text> // Unicode reload icon
                ) : step > i ? (
                  <Text style={styles.iconCheck}>✓</Text>
                ) : (
                  <Text style={{ width: 20 }} />
                )}
                <Text
                  style={[
                    styles.mainText,
                    step === i && { fontWeight: "600", color: "#fff" },
                    step > i && { fontWeight: "600", color: "#fff" },
                    step < i && { color: "rgba(255,255,255,0.6)" },
                  ]}
                >
                  {line}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.ballsContainer}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.ball,
                  { transform: [{ translateY: ballAnim[i] }] },
                  { backgroundColor: "#fff", opacity: 1 },
                ]}
              />
            ))}
          </View>
          <Text style={styles.statusText}>
            AI is generating your maximum potential based on{"\n"}
            50k+ successful transformation
          </Text>
          <ButtonStart text="Continue" handlepress={handleContinue} />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const ballSize = 18;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: scale(20),
    justifyContent: "space-between",
    paddingTop: verticalScale(200),
    paddingBottom: verticalScale(20),
  },
  textContainer: {
    alignItems: "center",
    marginBottom: verticalScale(40),
    minHeight: verticalScale(110),
  },
  mainText: {
    fontSize: moderateScale(18),
    color: "#fff",
    paddingLeft: 8,
    letterSpacing: 0.2,
  },
  icon: {
    color: "#fff",
    fontSize: moderateScale(18),
    marginRight: 2,
    width: 22,
    textAlign: "center",
  },
  iconCheck: {
    color: "#fff",
    fontSize: moderateScale(20),
    marginRight: 2,
    width: 22,
    textAlign: "center",
  },
  ballsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: verticalScale(50),
    height: ballSize * 2,
  },
  ball: {
    width: ballSize,
    height: ballSize,
    borderRadius: ballSize / 2,
    marginHorizontal: scale(12),
    backgroundColor: "#fff",
    opacity: 0.4,
    shadowColor: "#6D37D4",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  statusText: {
    color: "rgba(255,255,255,0.82)",
    textAlign: "center",
    fontSize: moderateScale(14),
    fontWeight: "400",
    lineHeight: 19,
  },
});

export default LoadingScreen;
