import img from "@/src/constants/img";
import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from "react-native-image-picker";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Svg, { Ellipse, Rect, Mask, Defs } from "react-native-svg";
import ButtonStart from "../atoms/startbutton";

type PhotoResult = {
  frontPhoto: string;
  sidePhoto: string;
  fullBodyPhoto: string | null;
};

type GuidedCameraProps = {
  visible: boolean;
  onClose: () => void;
  onPhotosCaptured: (photos: PhotoResult) => void;
};

const BackArrow: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.backArrow}>
    <Text style={{ fontSize: 24, color: "#fff" }}>←</Text>
  </TouchableOpacity>
);

const GuidedCamera: React.FC<GuidedCameraProps> = ({
  visible,
  onClose,
  onPhotosCaptured,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<
    | "front-position"
    | "front-preview"
    | "side-position"
    | "side-preview"
    | "full-body-intro"
    | "full-body-position"
    | "full-body-preview"
  >("front-position");

  const [cameraFacing, setCameraFacing] = useState<"front" | "back">("front");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [sidePhoto, setSidePhoto] = useState<string | null>(null);
  const [fullBodyPhoto, setFullBodyPhoto] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const handlePermissionRequest = async () => {
    try {
      setPermissionError(null);
      const result = await requestPermission();

      if (!result.granted) {
        setPermissionError("Camera permission denied");
        Alert.alert(
          "Camera Access Required",
          "This app needs camera access to take photos for analysis. Please enable it in Settings.",
          [
            { text: "Cancel", onPress: onClose },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (error) {
      console.error("Permission request failed:", error);
      setPermissionError("Failed to request camera permission");
      Alert.alert(
        "Permission Error",
        "Failed to request camera permission. Please try again.",
        [{ text: "OK", onPress: onClose }]
      );
    }
  };

  useEffect(() => {
    if (visible && !permission?.granted) {
      handlePermissionRequest();
    }
  }, [visible, permission]);

  // Effect to switch camera based on the step
  useEffect(() => {
    if (step === "full-body-position") {
      setCameraFacing("back");
    } else {
      setCameraFacing("front");
    }
  }, [step]);

  const handleCapture = async () => {
    try {
      if (!cameraRef.current) {
        throw new Error("Camera not ready");
      }

      if (!permission?.granted) {
        throw new Error("Camera permission not granted");
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false,
        exif: false,
      });

      if (!photo?.uri) {
        throw new Error("Failed to capture photo");
      }

      setPhotoUri(photo.uri);
      setPermissionError(null);

      if (step === "front-position") setStep("front-preview");
      else if (step === "side-position") setStep("side-preview");
      else if (step === "full-body-position") setStep("full-body-preview");
    } catch (error) {
      console.error("Camera capture error:", error);
      setPermissionError("Failed to capture photo. Please try again.");
      Alert.alert(
        "Capture Error",
        "Failed to capture photo. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleAccept = () => {
    if (step === "front-preview" && photoUri) {
      setFrontPhoto(photoUri);
      setPhotoUri(null);
      setStep("side-position");
    } else if (step === "side-preview" && photoUri) {
      setSidePhoto(photoUri);
      setPhotoUri(null);
      setStep("full-body-intro");
    } else if (step === "full-body-preview" && photoUri) {
      setFullBodyPhoto(photoUri);
      setPhotoUri(null);
      // Done: return all photos
      onPhotosCaptured({
        frontPhoto: frontPhoto!,
        sidePhoto: sidePhoto!,
        fullBodyPhoto: photoUri,
      });
      onClose();
    }
  };

  const handleReject = () => {
    setPhotoUri(null);
    if (step === "front-preview") setStep("front-position");
    else if (step === "side-preview") setStep("side-position");
    else if (step === "full-body-preview") setStep("full-body-position");
  };

  const handleFullBodySkip = () => {
    onPhotosCaptured({
      frontPhoto: frontPhoto!,
      sidePhoto: sidePhoto!,
      fullBodyPhoto: null,
    });
    onClose();
  };

  const handleGallerySelect = () => {
    const options = {
      mediaType: "photo" as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 1 as const,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]) {
        setPhotoUri(response.assets[0].uri || null);
        
        // Navigate to appropriate preview step based on current step
        if (step === "front-position") {
          setStep("front-preview");
        } else if (step === "side-position") {
          setStep("side-preview");
        } else if (step === "full-body-position") {
          setStep("full-body-preview");
        }
      }
    });
  };

  // Updated, more user-friendly instructions
  const instructions: Record<string, string> = {
    "front-position": "Center Your Face in the Frame\n(Tap Gallery to choose existing photo)",
    "front-preview": "Front photo captured",
    "side-position": "Now, Turn for a Profile Photo\n(Tap Gallery to choose existing photo)",
    "side-preview": "Side photo captured",
    "full-body-position": "Capture Your Full Body Photo\n(Tap Gallery to choose existing photo)",
    "full-body-preview": "Full-body photo captured",
  };

  if (step === "full-body-intro") {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#2D1B69" }}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.fullBodyContainer}>
              <Text style={styles.fullBodyTitle}>
                <Text>Show your full self</Text>
                <Text style={{ fontStyle: "italic" }}> for the best results</Text>
              </Text>
              <Text style={styles.fullBodySubtitle}>
                A full-body photo helps us assess your transformation potential
                and suggest body-specific improvements.
              </Text>
              <View style={styles.fullBodyImageFrame}>
                <Image
                  source={img.fullbodydummy}
                  style={styles.fullBodyImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.fullBodyActions}>
                <TouchableOpacity
                  onPress={handleFullBodySkip}
                  style={styles.skipButton}
                >
                  <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
                <ButtonStart
                  text="Continue"
                  handlepress={() => setStep("full-body-position")}
                />
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: "#20186e" }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={[
              styles.topBar,
              Platform.OS === "ios" && {
                paddingTop: Math.max(insets.top - 20, 10),
              },
            ]}
          >
            <View style={styles.topBarContent}>
              <View style={styles.topBarHeader}>
                <BackArrow onPress={onClose} />
                <View style={{ width: 32 }} />
              </View>
              <Text style={styles.instruction}>{instructions[step]}</Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressSegment,
                    (frontPhoto || step === "front-preview") &&
                    styles.progressSegmentCompleted,
                  ]}
                />
                <View
                  style={[
                    styles.progressSegment,
                    (sidePhoto || step === "side-preview") &&
                    styles.progressSegmentCompleted,
                  ]}
                />
                <View
                  style={[
                    styles.progressSegment,
                    (fullBodyPhoto || step === "full-body-preview") &&
                    styles.progressSegmentCompleted,
                  ]}
                />
              </View>
            </View>
          </View>
          {photoUri ? (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: photoUri }}
                style={[
                  styles.previewImage,
                  (step === "front-preview" || step === "side-preview") &&
                  styles.flippedImage,
                ]}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={styles.gradientOverlay}
              />
              <View style={styles.photoActions}>
                <TouchableOpacity onPress={handleReject}>
                  <Feather name="x" style={styles.actionIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAccept}>
                  <Feather name="check" style={styles.actionIcon} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.cameraContainer}>
              {permission?.granted ? (
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing={cameraFacing}
                  mode="picture"
                  enableTorch={false}
                />
              ) : (
                <View style={styles.permissionContainer}>
                  <Text style={styles.permissionText}>
                    {permissionError || "Requesting camera permission..."}
                  </Text>
                  {permissionError && (
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={handlePermissionRequest}
                    >
                      <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {(step === "front-position" || step === "side-position") && (
                <View style={styles.ovalOverlayContainer}>
                  <Svg width="100%" height="100%" style={styles.ovalOverlay}>
                    <Defs>
                      <Mask id="ellipseMask">
                        <Rect width="100%" height="100%" fill="white" />
                        <Ellipse
                          cx="50%"
                          cy="35%"
                          rx="40%"
                          ry="30%"
                          fill="black"
                        />
                      </Mask>
                    </Defs>
                    <Rect
                      width="100%"
                      height="100%"
                      fill="rgba(0, 0, 0, 0.5)"
                      mask="url(#ellipseMask)"
                    />
                    <Ellipse
                      cx="50%"
                      cy="35%"
                      rx="40%"
                      ry="30%"
                      stroke="rgba(255,255,255,0.7)"
                      strokeWidth="2"
                      fill="none"
                    />
                  </Svg>
                </View>
              )}
              <View style={styles.captureBar}>
                {/* Gallery button - show for all photo steps */}
                <TouchableOpacity
                  style={styles.galleryButton}
                  onPress={handleGallerySelect}
                >
                  <Feather name="image" size={24} color="#fff" />
                  <Text style={styles.galleryButtonText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={handleCapture}
                >
                  <View style={styles.captureCircle} />
                </TouchableOpacity>

                <View style={styles.placeholder} />
              </View>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  topBar: {
    minHeight: verticalScale(120),
    backgroundColor: "#20186e",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  topBarContent: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(10),
    gap: verticalScale(20),
    justifyContent: "space-between",
    marginBottom: verticalScale(15),
  },
  topBarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    flexDirection: "row",
    width: "100%",
    height: verticalScale(3),
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  progressSegment: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: scale(1),
  },
  progressSegmentCompleted: {
    backgroundColor: "rgb(255, 255, 255)",
  },
  backArrow: {
    padding: 4,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  instruction: {
    textAlign: "center",
    color: "#fff",
    fontFamily: "Matter",
    fontWeight: "400",
    fontSize: moderateScale(16),
    lineHeight: moderateScale(22.4), // 140% of 16px
    letterSpacing: moderateScale(-0.16), // -1% of 16px
    width: "100%",
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: "#000",
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  ovalOverlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  ovalOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  captureBar: {
    position: "absolute",
    bottom: verticalScale(40),
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(40),
    zIndex: 3,
  },
  captureButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 40,
    padding: 8,
  },
  captureCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.8)",
  },
  galleryButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 30,
    padding: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryButtonText: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "500",
    marginTop: 4,
  },
  placeholder: {
    width: 54,
    height: 54,
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  flippedImage: {
    transform: [{ scaleX: -1 }],
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "30%",
  },
  photoActions: {
    position: "absolute",
    bottom: verticalScale(50),
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  actionIcon: {
    fontSize: moderateScale(40),
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  // Full-body intro styles
  fullBodyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: scale(20),
    backgroundColor: "#2D1B69",
  },
  fullBodyTitle: {
    color: "#fff",
    fontFamily: "Georgia",
    fontWeight: "400",
    // fontStyle: "italic",
    fontSize: moderateScale(40),
    lineHeight: moderateScale(46), // 114.99% of 40px
    letterSpacing: moderateScale(-0.4), // -1% of 40px
    marginBottom: verticalScale(12),
  },
  fullBodySubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Matter",
    fontWeight: "400",
    fontSize: moderateScale(16),
    lineHeight: moderateScale(22.4), // 140% of 16px
    letterSpacing: moderateScale(-0.16), // -1% of 16px
    marginBottom: verticalScale(20),
  },
  fullBodyImageFrame: {
    width: scale(310),
    height: scale(320),
    marginTop: verticalScale(20),
    borderRadius: moderateScale(16),
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5947a7ff",
    marginBottom: verticalScale(32),
  },
  fullBodyImage: {
    width: "100%",
    height: "100%",
  },
  fullBodyActions: {
    width: "100%",
    alignItems: "center",
  },
  skipButton: {
    padding: verticalScale(12),
  },
  skipText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.85,
  },
  // Permission handling styles
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: scale(20),
  },
  permissionText: {
    color: "#fff",
    fontSize: moderateScale(18),
    textAlign: "center",
    marginBottom: verticalScale(20),
  },
  retryButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(24),
  },
  retryButtonText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
});

export default GuidedCamera;
