import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import ImageSlider from "@/src/componants/molecules/imgslider";
import MonthlyProgressBars from "@/src/componants/molecules/MonthlyProgressBars";
import Paywall from "@/src/componants/molecules/Paywall";
import img from "@/src/constants/img";
import { useAuth } from "@/src/context/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const LockedDashboard: React.FC = () => {
  const { leftImages, rightImages, refreshCustomerInfo } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GridBackgroundImg top={true} />
      <LinearGradient
        colors={["#171840", "#6D37D4"]}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Maxx.</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/settings")}>
                  <Text style={styles.settingsIcon}>{"\u{2699}"}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.imageContainer}>
                <View style={styles.imageWrapper}>
                  <ImageSlider
                    beforeImage={{ uri: leftImages[0].uri }}
                    afterImage={{ uri: rightImages[0].uri }}
                    lefttext="Pose 1"
                    righttext="+4 levels"
                  />
                </View>
              </View>

              <MonthlyProgressBars currentDays={0} />

              <View style={styles.navigationContainer}>
                <View style={styles.navCard}>
                  <View style={styles.navCardIcon}>
                    <FontAwesome name="lock" size={24} color="white" />
                  </View>
                  <Text style={styles.navCardTitle}>Your Plan</Text>
                  <Text style={styles.navCardSubtitle}>View Daily Task</Text>
                </View>

                <View style={styles.navCard}>
                  <View style={styles.navCardIcon}>
                    <FontAwesome name="lock" size={24} color="white" />
                  </View>
                  <Text style={styles.navCardTitle}>Analysis</Text>
                  <Text style={styles.navCardSubtitle}>See Breakdown</Text>
                </View>
              </View>

              <ButtonStart
                text="Unlock at $9.99/week"
                handlepress={() => router.push("/(tabs)/paywallScreen")}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Paywall Modal */}
      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <Paywall
          onPurchaseSuccess={() => {
            setShowPaywall(false);
            refreshCustomerInfo();
            // Navigate to the unlocked dashboard with AI analysis
            router.push("/(tabs)/mainScreen");
          }}
        />
      </Modal>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: {
    flex: 1,
    zIndex: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(15),
    paddingBottom: verticalScale(20),
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: verticalScale(15),
    width: "100%",
  },
  headerTitle: {
    color: "#fff",
    fontFamily: "Matter",
    fontSize: moderateScale(21),
    fontWeight: "500",
    lineHeight: moderateScale(28), // 28px
    letterSpacing: moderateScale(-0.42), // -2% of 21px
  },
  settingsIcon: {
    color: "#fff",
    fontSize: moderateScale(24),
  },
  notificationBanner: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    marginTop: verticalScale(15),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationText: {
    color: "#000",
    fontSize: moderateScale(14),
    fontWeight: "500",
    flex: 1,
  },
  notificationClose: {
    color: "#000",
    fontSize: moderateScale(20),
    fontWeight: "bold",
  },
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
  imageContainer: {
    alignItems: "center",
    marginTop: verticalScale(25),
  },
  imageWrapper: {
    position: "relative",
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(15),
    gap: scale(8),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  navigationContainer: {
    marginTop: verticalScale(40),
    flexDirection: "row",
    gap: scale(15),
  },
  navCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.11)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, .5)",
    borderRadius: moderateScale(15),
    paddingVertical: verticalScale(30),
    paddingHorizontal: scale(20),
    width: "100%",
    height: verticalScale(100),
    alignItems: "center",
    justifyContent: "center",
  },
  navCardIcon: {
    marginBottom: verticalScale(10),
  },
  navCardTitle: {
    color: "#fff",
    fontFamily: "Matter",
    fontSize: moderateScale(16),
    fontWeight: "500",
    lineHeight: moderateScale(20), // 20px
    letterSpacing: 0, // 0%
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  navCardSubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(14),
    fontWeight: "400",
    lineHeight: moderateScale(19.6), // 140% of 14px
    letterSpacing: moderateScale(-0.14), // -1% of 14px
    textAlign: "center",
  },
});
export default LockedDashboard;
