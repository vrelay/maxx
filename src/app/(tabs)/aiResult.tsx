import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import img from "@/src/constants/img";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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

const { width: screenWidth } = Dimensions.get("window");

const PreviewMultiplePoses = () => (
  <View style={styles.pageContent}>
    <View style={styles.gridContainer}>
      {[
        img.faceimg_greyscaled,
        img.faceimg,
        img.faceimg_greyscaled,
        img.faceimg,
      ].map((imgSrc, idx) => (
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

const PreviewYourRatings = () => (
  <View style={styles.pageContent}>
    <View style={styles.ratingsRow}>
      {[78, 78].map((r, idx) => (
        <View key={idx} style={styles.ratingBox}>
          <View style={styles.ratingCircle}>
            <Text style={styles.ratingText}>{r}</Text>
          </View>
          <Text style={styles.ratingLabel}>Jaw & Face</Text>
        </View>
      ))}
    </View>
    <View style={styles.ratingsRow}>
      {[78, 78].map((r, idx) => (
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

const StartTransformationToday = () => {
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
    <View style={styles.pageContent}>
      {tasks.map((t, i) => (
        <View key={i} style={styles.taskCard}>
          <View style={styles.taskLeft}>
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
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.heading}>Preview Your Potential</Text>
              <Text style={styles.subheading}>
                Improve your score from 6.7 to 8.8
              </Text>
            </View>
            {/* SLIDER */}
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
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {item}
                  </View>
                )}
                style={styles.flatList}
              />
            </View>
            {/* FOOTER */}
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
                <TouchableOpacity onPress={() => router.push("/(tabs)/lockedDashboard")}>
                  <Text style={styles.maybeTxt}>Maybe Later</Text>
                </TouchableOpacity>
              )}
            </View>
            {/* PAGINATION DOTS */}
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
    backgroundColor: "transparent",
    justifyContent: "flex-start",
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
    justifyContent: "center",
    maxHeight: verticalScale(330),
  },
  sliderContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  flatList: {
    flexGrow: 0,
  },
  pageContent: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: verticalScale(260),
    width: scale(300),
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(12),
    gap: scale(12),
  },
  gridItem: {
    width: scale(128),
    height: scale(128),
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: verticalScale(12),
    marginHorizontal: scale(7),
    position: "relative",
    backgroundColor: "#241060",
  },
  gridImage: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  lockOverlay: {
    position: "absolute",
    backgroundColor: "rgba(22,22,22,0.38)",
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
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
    marginBottom: verticalScale(22),
    gap: scale(18),
  },
  ratingBox: {
    width: scale(128),
    height: scale(128),
    backgroundColor: "#371F9B",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: scale(7),
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
    backgroundColor: "#4733B2",
  },
  ratingText: {
    color: "#fff",
    fontSize: moderateScale(21),
    fontWeight: "700",
    textAlign: "center",
  },
  ratingLabel: {
    color: "#fff",
    fontSize: moderateScale(15),
    textAlign: "center",
    marginBottom: verticalScale(2),
    marginTop: verticalScale(4),
    opacity: 0.75,
  },
  taskCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: scale(260),
    minHeight: verticalScale(54),
    backgroundColor: "#391E8E",
    borderRadius: 12,
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(14),
    marginBottom: verticalScale(18),
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
    alignItems: "center",
    backgroundColor: "transparent",
  },
  price: {
    color: "rgba(255,255,255,0.75)",
    fontSize: moderateScale(15),
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  ctaBtn: {
    backgroundColor: "#fff",
    borderRadius: 13,
    paddingVertical: verticalScale(13),
    alignItems: "center",
    width: "92%",
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
    position: "absolute",
    bottom: verticalScale(14),
    width: "100%",
    zIndex: 1,
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
