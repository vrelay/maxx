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

const PrivacyPolicyScreen: React.FC = () => {
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
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backButton}>{"\u2190"}</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Privacy Policy</Text>
              <View style={{ width: scale(20) }} />
            </View>

            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
            <View style={styles.contentContainer}>
              <Text style={styles.lastUpdated}>Last updated: 9/25/2025</Text>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Information We Collect</Text>
                <Text style={styles.bodyText}>
                  We collect information you provide directly to us, such as when you create an account, upload photos for analysis, or contact us for support. This may include:
                </Text>
                <View style={styles.bulletContainer}>
                  <Text style={styles.bulletPoint}>• Account information (email, username)</Text>
                  <Text style={styles.bulletPoint}>• Photos and images you upload for analysis</Text>
                  <Text style={styles.bulletPoint}>• Device information and usage data</Text>
                  <Text style={styles.bulletPoint}>• Payment information (processed securely through third-party providers)</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How We Use Your Information</Text>
                <Text style={styles.bodyText}>
                  We use the information we collect to:
                </Text>
                <View style={styles.bulletContainer}>
                  <Text style={styles.bulletPoint}>• Provide and improve our looksmaxxing analysis services</Text>
                  <Text style={styles.bulletPoint}>• Process your photos to generate transformation recommendations</Text>
                  <Text style={styles.bulletPoint}>• Communicate with you about your account and our services</Text>
                  <Text style={styles.bulletPoint}>• Ensure the security and integrity of our platform</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Photo Privacy and Security</Text>
                <Text style={styles.bodyText}>
                  Your photos are extremely important to us. We implement industry-standard security measures:
                </Text>
                <View style={styles.bulletContainer}>
                  <Text style={styles.bulletPoint}>• All photos are encrypted during transmission and storage</Text>
                  <Text style={styles.bulletPoint}>• Photos are processed using secure, privacy-focused AI systems</Text>
                  <Text style={styles.bulletPoint}>• We do not share your photos with third parties</Text>
                  <Text style={styles.bulletPoint}>• You can delete your photos at any time through your account settings</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data Sharing and Disclosure</Text>
                <Text style={styles.bodyText}>
                  We do not sell, trade, or otherwise transfer your personal information to third parties. We may share information only in the following circumstances:
                </Text>
                <View style={styles.bulletContainer}>
                  <Text style={styles.bulletPoint}>• With your explicit consent</Text>
                  <Text style={styles.bulletPoint}>• To comply with legal obligations</Text>
                  <Text style={styles.bulletPoint}>• To protect our rights and prevent fraud</Text>
                  <Text style={styles.bulletPoint}>• With trusted service providers who help us operate our platform</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Rights and Choices</Text>
                <Text style={styles.bodyText}>
                  You have the right to:
                </Text>
                <View style={styles.bulletContainer}>
                  <Text style={styles.bulletPoint}>• Access and review your personal information</Text>
                  <Text style={styles.bulletPoint}>• Update or correct your information</Text>
                  <Text style={styles.bulletPoint}>• Delete your account and associated data</Text>
                  <Text style={styles.bulletPoint}>• Opt out of marketing communications</Text>
                  <Text style={styles.bulletPoint}>• Request a copy of your data</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Children's Privacy</Text>
                <Text style={styles.bodyText}>
                  Our service is not intended for children under 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>International Users</Text>
                <Text style={styles.bodyText}>
                  If you are accessing our service from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Changes to This Policy</Text>
                <Text style={styles.bodyText}>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Us</Text>
                <Text style={styles.bodyText}>
                  If you have any questions about this Privacy Policy, please contact us at:
                </Text>
                <Text style={styles.bodyText}>
                  Email: gus@marlomaxxing.com
                </Text>
                <Text style={styles.bodyText}>
                  We will respond to your inquiry within 30 days.
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
});

export default PrivacyPolicyScreen;
