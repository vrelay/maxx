import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import ImageSlider from "@/src/componants/molecules/imgslider";
import img from "@/src/constants/img";
import { useAuth } from "@/src/context/AuthContext";
import looksmaxxingService from "@/src/services/looksmaxxingService";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Svg, { Circle } from "react-native-svg";

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
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

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
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
          fill="rgba(255, 255, 255, 0.08)"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={"#fff"}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(90 ${size / 2} ${
            size / 2
          }) scale(-1, 1) translate(-${size}, 0)`}
        />
      </Svg>

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

const Analysis: React.FC = () => {
  const { leftImages, rightImages, user, subscriptionDays } = useAuth();
  const [looksmaxxingResults, setLooksmaxxingResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState("Month 1-2");
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const tabs = ["Month 1-2", "Month 3-4", "Month 5-6"];

  const onScan = () => {
    return;
  };

  // Navigation functions for pose switching
  const onLeftNavigation = () => {
    setCurrentPoseIndex((prev) => (prev === 0 ? 3 : prev - 1));
  };

  const onRightNavigation = () => {
    setCurrentPoseIndex((prev) => (prev === 3 ? 0 : prev + 1));
  };

  const fetchLooksmaxxingData = async () => {
    try {
      setLoading(true);
      const result = await looksmaxxingService.getJsonFromFirestore(
        user?.uid as string,
        "looksmaxxing_results"
      );
      setLooksmaxxingResults(result.data);
    } catch (error) {
      console.error("Error fetching looksmaxxing data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchLooksmaxxingData();
    }
  }, [user?.uid]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Month 1-2":
        return (
          <View>
            <View style={styles.sliderContainer}>
              <ImageSlider
                beforeImage={{ uri: leftImages[currentPoseIndex]?.uri }}
                afterImage={{ uri: rightImages[currentPoseIndex]?.uri }}
                lefttext="Pose 1"
                righttext="+4 levels"
                onleftnavigation={onLeftNavigation}
                onrightnavigation={onRightNavigation}
              />
              <View style={styles.paginationDots}>
                {[0, 1, 2, 3].map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      currentPoseIndex === idx ? styles.dotActive : null,
                    ]}
                  />
                ))}
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : (
              <FlatList
                data={
                  looksmaxxingResults?.analysisResult.advice_json.priorities ||
                  []
                }
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `${item.area}-${index}`}
                renderItem={({ item }) => (
                  <RatingCircle
                    score={item.score || 0}
                    label={item.area
                      .split("_")
                      .map(
                        (word: string) =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  />
                )}
                contentContainerStyle={styles.flatListContainer}
                ItemSeparatorComponent={() => (
                  <View style={{ width: scale(10) }} />
                )}
              />
            )}
          </View>
        );
      case "Month 3-4":
        return (
          <Image
            source={img.nextplan_islocked}
            style={styles.emptyImage}
            resizeMode="contain"
          />
        );
      case "Month 5-6":
        return (
          <Image
            source={img.nextplan_islocked}
            style={styles.emptyImage}
            resizeMode="contain"
          />
        );
      default:
        return null;
    }
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
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backButton}>{"\u2190"}</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Your Results</Text>
              <View style={{ width: scale(20) }} />
            </View>

            <View style={styles.content}>
              <View style={styles.tabContainer}>
                {tabs.map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === tab && styles.activeTabText,
                      ]}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {renderTabContent()}
            </View>

            {subscriptionDays &&
              subscriptionDays >= 60 &&
              activeTab != "Month 1-2" && (
                <ButtonStart text="Scan Progress" handlepress={onScan} />
              )}
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
    paddingBottom: verticalScale(20),
    zIndex: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(15),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
  backButton: {
    color: "#fff",
    fontSize: moderateScale(28),
  },
  headerTitle: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#5f50986b",
    borderRadius: moderateScale(12),
    padding: scale(4),
    marginBottom: verticalScale(24),
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#e1e2e6ff",
  },
  tabText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  activeTabText: {
    color: "#2D1B69",
  },
  sliderContainer: {
    alignItems: "center",
    marginTop: verticalScale(20),
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: verticalScale(20),
  },
  flatListContainer: {
    paddingHorizontal: scale(10),
    marginTop: verticalScale(20),
  },
  ratingBox: {
    alignItems: "center",
    backgroundColor: "rgba(135, 89, 209, 0.35)",
    width: scale(100),
    padding: scale(10),
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
  emptyImage: {
    width: scale(350),
    marginTop: verticalScale(100),
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(15),
    gap: scale(8),
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    backgroundColor: "#fff",
    width: scale(20),
  },
});

export default Analysis;
