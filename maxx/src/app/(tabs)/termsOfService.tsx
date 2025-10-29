import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { SafeNavigation } from "../../utils/safeNavigation";

const TermsOfServiceScreen: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={["#171840", "#6D37D4"]}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => SafeNavigation.goBack("/(tabs)/settings")}>
                <Text style={styles.backButton}>{"\u2190"}</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Terms of Service</Text>
              <View style={{ width: scale(20) }} />
            </View>

            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.contentContainer}>
                <Text style={styles.lastUpdated}>Last updated: 9/25/2025</Text>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Acceptance of Terms</Text>
                  <Text style={styles.bodyText}>
                    By accessing and using MarloMaxxing ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Description of Service</Text>
                  <Text style={styles.bodyText}>
                    MarloMaxxing provides AI-powered analysis and recommendations for physical appearance improvement, including but not limited to:
                  </Text>
                  <View style={styles.bulletContainer}>
                    <Text style={styles.bulletPoint}>• Facial analysis and rating systems</Text>
                    <Text style={styles.bulletPoint}>• Personalized improvement recommendations</Text>
                    <Text style={styles.bulletPoint}>• Exercise and lifestyle guidance</Text>
                    <Text style={styles.bulletPoint}>• Progress tracking and comparison tools</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>User Responsibilities</Text>
                  <Text style={styles.bodyText}>
                    As a user of our service, you agree to:
                  </Text>
                  <View style={styles.bulletContainer}>
                    <Text style={styles.bulletPoint}>• Provide accurate and truthful information</Text>
                    <Text style={styles.bulletPoint}>• Use the service only for personal, non-commercial purposes</Text>
                    <Text style={styles.bulletPoint}>• Not share your account credentials with others</Text>
                    <Text style={styles.bulletPoint}>• Not attempt to reverse engineer or copy our technology</Text>
                    <Text style={styles.bulletPoint}>• Respect the intellectual property rights of others</Text>
                    <Text style={styles.bulletPoint}>• Use the service in compliance with all applicable laws</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Content and Photos</Text>
                  <Text style={styles.bodyText}>
                    When you upload photos or other content to our service:
                  </Text>
                  <View style={styles.bulletContainer}>
                    <Text style={styles.bulletPoint}>• You retain ownership of your content</Text>
                    <Text style={styles.bulletPoint}>• You grant us a limited license to process and analyze your content</Text>
                    <Text style={styles.bulletPoint}>• You confirm you have the right to upload and use the content</Text>
                    <Text style={styles.bulletPoint}>• You understand that content may be processed by AI systems</Text>
                    <Text style={styles.bulletPoint}>• You can delete your content at any time through your account</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Subscription and Billing</Text>
                  <Text style={styles.bodyText}>
                    Our subscription service operates as follows:
                  </Text>
                  <View style={styles.bulletContainer}>
                    <Text style={styles.bulletPoint}>• Subscriptions are billed weekly at $9.99</Text>
                    <Text style={styles.bulletPoint}>• Billing occurs automatically unless cancelled</Text>
                    <Text style={styles.bulletPoint}>• You can cancel your subscription at any time</Text>
                    <Text style={styles.bulletPoint}>• Refunds are handled in accordance with App Store/Google Play policies</Text>
                    <Text style={styles.bulletPoint}>• Prices may change with 30 days notice</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Medical Disclaimer</Text>
                  <Text style={styles.bodyText}>
                    <Text style={styles.importantText}>IMPORTANT:</Text> MarloMaxxing is for entertainment and educational purposes only. Our service does not provide medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals before making any changes to your health or appearance routine.
                  </Text>
                  <View style={styles.bulletContainer}>
                    <Text style={styles.bulletPoint}>• Our recommendations are not medical advice</Text>
                    <Text style={styles.bulletPoint}>• Results may vary and are not guaranteed</Text>
                    <Text style={styles.bulletPoint}>• Some suggestions may not be suitable for all individuals</Text>
                    <Text style={styles.bulletPoint}>• Consult professionals before beginning any new regimen</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Prohibited Uses</Text>
                  <Text style={styles.bodyText}>
                    You may not use our service to:
                  </Text>
                  <View style={styles.bulletContainer}>
                    <Text style={styles.bulletPoint}>• Upload photos of minors (under 18)</Text>
                    <Text style={styles.bulletPoint}>• Upload photos of other people without consent</Text>
                    <Text style={styles.bulletPoint}>• Engage in harassment or discrimination</Text>
                    <Text style={styles.bulletPoint}>• Violate any applicable laws or regulations</Text>
                    <Text style={styles.bulletPoint}>• Attempt to hack or compromise the service</Text>
                    <Text style={styles.bulletPoint}>• Share or distribute inappropriate content</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Limitation of Liability</Text>
                  <Text style={styles.bodyText}>
                    To the fullest extent permitted by law, MarloMaxxing shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Termination</Text>
                  <Text style={styles.bodyText}>
                    We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Changes to Terms</Text>
                  <Text style={styles.bodyText}>
                    We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the app. Continued use of the service after changes constitutes acceptance of the new terms.
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Governing Law</Text>
                  <Text style={styles.bodyText}>
                    These Terms of Service are governed by and construed in accordance with the laws of the United States. Any disputes will be resolved in the courts of the United States.
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Contact Information</Text>
                  <Text style={styles.bodyText}>
                    If you have any questions about these Terms of Service, please contact us at:
                  </Text>
                  <Text style={styles.bodyText}>
                    Email: gus@marlomaxxing.com
                  </Text>
                  <Text style={styles.bodyText}>
                    We will respond to your inquiry within 48 hours.
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gradient: { 
    flex: 1 
  },
  safeArea: {
    flex: 1,
    zIndex: 2,
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
  contentContainer: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(40),
  },
  lastUpdated: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: moderateScale(14),
    fontStyle: "italic",
    marginBottom: verticalScale(24),
    textAlign: "center",
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "700",
    marginBottom: verticalScale(12),
    lineHeight: moderateScale(24),
  },
  bodyText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(8),
  },
  bulletContainer: {
    marginTop: verticalScale(8),
    marginLeft: scale(8),
  },
  bulletPoint: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(6),
  },
  importantText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "700",
  },
});

export default TermsOfServiceScreen;
