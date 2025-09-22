import ButtonStart from "@/src/componants/atoms/startbutton";
import ImageSlider from "@/src/componants/molecules/imgslider";
import img from "@/src/constants/img";
import { useAuth } from "@/src/context/AuthContext";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

// Helper function to determine the border color based on the rating
const getBorderColor = (score: number) => {
  if (score >= 8.5) return "#34D399"; // A vibrant green
  if (score >= 6) return "#FBBF24"; // A warm yellow
  return "#F87171"; // A soft red
};

// A dedicated component for the rating circles for cleaner code
const RatingCircle = ({ score, label }: { score: number; label: string }) => (
  <View style={styles.ratingBox}>
    <View style={[styles.ratingCircle, { borderColor: getBorderColor(score) }]}>
      <Text style={styles.ratingCircleText}>{score}</Text>
    </View>
    <Text style={styles.ratingLabel}>{label}</Text>
  </View>
);

const UnlockedLook: React.FC = () => {
  const { savedImages } = useAuth();
  const onViewPlan = () => {
    router.push("/(tabs)/looksmaxxingPlan");
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Main content wrapper */}
          <View>
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>
                Your looksmaxxed transformation
              </Text>
              <Text style={styles.currentScore}>You current score: 4</Text>
            </View>

            <View style={styles.sliderContainer}>
              <ImageSlider
                beforeImage={{ uri: savedImages[0].uri }}
                afterImage={{ uri: savedImages[1].uri }}
                containerWidth={scale(320)}
                containerHeight={scale(340)}
                sliderWidth={moderateScale(4)}
                knobSize={moderateScale(32)}
              />
            </View>

            <View style={styles.ratingsRow}>
              <RatingCircle score={8.9} label="Chest" />
              <RatingCircle score={9.0} label="Eyes" />
              <RatingCircle score={5.5} label="Jawline" />
            </View>
          </View>

          {/* Footer button */}
          <ButtonStart text="View Looksmaxxing Plan" handlepress={onViewPlan} />
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
    justifyContent: "space-between", // Pushes button to the bottom
    paddingHorizontal: scale(15),
    paddingBottom: verticalScale(20),
  },
  headerContainer: {
    alignItems: "flex-start",
    width: "100%",
    paddingTop: verticalScale(10),
  },
  headerTitle: {
    color: "#fff",
    fontSize: moderateScale(34),
    fontWeight: "700",
    marginBottom: verticalScale(6),
    textAlign: "left",
  },
  currentScore: {
    color: "rgba(255,255,255,0.7)",
    fontSize: moderateScale(15),
    textAlign: "left",
  },
  sliderContainer: {
    alignItems: "center",
    marginTop: verticalScale(20),
  },
  ratingsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginTop: verticalScale(30),
  },
  ratingBox: {
    alignItems: "center",
    backgroundColor: "rgba(135, 89, 209, 0.26)",
    width: scale(100),
    padding: scale(12),
    borderRadius: moderateScale(12),
  },
  ratingCircle: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(40),
    borderWidth: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
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
  viewPlanBtn: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(16),
    alignItems: "center",
    marginTop: verticalScale(20), // Ensure space from content above
  },
  viewPlanBtnText: {
    color: "#2D1B69",
    fontWeight: "700",
    fontSize: moderateScale(16),
  },
});
export default UnlockedLook;
