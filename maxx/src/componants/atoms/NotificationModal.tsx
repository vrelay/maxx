import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <SafeAreaView style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Never miss a step</Text>
        <Text style={styles.modalDescription}>
          Turn on notifications to stay updated on your tasks, progress, and
          important tips for your transformation journey.
        </Text>

        <View style={styles.bellContainer}>
          <FontAwesome name="bell" size={60} color="#FFD700" />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>1</Text>
          </View>
        </View>

        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
            <Text style={styles.primaryButtonText}>Turn On Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Skip For Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  </Modal>
);

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
  bellContainer: {
    position: "relative",
    marginBottom: verticalScale(32),
  },
  notificationBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF4444",
    borderRadius: moderateScale(10),
    width: scale(20),
    height: scale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "700",
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

export default NotificationModal;
