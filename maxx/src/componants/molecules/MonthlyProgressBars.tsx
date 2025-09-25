import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

interface MonthlyProgressBarsProps {
  currentDays: number;
  totalDays?: number;
}

const MonthlyProgressBars: React.FC<MonthlyProgressBarsProps> = ({
  currentDays,
  totalDays = 180,
}) => {
  const getProgressForPeriod = (periodStart: number, periodEnd: number) => {
    if (currentDays < periodStart) {
      return 0;
    } else if (currentDays >= periodEnd) {
      return 100;
    } else {
      return ((currentDays - periodStart) / (periodEnd - periodStart)) * 100;
    }
  };

  const getCurrentPeriodDays = (periodStart: number, periodEnd: number) => {
    if (currentDays < periodStart) {
      return 0;
    } else if (currentDays >= periodEnd) {
      return periodEnd - periodStart;
    } else {
      return currentDays - periodStart;
    }
  };

  return (
    <View style={styles.monthlyProgressContainer}>
      <View style={styles.monthlyProgressHeader}>
        <Text style={styles.monthlyProgressTitle}>Your Day Progress</Text>
        <Text style={styles.monthlyProgressValue}>
          {currentDays}/{totalDays}
        </Text>
      </View>
      <View style={styles.threeProgressBarsContainer}>
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${getProgressForPeriod(0, 60)}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.progressBarWrapper}>
          <View
            style={[
              styles.progressBarBackground,
              currentDays < 60 && styles.lockedProgressBar,
            ]}
          >
            {currentDays < 60 ? (
              <View style={styles.lockIconAbsolute}>
                <FontAwesome name="lock" size={20} color="rgb(255, 255, 255)" />
              </View>
            ) : (
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${getProgressForPeriod(60, 120)}%`,
                  },
                ]}
              />
            )}
          </View>
        </View>

        <View style={styles.progressBarWrapper}>
          <View
            style={[
              styles.progressBarBackground,
              currentDays < 120 && styles.lockedProgressBar,
            ]}
          >
            {currentDays < 120 ? (
              <View style={styles.lockIconAbsolute}>
                <FontAwesome name="lock" size={20} color="rgb(255, 255, 255)" />
              </View>
            ) : (
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${getProgressForPeriod(120, 180)}%`,
                  },
                ]}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  monthlyProgressContainer: {
    marginTop: verticalScale(30),
  },
  monthlyProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  monthlyProgressTitle: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  monthlyProgressValue: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
  threeProgressBarsContainer: {
    flexDirection: "row",
    gap: scale(12),
    marginTop: verticalScale(15),
  },
  progressBarWrapper: {
    flex: 1,
  },
  progressBarValue: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: moderateScale(11),
    fontWeight: "500",
  },
  progressBarBackground: {
    position: "relative",
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
  lockedProgressBar: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  lockIconAbsolute: {
    position: "absolute",
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MonthlyProgressBars;
