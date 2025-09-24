import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import ImageSlider from "@/src/componants/molecules/imgslider";
import { useAuth } from "@/src/context/AuthContext";
import looksmaxxingService from "@/src/services/looksmaxxingService";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Svg, { Circle } from "react-native-svg";

// Helper function to determine the border color based on the rating
const getBorderColor = (score: number) => {
  if (score >= 75) return "#34D399"; // A vibrant green
  if (score >= 50) return "#FBBF24"; // A warm yellow
  return "#F87171"; // A soft red
};

// SVG-based Circular Progress Component - ANTICLOCKWISE ONLY
const CircularProgress = ({
  score,
  size = 70,
  strokeWidth = 4,
  showText = true,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
}) => {
  const progressColor = getBorderColor(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // For anticlockwise: Use negative stroke-dashoffset calculation
  const strokeDashoffset = circumference - (circumference * score) / 100;

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
          fill="rgba(255, 255, 255, 0.08)"
        />
        {/* Progress Circle - ANTICLOCKWISE */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          // KEY CHANGE: Rotate +90 degrees for anticlockwise (instead of -90)
          transform={`rotate(90 ${size / 2} ${
            size / 2
          }) scale(-1, 1) translate(-${size}, 0)`}
        />
      </Svg>

      {/* Score text in center */}
      {showText && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={styles.ratingCircleText}>{score}</Text>
        </View>
      )}
    </View>
  );
};

// A dedicated component for the rating circles for cleaner code
const RatingCircle = ({ score, label }: { score: number; label: string }) => (
  <View style={[styles.ratingBox]}>
    <CircularProgress
      score={score}
      size={scale(70)}
      strokeWidth={4}
      showText={true}
    />
    <Text style={styles.ratingLabel}>{label}</Text>
  </View>
);

const UnlockedLook: React.FC = () => {
  const { savedImages, user, isPremium } = useAuth();
  const [looksmaxxingResults, setLooksmaxxingResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to fetch looksmaxxing data
  const fetchLooksmaxxingData = async () => {
    try {
      setLoading(true);
      const result = await looksmaxxingService.getJsonFromFirestore(
        user?.uid as string,
        "looksmaxxing_results"
      );
      setLooksmaxxingResults(result.data.data.advice_json);
    } catch (error) {
      console.error("Error fetching looksmaxxing data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (user?.uid) {
      fetchLooksmaxxingData();
    }
  }, [user?.uid]);

  const onViewPlan = () => {
    router.push("/(tabs)/looksmaxxingPlan");
  };

  // Check if user has premium access
  if (!isPremium) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Premium Required</Text>
              <Text style={styles.currentScore}>Please upgrade to access this feature</Text>
            </View>
            <ButtonStart 
              text="Upgrade to Premium" 
              handlepress={() => router.push('/(tabs)/lockedDashboard')} 
            />
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }
        
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
            {/* Main content wrapper */}
            <View>
              <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>
                  Your looksmaxxed transformation
                </Text>
                <Text style={styles.currentScore}>You current score: 4</Text>
              </View>

              <View style={styles.sliderContainer}>
                <ImageSlider
                  beforeImage={{ uri: savedImages[0].uri }}
                  afterImage={{ uri: savedImages[1].uri }}
                  containerWidth={scale(320)}
                  containerHeight={scale(320)}
                  sliderWidth={moderateScale(4)}
                  knobSize={moderateScale(32)}
                />
              </View>

              <View style={styles.ratingsRow}>
                {loading ? (
                  <ActivityIndicator size="large" color="#fff" />
                ) : (
                  (() => {
                    // Get top 3 priorities and format area names
                    const topPriorities =
                      looksmaxxingResults?.priorities?.slice(0, 3) || [];
                    const formattedPriorities = topPriorities.map(
                      (priority: any) => ({
                        ...priority,
                        formattedArea: priority.area
                          .split("_")
                          .map(
                            (word: string) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" "),
                      })
                    );

                    // Fill with default data if we don't have enough priorities
                    while (formattedPriorities.length < 3) {
                      formattedPriorities.push({
                        score: 0,
                        formattedArea: "Loading...",
                        area: "loading",
                      });
                    }

                    return formattedPriorities.map(
                      (priority: any, index: number) => (
                        <RatingCircle
                          key={index}
                          score={priority.score || 0}
                          label={priority.formattedArea || "Loading..."}
                        />
                      )
                    );
                  })()
                )}
              </View>
            </View>

            {/* Footer button */}
            <ButtonStart
              text="View Looksmaxxing Plan"
              handlepress={onViewPlan}
            />
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
  },
  container: {
    flex: 1,
    justifyContent: "space-between", // Pushes button to the bottom
    paddingHorizontal: scale(15),
    paddingBottom: verticalScale(20),
  },
  headerContainer: {
    alignItems: "flex-start",
    width: "100%",
    paddingTop: verticalScale(10),
  },
  headerTitle: {
    color: "#fff",
    fontSize: moderateScale(34),
    fontWeight: "700",
    marginBottom: verticalScale(6),
    textAlign: "left",
  },
  currentScore: {
    color: "rgba(255,255,255,0.7)",
    fontSize: moderateScale(15),
    textAlign: "left",
  },
  sliderContainer: {
    alignItems: "center",
    marginTop: verticalScale(20),
  },
  ratingsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginTop: verticalScale(20),
  },
  ratingBox: {
    alignItems: "center",
    backgroundColor: "rgba(135, 89, 209, 0.26)",
    width: scale(100),
    padding: scale(12),
    borderRadius: moderateScale(12),
  },
  ratingCircleText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(24),
  },
  ratingLabel: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
    fontSize: moderateScale(14),
    marginTop: verticalScale(10),
  },
  viewPlanBtn: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(16),
    alignItems: "center",
    marginTop: verticalScale(20), // Ensure space from content above
  },
  viewPlanBtnText: {
    color: "#2D1B69",
    fontWeight: "700",
    fontSize: moderateScale(16),
  },
});

export default UnlockedLook;
