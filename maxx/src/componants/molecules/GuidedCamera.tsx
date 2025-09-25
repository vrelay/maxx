import img from "@/src/constants/img";
import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
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

  useEffect(() => {
    if (visible && !permission?.granted) {
      console.log('Requesting camera permission...');
      requestPermission().then((result) => {
        console.log('Camera permission result:', result);
        if (!result.granted) {
          console.error('Camera permission denied');
        }
      }).catch((error) => {
        console.error('Error requesting camera permission:', error);
      });
    }
  }, [visible]);

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
      if (cameraRef.current) {
        console.log('Taking picture...');
        const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
        console.log('Picture taken:', photo.uri);
        setPhotoUri(photo.uri);
        if (step === "front-position") setStep("front-preview");
        else if (step === "side-position") setStep("side-preview");
        else if (step === "full-body-position") setStep("full-body-preview");
      } else {
        console.error('Camera ref is null');
      }
    } catch (error) {
      console.error('Error taking picture:', error);
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

  // Updated, more user-friendly instructions
  const instructions: Record<string, string> = {
    "front-position": "Center Your Face in the Frame",
    "front-preview": "Front photo captured",
    "side-position": "Now, Turn for a Profile Photo",
    "side-preview": "Side photo captured",
    "full-body-position": "Capture Your Full Body Photo",
    "full-body-preview": "Full-body photo captured",
  };

  if (step === "full-body-intro") {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#2D1B69" }}>
          <View style={styles.fullBodyContainer}>
            <Text style={styles.fullBodyTitle}>
              Show your full self for the best results
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
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={styles.topBar}>
          <BackArrow onPress={onClose} />
          <Text style={styles.instruction}>{instructions[step]}</Text>
          <View style={{ width: 32 }} />
        </View>
        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
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
              <>
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing={cameraFacing}
                />
                {(step === "front-position" || step === "side-position") && (
                  <View style={styles.ovalOverlay} />
                )}
                <View style={styles.captureBar}>
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={handleCapture}
                  >
                    <View style={styles.captureCircle} />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>
                  Camera permission is required to take photos
                </Text>
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={() => requestPermission()}
                >
                  <Text style={styles.permissionButtonText}>
                    Grant Permission
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  topBar: {
    height: verticalScale(60),
    backgroundColor: "#20186e",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
  },
  backArrow: {
    padding: 4,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  instruction: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontWeight: "500",
    fontSize: moderateScale(16),
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
  ovalOverlay: {
    position: "absolute",
    top: "15%",
    alignSelf: "center",
    width: scale(220),
    height: verticalScale(300),
    borderRadius: scale(120), // Large radius creates an ellipse on a rectangle
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
    backgroundColor: "transparent", // No fill color
    zIndex: 2,
  },
  captureBar: {
    position: "absolute",
    bottom: verticalScale(40),
    left: 0,
    right: 0,
    alignItems: "center",
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
    fontWeight: "bold",
    fontSize: moderateScale(28),
    marginBottom: verticalScale(12),
  },
  fullBodySubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: moderateScale(16),
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
  // Permission styles
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(20),
    backgroundColor: "#000",
  },
  permissionText: {
    color: "#fff",
    fontSize: moderateScale(18),
    textAlign: "center",
    marginBottom: verticalScale(20),
  },
  permissionButton: {
    backgroundColor: "#20186e",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "500",
  },
});

export default GuidedCamera;
