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
  savedImages,
}: {
  title: string;
  savedImages: SavedImage[];
}) => (
  <View style={styles.pageContent}>
    <View style={styles.cardContainer}>
      <Text style={styles.pageTitle}>{title}</Text>
      <Image source={img.decor_bar} style={styles.decor_bar} />
      <View style={styles.gridContainer}>
        {(() => {
          const images =
            savedImages.length >= 5
              ? savedImages.slice(-3)
              : [img.frontbody, img.sideface, img.sidebody];
          return ["slider", ...images.map((image) => image)].map(
            (item, idx) => {
              if (idx === 0) {
                return (
                  <View key={idx} style={styles.gridItem}>
                    <ImageSlider
                      beforeImage={{ uri: savedImages[0].uri }}
                      afterImage={{ uri: savedImages[1].uri }}
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
                  <View style={styles.lockOverlay}>
                    <FontAwesome
                      name="lock"
                      style={styles.lockText}
                      color="#fff"
                    />
                  </View>
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
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
}) => {
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
          <Text style={styles.newRatingText}>{score}</Text>
        </View>
      )}
    </View>
  );
};

// A dedicated component for the rating circles for cleaner code
const RatingCircleDisplay = ({
  score,
  label,
}: {
  score: number;
  label: string;
}) => (
  <View style={styles.ratingCircleBox}>
    <CircularProgress
      score={score}
      size={scale(65)}
      strokeWidth={3}
      showText={true}
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
  // Get top 4 priorities and format area names
  const topPriorities = priorities.slice(0, 4).map((priority) => ({
    ...priority,
    formattedArea: priority.area
      .split("_")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  }));

  return (
    <View style={styles.pageContent}>
      <View style={styles.cardContainer}>
        <Text style={styles.pageTitle}>{title}</Text>
        <Image source={img.decor_bar} style={styles.decor_bar} />
        <View style={styles.ratingsRow}>
          <RatingCircleDisplay
            score={topPriorities[0]?.score || 0}
            label={topPriorities[0]?.formattedArea || "Loading..."}
          />
          <RatingCircleDisplay
            score={topPriorities[1]?.score || 0}
            label={topPriorities[1]?.formattedArea || "Loading..."}
          />
        </View>
        <View style={styles.ratingsRow}>
          <RatingCircleDisplay
            score={topPriorities[2]?.score || 0}
            label={topPriorities[2]?.formattedArea || "Loading..."}
          />
          <RatingCircleDisplay
            score={topPriorities[3]?.score || 0}
            label={topPriorities[3]?.formattedArea || "Loading..."}
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
  // Get top 4 priorities and format them for display
  const topPriorities = priorities.slice(0, 3).map((priority) => ({
    label: priority.area
      .split("_")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    desc: priority.improvement_habits,
    level: Math.round((100 - priority.score) / 10), // Convert score to level improvement
    impact: priority.impact,
    difficulty: priority.difficulty,
  }));

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.pageContent}>
        <View style={styles.cardContainer}>
          <Text style={styles.pageTitle}>{title}</Text>
          <Image source={img.decor_bar} style={styles.decor_bar} />
          {topPriorities.map((t, i) => (
            <>
              <View style={styles.cardWrapper}>
                <View style={styles.taskCard}>
                  <View style={styles.imagePlaceholder} />
                  <View style={styles.taskTextContainer}>
                    <Text style={styles.taskTitle}>{t.label}</Text>
                    <Text style={styles.taskDescription}>{t.desc}</Text>
                  </View>
                  <View style={styles.levelPill}>
                    <Text style={styles.taskLevel}>+{t.level} levels</Text>
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
            </>
          ))}
        </View>
      </View>
    </View>
  );
};

const DummySliderScreen: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const { user, savedImages, setSavedImages } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [looksmaxxingResults, setLooksmaxxingResults] = useState<any>(null);
  // Load saved images on component mount
  useEffect(() => {
    loadSavedImages();
  }, []);

  const loadSavedImages = async (): Promise<void> => {
    setLoading(true);
    const result: GetSavedImagesResult = await getSavedImages();
    if (result.success) {
      const filteredImages = result.images.filter((image) => {
        const nameWithoutExtension = image.name.replace(/\.[^/.]+$/, "");
        return [
          "front_before",
          "front_after",
          "side_after",
          "physique_after",
          "lifestyle_after",
        ].includes(nameWithoutExtension);
      });
      console.log("filteredImages", filteredImages);
      setSavedImages(filteredImages);
      const looksmaxxingResults =
        await looksmaxxingService.getJsonFromFirestore(
          user?.uid as string,
          "looksmaxxing_results"
        );
      console.log(
        "looksmaxxingResults",
        looksmaxxingResults.data.data.advice_json
      );
      setLooksmaxxingResults(looksmaxxingResults.data.data.advice_json);
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

  const pages = [
    <PreviewMultiplePoses
      key="0"
      title="Unlock Multiple Poses"
      savedImages={savedImages}
    />,
    <PreviewYourRatings
      key="1"
      title="Discover Your Ratings"
      priorities={looksmaxxingResults?.priorities || []}
    />,
    <StartTransformationToday
      key="2"
      title="Start Transformation Today"
      priorities={looksmaxxingResults?.priorities || []}
    />,
  ];

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
                Improve your score from 6.7 to 8.8
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
              {savedImages.length > 0 && (
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
              )}
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
    marginBottom: verticalScale(16),
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
    marginBottom: verticalScale(10),
    alignItems: "center",
  },
  heading: {
    color: "#fff",
    fontSize: moderateScale(30),
    fontWeight: "700",
    textAlign: "center",
    marginBottom: verticalScale(2),
  },
  subheading: {
    color: "rgba(255,255,255,0.6)",
    fontSize: moderateScale(14),
    fontWeight: "600",
    textAlign: "center",
    marginBottom: verticalScale(8),
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
    maxHeight: verticalScale(450), // Adjusted height
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
    fontSize: moderateScale(22),
    marginBottom: verticalScale(20),
    fontWeight: "600",
    textAlign: "center",
  },
  decor_bar: {
    width: "100%",
    height: scale(10),
    marginBottom: verticalScale(15),
  },
  cardContainer: {
    borderRadius: 20,
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(20),
    width: "100%",
    alignContent: "center",
    justifyContent: "space-between",
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.54)",
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
    backgroundColor: "rgba(0, 0, 0, 0.67)",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  lockText: {
    color: "#fff",
    fontSize: moderateScale(32),
  },
  ratingsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginBottom: verticalScale(15),
    gap: scale(10),
  },
  ratingCircleBox: {
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "100%",
    height: verticalScale(115),
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: scale(10),
    flex: 1,
  },
  newRatingText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(20),
  },
  newRatingLabel: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
    fontSize: moderateScale(12),
    marginTop: verticalScale(10),
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingBottom: verticalScale(12),
    height: verticalScale(50),
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
    fontSize: moderateScale(16),
    fontWeight: "700",
  },
  taskDescription: {
    color: "rgba(255,255,255,0.7)",
    fontSize: moderateScale(12),
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
    fontSize: moderateScale(15),
    textAlign: "center",
  },
  maybeTxt: {
    color: "#fff",
    opacity: 0.62,
    fontSize: moderateScale(14),
    textAlign: "center",
    marginBottom: verticalScale(10),
    marginTop: verticalScale(6),
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(20),
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
