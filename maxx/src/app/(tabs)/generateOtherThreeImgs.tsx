import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import ConfettiBurst from "@/src/componants/atoms/ConfettiBurst";
import ImageSlider from "@/src/componants/molecules/imgslider";
import MonthlyProgressBars from "@/src/componants/molecules/MonthlyProgressBars";
import ApiProgressComponent from "@/src/componants/molecules/ApiProgressComponent";
import img from "@/src/constants/img";
import { useAuth } from "@/src/context/AuthContext";
import { useApiProgress } from "@/src/hooks/useApiProgress";
import looksmaxxingService from "@/src/services/looksmaxxingService";
import { getSavedImages, GetSavedImagesResult } from "@/src/utils/imageStorage";
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
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const GenerateOtherThreeImgs: React.FC = () => {
  const {
    user,
    leftImages,
    rightImages,
    subscriptionDays,
    looksmaxxingResults,
    setLooksmaxxingResults,
    setLeftImages,
    setRightImages,
    processImgsGenrationForNextStep,
    setProcessImgsGenrationForNextStep,
  } = useAuth();
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [everythingDone, setEverythingDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const {
    isApiCallInProgress,
    apiProgress,
    step,
    startApiCall,
    handleApiProgress,
    completeApiCall,
  } = useApiProgress();

  // Trigger confetti when API call completes
  useEffect(() => {
    if (step === 6 && apiProgress === 100) {
      setTimeout(() => {
        setProcessImgsGenrationForNextStep("");
        setShowConfetti(true);
      }, 500);
    }
  }, [step, apiProgress]);

  const loadSavedImages = async (): Promise<void> => {
    const result: GetSavedImagesResult = await getSavedImages();
    if (result.success) {
      const filteredleftImages = result.images.filter((image) => {
        const nameWithoutExtension = image.name.replace(/\.[^/.]+$/, "");
        return ["front_before", "side_before", "fullbody_before"].includes(
          nameWithoutExtension
        );
      });
      const filteredrightImages = result.images.filter((image) => {
        const nameWithoutExtension = image.name.replace(/\.[^/.]+$/, "");
        return [
          "front_after",
          "side_after",
          "physique_after",
          "lifestyle_after",
        ].includes(nameWithoutExtension);
      });
      console.log("filteredImages", filteredleftImages);
      console.log("filteredImages", filteredrightImages);

      const dummyImages = {
        modificationTime: new Date(),
        name: "",
        path: "",
        size: 0,
        uri: "",
      };
      //push dummyimages and make total of four images so first count the length of filteredleftImages and then push the dummyimages to the array
      const totalImages = filteredleftImages.length;
      if (totalImages < 4) {
        for (let i = 0; i < 4 - totalImages; i++) {
          filteredleftImages.push(dummyImages);
        }
      }
      setLeftImages(filteredleftImages);
      setRightImages(filteredrightImages);
      const looksmaxxingResults =
        await looksmaxxingService.getJsonFromFirestore(
          user?.uid as string,
          "looksmaxxing_results"
        );

      setLooksmaxxingResults(looksmaxxingResults.data);
    }
  };
  useEffect(() => {
    if (processImgsGenrationForNextStep === "") {
      loadSavedImages();
      setEverythingDone(true);
    }
  }, [processImgsGenrationForNextStep]);

  // TESTING useEffect - Uncomment this to test progress without real API calls
  // useEffect(() => {
  //   const testApiCall = async () => {
  //     startApiCall();

  //     // Simulate API call steps with delays and smooth progress
  //     const steps = [
  //       { step: 1, delay: 100, message: "Starting API call..." },
  //       { step: 2, delay: 200, message: "Analyzing images..." },
  //       { step: 3, delay: 300, message: "Generating side profile..." },
  //       { step: 4, delay: 300, message: "Generating physique..." },
  //       { step: 5, delay: 300, message: "Generating lifestyle..." },
  //       { step: 6, delay: 100, message: "Finalizing results..." },
  //     ];

  //     for (const { step, delay, message } of steps) {
  //       console.log(`Testing step ${step}: ${message}`);
  //       handleApiProgress(step);

  //       // Add some intermediate progress updates for smoother animation
  //       if (step < 6) {
  //         const intermediateSteps = 3;
  //         const stepDelay = delay / (intermediateSteps + 1);

  //         for (let i = 1; i <= intermediateSteps; i++) {
  //           await new Promise((resolve) => setTimeout(resolve, stepDelay));
  //           // Don't change the step, just let the smooth animation continue
  //         }

  //         await new Promise((resolve) => setTimeout(resolve, stepDelay));
  //       } else {
  //         // For the final step, just wait the full delay
  //         await new Promise((resolve) => setTimeout(resolve, delay));
  //       }
  //     }
  //     setEverythingDone(true);
  //     console.log("Test API call completed!");
  //   };

  //   testApiCall();
  // }, []);

  // REAL API CALL useEffect - Uncomment this for production
  useEffect(() => {
    handleApiProgress(0);
    const call = async () => {
      startApiCall();

      try {
        // Show that we're starting the API call
        handleApiProgress(1);

        const result = await looksmaxxingService.upgradeToCompleteResults(
          user?.uid as string,
          looksmaxxingResults?.id,
          handleApiProgress
        );

        if (!result.success) {
          console.error("API call failed:", result.error);
          completeApiCall();
          return;
        }

        console.log("API call successful:", result);
      } catch (error) {
        console.error("API call error:", error);
        completeApiCall();
        return;
      }

      await loadSavedImages();
      handleApiProgress(6); // Final step
      setEverythingDone(true);
    };
    if (processImgsGenrationForNextStep === "next3") {
      call();
    } else if (processImgsGenrationForNextStep === "nextmonthsiteration") {
      // call();
    }
  }, []);

  const onLeftNavigation = () => {
    setCurrentPoseIndex((prev) => (prev === 0 ? 3 : prev - 1));
  };

  const onRightNavigation = () => {
    setCurrentPoseIndex((prev) => (prev === 3 ? 0 : prev + 1));
  };

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
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Maxx.</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/settings")}>
                <Text style={styles.settingsIcon}>{"\u{2699}"}</Text>
              </TouchableOpacity>
            </View>

            <ApiProgressComponent
              isVisible={isApiCallInProgress}
              progress={apiProgress}
              step={step}
            />

            <ConfettiBurst
              isVisible={showConfetti}
              onComplete={() => {
                setShowConfetti(false);
                completeApiCall();
              }}
            />

            <View style={styles.imageContainer}>
              <View style={styles.imageWrapper}>
                {everythingDone && (
                  <ImageSlider
                    beforeImage={{ uri: leftImages[currentPoseIndex]?.uri }}
                    afterImage={{ uri: rightImages[currentPoseIndex]?.uri }}
                    lefttext="Pose 1"
                    righttext="+4 levels"
                    onleftnavigation={onLeftNavigation}
                    onrightnavigation={onRightNavigation}
                  />
                )}
                {!everythingDone && (
                  <ImageSlider
                    beforeImage={{ uri: leftImages[0]?.uri }}
                    afterImage={{ uri: rightImages[0]?.uri }}
                    lefttext="Pose 1"
                    righttext="+4 levels"
                  />
                )}

                <View style={styles.paginationDots}>
                  {[0, 1, 2, 3].map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.dot,
                        currentPoseIndex === idx ? styles.dotActive : null,
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>

            <MonthlyProgressBars currentDays={subscriptionDays || 0} />

            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={styles.navCard}
                onPress={() => router.push("/(tabs)/looksmaxxingPlan")}
              >
                <View style={styles.navCardIcon}>
                  <FontAwesome name="calendar" size={24} color="orange" />
                </View>
                <Text style={styles.navCardTitle}>Your Plan</Text>
                <Text style={styles.navCardSubtitle}>View Daily Task</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navCard}
                onPress={() => router.push("/(tabs)/analysis")}
              >
                <View style={styles.navCardIcon}>
                  <FontAwesome name="bar-chart-o" size={24} color="orange" />
                </View>
                <Text style={styles.navCardTitle}>Analysis</Text>
                <Text style={styles.navCardSubtitle}>See Breakdown</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: {
    flex: 1,
    zIndex: 2,
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
    paddingTop: verticalScale(15),
    width: "100%",
  },
  headerTitle: {
    color: "#fff",
    fontSize: moderateScale(22),
    fontWeight: "700",
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
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  dotActive: {
    backgroundColor: "#fff",
    width: scale(20),
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
    fontSize: moderateScale(15),
    fontWeight: "700",
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  navCardSubtitle: {
    color: "rgb(255, 255, 255)",
    fontSize: moderateScale(14),
    textAlign: "center",
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    zIndex: 1000,
  },
  paperPiece: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});
export default GenerateOtherThreeImgs;
