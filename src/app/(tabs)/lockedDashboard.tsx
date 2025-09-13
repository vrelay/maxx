import ImageSlider from "@/src/componants/molecules/imgslider";
import img from "@/src/constants/img";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
const LockedDashboard: React.FC = () => {
  const onUnlock = () => {
    router.push("/(tabs)/unlockedLook");
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Maxx.</Text>
        <ImageSlider
          beforeImage={img.faceimg_greyscaled}
          afterImage={img.faceimg}
          containerWidth={scale(270)}
          containerHeight={scale(250)}
          sliderWidth={moderateScale(4)}
          knobSize={moderateScale(32)}
        />
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Start Transformation Today</Text>
          <Text style={styles.progressValue}>0/180</Text>
        </View>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.lockedItem}>
            <Text style={styles.lockedItemTitle}>Your Plan</Text>
            <Text style={styles.lockedItemSub}>View Daily Task</Text>
            <Text style={styles.lockIcon}>{"\u{1F512}"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.lockedItem}>
            <Text style={styles.lockedItemTitle}>Analysis</Text>
            <Text style={styles.lockedItemSub}>See Breakdown</Text>
            <Text style={styles.lockIcon}>{"\u{1F512}"}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.unlockBtn} onPress={onUnlock}>
          <Text style={styles.unlockBtnText}>Unlock at $9.99/week</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D1B69",
    alignItems: "center",
    paddingTop: verticalScale(48),
    paddingHorizontal: scale(24),
  },
  headerTitle: {
    color: "#fff",
    fontSize: moderateScale(26),
    fontWeight: "700",
    marginBottom: verticalScale(8),
    textAlign: "left",
    alignSelf: "flex-start",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: scale(270),
    marginVertical: verticalScale(16),
  },
  progressLabel: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  progressValue: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  listContainer: {
    width: scale(270),
    marginVertical: verticalScale(12),
  },
  lockedItem: {
    flexDirection: "row",
    backgroundColor: "#371F9B",
    marginBottom: verticalScale(8),
    borderRadius: moderateScale(13),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    alignItems: "center",
    justifyContent: "space-between",
  },
  lockedItemTitle: {
    color: "white",
    fontWeight: "700",
    fontSize: moderateScale(16),
    flex: 2,
  },
  lockedItemSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: moderateScale(12),
    flex: 2,
    marginLeft: scale(12),
  },
  lockIcon: {
    color: "#fff",
    fontSize: moderateScale(18),
    marginLeft: scale(8),
  },
  unlockBtn: {
    marginTop: verticalScale(22),
    width: scale(270),
    backgroundColor: "#fff",
    borderRadius: moderateScale(13),
    paddingVertical: verticalScale(16),
    alignItems: "center",
  },
  unlockBtnText: {
    color: "#2D1B69",
    fontWeight: "700",
    fontSize: moderateScale(16),
  },
});
export default LockedDashboard;
