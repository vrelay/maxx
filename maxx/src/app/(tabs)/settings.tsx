import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useAuth } from "@/src/context/AuthContext";
import { authService } from "@/src/services/authService";
import referralService from "../../services/referralService";
import NotificationModal from "../../componants/atoms/NotificationModal";
import NPSModal from "../../componants/atoms/NPSModal";
import InviteFriendsModal from "../../componants/atoms/InviteFriendsModal";


const SettingsScreen: React.FC = () => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showNPSModal, setShowNPSModal] = useState(false);
  const [showInviteFriendsModal, setShowInviteFriendsModal] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(false);
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            const result = await authService.signOut();
            if (result.success) {
              await signOut();
              router.replace("/(auth)");
            } else {
              Alert.alert("Error", result.error || "Logout failed");
            }
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Logout failed. Please try again.");
          }
        },
      },
    ]);
  };

  const handleInviteFriends = async () => {
    console.log(" DEBUG: Invite friends pressed");

    try {
      // Check if user is authenticated
      if (!user) {
        console.log(" DEBUG: User not authenticated");
        Alert.alert("Error", "Please sign in to invite friends");
        return;
      }

      console.log(" DEBUG: User authenticated:", user.uid);

      // Get or generate referral code
      console.log(" DEBUG: Getting referral info...");
      const referralResult = await referralService.getReferralInfo();

      if (referralResult.success && referralResult.data) {
        console.log("DEBUG: Referral info loaded:", referralResult.data);

        // Generate share message (no URL)
        const message = referralService.generateShareMessage(
          referralResult.data.code
        );

        console.log(" DEBUG: Sharing with message:", message);

        // Use React Native Share
        const Share = require("react-native").Share;
        await Share.share({
          message: message,
          title: "Join Maxx with my referral code!",
        });

        console.log(" DEBUG: Share dialog opened successfully");
      } else {
        console.log(
          " DEBUG: Failed to get referral info:",
          referralResult.error
        );

        // Try to generate a new referral code
        console.log("🔄 DEBUG: Attempting to generate new referral code...");
        const generateResult = await referralService.generateReferralCode();

        if (generateResult.success && generateResult.data) {
          console.log(
            " DEBUG: New referral code generated:",
            generateResult.data
          );

          const message = referralService.generateShareMessage(
            generateResult.data.code
          );

          const Share = require("react-native").Share;
          await Share.share({
            message: message,
            title: "Join Maxx with my referral code!",
          });
        } else {
          console.log(
            " DEBUG: Failed to generate referral code:",
            generateResult.error
          );
          Alert.alert(
            "Error",
            "Failed to generate referral code. Please try again."
          );
        }
      }
    } catch (error) {
      console.error(" DEBUG: Error in handleInviteFriends:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const handleManagePlan = () => {
    // Dummy manage plan - nothing happens
    console.log("Manage plan pressed");
  };

  const handleLegalItem = (item: string) => {
    if (item === "Privacy Policy") {
      router.push("/(tabs)/privacyPolicy");
    } else if (item === "Terms of Service") {
      router.push("/(tabs)/termsOfService");
    } else {
      // Dummy legal items - nothing happens for other items
      console.log(`${item} pressed`);
    }
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
                  onPress={() => setShowInviteFriendsModal(true)}
                >
                  <Text style={styles.modalTriggerText}>Invite Friends</Text>
                </TouchableOpacity>

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
                <FontAwesome name="instagram" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <FontAwesome name="twitter" size={24} color="black" />
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
        <InviteFriendsModal
          visible={showInviteFriendsModal}
          onClose={() => setShowInviteFriendsModal(false)}
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
});

export default SettingsScreen;
