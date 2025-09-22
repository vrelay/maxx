import ImageSlider from "@/src/componants/molecules/imgslider";
import img from "@/src/constants/img";
import { useAuth } from "@/src/context/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const LockedDashboard: React.FC = () => {
  const { savedImages } = useAuth();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Maxx.</Text>
              <TouchableOpacity>
                <Text style={styles.settingsIcon}>{"\u{2699}"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sliderContainer}>
              <ImageSlider
                beforeImage={{ uri: savedImages[0].uri }}
                afterImage={{ uri: savedImages[1].uri }}
                containerWidth={scale(290)}
                containerHeight={scale(300)}
                sliderWidth={moderateScale(4)}
                knobSize={moderateScale(32)}
              />
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>
                Start Transformation Today
              </Text>
              <Text style={styles.progressValue}>60/180</Text>
            </View>

            <View style={styles.progressBarBackground}>
              <View style={styles.progressBarFill}></View>
            </View>

            <View style={styles.listContainer}>
              <TouchableOpacity
                style={styles.lockedItem}
                onPress={() => router.push("/looksmaxxingPlan")} // Navigation added
              >
                <FontAwesome
                  name="calendar"
                  style={styles.itemIcon}
                  color="orange"
                />
                <View style={styles.itemTextContainer}>
                  <Text style={styles.lockedItemTitle}>Your Plan</Text>
                  <Text style={styles.lockedItemSub}>View Daily Task</Text>
                </View>
                <FontAwesome
                  name="chevron-right" // Icon changed
                  style={styles.chevronIcon}
                  color="grey"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.lockedItem}
                onPress={() => router.push("/unlockedLook")} // Navigation added
              >
                <FontAwesome
                  name="bar-chart-o"
                  style={styles.itemIcon}
                  color="orange"
                />
                <View style={styles.itemTextContainer}>
                  <Text style={styles.lockedItemTitle}>Analysis</Text>
                  <Text style={styles.lockedItemSub}>See Breakdown</Text>
                </View>
                <FontAwesome
                  name="chevron-right" // Icon changed
                  style={styles.chevronIcon}
                  color="grey"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2D1B69",
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
    paddingTop: verticalScale(10),
    width: "100%",
  },
  headerTitle: {
    color: "#fff",
    fontSize: moderateScale(32),
    fontWeight: "700",
  },
  settingsIcon: {
    color: "#fff",
    fontSize: moderateScale(24),
  },
  sliderContainer: {
    alignItems: "center",
    marginTop: verticalScale(20),
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: verticalScale(25),
    paddingHorizontal: scale(5),
  },
  progressLabel: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
  progressValue: {
    color: "rgba(255,255,255,0.7)",
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
  progressBarBackground: {
    height: 4,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginTop: verticalScale(8),
    paddingHorizontal: scale(5),
  },
  progressBarFill: {
    height: "100%",
    width: "33.33%", // Updated for 60/180
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  listContainer: {
    width: "100%",
    marginTop: verticalScale(30),
  },
  lockedItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginBottom: verticalScale(12),
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    alignItems: "center",
  },
  itemIcon: {
    fontSize: moderateScale(20),
    marginRight: scale(12),
  },
  itemTextContainer: {
    flex: 1,
  },
  lockedItemTitle: {
    color: "#000",
    fontWeight: "600",
    fontSize: moderateScale(15),
  },
  lockedItemSub: {
    color: "#888",
    fontSize: moderateScale(12),
    marginTop: verticalScale(2),
  },
  chevronIcon: {
    fontSize: moderateScale(16),
  },
});
export default LockedDashboard;