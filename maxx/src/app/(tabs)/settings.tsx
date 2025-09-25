import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

// Notification Modal Component
const NotificationModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
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
    </View>
  </Modal>
);

// NPS Rating Modal Component
const NPSModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
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

        <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
          <Text style={styles.primaryButtonText}>Rate Us</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const SettingsScreen: React.FC = () => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showNPSModal, setShowNPSModal] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(false);

  const handleLogout = () => {
    // Dummy logout - nothing happens
    console.log("Logout pressed");
  };

  const handleInviteFriends = () => {
    // Dummy invite - nothing happens
    console.log("Invite friends pressed");
  };

  const handleManagePlan = () => {
    // Dummy manage plan - nothing happens
    console.log("Manage plan pressed");
  };

  const handleLegalItem = (item: string) => {
    // Dummy legal items - nothing happens
    console.log(`${item} pressed`);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>{"\u2190"}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={{ width: scale(20) }} />
          </View>

          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Referral Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Referral</Text>
              <TouchableOpacity
                style={styles.referralCard}
                onPress={handleInviteFriends}
              >
                <View style={styles.referralContent}>
                  <View style={styles.referralText}>
                    <Text style={styles.referralTitle}>
                      Invite your friends to join
                    </Text>
                    <Text style={styles.referralDescription}>
                      Share your referral code & help them get started.
                    </Text>
                    <TouchableOpacity
                      style={styles.inviteButton}
                      onPress={handleInviteFriends}
                    >
                      <FontAwesome name="share" size={16} color="#2D1B69" />
                      <Text style={styles.inviteButtonText}>Invite now</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.megaphoneContainer}>
                    <FontAwesome name="bullhorn" size={40} color="#FF6B35" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Notifications Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <View style={styles.notificationCard}>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>
                    Enable Push Notification
                  </Text>
                  <Text style={styles.notificationDescription}>
                    Turn on notification to get real time updates of your
                    matches.
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    pushNotificationsEnabled && styles.toggleActive,
                  ]}
                  onPress={() => {
                    if (!pushNotificationsEnabled)
                      setShowNotificationModal(true);
                    setPushNotificationsEnabled(!pushNotificationsEnabled);
                  }}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      pushNotificationsEnabled && styles.toggleThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Subscription Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subscription</Text>
              <TouchableOpacity
                style={styles.listItem}
                onPress={handleManagePlan}
              >
                <Text style={styles.listItemText}>Manage Plan & Payments</Text>
                <FontAwesome
                  name="chevron-right"
                  size={16}
                  color="rgba(255,255,255,0.5)"
                />
              </TouchableOpacity>
            </View>

            {/* Legals Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Legals</Text>
              {[
                "Privacy Policy",
                "Terms of Service",
                "Community Guidelines",
                "About Us",
                "Help & Support",
                "FAQs",
              ].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.listItem}
                  onPress={() => handleLegalItem(item)}
                >
                  <Text style={styles.listItemText}>{item}</Text>
                  <FontAwesome
                    name="chevron-right"
                    size={16}
                    color="rgba(255,255,255,0.5)"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Modal Trigger Buttons */}
            <View style={styles.modalTriggersSection}>

              <TouchableOpacity
                style={styles.modalTriggerButton}
                onPress={() => setShowNPSModal(true)}
              >
                <Text style={styles.modalTriggerText}>Rate Us</Text>
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            {/* Social Icons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialIcon}>
                <FontAwesome
                  name="instagram"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <FontAwesome
                  name="twitter"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            </View>

            {/* App Version */}
            <Text style={styles.versionText}>App Version 2.0.770</Text>
          </ScrollView>
        </View>

        {/* Modals */}
        <NotificationModal
          visible={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
        />
        <NPSModal
          visible={showNPSModal}
          onClose={() => setShowNPSModal(false)}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2D1B69",
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(15),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
  backButton: {
    color: "#fff",
    fontSize: moderateScale(28),
  },
  headerTitle: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "600",
    marginBottom: verticalScale(12),
  },
  referralCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(16),
    padding: scale(20),
    borderTopRightRadius: moderateScale(20),
  },
  referralContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  referralText: {
    flex: 1,
  },
  referralTitle: {
    color: "#2D1B69",
    fontSize: moderateScale(16),
    fontWeight: "700",
    marginBottom: verticalScale(4),
  },
  referralDescription: {
    color: "rgba(45, 27, 105, 0.7)",
    fontSize: moderateScale(12),
    marginBottom: verticalScale(12),
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D1B69",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    alignSelf: "flex-start",
  },
  inviteButtonText: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "600",
    textAlign: "center",
    marginLeft: scale(4),
  },
  megaphoneContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  notificationCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: moderateScale(12),
    padding: scale(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "600",
    marginBottom: verticalScale(4),
  },
  notificationDescription: {
    color: "rgba(255,255,255,0.7)",
    fontSize: moderateScale(12),
  },
  toggle: {
    width: scale(50),
    height: verticalScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    paddingHorizontal: scale(2),
  },
  toggleActive: {
    backgroundColor: "#34D399",
  },
  toggleThumb: {
    width: scale(24),
    height: scale(24),
    borderRadius: moderateScale(12),
    backgroundColor: "#fff",
    alignSelf: "flex-start",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(8),
  },
  listItemText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
  modalTriggersSection: {
    marginBottom: verticalScale(24),
    gap: verticalScale(12),
  },
  modalTriggerButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(20),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  modalTriggerText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(16),
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  logoutText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: verticalScale(16),
    gap: scale(24),
  },
  socialIcon: {
    padding: scale(8),
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: moderateScale(12),
  },
  versionText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: moderateScale(12),
    textAlign: "center",
    marginBottom: verticalScale(20),
  },
  // Modal Styles
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

export default SettingsScreen;
