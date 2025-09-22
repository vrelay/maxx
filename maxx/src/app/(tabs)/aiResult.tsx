import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import ImageSlider from "@/src/componants/molecules/imgslider";
import img from "@/src/constants/img";
import { useAuth } from "@/src/context/AuthContext";
import {
  clearAllSavedImages,
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
      <Text style={[styles.pageTitle, { marginBottom: verticalScale(15) }]}>
        {title}
      </Text>
      <View style={styles.gridContainer}>
        {["slider", ...savedImages.slice(-3).map((image) => image.uri)].map(
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
                <Image
                  source={{ uri: item as string }}
                  style={styles.gridImage}
                />
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
        )}
      </View>
    </View>
  </View>
);

// Helper function to determine the border color based on the rating
const getBorderColor = (score: number) => {
  if (score >= 85) return "#34D399"; // A vibrant green
  if (score >= 70) return "#FBBF24"; // A warm yellow
  return "#F87171"; // A soft red
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
    <View
      style={[styles.newRatingCircle, { borderColor: getBorderColor(score) }]}
    >
      <Text style={styles.newRatingText}>{score}</Text>
    </View>
    <Text style={styles.newRatingLabel}>{label}</Text>
  </View>
);

const PreviewYourRatings = ({ title }: { title: string }) => (
  <View style={styles.pageContent}>
    <View
      style={[styles.cardContainer, { paddingVertical: verticalScale(30) }]}
    >
      <Text style={[styles.pageTitle, { marginBottom: verticalScale(25) }]}>
        {title}
      </Text>
      <View style={styles.ratingsRow}>
        <RatingCircleDisplay score={78} label="Jaw & Face" />
        <RatingCircleDisplay score={85} label="Skin" />
      </View>
      <View style={styles.ratingsRow}>
        <RatingCircleDisplay score={65} label="Eyes" />
        <RatingCircleDisplay score={91} label="Hair" />
      </View>
    </View>
  </View>
);

const StartTransformationToday = ({ title }: { title: string }) => {
  const tasks = [
    {
      label: "Jaw & Face",
      desc: "Mewing and chewing exercises daily",
      level: 2,
    },
    { label: "Skin", desc: "Tretinoin + Ceramide routine", level: 5 },
    { label: "Eyes", desc: "Fade cut + Sea salt spray styling", level: 6 },
  ];
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.pageContent}>
        <View style={styles.cardContainer}>
          <Text style={[styles.pageTitle, { marginBottom: verticalScale(15) }]}>
            {title}
          </Text>
          {tasks.map((t, i) => (
            <View key={i} style={styles.taskCard}>
              <View style={styles.taskLeft}>
                <Text style={styles.taskLabel}>{t.label}</Text>
                <Text style={styles.taskDesc}>{t.desc}</Text>
              </View>
              <View style={styles.levelPill}>
                <Text style={styles.taskLevel}>+{t.level} levels</Text>
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
          ))}
        </View>
      </View>
    </View>
  );
};

const DummySliderScreen: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const { savedImages, setSavedImages } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);

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
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
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
    <PreviewYourRatings key="1" title="Discover Your Ratings" />,
    <StartTransformationToday key="2" title="Start Transformation Today" />,
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
  gradientBorder: {
    ...StyleSheet.absoluteFillObject,
  },
  cardWrapper: {
    marginBottom: verticalScale(16),
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
    fontWeight: "600",
    textAlign: "center",
  },
  cardContainer: {
    borderRadius: 20,
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(20),
    width: "100%",
    alignContent: "center",
    justifyContent: "space-between",
    flex: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 1.84,
    elevation: 2,
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
    backgroundColor: "rgba(22,22,22,0.78)",
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
    marginBottom: verticalScale(22),
  },
  ratingCircleBox: {
    alignItems: "center",
    width: scale(128),
  },
  newRatingCircle: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    borderWidth: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  newRatingText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(24),
  },
  newRatingLabel: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
    fontSize: moderateScale(14),
    marginTop: verticalScale(10),
  },
  taskCard: {
    overflow: "hidden", // Added this line
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    minHeight: verticalScale(54),
    backgroundColor: "#391E8E",
    borderRadius: 12,
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(14),
    marginBottom: verticalScale(18),
    alignSelf: "center",
    elevation: 2,
  },
  taskLeft: {
    flex: 1,
    justifyContent: "center",
  },
  taskLabel: {
    fontStyle: "italic",
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(16),
    marginBottom: verticalScale(2),
  },
  taskDesc: {
    color: "rgba(255,255,255,0.85)",
    fontSize: moderateScale(12),
  },
  levelPill: {
    backgroundColor: "#fff",
    borderRadius: 12,
    minWidth: scale(58),
    paddingVertical: verticalScale(2),
    alignItems: "center",
    justifyContent: "center",
  },
  taskLevel: {
    color: "#2F1C6A",
    fontWeight: "700",
    fontSize: moderateScale(13.5),
    textAlign: "center",
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
    width: scale(14),
    height: scale(14),
    borderRadius: scale(7),
    backgroundColor: "rgba(255,255,255,0.28)",
    marginHorizontal: scale(6),
  },
  dotActive: {
    backgroundColor: "#fff",
  },
});

export default DummySliderScreen;
