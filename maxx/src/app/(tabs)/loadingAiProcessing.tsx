import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import { useAuth } from "@/src/context/AuthContext";
import looksmaxxingService from "@/src/services/looksmaxxingService";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  View,
  AppState,
  AppStateStatus,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const STEP_TEXTS = [
  "Analysing your features",
  "Calculating looksmax potential",
  "Generating your transformation",
];

const LoadingScreen: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const { frontPhoto, sidePhoto, fullBodyPhoto } = useLocalSearchParams();
  const { user, processImgsGenrationForNextStep } = useAuth();
  
  // Refs for managing processing state
  const processingRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Enhanced error handling with retry logic
  const handleError = (error: any, context: string) => {
    console.error(`${context} error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    setLastError(errorMessage);
    
    // Check if it's a session expiry error
    const isSessionError = errorMessage.includes('expired') || 
                          errorMessage.includes('unauthenticated') ||
                          errorMessage.includes('invalid-argument');
    
    // Check if it's a network error
    const isNetworkError = errorMessage.includes('Network') || 
                          errorMessage.includes('timeout') ||
                          errorMessage.includes('connection');
    
    if (retryCount < 3 && (isSessionError || isNetworkError)) {
      // Auto-retry for session and network errors
      setRetryCount(prev => prev + 1);
      const delay = Math.min(2000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
      
      retryTimeoutRef.current = setTimeout(() => {
        console.log(`Retrying ${context} (attempt ${retryCount + 1}/3)...`);
        callAllAPIs(frontPhoto as string, sidePhoto as string, (fullBodyPhoto as string) || undefined);
      }, delay);
    } else {
      // Show error dialog with appropriate options
      showErrorDialog(errorMessage, context);
    }
  };

  const showErrorDialog = (errorMessage: string, context: string) => {
    const isSessionError = errorMessage.includes('expired') || 
                          errorMessage.includes('unauthenticated');
    
    const buttons = [
      { 
        text: "Retake Photos", 
        onPress: () => router.replace("/(tabs)")
      }
    ];
    
    if (isSessionError) {
      buttons.unshift({
        text: "Sign In Again",
        onPress: () => router.replace("/(auth)/authScreen")
      });
    } else if (retryCount < 3) {
      buttons.unshift({
        text: "Try Again",
        onPress: () => {
          setRetryCount(0);
          setLastError(null);
          callAllAPIs(frontPhoto as string, sidePhoto as string, (fullBodyPhoto as string) || undefined);
        }
      });
    }
    
    Alert.alert(
      "Processing Error",
      `${context}: ${errorMessage}\n\n${retryCount >= 3 ? 'Maximum retry attempts reached.' : ''}`,
      buttons
    );
  };

  const callAllAPIs = async (
    frontPhoto: string,
    sidePhoto: string,
    fullBodyPhoto?: string
  ) => {
    if (processingRef.current) {
      console.log("Processing already in progress, skipping duplicate call");
      return;
    }
    
    processingRef.current = true;
    setIsProcessing(true);
    setLastError(null);
    
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
      console.log("firebase image upload result", uploadResult);
      
      if (uploadResult.success) {
        let result = null;
        if (processImgsGenrationForNextStep === "nextmonthsiteration") {
          result = await looksmaxxingService.processLooksmaxxingComplete(
            user?.uid as string,
            uploadResult.frontPhotoUrl,
            uploadResult.sidePhotoUrl,
            uploadResult.fullBodyPhotoUrl || "",
            setStep
          );
          if (result.success) {
            router.replace("/(tabs)/mainScreen");
            return;
          }
        } else {
          result = await looksmaxxingService.processLooksmaxxingBasic(
            user?.uid as string,
            uploadResult.frontPhotoUrl,
            uploadResult.sidePhotoUrl,
            uploadResult.fullBodyPhotoUrl || "",
            setStep
          );
          if (result.success) {
            router.replace("/(tabs)/aiResult");
            return;
          }
        }

        if (!result.success) {
          handleError(result.error || "Failed to process your photos", "Processing");
        }
      } else {
        handleError(uploadResult.error || "Failed to upload images", "Upload");
      }
    } catch (error) {
      handleError(error, "API Call");
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  // App state change handler
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log("App state changed from", appStateRef.current, "to", nextAppState);
    
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came back to foreground
      console.log("App returned to foreground");
      
      // If we were processing and there's an error, show retry option
      if (processingRef.current && lastError) {
        Alert.alert(
          "Processing Interrupted",
          "The app was interrupted while processing. Would you like to continue?",
          [
            { text: "Retake Photos", onPress: () => router.replace("/(tabs)") },
            { 
              text: "Continue Processing", 
              onPress: () => {
                setRetryCount(0);
                setLastError(null);
                callAllAPIs(frontPhoto as string, sidePhoto as string, (fullBodyPhoto as string) || undefined);
              }
            }
          ]
        );
      }
    }
    
    appStateRef.current = nextAppState;
  };

  // Initialize processing
  useEffect(() => {
    const call = async () =>
      await callAllAPIs(
        frontPhoto as string,
        sidePhoto as string,
        (fullBodyPhoto as string) || undefined
      );
    if (frontPhoto && sidePhoto) {
      call();
    }
  }, [frontPhoto, sidePhoto, fullBodyPhoto]);

  // App state listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [lastError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      processingRef.current = false;
    };
  }, []);

  // Animate loading balls
  const ballAnim = [
    useState(new Animated.Value(0))[0],
    useState(new Animated.Value(0))[0],
    useState(new Animated.Value(0))[0],
  ];

  useEffect(() => {
    const animateBalls = () => {
      ballAnim.forEach((anim, i) => {
        // Create a smooth sine wave animation using sequence
        const sineWaveAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: -12,
              duration: 500,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
          ])
        );

        // Start with a delay for each ball
        setTimeout(() => {
          sineWaveAnimation.start();
        }, i * 200);
      });
    };
    animateBalls();
  }, [ballAnim]);

  // Step auto advance
  useEffect(() => {
    if (step < STEP_TEXTS.length - 1) {
      const t = setTimeout(() => setStep((prev) => prev + 1), 10000);
      return () => clearTimeout(t);
    }
  }, []);

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
          <View></View>
          <View style={styles.textContainer}>
            {STEP_TEXTS.map((line, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: verticalScale(8),
                }}
              >
                {step === i ? (
                  <FontAwesome
                    name="refresh"
                    style={styles.icon}
                    color="white"
                  />
                ) : step > i ? (
                  <FontAwesome
                    name="check"
                    style={styles.iconCheck}
                    color="white"
                  />
                ) : (
                  <Text style={{ width: 20 }} />
                )}
                <Text
                  style={[
                    styles.mainText,
                    step === i && { fontWeight: "400", color: "#fff" },
                    step > i && { fontWeight: "400", color: "#fff" },
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
                  {
                    transform: [
                      {
                        translateY: ballAnim[i],
                      },
                    ],
                  },
                  { backgroundColor: "#fff", opacity: 1 },
                ]}
              />
            ))}
          </View>
          <Text style={styles.statusText}>
            {lastError ? (
              `Retrying... (${retryCount}/3)`
            ) : (
              `AI is generating your maximum potential based on${"\n"}50k+ successful transformation`
            )}
          </Text>
          {lastError && (
            <Text style={styles.errorText}>
              {lastError}
            </Text>
          )}
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
    fontFamily: "Matter",
    fontSize: moderateScale(16),
    fontWeight: "400",
    lineHeight: moderateScale(22.4), // 140% of 16px
    letterSpacing: moderateScale(-0.16), // -1% of 16px
    textAlign: "center",
    color: "#fff",
    paddingLeft: 8,
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
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    fontSize: moderateScale(14),
    fontWeight: "500",
    lineHeight: 19,
  },
  errorText: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    fontSize: moderateScale(12),
    fontWeight: "400",
    lineHeight: 16,
    marginTop: verticalScale(8),
    paddingHorizontal: scale(20),
  },
});

export default LoadingScreen;

