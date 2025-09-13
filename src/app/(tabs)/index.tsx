import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import GuidedCamera from "@/src/componants/molecules/GuidedCamera";
import img from "@/src/constants/img";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const HomeScreen: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);

  // Dummy function called when all photos captured/skipped
  const handleAllPhotosComplete = ({
    frontPhoto,
    sidePhoto,
    fullBodyPhoto,
  }: {
    frontPhoto: string;
    sidePhoto: string;
    fullBodyPhoto: string | null;
  }) => {
    setShowCamera(false);
    // Use the URIs as needed below
    console.log("Front:", frontPhoto);
    console.log("Side:", sidePhoto);
    console.log("Full body:", fullBodyPhoto);
    router.replace("/(tabs)/loadingAiProcessing");
  };

  return (
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
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Ready to see your</Text>
            <Text style={styles.titleItalic}>Peak Self?</Text>
            <Text style={styles.subtitle}>
              Take a quick scan so we can build your transformation.
            </Text>
            <View style={styles.photosContainer}>
              <View style={styles.photoSection}>
                <View style={styles.photoFrame}>
                  <Image source={img.faceimg_greyscaled} style={styles.photo} />
                </View>
                <Text style={styles.photoLabel}>Before</Text>
              </View>
              <View style={styles.photoSection}>
                <View style={styles.photoFrame}>
                  <Image source={img.faceimg} style={styles.photo} />
                </View>
                <Text style={styles.photoLabel}>After</Text>
              </View>
            </View>
            <View style={styles.scoresContainer}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreIcon}>👤</Text>
                <Text style={styles.scoreName}>OverAll</Text>
                <Text style={styles.scoreValue}>77</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreIcon}>⚡</Text>
                <Text style={styles.scoreName}>Potential</Text>
                <Text style={styles.scoreValue}>8.4</Text>
              </View>
            </View>
            <Text style={styles.recommendation}>20 x 20</Text>
            <Text style={styles.disclaimer}>
              💡 Use good lighting, no glasses, and keep a neutral expression.
            </Text>
          </View>
          <View style={styles.bottomContainer}>
            <ButtonStart text="Begin My Scan" handlepress={() => setShowCamera(true)} />
          </View>
        </SafeAreaView>
      </LinearGradient>
      {showCamera && (
        <GuidedCamera
          visible={showCamera}
          onClose={() => setShowCamera(false)}
          onPhotosCaptured={handleAllPhotosComplete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: scale(20),
    justifyContent: "space-between",
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: verticalScale(40),
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "Plush-Trial",
    fontSize: moderateScale(28),
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: moderateScale(-1),
  },
  titleItalic: {
    color: "#FFFFFF",
    fontFamily: "Plush-Trial",
    fontSize: moderateScale(28),
    fontWeight: "500",
    fontStyle: "italic",
    textAlign: "center",
    letterSpacing: moderateScale(-1),
    marginBottom: verticalScale(12),
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(14),
    textAlign: "center",
    marginBottom: verticalScale(30),
    fontWeight: "400",
  },
  photosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: verticalScale(20),
    paddingHorizontal: scale(20),
  },
  photoSection: { alignItems: "center" },
  photoFrame: {
    width: scale(120),
    height: scale(150),
    borderRadius: moderateScale(12),
    overflow: "hidden",
    marginBottom: verticalScale(8),
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  photo: { width: "100%", height: "100%", resizeMode: "cover" },
  photoLabel: {
    color: "#FFFFFF",
    fontFamily: "Matter",
    fontSize: moderateScale(14),
    fontWeight: "500",
    textAlign: "center",
  },
  scoresContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: verticalScale(10),
    gap: scale(30),
  },
  scoreItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: scale(8),
  },
  scoreIcon: { fontSize: moderateScale(16) },
  scoreName: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(12),
    fontWeight: "400",
  },
  scoreValue: {
    color: "#FFFFFF",
    fontFamily: "Plush-Trial",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  recommendation: {
    color: "#FFFFFF",
    fontFamily: "Plush-Trial",
    fontSize: moderateScale(24),
    fontWeight: "700",
    marginBottom: verticalScale(20),
  },
  disclaimer: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Matter",
    fontSize: moderateScale(12),
    textAlign: "center",
    fontWeight: "500",
    paddingHorizontal: scale(20),
  },
  bottomContainer: {
    paddingBottom: verticalScale(10),
  },
});

export default HomeScreen;
