import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import ImageSlider from "@/src/componants/molecules/imgslider";
import MonthlyProgressBars from "@/src/componants/molecules/MonthlyProgressBars";
import img from "@/src/constants/img";
import { useAuth } from "@/src/context/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const GenerateOtherThreeImgs: React.FC = () => {
  const { leftImages,rightImages, subscriptionDays } = useAuth();
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false);
  const [apiProgress, setApiProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiAnimation = new Animated.Value(0);

  const simulateApiCall = () => {
    setIsApiCallInProgress(true);
    setApiProgress(0);

    const progressInterval = setInterval(() => {
      setApiProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsApiCallInProgress(false);
            setShowConfetti(true);
            Animated.timing(confettiAnimation, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }).start();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const onLeftNavigation = () => {
    setCurrentPoseIndex((prev) => (prev === 0 ? 3 : prev - 1));
  };

  const onRightNavigation = () => {
    setCurrentPoseIndex((prev) => (prev === 3 ? 0 : prev + 1));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      simulateApiCall();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const renderNotificationBanner = () => {
    if (isApiCallInProgress) {
      return (
        <View style={styles.notificationBanner}>
          <Text style={styles.notificationText}>
            Processing in progress... hang tight till then!
          </Text>
          <TouchableOpacity onPress={() => setIsApiCallInProgress(false)}>
            <Text style={styles.notificationClose}>×</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const renderConfetti = () => {
    if (!showConfetti) return null;

    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;

    const burstY = 50;
    const burstX = screenWidth / 2;
    const paperPieces = [
      { color: "#FFD700", size: 12, shape: "square" },
      { color: "#FF6B6B", size: 8, shape: "circle" },
      { color: "#4ECDC4", size: 15, shape: "rectangle" },
      { color: "#45B7D1", size: 10, shape: "triangle" },
      { color: "#96CEB4", size: 14, shape: "square" },
      { color: "#FFEAA7", size: 6, shape: "circle" },
      { color: "#DDA0DD", size: 11, shape: "rectangle" },
      { color: "#98D8C8", size: 9, shape: "triangle" },
      { color: "#FF9F43", size: 13, shape: "square" },
      { color: "#6C5CE7", size: 7, shape: "circle" },
      { color: "#A29BFE", size: 16, shape: "rectangle" },
      { color: "#FD79A8", size: 5, shape: "triangle" },
    ];

    return (
      <View style={styles.confettiContainer}>
        {[...Array(60)].map((_, i) => {
          const piece = paperPieces[i % paperPieces.length];

          const randomAngle = Math.random() * 2 * Math.PI;
          const randomDistance = 100 + Math.random() * 200;

          const endX = burstX + Math.cos(randomAngle) * randomDistance;
          const endY = burstY + Math.sin(randomAngle) * randomDistance;

          const extraRandomX = (Math.random() - 0.5) * 80;
          const extraRandomY = (Math.random() - 0.5) * 80;
          const finalEndX = endX + extraRandomX;
          const finalEndY = endY + extraRandomY;

          return (
            <Animated.View
              key={i}
              style={[
                styles.paperPiece,
                {
                  left: burstX - piece.size / 2,
                  top: burstY - piece.size / 2,
                  width: piece.size,
                  height: piece.size,
                  backgroundColor: piece.color,
                  borderRadius: piece.shape === "circle" ? piece.size / 2 : 2,
                  transform: [
                    {
                      translateX: confettiAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, finalEndX - burstX],
                      }),
                    },
                    {
                      translateY: confettiAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, finalEndY - burstY],
                      }),
                    },
                    {
                      rotate: confettiAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "720deg"],
                      }),
                    },
                    {
                      scale: confettiAnimation.interpolate({
                        inputRange: [0, 0.1, 0.8, 1],
                        outputRange: [0, 1.2, 1, 0.3],
                      }),
                    },
                  ],
                  opacity: confettiAnimation.interpolate({
                    inputRange: [0, 0.1, 0.7, 1],
                    outputRange: [0, 1, 1, 0],
                  }),
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GridBackgroundImg top={true} />
      <LinearGradient
        colors={["#171840", "#6D37D4"]}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Maxx.</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/settings")}>
                <Text style={styles.settingsIcon}>{"\u{2699}"}</Text>
              </TouchableOpacity>
            </View>

            {/* {renderNotificationBanner()} */}

            {isApiCallInProgress && (
              <View style={styles.loadingCard}>
                <Text style={styles.loadingTitle}>
                  Your plan and images are on the way...
                </Text>
                <Text style={styles.loadingSubtitle}>
                  Just about few minutes to go.
                </Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${apiProgress}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            )}

            <View style={styles.imageContainer}>
              <View style={styles.imageWrapper}>
                <ImageSlider
                  beforeImage={{ uri: leftImages[currentPoseIndex]?.uri }}
                  afterImage={{ uri: rightImages[currentPoseIndex]?.uri }}
                  lefttext="Pose 1"
                  righttext="+4 levels"
                  onleftnavigation={onLeftNavigation}
                  onrightnavigation={onRightNavigation}
                />

                <View style={styles.paginationDots}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>
            </View>

            <MonthlyProgressBars currentDays={subscriptionDays || 0} />

            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={styles.navCard}
                onPress={() => router.push("/(tabs)/looksmaxxingPlan")}
              >
                <View style={styles.navCardIcon}>
                  <FontAwesome name="calendar" size={24} color="orange" />
                </View>
                <Text style={styles.navCardTitle}>Your Plan</Text>
                <Text style={styles.navCardSubtitle}>View Daily Task</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navCard}
                onPress={() => router.push("/(tabs)/analysis")}
              >
                <View style={styles.navCardIcon}>
                  <FontAwesome name="bar-chart-o" size={24} color="orange" />
                </View>
                <Text style={styles.navCardTitle}>Analysis</Text>
                <Text style={styles.navCardSubtitle}>See Breakdown</Text>
              </TouchableOpacity>
            </View>

            {renderConfetti()}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: {
    flex: 1,
    zIndex: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(15),
    paddingBottom: verticalScale(20),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: verticalScale(15),
    width: "100%",
  },
  headerTitle: {
    color: "#fff",
    fontSize: moderateScale(22),
    fontWeight: "700",
  },
  settingsIcon: {
    color: "#fff",
    fontSize: moderateScale(24),
  },
  notificationBanner: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    marginTop: verticalScale(15),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationText: {
    color: "#000",
    fontSize: moderateScale(14),
    fontWeight: "500",
    flex: 1,
  },
  notificationClose: {
    color: "#000",
    fontSize: moderateScale(20),
    fontWeight: "bold",
  },
  loadingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(20),
    marginTop: verticalScale(20),
    alignItems: "center",
  },
  loadingTitle: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "600",
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  loadingSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: moderateScale(14),
    textAlign: "center",
    marginBottom: verticalScale(20),
  },
  progressBarContainer: {
    width: "100%",
  },
  progressBarBackground: {
    height: 6,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 3,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  imageContainer: {
    alignItems: "center",
    marginTop: verticalScale(25),
  },
  imageWrapper: {
    position: "relative",
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(15),
    gap: scale(8),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  navigationContainer: {
    marginTop: verticalScale(40),
    flexDirection: "row",
    gap: scale(15),
  },
  navCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.11)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, .5)",
    borderRadius: moderateScale(15),
    paddingVertical: verticalScale(30),
    paddingHorizontal: scale(20),
    width: "100%",
    height: verticalScale(100),
    alignItems: "center",
    justifyContent: "center",
  },
  navCardIcon: {
    marginBottom: verticalScale(10),
  },
  navCardTitle: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontWeight: "700",
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  navCardSubtitle: {
    color: "rgb(255, 255, 255)",
    fontSize: moderateScale(14),
    textAlign: "center",
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    zIndex: 1000,
  },
  paperPiece: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});
export default GenerateOtherThreeImgs;
