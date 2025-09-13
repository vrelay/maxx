import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import img from "@/src/constants/img";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { launchCamera } from "react-native-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
const CameraPermissionModal = ({ visible, onAllow, onDeny }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            "Maxx" Would Like To Access{"\n"}The Camera
          </Text>
          <Text style={styles.modalMessage}>
            We need access to camera to capture your scan
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.denyButton} onPress={onDeny}>
              <Text style={styles.denyButtonText}>Don't Allow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.allowButton} onPress={onAllow}>
              <Text style={styles.allowButtonText}>Allow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const GuidedPhotoCaptureScreen = () => {
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const handleBeginScan = () => {
    setShowPermissionModal(true);
  };

  const handleAllowPermission = () => {
    setShowPermissionModal(false);

    // Launch camera for front photo
    const options = {
      mediaType: "photo",
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchCamera(options, (response) => {
      if (response.didCancel || response.error) {
        console.log("Front photo cancelled or error");
        return;
      }

      if (response.assets && response.assets[0]) {
        console.log("Front photo captured:", response.assets[0]);

        // After front photo, capture side photo
        launchCamera(options, (sideResponse) => {
          if (sideResponse.didCancel || sideResponse.error) {
            console.log("Side photo cancelled or error");
            return;
          }

          if (sideResponse.assets && sideResponse.assets[0]) {
            console.log("Side photo captured:", sideResponse.assets[0]);
            console.log("Both photos captured successfully!");
            // Navigate to next screen or process photos
          }
        });
      }
    });
  };

  const handleDenyPermission = () => {
    setShowPermissionModal(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
                {/* Before Photo - Dummy */}
                <View style={styles.photoSection}>
                  <View style={styles.photoFrame}>
                    <Image
                      source={img.faceimg_greyscaled}
                      style={styles.photo}
                    />
                  </View>
                  <Text style={styles.photoLabel}>Before</Text>
                </View>

                {/* After Photo - Dummy */}
                <View style={styles.photoSection}>
                  <View style={styles.photoFrame}>
                    <Image
                      source={img.faceimg}
                      style={styles.photo}
                    />
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
              <ButtonStart text="Begin My Scan" handlepress={handleBeginScan} />
            </View>
          </SafeAreaView>

          <CameraPermissionModal
            visible={showPermissionModal}
            onAllow={handleAllowPermission}
            onDeny={handleDenyPermission}
          />
        </LinearGradient>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
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
  photoSection: {
    alignItems: "center",
  },
  photoFrame: {
    width: scale(120),
    height: scale(150),
    borderRadius: moderateScale(12),
    overflow: "hidden",
    marginBottom: verticalScale(8),
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
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
  scoreIcon: {
    fontSize: moderateScale(16),
  },
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(40),
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(20),
    width: "100%",
  },
  modalTitle: {
    fontSize: moderateScale(17),
    fontWeight: "600",
    textAlign: "center",
    marginBottom: verticalScale(8),
    color: "#000000",
  },
  modalMessage: {
    fontSize: moderateScale(13),
    textAlign: "center",
    color: "#000000",
    marginBottom: verticalScale(20),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  denyButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    marginRight: scale(10),
    backgroundColor: "#F0F0F0",
    borderRadius: moderateScale(8),
  },
  allowButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    marginLeft: scale(10),
    backgroundColor: "#007AFF",
    borderRadius: moderateScale(8),
  },
  denyButtonText: {
    textAlign: "center",
    fontSize: moderateScale(16),
    fontWeight: "400",
    color: "#000000",
  },
  allowButtonText: {
    textAlign: "center",
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default GuidedPhotoCaptureScreen;
