import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

interface ApiProgressComponentProps {
  isVisible: boolean;
  progress: number;
  step: number;
}

const ApiProgressComponent: React.FC<ApiProgressComponentProps> = ({
  isVisible,
  progress,
  step,
}) => {

  const getStepText = (currentStep: number): string => {
    const stepTexts: { [key: number]: string } = {
      0: "Initializing...",
      1: "Analyzing images...",
      2: "Generating front image...",
      3: "Generating side profile...",
      4: "Generating physique...",
      5: "Generating lifestyle...",
      6: "Finalizing results...",
    };
    return stepTexts[currentStep] || "Processing...";
  };


  if (!isVisible) return null;

  return (
    <View style={styles.loadingCard}>
      <Text style={styles.loadingTitle}>
        Your plan and images are on the way...
      </Text>
      <Text style={styles.loadingSubtitle}>
        {getStepText(step)}
      </Text>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress}%` }
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(20),
    marginTop: verticalScale(20),
    alignItems: "center",
  },
  loadingTitle: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "600",
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  loadingSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: moderateScale(14),
    textAlign: "center",
    marginBottom: verticalScale(20),
  },
  progressBarContainer: {
    width: "100%",
  },
  progressBarBackground: {
    height: 6,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 3,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default ApiProgressComponent;
