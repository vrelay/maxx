import ButtonStart from "@/src/componants/atoms/startbutton";
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
  const onUnlock = () => {
    // In a real app, you might navigate to a paywall screen first.
    // For this example, we'll navigate to the unlocked look.
    router.push("/(tabs)/unlockedLook");
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Main content wrapper */}
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
              <Text style={styles.progressValue}>0/180</Text>
            </View>

            {/* Visual Progress Bar */}
            <View style={styles.progressBarBackground}>
              <View style={styles.progressBarFill}></View>
            </View>

            <View style={styles.listContainer}>
              <TouchableOpacity style={styles.lockedItem}>
                <FontAwesome
                  name="calendar"
                  style={styles.itemIcon}
                  color="orange"
                />
                {/* Calendar Icon */}
                <View style={styles.itemTextContainer}>
                  <Text style={styles.lockedItemTitle}>Your Plan</Text>
                  <Text style={styles.lockedItemSub}>View Daily Task</Text>
                </View>
                <FontAwesome name="lock" style={styles.itemIcon} color="grey" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.lockedItem}>
                <FontAwesome
                  name="bar-chart-o"
                  style={styles.itemIcon}
                  color="orange"
                />
                {/* Chart Icon */}
                <View style={styles.itemTextContainer}>
                  <Text style={styles.lockedItemTitle}>Analysis</Text>
                  <Text style={styles.lockedItemSub}>See Breakdown</Text>
                </View>
                <FontAwesome name="lock" style={styles.itemIcon} color="grey" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer button */}
          <ButtonStart text="Unlock at $9.99/week" handlepress={onUnlock} />
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
    justifyContent: "space-between", // Pushes button to bottom
    paddingHorizontal: scale(15),
    paddingBottom: verticalScale(20), // Padding for the button
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
    width: "2%", // Represents the start of the progress
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
  lockIcon: {
    fontSize: moderateScale(20),
  },
  unlockBtn: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(16),
    alignItems: "center",
    marginTop: verticalScale(20), // Space from content above
  },
  unlockBtnText: {
    color: "#2D1B69",
    fontWeight: "700",
    fontSize: moderateScale(16),
  },
});
export default LockedDashboard;
