import img from "@/src/constants/img";
import { CameraView, useCameraPermissions } from "expo-camera";
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
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [sidePhoto, setSidePhoto] = useState<string | null>(null);
  const [fullBodyPhoto, setFullBodyPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (visible && !permission?.granted) requestPermission();
  }, [visible]);

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      setPhotoUri(photo.uri);
      if (step === "front-position") setStep("front-preview");
      else if (step === "side-position") setStep("side-preview");
      else if (step === "full-body-position") setStep("full-body-preview");
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

  // "Skip for now" on full-body step: call results with fullBodyPhoto=null
  const handleFullBodySkip = () => {
    onPhotosCaptured({
      frontPhoto: frontPhoto!,
      sidePhoto: sidePhoto!,
      fullBodyPhoto: null,
    });
    onClose();
  };

  const instructions: Record<string, string> = {
    "front-position": "Position face in frame",
    "front-preview": "Front photo captured",
    "side-position": "Turn your head slightly",
    "side-preview": "Side photo captured",
    "full-body-position": "Show your full self in the frame",
    "full-body-preview": "Full-body photo captured",
  };

  // Intro screen for full-body step (matches your reference)
  if (step === "full-body-intro") {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#2D1B69" }}>
          <View style={styles.fullBodyContainer}>
            <Text style={styles.fullBodyTitle}>Show your full self for the best results</Text>
            <Text style={styles.fullBodySubtitle}>
              Full-body photo helps us assess your transformation potential and suggest body specific improvements.
            </Text>
            <View style={styles.fullBodyImageFrame}>
              <Image
                source={img.fullbodydummy}
                style={styles.fullBodyImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.fullBodyActions}>
              <TouchableOpacity onPress={handleFullBodySkip} style={styles.skipButton}>
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep("full-body-position")} style={styles.continueButton}>
                <Text style={styles.continueText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1752" }}>
        <View style={styles.topBar}>
          <BackArrow onPress={onClose} />
          <Text style={styles.instruction}>{instructions[step]}</Text>
          <View style={{ width: 32 }} />
        </View>
        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleReject}>
                <Text style={styles.actionButtonText}>✗</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleAccept}>
                <Text style={styles.actionButtonText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            {permission?.granted && (
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
              />
            )}
            {/* Hide oval for full-body shot */}
            {(step === "front-position" || step === "side-position") && <View style={styles.ovalOverlay} />}
            <View style={styles.captureBar}>
              <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
                <View style={styles.captureCircle} />
              </TouchableOpacity>
            </View>
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
    width: 240,
    height: 320,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
    backgroundColor: "rgba(255,255,255,0.07)",
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
    borderRadius: 32,
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222",
  },
  previewImage: {
    width: 320,
    height: 426,
    borderRadius: 16,
    alignSelf: "center",
  },
  photoActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(32),
  },
  actionButton: {
    marginHorizontal: scale(24),
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: scale(14),
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  actionButtonText: {
    fontSize: moderateScale(26),
    color: "#2D1B69",
    fontWeight: "bold",
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
    textAlign: "center",
    marginBottom: verticalScale(12),
  },
  fullBodySubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: moderateScale(16),
    textAlign: "center",
    marginBottom: verticalScale(20),
  },
  fullBodyImageFrame: {
    width: scale(220),
    height: scale(320),
    borderRadius: moderateScale(16),
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#462FA9",
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
    marginBottom: verticalScale(16),
  },
  skipText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.85,
  },
  continueButton: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(60),
  },
  continueText: {
    color: "#2D1B69",
    fontSize: moderateScale(18),
    fontWeight: "600",
    textAlign: "center",
  },
});

export default GuidedCamera;
