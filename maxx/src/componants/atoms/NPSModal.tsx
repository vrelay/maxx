import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

interface NPSModalProps {
  visible: boolean;
  onClose: () => void;
}

const NPSModal: React.FC<NPSModalProps> = ({ visible, onClose }) => {
  const handleRateUs = async () => {
    try {
      const appStoreUrl =
        Platform.OS === "ios"
          ? "https://apps.apple.com/app/id[YOUR_APP_ID]" // Replace with your actual App Store ID
          : "https://play.google.com/store/apps/details?id=com.yourpackagename"; // Replace with your actual package name

      const supported = await Linking.canOpenURL(appStoreUrl);
      if (supported) {
        await Linking.openURL(appStoreUrl);
      } else {
        Alert.alert("Error", "Unable to open app store");
      }
    } catch (error) {
      console.error("Error opening app store:", error);
      Alert.alert("Error", "Unable to open app store");
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Enjoying your experience</Text>
          <Text style={styles.modalDescription}>
            Tap to leave rating and make our day!
          </Text>

          <View style={styles.starsContainer}>
            <View style={styles.speechBubble}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome
                  key={star}
                  name={star <= 4 ? "star" : "star-half-o"}
                  size={24}
                  color="#FFD700"
                  style={styles.star}
                />
              ))}
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRateUs}
            >
              <Text style={styles.primaryButtonText}>Rate Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Skip For Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    padding: scale(24),
    paddingBottom: verticalScale(40),
    alignItems: "center",
  },
  modalTitle: {
    color: "#2D1B69",
    fontSize: moderateScale(20),
    fontWeight: "700",
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  modalDescription: {
    color: "rgba(45, 27, 105, 0.7)",
    fontSize: moderateScale(14),
    textAlign: "center",
    marginBottom: verticalScale(24),
    lineHeight: moderateScale(20),
  },
  starsContainer: {
    marginBottom: verticalScale(32),
  },
  speechBubble: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  star: {
    marginHorizontal: scale(2),
  },
  modalButtons: {
    width: "100%",
    gap: verticalScale(12),
  },
  primaryButton: {
    backgroundColor: "#2D1B69",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(16),
    alignItems: "center",
    width: "100%",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(16),
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#2D1B69",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
});

export default NPSModal;
