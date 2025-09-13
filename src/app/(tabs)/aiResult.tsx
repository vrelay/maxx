import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import img from "@/src/constants/img";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
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

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// --- Individual Page Content Components ---
const PreviewMultiplePoses = () => (
  <View style={styles.pageContent}>
    <View style={styles.gridContainer}>
      {[img.faceimg_greyscaled, img.faceimg, img.faceimg_greyscaled, img.faceimg].map((imgSrc, idx) => (
        <View key={idx} style={styles.gridItem}>
          <Image source={imgSrc} style={styles.gridImage} />
          {idx !== 0 && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockText}>{"\u{1F512}"}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  </View>
);

const PreviewYourRatings = () => {
  const ratings = [78, 78, 78, 78];
  return (
    <View style={styles.pageContent}>
      <View style={styles.ratingsContainer}>
        {ratings.map((r, idx) => (
          <View key={idx} style={styles.ratingBox}>
            <View style={styles.ratingCircle}>
              <Text style={styles.ratingText}>{r}</Text>
            </View>
            <Text style={styles.ratingLabel}>Jaw & Face</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const StartTransformationToday = () => {
  const tasks = [
    { label: "Jaw & Face", desc: "Mewing and chewing exercises daily", level: 2 },
    { label: "Skin", desc: "Tretinoin + Ceramide routine", level: 5 },
    { label: "Eyes", desc: "Fade cut + Sea salt spray styling", level: 6 },
  ];
  return (
    <View style={styles.pageContent}>
      {tasks.map((t, i) => (
        <View key={i} style={styles.taskItem}>
          <View style={styles.checkbox} />
          <View style={styles.taskTextContainer}>
            <Text style={styles.taskLabel}>{t.label}</Text>
            <Text style={styles.taskDesc}>{t.desc}</Text>
          </View>
          <View style={styles.levelPill}>
            <Text style={styles.taskLevel}>+{t.level} levels</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

// --- Main Component ---
const DummySliderScreen: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const pages = [
    <PreviewMultiplePoses key="0" />,
    <PreviewYourRatings key="1" />,
    <StartTransformationToday key="2" />,
  ];

  const handleScroll = (event: any) => {
    const newIndex = Math.round(
      event.nativeEvent.contentOffset.x / screenWidth
    );
    setPageIndex(newIndex);
  };

  // Moves to next page programmatically
  const scrollToIndex = (idx: number) => {
    if (flatListRef.current && idx < pages.length) {
      flatListRef.current.scrollToIndex({ animated: true, index: idx });
      setPageIndex(idx);
    }
  };

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
                  <View style={{ width: screenWidth }}>{item}</View>
                )}
                style={styles.flatList}
              />
            </View>
            <View style={styles.footer}>
              <Text style={styles.price}>at $9.99/week</Text>
              <TouchableOpacity
                style={styles.ctaBtn}
                onPress={() =>
                  scrollToIndex(
                    pageIndex + 1 === pages.length ? pageIndex : pageIndex + 1
                  )
                }
              >
                <Text style={styles.ctaTxt}>See My Full Potential</Text>
              </TouchableOpacity>
              {pageIndex < pages.length - 1 && (
                <TouchableOpacity onPress={() => scrollToIndex(pageIndex + 1)}>
                  <Text style={styles.maybeTxt}>Maybe Later</Text>
                </TouchableOpacity>
              )}
            </View>
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
          </SafeAreaView>
        </LinearGradient>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: scale(0),
    backgroundColor: "transparent",
    justifyContent: "flex-start",
  },
  header: {
    marginTop: verticalScale(24),
    marginBottom: verticalScale(4),
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
    justifyContent: "center",
    minHeight: verticalScale(280),
    maxHeight: verticalScale(370),
    // This centers the slide content and ensures it doesn't zoom/stretch
  },
  sliderContent: {
    alignItems: "center",
  },
  flatList: {
    flexGrow: 0,
  },
  pageContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(20),
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: scale(267),
    marginBottom: verticalScale(20),
  },
  gridItem: {
    width: scale(120),
    height: scale(120),
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: verticalScale(18),
    marginRight: scale(8),
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  lockOverlay: {
    position: "absolute",
    backgroundColor: "rgba(22,22,22,0.38)",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  lockText: {
    color: "#fff",
    fontSize: moderateScale(30),
  },
  ratingsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: scale(267),
    marginBottom: verticalScale(22),
  },
  ratingBox: {
    width: scale(120),
    height: scale(120),
    backgroundColor: "#371F9B",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(8),
  },
  ratingCircle: {
    width: scale(68),
    height: scale(68),
    borderRadius: scale(34),
    borderWidth: 4,
    borderColor: "#E1663A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  ratingText: {
    color: "#fff",
    fontSize: moderateScale(22),
    fontWeight: "700",
    textAlign: "center",
  },
  ratingLabel: {
    color: "#fff",
    fontSize: moderateScale(14),
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  // --- Task Section ---
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  checkbox: {
    width: scale(24),
    height: scale(24),
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 4,
    marginRight: scale(14),
    backgroundColor: "#2D1B69",
  },
  taskTextContainer: { flex: 1 },
  taskLabel: {
    fontStyle: "italic",
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(17),
    marginBottom: verticalScale(2),
  },
  taskDesc: {
    color: "#fff",
    fontSize: moderateScale(11),
  },
  levelPill: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    alignItems: "center",
    minWidth: scale(42),
  },
  taskLevel: {
    color: "#2F1C6A",
    fontWeight: "700",
    fontSize: moderateScale(14),
  },
  // --- Footer/Price/Buttons ---
  footer: {
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(6),
    alignItems: "center",
    backgroundColor: "transparent",
  },
  price: {
    color: "rgba(255,255,255,0.75)",
    fontSize: moderateScale(14),
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  ctaBtn: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: verticalScale(12),
    alignItems: "center",
    width: "85%",
    alignSelf: "center",
    marginBottom: verticalScale(4),
  },
  ctaTxt: {
    color: "#371F9B",
    fontWeight: "700",
    fontSize: moderateScale(17),
  },
  maybeTxt: {
    color: "#fff",
    opacity: 0.6,
    fontSize: moderateScale(14),
    textAlign: "center",
    marginBottom: verticalScale(10),
  },
  // --- Pagination ---
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: verticalScale(22),
    width: "100%",
    zIndex: 1,
  },
  dot: {
    width: scale(13),
    height: scale(13),
    borderRadius: scale(7),
    backgroundColor: "rgba(255,255,255,0.28)",
    marginHorizontal: scale(7),
  },
  dotActive: {
    backgroundColor: "#fff",
  },
});

export default DummySliderScreen;
