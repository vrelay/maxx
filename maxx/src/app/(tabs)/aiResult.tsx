

import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import ImageSlider from "@/src/componants/molecules/imgslider";
import img from "@/src/constants/img";
import { useAuth } from "@/src/context/AuthContext";
import looksmaxxingService from "@/src/services/looksmaxxingService";
import {
  getSavedImages,
  GetSavedImagesResult,
  SavedImage,
} from "@/src/utils/imageStorage";
import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Svg, { Circle } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");

const PreviewMultiplePoses = ({
  title,
  leftImages,
  rightImages,
}: {
  title: string;
  leftImages: SavedImage[];
  rightImages: SavedImage[];
}) => (
    <View style={styles.pageContent}>
      <View style={styles.cardContainer}>
        <Text style={styles.pageTitle}>{title}</Text>
        <Image source={img.decor_bar} style={styles.decor_bar} />
        <View style={styles.gridContainer}>
          {(() => {
            const images = [img.frontbody, img.sideface, img.sidebody];
            return ["slider", ...images.map((image) => image)].map(
              (item, idx) => {
                if (idx === 0) {
                  return (
                    <View key={idx} style={styles.gridItem}>
                      <ImageSlider
                      beforeImage={{ uri: leftImages[0].uri }}
                      afterImage={{ uri: rightImages[0].uri }}
                        containerWidth={scale(128)}
                        containerHeight={scale(128)}
                        sliderWidth={moderateScale(2)}
                        knobSize={moderateScale(24)}
                      />
                    </View>
                  );
                }
                return (
                  <View key={idx} style={styles.gridItem}>
                    <Image source={images[idx - 1]} style={styles.gridImage} />
                    <BlurView
                      intensity={80}
                      tint="light"
                      style={styles.lockOverlay}
                    >
                      <FontAwesome
                        name="lock"
                        size={moderateScale(32)}
                        color="#fff"
                      />
                    </BlurView>
                  </View>
                );
              }
            );
          })()}
        </View>
      </View>
    </View>
  );

// SVG-based Circular Progress Component - ANTICLOCKWISE ONLY
const CircularProgress = ({
  score,
  size = 80,
  strokeWidth = 4,
  showText = true,
  isLocked = false,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  isLocked?: boolean;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // For anticlockwise: Use negative stroke-dashoffset calculation
  // If locked, don't show any progress
  const strokeDashoffset = isLocked
    ? circumference
    : circumference - (circumference * score) / 100;

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
        {/* Progress Circle - ANTICLOCKWISE (only show if not locked) */}
        {!isLocked && (
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
        )}
      </Svg>

      {/* Score text or lock icon in center */}
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
          {isLocked ? (
            <FontAwesome
              name="lock"
              size={size * 0.3}
              color="rgba(255, 255, 255, 0.6)"
            />
          ) : (
            <Text style={styles.newRatingText}>{score}</Text>
          )}
        </View>
      )}
    </View>
  );
};

// A dedicated component for the rating circles for cleaner code
const RatingCircleDisplay = ({
  score,
  label,
  isLocked = false,
}: {
  score: number;
  label: string;
  isLocked?: boolean;
}) => (
  <View style={styles.ratingCircleBox}>
    <CircularProgress
      score={score}
      size={scale(65)}
      strokeWidth={3}
      showText={true}
      isLocked={isLocked}
    />
    <Text style={styles.newRatingLabel}>{label}</Text>
  </View>
);

const PreviewYourRatings = ({
  title,
  priorities,
}: {
  title: string;
  priorities: any[];
}) => {
  console.log("📊 PreviewYourRatings - Raw priorities received:", priorities);
  console.log("📊 PreviewYourRatings - Priorities length:", priorities?.length || 0);
  
  // Default fallback ratings if not enough priorities
  const defaultRatings = [
    {
      area: "skin",
      score: 60,
      impact: "high",
      difficulty: "low"
    },
    {
      area: "jawline",
      score: 55,
      impact: "high",
      difficulty: "med"
    },
    {
      area: "hair",
      score: 70,
      impact: "med",
      difficulty: "low"
    },
    {
      area: "style",
      score: 65,
      impact: "med",
      difficulty: "low"
    }
  ];
  
  // Use actual priorities if we have at least 4, otherwise use defaults
  const ratingsToUse = priorities && priorities.length >= 4 ? priorities : defaultRatings;
  console.log("📊 Ratings to use (actual or default):", ratingsToUse);
  console.log("📊 Reason for choice:", priorities && priorities.length >= 4 ? "Using actual priorities (4+)" : "Using default ratings (less than 4 priorities)");
  
  // Get top 4 priorities and format area names
  const topPriorities = ratingsToUse.slice(0, 4).map((priority, index) => {
    console.log(`📊 Processing rating priority ${index}:`, priority);
    
    const formatted = {
      ...priority,
      formattedArea: priority.area
        .split("_")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    };
    
    console.log(`✅ Formatted rating priority ${index}:`, formatted);
    return formatted;
  });
  
  console.log("🎯 Final topPriorities for ratings display:", topPriorities);
  
  // Log rating circle details before rendering
  topPriorities.forEach((priority, index) => {
    console.log(`📊 Rendering rating circle ${index}:`, {
      score: priority?.score || 0,
      label: priority?.formattedArea || "Loading...",
      isLocked: index > 0
    });
  });

  return (
    <View style={styles.pageContent}>
      <View style={styles.cardContainer}>
        <Text style={styles.pageTitle}>{title}</Text>
        <Image source={img.decor_bar} style={styles.decor_bar} />
        <View style={styles.ratingsRow}>
          <RatingCircleDisplay
            score={topPriorities[0]?.score || 0}
            label={topPriorities[0]?.formattedArea || "Loading..."}
            isLocked={false}
          />
          <RatingCircleDisplay
            score={topPriorities[1]?.score || 0}
            label={topPriorities[1]?.formattedArea || "Loading..."}
            isLocked={true}
          />
        </View>
        <View style={styles.ratingsRow}>
          <RatingCircleDisplay
            score={topPriorities[2]?.score || 0}
            label={topPriorities[2]?.formattedArea || "Loading..."}
            isLocked={true}
          />
          <RatingCircleDisplay
            score={topPriorities[3]?.score || 0}
            label={topPriorities[3]?.formattedArea || "Loading..."}
            isLocked={true}
          />
        </View>
      </View>
    </View>
  );
};

const StartTransformationToday = ({
  title,
  priorities,
}: {
  title: string;
  priorities: any[];
}) => {
  console.log("🔍 StartTransformationToday - Raw priorities received:", priorities);
  console.log("🔍 StartTransformationToday - Priorities length:", priorities?.length || 0);
  
  // Default fallback tasks if not enough priorities
  const defaultTasks = [
    {
      area: "skin",
      improvement_habits: "Daily skincare routine and hydration",
      score: 60,
      impact: "high",
      difficulty: "low"
    },
    {
      area: "jawline",
      improvement_habits: "Mewing exercises and chewing gum",
      score: 55,
      impact: "high",
      difficulty: "med"
    },
    {
      area: "hair",
      improvement_habits: "Proper styling and grooming routine",
      score: 70,
      impact: "med",
      difficulty: "low"
    }
  ];
  
  // Use actual priorities if we have at least 3, otherwise use defaults
  const tasksToUse = priorities && priorities.length >= 3 ? priorities : defaultTasks;
  console.log("🔍 Tasks to use (actual or default):", tasksToUse);
  console.log("🔍 Reason for choice:", priorities && priorities.length >= 3 ? "Using actual priorities (3+)" : "Using default tasks (less than 3 priorities)");
  
  // Get top 3 priorities and format them for display
  const topPriorities = tasksToUse.slice(0, 3).map((priority, index) => {
    console.log(`🔍 Processing priority ${index}:`, priority);
    
    const formatted = {
      label: priority.area
        .split("_")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      desc: priority.improvement_habits || "Improve this area with targeted exercises",
      level: Math.round((100 - priority.score) / 10), // Convert score to level improvement
      impact: priority.impact || "med",
      difficulty: priority.difficulty || "med",
    };
    
    console.log(`✅ Formatted priority ${index}:`, formatted);
    return formatted;
  });
  
  console.log("🎯 Final topPriorities for display:", topPriorities);
  
  // Log first task details before rendering
  if (topPriorities[0]) {
    console.log("🎯 Rendering first task:", {
      label: topPriorities[0].label,
      desc: topPriorities[0].desc,
      level: topPriorities[0].level,
      impact: topPriorities[0].impact,
      difficulty: topPriorities[0].difficulty
    });
  }
  
  // Log task count and availability
  console.log("🎯 Total tasks available:", topPriorities.length);
  console.log("🎯 Task 1 available:", !!topPriorities[0]);
  console.log("🎯 Task 2 available:", !!topPriorities[1]);
  console.log("🎯 Task 3 available:", !!topPriorities[2]);

  return (
    <View style={styles.pageContent}>
      <View style={styles.cardContainer}>
        <Text style={styles.pageTitle}>{title}</Text>
        <Image source={img.decor_bar} style={styles.decor_bar} />
        {/* First card - no blur */}
        <View style={styles.cardWrapper} key={0}>
          <View style={styles.taskCard}>
            <View style={styles.imagePlaceholder} />
            <View style={styles.taskTextContainer}>
              <Text style={styles.taskTitle}>{topPriorities[0]?.label}</Text>
              <Text style={styles.taskDescription}>
                {topPriorities[0]?.desc}
              </Text>
            </View>
            <View style={styles.levelPill}>
              <Text style={styles.taskLevel}>
                +{topPriorities[0]?.level} levels
              </Text>
            </View>
          </View>
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0)",
              "rgba(255, 255, 255, 0.25)",
              "rgba(255, 255, 255, 0)",
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradientBorder}
          />
        </View>

        {/* Combined overlay container for the last two cards */}
        <View style={styles.combinedCardsContainer}>
          {topPriorities.slice(1).map((t, i) => {
            // Log task details before rendering
            console.log(`🎯 Rendering blurred task ${i + 1}:`, {
              label: t.label,
              desc: t.desc,
              level: t.level,
              impact: t.impact,
              difficulty: t.difficulty
            });
            
            // Use different locked task images for each card
            const lockedImage = i === 0 ? require("@/src/assets/ui/lockedtask1.png") : require("@/src/assets/ui/lockedtask2.png");
            
            return (
              <View style={styles.cardWrapper} key={i + 1}>
                <View style={styles.taskCard}>
                  {/* Locked task image */}
                  <Image 
                    source={lockedImage} 
                    style={styles.lockedTaskImage}
                    resizeMode="stretch"
                  />
                </View>

                {/* The gradient border */}
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0)",
                    "rgba(255, 255, 255, 0.25)",
                    "rgba(255, 255, 255, 0)",
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.gradientBorder}
                />
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const DummySliderScreen: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  // Generate random scores only on first render
  const [scores] = useState(() => {
    const score1 = Math.round((Math.random() * 5 + 5) * 10) / 10; // 5.0 to 10.0
    const score2 = Math.round((Math.random() * 5 + 5) * 10) / 10; // 5.0 to 10.0
    
    // Ensure score2 is greater than score1
    if (score1 >= score2) {
      return [score1, Math.min(10.0, score1 + Math.round((Math.random() * 2 + 0.5) * 10) / 10)];
    }
    return [score1, score2];
  });
  
  const [currentScore, targetScore] = scores;

  const {
    user,
    looksmaxxingResults,
    setLooksmaxxingResults,
    leftImages,
    rightImages,
    setLeftImages,
    setRightImages,
  } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  // Load saved images on component mount
  useEffect(() => {
    loadSavedImages();
  }, []);

  const loadSavedImages = async (): Promise<void> => {
    setLoading(true);
    const result: GetSavedImagesResult = await getSavedImages();
    if (result.success) {
      const filteredleftImages = result.images.filter((image) => {
        const nameWithoutExtension = image.name.replace(/\.[^/.]+$/, "");
        return ["front_before"].includes(nameWithoutExtension);
      });
      const filteredrightImages = result.images.filter((image) => {
        const nameWithoutExtension = image.name.replace(/\.[^/.]+$/, "");
        return ["front_after"].includes(nameWithoutExtension);
      });
      console.log("filteredImages", filteredleftImages);
      console.log("filteredImages", filteredrightImages);
      setLeftImages(filteredleftImages);
      setRightImages(filteredrightImages);
      const looksmaxxingResults =
        await looksmaxxingService.getJsonFromFirestore(
          user?.uid as string,
          "looksmaxxing_results"
        );
      
      console.log("🗄️ Raw looksmaxxing results from Firestore:", looksmaxxingResults);
      console.log("🗄️ Looksmaxxing results data:", looksmaxxingResults.data);
      
      if (looksmaxxingResults.data?.analysisResult?.advice_json?.priorities) {
        console.log("🎯 Priorities found in results:", looksmaxxingResults.data.analysisResult.advice_json.priorities);
        console.log("🎯 Number of priorities:", looksmaxxingResults.data.analysisResult.advice_json.priorities.length);
        
        // Log each priority in detail
        looksmaxxingResults.data.analysisResult.advice_json.priorities.forEach((priority: any, index: number) => {
          console.log(`🎯 Priority ${index} details:`, {
            area: priority.area,
            improvement_habits: priority.improvement_habits,
            score: priority.score,
            impact: priority.impact,
            difficulty: priority.difficulty
          });
        });
      } else {
        console.log("❌ No priorities found in looksmaxxing results");
        console.log("❌ Analysis result structure:", looksmaxxingResults.data?.analysisResult);
      }
      
      setLooksmaxxingResults(looksmaxxingResults.data);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.container]}>
          <LinearGradient
            colors={["#171840", "#6D37D4"]}
            style={styles.gradient}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 18 }}>
                Loading your potential...
              </Text>
              {/* You can add ActivityIndicator here */}
            </View>
          </LinearGradient>
        </View>
      </GestureHandlerRootView>
    );
  }

  console.log("📱 Creating pages with looksmaxxingResults:", looksmaxxingResults);
  console.log("📱 Priorities being passed to components:", looksmaxxingResults?.analysisResult?.advice_json?.priorities || []);
  
  const pages = [
    <PreviewMultiplePoses
      key="0"
      title="Unlock Multiple Poses"
      leftImages={leftImages}
      rightImages={rightImages}
    />,
    <PreviewYourRatings
      key="1"
      title="Discover Your Ratings"
      priorities={
        looksmaxxingResults?.analysisResult.advice_json.priorities || []
      }
    />,
    <StartTransformationToday
      key="2"
      title="Start Transformation Today"
      priorities={
        looksmaxxingResults?.analysisResult.advice_json.priorities || []
      }
    />,
  ];
  
  console.log("📱 Pages created successfully:", pages.length);

  const handleScroll = (event: any) => {
    const newIndex = Math.round(
      event.nativeEvent.contentOffset.x / screenWidth
    );
    setPageIndex(newIndex);
  };

  const isLastPage = pageIndex === pages.length - 1;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <GridBackgroundImg top={true} />
        <LinearGradient
          colors={["#171840", "#6D37D4"]}
          locations={[0, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.heading}>Preview Your Potential</Text>
              <Text style={styles.subheading}>
                Improve your score from {currentScore} to {targetScore}
              </Text>
            </View>

            <View style={styles.sliderZone}>
              <FlatList
                data={pages}
                horizontal
                pagingEnabled
                keyExtractor={(_, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                ref={flatListRef}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.sliderContent}
                renderItem={({ item }) => (
                  <View
                    style={{
                      width: screenWidth,
                      justifyContent: "flex-start",
                      alignItems: "center",
                    }}
                  >
                    {item}
                  </View>
                )}
                style={styles.flatList}
              />

              <View style={styles.pagination}>
                {pages.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      pageIndex === idx ? styles.dotActive : null,
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.price}>at $9.99/week</Text>
              <ButtonStart
                text="See My Full Potential"
                handlepress={() => router.push("/(tabs)/lockedDashboard")}
              />
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/lockedDashboard")}
              >
                <Text style={styles.maybeTxt}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginVertical: verticalScale(8),
    marginHorizontal: scale(20),
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientBorder: {
    height: 1,
    width: "100%",
  },
  container: { flex: 1 },
  gradient: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "space-between",
  },
  header: {
    marginTop: verticalScale(30),
    marginBottom: verticalScale(5),
    alignItems: "center",
  },
  heading: {
    color: "#fff",
    fontFamily: "Plush-Trial",
    fontSize: moderateScale(32),
    fontWeight: "500",
    lineHeight: moderateScale(36.8),
    letterSpacing: moderateScale(-0.32),
    textAlign: "center",
    marginBottom: verticalScale(2),
  },
  subheading: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(16),
    fontWeight: "400",
    lineHeight: moderateScale(22.4),
    letterSpacing: moderateScale(-0.16),
    textAlign: "center",
    marginBottom: verticalScale(0),
  },
  sliderZone: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",


  },
  sliderContent: {
    alignItems: "center",
    justifyContent: "center",




  },
  flatList: {
    flexGrow: 0,
    maxHeight: verticalScale(450),

  },
  pageContent: {
    height: verticalScale(350),
    justifyContent: "flex-start",
    alignItems: "center",
    width: screenWidth,
    paddingHorizontal: scale(20),
  },
  pageTitle: {
    color: "#fff",
    fontFamily: "Matter",
    fontSize: moderateScale(20),
    fontWeight: "500",
    fontStyle: "italic",
    lineHeight: moderateScale(20),
    letterSpacing: moderateScale(-0.2),
    textAlign: "center",
    marginBottom: verticalScale(20),
  },
  decor_bar: {
    width: "100%",
    height: scale(10),
    marginBottom: verticalScale(15),
  },
  cardContainer: {
    borderRadius: 20,
    paddingVertical: verticalScale(20),
    margin: 12,
    paddingBottom: 20,
    width: "100%",
    alignContent: "center",
    justifyContent: "space-between",
    flex: 1,
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.024)",
    overflow: "visible",
    borderTopColor: "rgba(255, 255, 255, 0.5)",
    borderLeftColor: "rgba(255, 255, 255, 0.4)",
    borderRightColor: "rgba(255, 255, 255, 0.2)",
    borderBottomColor: "rgba(255, 255, 255, 0.15)",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(12),
  },
  gridItem: {
    width: scale(128),
    height: scale(128),
    borderRadius: 15,
    overflow: "hidden",
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  lockOverlay: {
    position: "absolute",
  
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "rgba(67, 43, 135, 0.1)",
  },
  ratingsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: verticalScale(5),
    gap: scale(10),
  },
  ratingCircleBox: {
    alignItems: "center",
    justifyContent: "center",
    width: scale(128),
    height: scale(128),
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: scale(10),
    // flex: 1,
  },
  newRatingText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(20),
  },
  newRatingLabel: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Matter",
    fontWeight: "400",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(19.6),
    letterSpacing: moderateScale(-0.14),
    textAlign: "center",
    marginTop: verticalScale(10),
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingBottom: verticalScale(10),
    height: verticalScale(50),
  },
  lockedTaskImage: {
    width: "100%",
    height: verticalScale(50),
    borderRadius: 15,
    transform: [{ scaleX: 1.1 }, { scaleY: 1.4 }],
    
  },
  combinedCardsContainer: {
    position: "relative",
    overflow: "hidden",
  },
  imagePlaceholder: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(10),
    backgroundColor: "rgb(205, 205, 205)",
    marginRight: scale(16),
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    color: "#fff",
    fontFamily: "Matter",
    fontSize: moderateScale(16),
    fontWeight: "500",
    lineHeight: moderateScale(20),
    letterSpacing: 0,
  },
  taskDescription: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(12),
    fontWeight: "400",
    lineHeight: moderateScale(16),
    letterSpacing: moderateScale(-0.12),
    marginTop: verticalScale(2),
  },
  levelPill: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(8),
  },
  taskLevel: {
    color: "#2F1C6A",
    fontWeight: "700",
    fontSize: moderateScale(13),
  },
  footer: {
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(8),
    height: verticalScale(150),
    alignItems: "center",
    backgroundColor: "transparent",

  },
  price: {
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Matter",
    fontSize: moderateScale(16),
    fontWeight: "400",
    lineHeight: moderateScale(22.4),
    letterSpacing: moderateScale(-0.16),
    textAlign: "center",
  },
  maybeTxt: {
    color: "#fff",
    opacity: 0.62,
    fontFamily: "Matter",
    fontSize: moderateScale(14),
    fontWeight: "400",
    lineHeight: moderateScale(19.6),
    letterSpacing: moderateScale(-0.14),
    textAlign: "center",
    marginBottom: verticalScale(10),
    marginTop: verticalScale(6),

  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(10),
    marginBottom: verticalScale(18),

  },
  dot: {
    width: scale(10),
    height: scale(10),

    borderRadius: scale(5),
    backgroundColor: "rgba(255,255,255,0.28)",
    marginHorizontal: scale(6),

  },
  dotActive: {
    backgroundColor: "#fff",
    width: scale(20),
  },


});

export default DummySliderScreen;
