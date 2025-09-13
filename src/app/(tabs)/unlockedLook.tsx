import ImageSlider from "@/src/componants/molecules/imgslider";
import img from "@/src/constants/img";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
const UnlockedLook: React.FC = () => {
  const onViewPlan = () => {
    router.push("/(tabs)/unlockedLook");
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
  <View style={styles.container}>
    <Text style={styles.headerTitle}>Your looksmaxxed transformation</Text>
    <Text style={styles.currentScore}>You current score: 4</Text>
    <ImageSlider
      beforeImage={img.faceimg_greyscaled}
      afterImage={img.faceimg}
      containerWidth={scale(270)}
      containerHeight={scale(250)}
      sliderWidth={moderateScale(4)}
      knobSize={moderateScale(32)}
    />
    <View style={styles.ratingsRow}>
      <View style={styles.ratingBox}>
        <Text style={styles.ratingCircleText}>8.9</Text>
        <Text style={styles.ratingLabel}>Chest</Text>
      </View>
      <View style={styles.ratingBox}>
        <Text style={styles.ratingCircleText}>90</Text>
        <Text style={styles.ratingLabel}>Eyes</Text>
      </View>
      <View style={styles.ratingBox}>
        <Text style={styles.ratingCircleText}>90</Text>
        <Text style={styles.ratingLabel}>Eyes</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.viewPlanBtn} onPress={onViewPlan}>
      <Text style={styles.viewPlanBtnText}>View Looksmaxxing Plan</Text>
    </TouchableOpacity>
  </View>
  </GestureHandlerRootView>
)}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D1B69",
    alignItems: "center",
    paddingTop: verticalScale(44),
    paddingHorizontal: scale(24),
  },
  headerTitle: {
    color: "#fff",
    fontSize: moderateScale(26),
    fontWeight: "700",
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  currentScore: {
    color: "rgba(255,255,255,0.8)",
    fontSize: moderateScale(14),
    marginBottom: verticalScale(16),
    textAlign: "center",
  },
  ratingsRow: {
    flexDirection: "row",
    width: scale(270),
    justifyContent: "space-between",
    marginVertical: verticalScale(24),
  },
  ratingBox: {
    width: scale(80),
    height: scale(90),
    backgroundColor: "#371F9B",
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    paddingTop: verticalScale(10),
  },
  ratingCircleText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(22),
    marginBottom: verticalScale(8),
  },
  ratingLabel: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
    fontSize: moderateScale(14),
  },
  viewPlanBtn: {
    marginTop: verticalScale(18),
    width: scale(270),
    backgroundColor: "#fff",
    borderRadius: moderateScale(13),
    paddingVertical: verticalScale(14),
    alignItems: "center",
  },
  viewPlanBtnText: {
    color: "#2D1B69",
    fontWeight: "700",
    fontSize: moderateScale(16),
  },
});
export default UnlockedLook;
