import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import referralService from "../../services/referralService";

interface InviteFriendsModalProps {
  visible: boolean;
  onClose: () => void;
}

const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  visible,
  onClose,
}) => {
  const handleInviteNow = async () => {
    try {
      // Get or generate referral code
      const referralResult = await referralService.getReferralInfo();

      if (referralResult.success && referralResult.data) {
        // Generate share message
        const message = referralService.generateShareMessage(
          referralResult.data.code
        );

        // Use React Native Share
        const Share = require("react-native").Share;
        await Share.share({
          message: message,
          title: "Join Maxx with my referral code!",
        });
      } else {
        // Try to generate a new referral code
        const generateResult = await referralService.generateReferralCode();

        if (generateResult.success && generateResult.data) {
          const message = referralService.generateShareMessage(
            generateResult.data.code
          );

          const Share = require("react-native").Share;
          await Share.share({
            message: message,
            title: "Join Maxx with my referral code!",
          });
        } else {
          Alert.alert(
            "Error",
            "Failed to generate referral code. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Error in handleInviteNow:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Invite your friends to join</Text>
          <Text style={styles.modalDescription}>
            Share your referral code & help them get started.
          </Text>

          <View style={styles.megaphoneModalContainer}>
            <FontAwesome name="bullhorn" size={60} color="#FF6B35" />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleInviteNow}
            >
              <Text style={styles.primaryButtonText}>Invite now</Text>
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
  megaphoneModalContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(32),
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

export default InviteFriendsModal;
