import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import GuidedCamera from "@/src/componants/molecules/GuidedCamera";
import img from "@/src/constants/img";
import { saveImageToAppStorage } from "@/src/utils/imageStorage";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const HomeScreen: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);

  const handleAllPhotosComplete = async ({
    frontPhoto,
    sidePhoto,
    fullBodyPhoto,
  }: {
    frontPhoto: string;
    sidePhoto: string;
    fullBodyPhoto: string | null;
  }) => {
    setShowCamera(false);
    
    try {
      // Save all images to app storage and wait for completion
      const frontResult = await saveImageToAppStorage(frontPhoto, "front_before");
      console.log("Front image saved to app storage", frontResult);
      
      const sideResult = await saveImageToAppStorage(sidePhoto, "side_before");
      console.log("Side image saved to app storage", sideResult);
      
      let fullBodyResult = null;
      if (fullBodyPhoto) {
        fullBodyResult = await saveImageToAppStorage(fullBodyPhoto, "fullbody_before");
        console.log("Full body image saved to app storage", fullBodyResult);
      }

      // Use the saved app storage paths for navigation
      const savedFrontPhoto = frontResult.success ? frontResult.uri : frontPhoto;
      const savedSidePhoto = sideResult.success ? sideResult.uri : sidePhoto;
      const savedFullBodyPhoto = fullBodyResult?.success ? fullBodyResult.uri : fullBodyPhoto;

      
      router.replace({
        pathname: "/(tabs)/loadingAiProcessing",
        params: {
          frontPhoto: savedFrontPhoto,
          sidePhoto: savedSidePhoto,
          fullBodyPhoto: savedFullBodyPhoto || undefined,
        }
      });
    } catch (error) {
      console.error("Error saving images to app storage:", error);
      // Fallback to original paths if saving fails
      router.replace({
        pathname: "/(tabs)/loadingAiProcessing",
        params: {
          frontPhoto,
          sidePhoto,
          fullBodyPhoto: fullBodyPhoto || undefined,
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2D1B69" />
      <GridBackgroundImg top={false} />
      <LinearGradient
        colors={["#171840", "#6D37D4"]}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Ready to see your</Text>
              <Text style={styles.title}>Peak Self?</Text>
              <Text style={styles.subtitle}>
                Take a quick scan so we can build your transformation.
              </Text>
            </View>

            <View style={styles.photosContainer}>
              <View style={styles.photoSection}>
                <View style={styles.photoFrame}>
                  <Image source={img.before_img} style={styles.photo} />
                </View>
                <Text style={styles.photoLabel}>Before</Text>
              </View>
              <View style={styles.photoSection}>
                <View style={styles.photoFrame}>
                  <Image source={img.after_img} style={styles.photo} />
                </View>
                <Text style={styles.photoLabel}>After</Text>
              </View>
            </View>

            <View style={styles.scoresContainer}>
              <View style={styles.scoreItem}>
                <FontAwesome
                  name="user"
                  style={styles.scoreIcon}
                  color="orange"
                />
                <Text style={styles.scoreName}>OverAll</Text>
                <Text style={styles.scoreValue}>7.7</Text>
              </View>
              <View style={styles.scoreItem}>
                <FontAwesome
                  name="rocket"
                  style={styles.scoreIcon}
                  color="orange"
                />
                <Text style={styles.scoreName}>Potential</Text>
                <Text style={styles.scoreValue}>8.4</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomContainer}>
            <View style={styles.disclaimerContainer}>
              <Text style={styles.disclaimerIcon}>💡</Text>
              <Text style={styles.disclaimerText}>
                Use good lighting, no glasses, and keep a neutral expression.
              </Text>
            </View>
            <ButtonStart
              text="Begin My Scan"
              handlepress={() => setShowCamera(true)}
              // handlepress={() => router.replace("/(tabs)/aiResult")}
            />
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
    justifyContent: "space-between",
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(10),
    fontFamily: "Plush-Trial",
    zIndex: 2,
  },
  headerContainer: {
    paddingTop: verticalScale(20),
    alignItems: "flex-start",
    width: "100%",
  },
  title: {
    color: "#FFFFFF",
    fontSize: moderateScale(36),
    fontWeight: "500",
    textAlign: "left",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: moderateScale(15),
    textAlign: "left",
    marginTop: verticalScale(16),
    fontWeight: "400",
    maxWidth: "90%",
  },
  photosContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: verticalScale(30),
    gap: scale(20),
  },
  photoSection: { alignItems: "center" },
  photoFrame: {
    width: scale(150),
    height: scale(170),
    borderRadius: moderateScale(10),
    overflow: "hidden",
    borderColor: "rgba(255, 255, 255, 0.9)",
    marginBottom: verticalScale(12),
  },
  photo: { width: "100%", height: "100%", resizeMode: "cover" },
  photoLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
  scoresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(30),
    gap: scale(12),
  },
  scoreItem: {
    width: scale(140),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(16),
    gap: scale(8),
  },
  scoreIcon: { fontSize: moderateScale(16) },
  scoreName: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
  scoreValue: {
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  bottomContainer: {
    paddingVertical: verticalScale(20),
  },
  disclaimerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
  },
  disclaimerIcon: {
    fontSize: moderateScale(11),
    marginRight: scale(8),
  },
  disclaimerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: moderateScale(10),
    fontWeight: "400",
    flex: 1,
  },
});

export default HomeScreen;
